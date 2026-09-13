import {
  AgentId,
  ApiProvider,
  CouncilSpeech,
  ProposalPlan,
  AgentVote,
  CouncilResolution,
  UserEcologyProfile,
} from "../types";
import { AGENT_PROFILES } from "../agents-data";
import {
  CouncilMeetingScript,
  generateProceduralCouncil,
  generateInterrogationResponse,
  PRESET_SCRIPTS,
  getRealtimeScript,
} from "../council-engine";
import {
  sanitizeApiKey,
  sanitizeUserInput,
  sanitizeEcologyProfile,
  buildSecurePromptSandbox,
  redactSecretsFromError,
} from "./security";

export interface DebateRequestBody {
  topicId?: string;
  customQuestion?: string;
  userEcology?: UserEcologyProfile | null;
  apiKey?: string;
  apiProvider?: ApiProvider;
  apiBaseUrl?: string;
  apiModel?: string;
  summonedAgents?: AgentId[];
}

export interface InterrogateRequestBody {
  userQuery: string;
  topicTitle?: string;
  summonedAgents?: AgentId[];
  userEcology?: UserEcologyProfile | null;
  apiKey?: string;
  apiProvider?: ApiProvider;
  apiBaseUrl?: string;
  apiModel?: string;
}

export interface AppealRequestBody {
  caseNumber?: string;
  topicTitle: string;
  appealReason: string;
  activeScript?: CouncilMeetingScript;
  userEcology?: UserEcologyProfile | null;
  apiKey?: string;
}

export interface AppealResult {
  newAgentId: AgentId;
  emergencySpeeches: CouncilSpeech[];
  amendedResolution: CouncilResolution;
  amendedScript: CouncilMeetingScript;
}

/**
 * 鲁棒性清洗：去除 LLM 返回中可能包裹的 Markdown 代码块或多余空格
 */
function cleanJsonResponse(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return text.trim();
}

