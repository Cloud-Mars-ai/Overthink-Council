import { NextRequest, NextResponse } from "next/server";
import {
  generateCouncilDebate,
  generateInterrogationReplies,
  processAppealResolution,
} from "@/lib/server/council-service";
import { AGENT_PROFILES } from "@/lib/agents-data";
import {
  getClientIp,
  checkRateLimit,
  checkPayloadSize,
  redactSecretsFromError,
  sanitizeApiKey,
  sanitizeUserInput,
  maskSecret,
} from "@/lib/server/security";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * 通用脑内议会核心网关路由 (POST /api/council)
 * 具备 IP 速率限制防护、密钥脱敏与安全沙盒隔离
 */
export async function POST(req: NextRequest) {
  // 1. 检查请求体尺寸 (防 DoS 内存耗尽)
  if (!checkPayloadSize(req)) {
    return NextResponse.json(
      { success: false, error: "请求数据包过大 (Payload Too Large)" },
      { status: 413, headers: NO_CACHE_HEADERS }
    );
  }

  // 2. IP 速率限制防护
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, 30);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "请求过于频繁，请稍候再试（脑内神经元冷却中）",
        retryAfterSeconds: rateLimit.resetInSeconds,
      },
      {
        status: 429,
        headers: {
          ...NO_CACHE_HEADERS,
          "Retry-After": String(rateLimit.resetInSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, isInterrogation, isAppeal } = body;

    // 2. 当庭质询答辩 (Interrogation)
    if (action === "interrogate" || isInterrogation) {
      const userQuery = sanitizeUserInput(body.userQuery, 200);
      const speeches = await generateInterrogationReplies({
        userQuery,
        topicTitle: sanitizeUserInput(body.topicTitle || body.customQuestion, 100),
        summonedAgents: body.summonedAgents,
          userEcology: body.userEcology,
          apiKey: sanitizeApiKey(body.apiKey) || undefined,
          apiProvider: body.apiProvider,
          apiBaseUrl: body.apiBaseUrl,
          apiModel: body.apiModel,
        });

      return NextResponse.json(
        {
          success: true,
          action: "interrogate",
          speeches,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 3. 二审复议上诉 (Appeal)
    if (action === "appeal" || isAppeal) {
      const appealReason = sanitizeUserInput(body.appealReason || body.evidence, 200) || "当事人提出不可抗力申诉";

      const result = await processAppealResolution({
        caseNumber: sanitizeUserInput(body.caseNumber, 40),
        topicTitle: sanitizeUserInput(body.topicTitle, 100) || "当前议案",
        appealReason,
        activeScript: body.activeScript,
        userEcology: body.userEcology,
        apiKey: sanitizeApiKey(body.apiKey) || undefined,
      });

      return NextResponse.json(
        {
          success: true,
          action: "appeal",
          ...result,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 4. 全量议会辩论剧本生成 (Debate)
    const customQuestion = sanitizeUserInput(body.customQuestion, 300);

    const result = await generateCouncilDebate({
      topicId: typeof body.topicId === "string" ? body.topicId.slice(0, 50) : undefined,
      customQuestion,
      userEcology: body.userEcology,
      apiKey: sanitizeApiKey(body.apiKey) || undefined,
      apiProvider: body.apiProvider,
      apiBaseUrl: body.apiBaseUrl,
      apiModel: body.apiModel,
      summonedAgents: body.summonedAgents,
    });

    return NextResponse.json(
      {
        success: true,
        action: "debate",
        source: result.source,
        script: result.script,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : "Internal server error";
    const safeMessage = redactSecretsFromError(rawMessage);
    return NextResponse.json(
      { success: false, error: safeMessage },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

/**
 * 议会服务自检与状态接口 (GET /api/council)
 * 安全加固：绝不输出 process.env 密钥明文
 */
export async function GET() {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json(
    {
      success: true,
      status: "online",
      name: "Mind Council Neural Engine Gateway",
      version: "2.5.3",
      security: {
        rateLimiterActive: true,
        keySanitizationActive: true,
        promptSandboxActive: true,
        serverEnvKeyConfigured: hasEnvKey,
        serverEnvKeyMasked: hasEnvKey ? maskSecret(process.env.GEMINI_API_KEY) : "NOT_CONFIGURED",
      },
      serverTime: new Date().toISOString(),
      commissionersCount: Object.keys(AGENT_PROFILES).length,
      supportedProviders: ["gemini", "openai", "procedural"],
    },
    { headers: NO_CACHE_HEADERS }
  );
}
