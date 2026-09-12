import { NextRequest, NextResponse } from "next/server";
import { generateCouncilDebate } from "@/lib/server/council-service";
import {
  getClientIp,
  checkRateLimit,
  redactSecretsFromError,
  sanitizeApiKey,
  sanitizeUserInput,
} from "@/lib/server/security";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function POST(req: NextRequest) {
  // IP 速率限制
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
    const customQuestion = sanitizeUserInput(body.customQuestion, 300);
    const safeKey = sanitizeApiKey(body.apiKey) || undefined;

    const result = await generateCouncilDebate({
      topicId: typeof body.topicId === "string" ? body.topicId.slice(0, 50) : undefined,
      customQuestion,
      userEcology: body.userEcology,
      apiKey: safeKey,
      apiProvider: body.apiProvider,
      summonedAgents: body.summonedAgents,
    });

    return NextResponse.json(
      {
        success: true,
        source: result.source,
        script: result.script,
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