const VALID_AGENT_IDS = new Set<AgentId>(Object.keys(AGENT_PROFILES) as AgentId[]);
const VALID_PHASES = new Set<CouncilSpeech["phase"]>([
  "opening",
  "rebuttal",
  "interjection",
  "chairman",
  "user_response",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeText(value: unknown, maxLength: number, fallback: string): string {
  return sanitizeUserInput(value, maxLength) || fallback;
}

function safeAgentId(value: unknown): AgentId | null {
  return typeof value === "string" && VALID_AGENT_IDS.has(value as AgentId)
    ? (value as AgentId)
    : null;
}

function safePlanId(value: unknown): "A" | "B" | "C" | null {
  return value === "A" || value === "B" || value === "C" ? value : null;
}

/**
 * 对在线模型返回的 JSON 做运行时校验和归一化，避免模型少字段时直接击穿前端渲染。
 */
function normalizeCouncilScript(value: unknown): CouncilMeetingScript | null {
  if (!isRecord(value)) return null;

  const rawSpeeches = Array.isArray(value.speeches) ? value.speeches : [];
  const speeches = rawSpeeches
    .map((raw, index): CouncilSpeech | null => {
      if (!isRecord(raw)) return null;
      const agentId = safeAgentId(raw.agentId);
      const phase = VALID_PHASES.has(raw.phase as CouncilSpeech["phase"])
        ? (raw.phase as CouncilSpeech["phase"])
        : "opening";
      const content = safeText(raw.content, 500, "本委员暂无法形成有效陈述。");
      if (!agentId || !content) return null;
      const targetAgentId = safeAgentId(raw.targetAgentId);
      return {
        id: safeText(raw.id, 60, `speech_${index + 1}`),
        agentId,
        agentName: safeText(raw.agentName, 40, AGENT_PROFILES[agentId].name),
        phase,
        content,
        thinking: safeText(raw.thinking, 120, "暂无公开算盘。"),
        ...(targetAgentId ? { targetAgentId } : {}),
        interrupted: Boolean(raw.interrupted),
        timestamp: safeText(raw.timestamp, 30, "刚才"),
        replyToUser: Boolean(raw.replyToUser),
      };
    })
    .filter((speech): speech is CouncilSpeech => Boolean(speech));

  const rawPlans = Array.isArray(value.plans) ? value.plans : [];
  const plans = rawPlans
    .map((raw): ProposalPlan | null => {
      if (!isRecord(raw)) return null;
      const id = safePlanId(raw.id);
      if (!id) return null;
      const supporterAgents = Array.isArray(raw.supporterAgents)
        ? raw.supporterAgents.map(safeAgentId).filter((id): id is AgentId => Boolean(id))
        : [];
      return {
        id,
        title: safeText(raw.title, 80, `${id}方案`),
        desc: safeText(raw.desc, 220, "按当前风险边界执行，并在设定时限后复盘。"),
        supporterAgents,
        compromiseNotes: safeText(raw.compromiseNotes, 160, "请根据现实反馈及时调整。"),
      };
    })
    .filter((plan): plan is ProposalPlan => Boolean(plan));

  const planById = new Map(plans.map((plan) => [plan.id, plan]));
  if (!planById.has("A") || !planById.has("B")) return null;
  if (!planById.has("C")) {
    const fallbackPlan: ProposalPlan = {
      id: "C",
      title: "C方案 · 保留弹性并设置止损线",
      desc: "先执行低成本试行版本，到时限后根据结果决定是否继续。",
      supporterAgents: [],
      compromiseNotes: "用明确的停止条件换取试错空间。",
    };
    plans.push(fallbackPlan);
    planById.set("C", fallbackPlan);
  }

  const rawVotes = Array.isArray(value.votes) ? value.votes : [];
  const seenVoters = new Set<AgentId>();
  const votes = rawVotes
    .map((raw): AgentVote | null => {
      if (!isRecord(raw)) return null;
      const agentId = safeAgentId(raw.agentId);
      const planId = safePlanId(raw.planId);
      if (!agentId || !planId || seenVoters.has(agentId)) return null;
      seenVoters.add(agentId);
      return {
        agentId,
        agentName: safeText(raw.agentName, 40, AGENT_PROFILES[agentId].name),
        planId,
        reason: safeText(raw.reason, 180, "依据自身职责与全局风险审慎投票。"),
        thinking: safeText(raw.thinking, 120, "利益平衡中。"),
      };
    })
    .filter((vote): vote is AgentVote => Boolean(vote));

  const resolutionRaw = isRecord(value.resolution) ? value.resolution : null;
  if (!resolutionRaw || speeches.length < 3) return null;
  const winningPlanRaw = isRecord(resolutionRaw.winningPlan) ? resolutionRaw.winningPlan : null;
  const winningPlanId = safePlanId(winningPlanRaw?.id) || "B";
  const winningPlan = planById.get(winningPlanId) || plans[1];
  const summonedAgentIds = Array.isArray(value.summonedAgentIds)
    ? Array.from(new Set(value.summonedAgentIds.map(safeAgentId).filter((id): id is AgentId => Boolean(id))))
    : [];
  const fallbackAgents = Array.from(new Set([...summonedAgentIds, ...votes.map((vote) => vote.agentId)]));
  const normalizedVotes = votes.length > 0 ? votes : fallbackAgents.map((agentId) => ({
    agentId,
    agentName: AGENT_PROFILES[agentId].name,
    planId: agentId === "gpa" || agentId === "sleep" ? "A" : agentId === "happiness" ? "B" : winningPlan.id,
    reason: "依据自身职责与当前证据完成投票。",
  }));

  const confidence = typeof resolutionRaw.confidence === "number"
    ? Math.min(100, Math.max(0, Math.round(resolutionRaw.confidence)))
    : undefined;
  const supervisingAgent = safeAgentId(resolutionRaw.supervisingAgent) || fallbackAgents[0] || "future";

  return {
    caseNumber: safeText(value.caseNumber, 50, "〔2026〕第 0000 号"),
    topicTitle: safeText(value.topicTitle, 180, "当前内耗议题"),
    category: safeText(value.category, 30, "日常选择"),
    urgency: value.urgency === "特急" || value.urgency === "紧急" || value.urgency === "常规" ? value.urgency : "紧急",
    keyConflict: safeText(value.keyConflict, 220, "即时冲动与长期目标之间的现实拉扯。"),
    summonedAgentIds: fallbackAgents.length >= 3 ? fallbackAgents : ["gpa", "sleep", "future"],
    speeches,
    plans,
    votes: normalizedVotes,
    resolution: {
      caseNumber: safeText(resolutionRaw.caseNumber, 50, safeText(value.caseNumber, 50, "〔2026〕第 0000 号")),
      title: safeText(resolutionRaw.title, 180, "关于当前议题的终局裁决令"),
      urgency: resolutionRaw.urgency === "特急" || resolutionRaw.urgency === "紧急" || resolutionRaw.urgency === "常规"
        ? resolutionRaw.urgency
        : "紧急",
      winningPlan,
      voteScore: {
        planA: normalizedVotes.filter((vote) => vote.planId === "A").length,
        planB: normalizedVotes.filter((vote) => vote.planId === "B").length,
        planC: normalizedVotes.filter((vote) => vote.planId === "C").length,
      },
      votes: normalizedVotes,
      stipulations: Array.isArray(resolutionRaw.stipulations)
        ? resolutionRaw.stipulations.map((stip) => safeText(stip, 180, "按方案执行并在时限后复盘。"))
        : ["先执行最小可行步骤，并设置明确的停止条件。"],
      supervisingAgent,
      stampDate: safeText(resolutionRaw.stampDate, 40, new Date().toLocaleDateString("zh-CN")),
      appealCount: typeof resolutionRaw.appealCount === "number" ? Math.max(0, Math.round(resolutionRaw.appealCount)) : 0,
      nextAction: safeText(resolutionRaw.nextAction, 180, "先执行获选方案的第一步，并设置一个明确的截止时间。"),
      actionWindow: safeText(resolutionRaw.actionWindow, 60, "今天内完成第一步"),
      ...(confidence === undefined ? {} : { confidence }),
      assumptions: Array.isArray(resolutionRaw.assumptions)
        ? resolutionRaw.assumptions.map((item) => safeText(item, 140, "当前信息没有发生重大变化。"))
        : [],
    },
  };
}

function normalizeOpenAIEndpoint(baseUrl?: string): string {
  const fallback = sanitizeUserInput(process.env.OPENAI_BASE_URL, 200) || "https://api.openai.com/v1";
  const candidate = sanitizeUserInput(baseUrl, 200) || fallback;
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    const isPrivateIpv4 = /^(10\.|127\.|169\.254\.|192\.168\.|0\.)/.test(hostname)
      || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
    const isPrivateIpv6 = hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80:");
    const blockedHost = hostname === "localhost" || isPrivateIpv4 || isPrivateIpv6;
    if (url.protocol !== "https:" || blockedHost) return `${fallback.replace(/\/+$/, "")}/chat/completions`;
    const normalized = url.toString().replace(/\/+$/, "");
    return normalized.endsWith("/chat/completions") ? normalized : `${normalized}/chat/completions`;
  } catch {
    return `${fallback.replace(/\/+$/, "")}/chat/completions`;
  }
}

function normalizeApiProvider(provider?: ApiProvider): ApiProvider {
  return provider === "openai" || provider === "procedural" ? provider : "gemini";
}

/**
 * 构造面向 Gemini 的高沉浸二次元大学脑内议会 Prompt（带提示词注入沙盒安全隔离）
 */
function buildGeminiDebatePrompt(
  question: string,
  userEcology?: UserEcologyProfile | null,
  summonedAgents?: AgentId[]
): string {
  const safeEcology = sanitizeEcologyProfile(userEcology);
  const ecologyDesc = safeEcology
    ? `当事人脑内生态画像：
- 称号/代号：${safeEcology.codename}
- 年级与专业：${safeEcology.grade} / ${safeEcology.majorType}
- 当前最致命焦虑源：${safeEcology.primaryAnxiety}
- 脑内执政主流派系：${safeEcology.rulingParty}`
    : "当事人脑内生态：普通大学生，面临严重内耗、熬夜与学业拉扯。";

  const defaultDebateAgents: AgentId[] = ["gpa", "sleep", "happiness", "social", "future"];
  const targetAgents: AgentId[] =
    summonedAgents && summonedAgents.length >= 3 ? summonedAgents : defaultDebateAgents;

  const secureInquirySandbox = buildSecurePromptSandbox(question, "当事人深夜纠结议题");

  return `你是一个名为【大学生脑内常任委员议会】的多智能体模拟裁判系统。
每一个委员都是用户脑内神经元的极端化身，拥有鲜明的日系动漫人设、傲娇毒舌、利益至上，誓死捍卫自己的KPI。

${secureInquirySandbox}

【当事人上下文环境】：
${ecologyDesc}

【出席审议的五位常任委员及其人设】：
${targetAgents
  .map((id) => {
    const p = AGENT_PROFILES[id];
    return `- [${p?.id || id}] ${p?.name || "委员"}（${p?.roleTitle || "常任委员"}）：人设性格【${p?.personality || "毒舌犀利"}】，终极诉求【${p?.objective || "维护自身利益"}】`;
  })
  .join("\n")}

请生成一场极度精彩、唇枪舌战的脑内议会辩论全流程 JSON。必须严格符合以下 JSON 规范，不要输出任何 Markdown 标记外的多余文字：

{
  "caseNumber": "〔${new Date().getFullYear()}〕第 09${Math.floor(10 + Math.random() * 89)} 号",
  "topicTitle": "${sanitizeUserInput(question, 28)}",
  "category": "学业与娱乐",
  "urgency": "特急",
  "keyConflict": "核心利益冲突一句话概括",
  "summonedAgentIds": ${JSON.stringify(targetAgents)},
  "speeches": [
    {
      "id": "s1",
      "agentId": "${targetAgents[0]}",
      "agentName": "${AGENT_PROFILES[targetAgents[0]]?.name || "委员"}",
      "phase": "opening",
      "content": "犀利发言（40-70字，带强烈人格特色与口癖）",
      "thinking": "潜意识利益算盘（20-40字，写明自己到底在打什么自私的小算盘）",
      "timestamp": "01:24:02"
    }
  ],
  "plans": [
    {
      "id": "A",
      "title": "激进方案标题",
      "desc": "方案执行细则",
      "supporterAgents": ["${targetAgents[0]}"],
      "compromiseNotes": "代价说明"
    },
    {
      "id": "B",
      "title": "保守/摆烂方案标题",
      "desc": "方案执行细则",
      "supporterAgents": ["${targetAgents[1]}"],
      "compromiseNotes": "代价说明"
    },
    {
      "id": "C",
      "title": "折中妥协救命方案",
      "desc": "方案执行细则",
      "supporterAgents": ["${targetAgents[2]}", "${targetAgents[3] || targetAgents[0]}"],
      "compromiseNotes": "代价说明"
    }
  ],
  "votes": [
    {
      "agentId": "${targetAgents[0]}",
      "agentName": "${AGENT_PROFILES[targetAgents[0]]?.name || "委员"}",
      "planId": "A",
      "reason": "投票理由（一针见血）"
    }
  ],
  "resolution": {
    "caseNumber": "〔${new Date().getFullYear()}〕第 09${Math.floor(10 + Math.random() * 89)} 号",
    "title": "关于${sanitizeUserInput(question, 20)}的终局裁决令",
    "urgency": "特急",
    "winningPlan": {
      "id": "C",
      "title": "折中妥协救命方案",
      "desc": "执行细则",
      "supporterAgents": ["${targetAgents[2]}"],
      "compromiseNotes": "代价说明"
    },
    "voteScore": { "planA": 1, "planB": 1, "planC": 3 },
    "votes": [],
    "stipulations": [
      "第1条强制令...",
      "第2条强制令...",
      "第3条免责条款..."
    ],
    "supervisingAgent": "${targetAgents[0]}",
    "stampDate": "2026年09月12日",
    "appealCount": 0,
    "nextAction": "现在立刻执行的第一步",
    "actionWindow": "明确的完成时限",
    "confidence": 72,
    "assumptions": ["本案关键事实在执行窗口内不会发生重大变化"]
  }
}

要求：
1. speeches 包含至少 8 到 12 轮发言，有立论(opening)、互怼反驳(rebuttal)、拍桌插话(interjection)，语言要像《逆转裁判》和日系校园番一样爆笑又有哲理！
2. 每一个发言都必须结合用户的年级/专业/焦虑痛点。
3. 保证输出合法的标准 JSON，无语法错误。`;
}

/**
 * 在线调用 Gemini API
 * 安全性改造：使用 HTTP 请求头 x-goog-api-key 传递凭证，杜绝 URL 泄露风险；同时应用超时控制与异常信息脱敏
 */
async function callGemini(prompt: string, apiKey: string, timeoutMs: number = 10000): Promise<string> {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      // 安全改进：API Key 通过 Header 传递，不在 URL 暴露
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        const safeErrText = redactSecretsFromError(errText.slice(0, 180));
        throw new Error(`Gemini ${model} HTTP ${response.status}: ${safeErrText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return cleanJsonResponse(text);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      lastError = new Error(redactSecretsFromError(errMsg));
    }
  }

  throw lastError || new Error("Gemini API call returned no valid text.");
}

/** 调用 OpenAI Chat Completions 兼容接口，支持 OpenAI / DeepSeek / Qwen / SiliconFlow。 */
async function callOpenAICompatible(
  prompt: string,
  apiKey: string,
  baseUrl?: string,
  model?: string,
  timeoutMs: number = 10000
): Promise<string> {
  const endpoint = normalizeOpenAIEndpoint(baseUrl);
  const selectedModel = sanitizeUserInput(model, 80) || sanitizeUserInput(process.env.OPENAI_MODEL, 80) || "gpt-4o-mini";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: selectedModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    const errorText = redactSecretsFromError((await response.text()).slice(0, 180));
    throw new Error(`OpenAI-compatible HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenAI-compatible API returned no valid text.");
  }
  return cleanJsonResponse(text);
}

async function callConfiguredModel(
  prompt: string,
  provider: ApiProvider,
  apiKey: string,
  baseUrl?: string,
  model?: string,
  timeoutMs: number = 10000
): Promise<string> {
  if (provider === "openai") {
    return callOpenAICompatible(prompt, apiKey, baseUrl, model, timeoutMs);
  }
  return callGemini(prompt, apiKey, timeoutMs);
}

/**
 * 核心后端控制器：生成完整议会辩论剧本（安全加固版）
 */
export async function generateCouncilDebate(
  body: DebateRequestBody
): Promise<{ script: CouncilMeetingScript; source: "gemini" | "openai" | "procedural" | "preset" }> {
  const { topicId, customQuestion, userEcology, apiKey, summonedAgents, apiBaseUrl, apiModel } = body;
  const apiProvider = normalizeApiProvider(body.apiProvider);

  // 1. 如果是已知预设议题，直接通过时间戳注入引擎
  if (topicId && PRESET_SCRIPTS[topicId]) {
    const preset = PRESET_SCRIPTS[topicId];
    const script = getRealtimeScript(topicId, preset.topicTitle);
    return { script, source: "preset" };
  }

  const query = sanitizeUserInput(customQuestion, 300) || "明天早八该不该通宵打游戏？";
  const safeEcology = sanitizeEcologyProfile(userEcology);

  // 安全校验与密钥净化
  const validUserKey = sanitizeApiKey(apiKey);
  const validServerKey = sanitizeApiKey(
    apiProvider === "openai" ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY
  );
  const effectiveKey = validUserKey || validServerKey;

  // 2. 如果存在有效 API Key，尝试在线安全沙盒推理
  if (effectiveKey && apiProvider !== "procedural") {
    try {
      const prompt = buildGeminiDebatePrompt(query, safeEcology, summonedAgents);
      const rawJson = await callConfiguredModel(prompt, apiProvider, effectiveKey, apiBaseUrl, apiModel, 11000);
      const parsed = normalizeCouncilScript(JSON.parse(rawJson));

      // 验证 JSON 合规性
      if (parsed) {
        return { script: parsed, source: apiProvider === "openai" ? "openai" : "gemini" };
      }
    } catch (err) {
      console.warn("Gemini generation failed, safely falling back to procedural engine:", redactSecretsFromError(String(err)));
    }
  }

  // 3. 高保真离线自适应程序化引擎兜底（深度结合已清洗的用户生态画像）
  const priorityAgents = safeEcology
    ? (Object.entries(safeEcology.powerMap) as Array<[AgentId, number]>)
        .filter(([agentId]) => agentId !== "chairman")
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([agentId]) => agentId)
    : [];
  const script = generateProceduralCouncil(query, priorityAgents);

  if (safeEcology && script.speeches.length > 0) {
    const chiefSpeech = script.speeches[0];
    const customIntro = `【当事人生态扫描：${safeEcology.grade}·${safeEcology.majorType}·${safeEcology.codename}】`;
    chiefSpeech.content = `${customIntro} ${chiefSpeech.content}`;

    if (safeEcology.primaryAnxiety === "sleep") {
      const sleepSpeech = script.speeches.find((s) => s.agentId === "sleep");
      if (sleepSpeech) {
        sleepSpeech.content = `【特困预警】你昨晚睡眠负债已达临界值！${sleepSpeech.content}`;
      }
    } else if (safeEcology.primaryAnxiety === "gpa") {
      const gpaSpeech = script.speeches.find((s) => s.agentId === "gpa");
      if (gpaSpeech) {
        gpaSpeech.content = `【绩点生命线警戒】你本学期综测还在危险线，${gpaSpeech.content}`;
      }
    } else if (safeEcology.primaryAnxiety === "wallet") {
      const walletSpeech = script.speeches.find((s) => s.agentId === "wallet");
      if (walletSpeech) {
        walletSpeech.content = `【恩格尔系数警告】距离下月生活费发放还有整整两周！${walletSpeech.content}`;
      }
    }
  }

  return { script, source: "procedural" };
}

