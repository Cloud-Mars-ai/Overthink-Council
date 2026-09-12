import { NextRequest } from "next/server";
import { generateCouncilDebate } from "@/lib/server/council-service";
import {
  getClientIp,
  checkRateLimit,
  checkPayloadSize,
  redactSecretsFromError,
  sanitizeApiKey,
  sanitizeUserInput,
} from "@/lib/server/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. 检查请求体尺寸 (防 DoS)
  if (!checkPayloadSize(req)) {
    return new Response(JSON.stringify({ error: "请求数据包过大" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. IP 速率限制
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, 30);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "请求过于频繁，请稍候再试（脑内神经元冷却中）",
        retryAfterSeconds: rateLimit.resetInSeconds,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.resetInSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const customQuestion = sanitizeUserInput(body.customQuestion, 300);
    const safeKey = sanitizeApiKey(body.apiKey) || undefined;

    // 先获取或生成完整会审脚本
    const debateResult = await generateCouncilDebate({
      topicId: typeof body.topicId === "string" ? body.topicId.slice(0, 50) : undefined,
      customQuestion,
      userEcology: body.userEcology,
      apiKey: safeKey,
      apiProvider: body.apiProvider,
      summonedAgents: body.summonedAgents,
    });

    const script = debateResult.script;
    const encoder = new TextEncoder();

    // 构造 Server-Sent Events (SSE) 流
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        try {
          // 1. 发送初始化连接事件
          sendEvent("connected", {
            caseNumber: script.caseNumber,
            topicTitle: script.topicTitle,
            category: script.category,
            urgency: script.urgency,
            source: debateResult.source,
          });

          // 2. 逐个发言流式发射（模拟真实审议中委员逐个起立陈述）
          for (let i = 0; i < script.speeches.length; i++) {
            const speech = script.speeches[i];

            // 告知该发言开始
            sendEvent("speech_start", {
              index: i,
              id: speech.id,
              agentId: speech.agentId,
              agentName: speech.agentName,
              phase: speech.phase,
              interrupted: speech.interrupted,
              thinking: speech.thinking,
            });

            // 将发言台词切片流式发送 (SSE token/character chunks)
            const text = speech.content;
            const chunkSize = 3; // 每次发送 3 个汉字
            for (let c = 0; c < text.length; c += chunkSize) {
              const chunk = text.slice(c, c + chunkSize);
              sendEvent("speech_chunk", {
                id: speech.id,
                chunk,
                progress: Math.min(1, (c + chunkSize) / text.length),
              });
              // 模拟神经网络微延迟 18ms
              await new Promise((r) => setTimeout(r, 18));
            }

            // 发言结束
            sendEvent("speech_end", speech);
            // 委员之间微停顿
            await new Promise((r) => setTimeout(r, 60));
          }

          // 3. 发送方案与表决
          sendEvent("plans", { plans: script.plans, votes: script.votes });

          // 4. 发送终局决议
          sendEvent("resolution", script.resolution);

          // 5. 发送完成标志及完整备份
          sendEvent("done", { fullScript: script });
        } catch (streamErr) {
          sendEvent("error", {
            message: redactSecretsFromError(
              streamErr instanceof Error ? streamErr.message : "流式传输异常"
            ),
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: redactSecretsFromError(rawMessage) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
