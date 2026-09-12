import { AgentId, CouncilSpeech, ProposalPlan, AgentVote, CouncilResolution, UserEcologyProfile } from "../types";
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
  apiProvider?: "gemini" | "openai" | "custom";
  summonedAgents?: AgentId[];
}

export interface InterrogateRequestBody {
  userQuery: string;
  topicTitle?: string;
  summonedAgents?: AgentId[];
  userEcology?: UserEcologyProfile | null;
  apiKey?: string;
}

export interface AppealRequestBody {
  caseNumber?: string;
  topicTitle: string;
  appealReason: string;
  activeScript?: CouncilMeetingScript;
  userEcology?: UserEcologyProfile | null;
  apiKey?: string;
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
  "caseNumber": "〔2026〕第 09${Math.floor(10 + Math.random() * 89)} 号",
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
    "caseNumber": "〔2026〕第 09${Math.floor(10 + Math.random() * 89)} 号",
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
    "appealCount": 0
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

/**
 * 核心后端控制器：生成完整议会辩论剧本（安全加固版）
 */
export async function generateCouncilDebate(
  body: DebateRequestBody
): Promise<{ script: CouncilMeetingScript; source: "gemini" | "procedural" | "preset" }> {
  const { topicId, customQuestion, userEcology, apiKey, summonedAgents } = body;

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
  const validServerKey = sanitizeApiKey(process.env.GEMINI_API_KEY);
  const effectiveKey = validUserKey || validServerKey;

  // 2. 如果存在有效 API Key，尝试在线安全沙盒推理
  if (effectiveKey) {
    try {
      const prompt = buildGeminiDebatePrompt(query, safeEcology, summonedAgents);
      const rawJson = await callGemini(prompt, effectiveKey, 11000);
      const parsed = JSON.parse(rawJson);

      // 验证 JSON 合规性
      if (parsed.caseNumber && parsed.speeches && parsed.speeches.length > 0 && parsed.resolution) {
        return { script: parsed as CouncilMeetingScript, source: "gemini" };
      }
    } catch (err) {
      console.warn("Gemini generation failed, safely falling back to procedural engine:", redactSecretsFromError(String(err)));
    }
  }

  // 3. 高保真离线自适应程序化引擎兜底（深度结合已清洗的用户生态画像）
  const script = generateProceduralCouncil(query);

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
  const { userQuery, topicTitle, summonedAgents, userEcology, apiKey } = body;

  const safeQuery = sanitizeUserInput(userQuery, 200);
  const safeTopic = sanitizeUserInput(topicTitle, 100) || "当前议案";
  const safeEcology = sanitizeEcologyProfile(userEcology);

  const validUserKey = sanitizeApiKey(apiKey);
  const validServerKey = sanitizeApiKey(process.env.GEMINI_API_KEY);
  const effectiveKey = validUserKey || validServerKey;

  const defaultInterrogateAgents: AgentId[] = ["gpa", "sleep", "happiness", "future"];
  const agents: AgentId[] =
    summonedAgents && summonedAgents.length > 0 ? summonedAgents : defaultInterrogateAgents;

  if (effectiveKey && safeQuery.trim()) {
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

      const rawJson = await callGemini(prompt, effectiveKey, 8000);
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
): Promise<{
  newAgentId: AgentId;
  emergencySpeeches: CouncilSpeech[];
  amendedResolution: CouncilResolution;
}> {
  const { topicTitle, appealReason, activeScript } = body;
  const safeTopic = sanitizeUserInput(topicTitle, 100) || "当前议案";
  const safeAppealReason = sanitizeUserInput(appealReason, 200) || "当事人提出不可抗力申诉";

  if (activeScript?.appealScript) {
    return activeScript.appealScript;
  }

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
    caseNumber: activeScript?.caseNumber || `〔2026〕复审·第${Math.floor(100 + Math.random() * 899)}号`,
    title: `关于“${safeTopic}”之终审裁决特别行政令`,
    urgency: "特急",
    winningPlan: {
      id: "C",
      title: "【二审修正案】极限尊严保全与减损执行方案",
      desc: `鉴于当事人申诉理由（${safeAppealReason.slice(0, 30)}），议会特批阶段性豁免，并由尊严委员与未来推演司联合监管。`,
      supporterAgents: ["dignity", "future", "sleep"],
      compromiseNotes: "允许短期情绪宣泄，但必须在24小时内回归正轨。",
    },
    voteScore: { planA: 2, planB: 1, planC: 5 },
    votes: [],
    stipulations: [
      `第1条：准许当事人依据新证据“${safeAppealReason.slice(0, 18)}”延缓原定严苛惩罚。`,
      "第2条：设立48小时情绪缓冲舱，由【尊严委员】与【快乐委员】联合督导。",
      "第3条：本令为终审裁决，即刻生效，不得再次上诉。",
    ],
    supervisingAgent: "dignity",
    stampDate: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }),
    appealCount: (activeScript?.resolution?.appealCount || 0) + 1,
    newEvidence: safeAppealReason,
  };

  return {
    newAgentId: emergencyAgentId,
    emergencySpeeches,
    amendedResolution,
  };
}
