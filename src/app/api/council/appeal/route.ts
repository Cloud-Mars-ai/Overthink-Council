import { NextRequest, NextResponse } from "next/server";
import { processAppealResolution } from "@/lib/server/council-service";
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
        error: "上诉申请过于频繁，请等待复审法庭开庭",
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
    const appealReason = sanitizeUserInput(body.appealReason || body.evidence, 200) || "当事人提出不可抗力申诉";
    const safeKey = sanitizeApiKey(body.apiKey) || undefined;

    const result = await processAppealResolution({
      caseNumber: sanitizeUserInput(body.caseNumber, 40),
      topicTitle: sanitizeUserInput(body.topicTitle, 100) || "当前议案",
      appealReason,
      activeScript: body.activeScript,
      userEcology: body.userEcology,
      apiKey: safeKey,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
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
