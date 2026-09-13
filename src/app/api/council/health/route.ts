import { NextResponse } from "next/server";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { maskSecret } from "@/lib/server/security";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET() {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

  return NextResponse.json(
    {
      status: "ok",
      service: "mind-council-backend",
      version: "2.5.3",
      uptimeSeconds: Math.floor(process.uptime()),
      security: {
        rateLimiterActive: true,
        rateLimiterScope: "process-local",
        inputSanitizationActive: true,
        promptInjectionGuardActive: true,
        modelOutputValidationActive: true,
        proxyHeadersTrusted: process.env.TRUST_PROXY_HEADERS === "true",
        serverEnvKeyConfigured: hasGeminiKey || hasOpenAiKey,
        serverEnvKeyMasked: hasGeminiKey ? maskSecret(process.env.GEMINI_API_KEY) : "NOT_CONFIGURED",
        openAiEnvKeyConfigured: hasOpenAiKey,
      },
      activeCommissioners: Object.keys(AGENT_PROFILES).map((id) => ({
        id,
        name: AGENT_PROFILES[id].name,
        party: AGENT_PROFILES[id].partyName,
        power: AGENT_PROFILES[id].powerPercent,
      })),
      timestamp: new Date().toISOString(),
    },
    { headers: NO_CACHE_HEADERS }
  );
}
