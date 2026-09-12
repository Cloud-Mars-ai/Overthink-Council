import { NextRequest, NextResponse } from "next/server";
import { generateInterrogationReplies } from "@/lib/server/council-service";
import {
  getClientIp,
  checkRateLimit,
  checkPayloadSize,
  redactSecretsFromError,
  sanitizeApiKey,
  sanitizeUserInput,
} from "@/lib/server/security";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function POST(req: NextRequest) {
  // 1. 检查请求体尺寸 (防 DoS)
  if (!checkPayloadSize(req)) {
    return NextResponse.json(
      { success: false, error: "请求数据包过大 (Payload Too Large)" },
      { status: 413, headers: NO_CACHE_HEADERS }
    );
  }

  // 2. IP 速率限制
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, 45);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "质询过于频繁，请稍候再试（委员正在平复情绪）",
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
    const userQuery = sanitizeUserInput(body.userQuery, 200);
    const safeKey = sanitizeApiKey(body.apiKey) || undefined;

    const speeches = await generateInterrogationReplies({
      userQuery,
      topicTitle: sanitizeUserInput(body.topicTitle || body.customQuestion, 100),
      summonedAgents: body.summonedAgents,
      userEcology: body.userEcology,
      apiKey: safeKey,
    });

    return NextResponse.json(
      {
        success: true,
        speeches,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: redactSecretsFromError(rawMessage) },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
