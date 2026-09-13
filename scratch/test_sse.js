// 测试 /api/council/stream SSE 端点
async function testStream() {
  try {
    const res = await fetch("http://localhost:3000/api/council/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customQuestion: "明天早八高数课，舍友喊我通宵五排打瓦，到底去不去？",
      }),
    });

    console.log("SSE HTTP Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));

    if (!res.ok) {
      const errText = await res.text();
      console.error("Error response:", errText);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let eventsReceived = 0;
    while (eventsReceived < 15) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n");
      for (const line of lines) {
        if (line.startsWith("event:") || line.startsWith("data:")) {
          eventsReceived++;
          console.log(line.slice(0, 80));
        }
      }
    }

    console.log("SSE Stream successfully established and received events!");
    await reader.cancel();
  } catch (err) {
    console.error("SSE Test failed:", err);
  }
}

testStream();