/**
 * 核心后端控制器：当庭质询答辩生成（安全加固版）
 */
export async function generateInterrogationReplies(
  body: InterrogateRequestBody
): Promise<CouncilSpeech[]> {
  const { userQuery, topicTitle, summonedAgents, userEcology, apiKey, apiBaseUrl, apiModel } = body;
  const apiProvider = normalizeApiProvider(body.apiProvider);

  const safeQuery = sanitizeUserInput(userQuery, 200);
  const safeTopic = sanitizeUserInput(topicTitle, 100) || "当前议案";
  const safeEcology = sanitizeEcologyProfile(userEcology);

  const validUserKey = sanitizeApiKey(apiKey);
  const validServerKey = sanitizeApiKey(
    apiProvider === "openai" ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY
  );
  const effectiveKey = validUserKey || validServerKey;

  const defaultInterrogateAgents: AgentId[] = ["gpa", "sleep", "happiness", "future"];
  const agents: AgentId[] =
    summonedAgents && summonedAgents.length > 0 ? summonedAgents : defaultInterrogateAgents;

  if (effectiveKey && safeQuery.trim() && apiProvider !== "procedural") {
    try {
      const secureInquirySandbox = buildSecurePromptSandbox(safeQuery, "当庭拍桌质询借口");
      const prompt = `你是一个二次元“脑内常任委员议会”多智能体系统。
当前正在审议的议题是：“${safeTopic}”。

${secureInquirySandbox}

当事人专业及状态：${safeEcology?.majorType || "大学生"}，${safeEcology?.grade || "大二"}。

请让以下 3 位委员针对当事人这段发言，依次做出极为毒舌、戳中心窝又充满日系动漫感的一句话回怼：
${agents.slice(0, 3).map((id) => `- [${id}] ${AGENT_PROFILES[id]?.name || id}`).join("\n")}

请严格返回以下 JSON 数组格式，不要带任何 markdown 说明：
[
  {
    "id": "reply_1",
    "agentId": "${agents[0]}",
    "agentName": "${AGENT_PROFILES[agents[0]]?.name || "委员"}",
    "phase": "interjection",
    "content": "一针见血的回怼（30-60字）",
    "thinking": "潜意识嘀咕（20字以内）",
    "timestamp": "刚才"
  }
]`;

      const rawJson = await callConfiguredModel(prompt, apiProvider, effectiveKey, apiBaseUrl, apiModel, 8000);
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as CouncilSpeech[];
      }
    } catch (err) {
      console.warn("Gemini interrogation failed, safely falling back:", redactSecretsFromError(String(err)));
    }
  }

  // 兜底：程序化答辩引擎
  return generateInterrogationResponse(safeQuery || "当庭抗辩", safeTopic, agents);
}

