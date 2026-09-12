import { NextResponse } from "next/server";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { maskSecret } from "@/lib/server/security";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET() {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);

  return NextResponse.json(
    {
      status: "ok",
      service: "mind-council-backend",
      version: "2.5.3",
      uptimeSeconds: Math.floor(process.uptime()),
      security: {
        rateLimiterActive: true,
        inputSanitizationActive: true,
        promptInjectionGuardActive: true,
        serverEnvKeyConfigured: hasEnvKey,
        serverEnvKeyMasked: hasEnvKey ? maskSecret(process.env.GEMINI_API_KEY) : "NOT_CONFIGURED",
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