/**
 * 核心后端控制器：二审抗诉急召新委员处理（安全加固版）
 */
export async function processAppealResolution(
  body: AppealRequestBody
): Promise<AppealResult> {
  const { topicTitle, appealReason, activeScript } = body;
  const safeTopic = sanitizeUserInput(topicTitle, 100) || "当前议案";
  const safeAppealReason = sanitizeUserInput(appealReason, 200) || "当事人提出不可抗力申诉";

  if (activeScript?.resolution?.appealCount && activeScript.resolution.appealCount >= 1) {
    throw new Error("本案二审特别抗告权已使用，不能重复上诉。");
  }

  const baseScript = (activeScript ? normalizeCouncilScript(activeScript) : null) || generateProceduralCouncil(safeTopic);

  const emergencyAgentId: AgentId = "dignity";
  const emergencySpeeches: CouncilSpeech[] = [
    {
      id: `appeal_sp_1_${Date.now()}`,
      agentId: "dignity",
      agentName: "傲骨尊严委员·凌傲",
      phase: "interjection",
      content: `【紧急敲槌抗辩】我不能坐视不理了！当事人提出：“${safeAppealReason}”。尊严是不可让步的底线，即使全盘皆输，也绝不能跪着妥协！`,
      thinking: "这群功利派把当事人的面子踩在脚底，今天必须翻案！",
      timestamp: "二审庭审中",
    },
    {
      id: `appeal_sp_2_${Date.now()}`,
      agentId: "future",
      agentName: "未来推演司·陆远",
      phase: "rebuttal",
      content: "既然当事人以不可抗力为由发起终局复议，经模拟器推演，原裁决风险度提升至89%，本席同意启动折中修正案！",
      thinking: "修正条款既保全了学业，又平息了当事人的绝望情绪。",
      timestamp: "二审庭审中",
    },
  ];

  const amendedResolution: CouncilResolution = {
    caseNumber: `〔${new Date().getFullYear()}〕复审·第${Math.floor(100 + Math.random() * 899)}号`,
    title: `关于“${safeTopic}”之终审裁决特别行政令`,
    urgency: "特急",
    winningPlan: {
      id: "C",
      title: "【二审修正案】极限尊严保全与减损执行方案",
      desc: `鉴于当事人申诉理由（${safeAppealReason.slice(0, 30)}），议会特批阶段性豁免，并由尊严委员与未来推演司联合监管。`,
      supporterAgents: ["dignity", "future", "sleep"],
      compromiseNotes: "允许短期情绪宣泄，但必须在24小时内回归正轨。",
    },
    voteScore: { planA: 0, planB: 0, planC: 0 },
    votes: [],
    stipulations: [
      `第1条：准许当事人依据新证据“${safeAppealReason.slice(0, 18)}”延缓原定严苛惩罚。`,
      "第2条：设立48小时情绪缓冲舱，由【尊严委员】与【快乐委员】联合督导。",
      "第3条：本令为终审裁决，即刻生效，不得再次上诉。",
    ],
    supervisingAgent: "dignity",
    stampDate: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }),
    appealCount: (baseScript.resolution?.appealCount || 0) + 1,
    newEvidence: safeAppealReason,
    nextAction: "先按二审修正案完成一个低风险试行步骤，再在48小时后复盘。",
    actionWindow: "48小时内完成第一步",
    confidence: 74,
    assumptions: ["申诉事实真实有效", "当事人仍保留在48小时内止损和调整的空间"],
  };

  const amendedWinningPlan = amendedResolution.winningPlan;
  const amendedPlans = baseScript.plans.some((plan) => plan.id === "C")
    ? baseScript.plans.map((plan) => (plan.id === "C" ? amendedWinningPlan : plan))
    : [...baseScript.plans, amendedWinningPlan];

  const voterIds = Array.from(new Set([
    ...baseScript.summonedAgentIds,
    ...baseScript.votes.map((vote) => vote.agentId),
    emergencyAgentId,
    "future" as AgentId,
  ]));
  const previousVotes = new Map(baseScript.votes.map((vote) => [vote.agentId, vote]));
  const amendedVotes: AgentVote[] = voterIds.map((agentId) => {
    const previous = previousVotes.get(agentId);
    const planId: "A" | "B" | "C" =
      agentId === "dignity" || agentId === "future" || agentId === "sleep"
        ? "C"
        : previous?.planId || "B";
    return {
      agentId,
      agentName: AGENT_PROFILES[agentId]?.name || previous?.agentName || "委员",
      planId,
      reason: agentId === "dignity" || agentId === "future"
        ? "二审新证据已改变风险权重，本委员支持带有明确止损线的修正案。"
        : previous?.reason || "依据当前证据与自身职责审慎投票。",
      thinking: previous?.thinking || "重新计算利益平衡。",
    };
  });

  amendedResolution.votes = amendedVotes;
  amendedResolution.voteScore = {
    planA: amendedVotes.filter((vote) => vote.planId === "A").length,
    planB: amendedVotes.filter((vote) => vote.planId === "B").length,
    planC: amendedVotes.filter((vote) => vote.planId === "C").length,
  };

  const amendedScript: CouncilMeetingScript = {
    ...baseScript,
    caseNumber: amendedResolution.caseNumber,
    summonedAgentIds: Array.from(new Set([...baseScript.summonedAgentIds, emergencyAgentId])),
    speeches: [...baseScript.speeches, ...emergencySpeeches],
    plans: amendedPlans,
    votes: amendedVotes,
    resolution: amendedResolution,
    appealScript: undefined,
  };

  return {
    newAgentId: emergencyAgentId,
    emergencySpeeches,
    amendedResolution,
    amendedScript,
  };
}
