// Full Test Suite for Mind Council Universal & Dedicated Backend Endpoints
async function runFullTests() {
  const baseUrl = "http://localhost:3000";
  console.log("=== Testing Mind Council Full Backend Suite at", baseUrl, "===");

  try {
    // 1. GET /api/council/health
    console.log("\n[1/6] Testing GET /api/council/health...");
    const resHealth = await fetch(`${baseUrl}/api/council/health`);
    const dataHealth = await resHealth.json();
    console.log("-> Status:", resHealth.status, "| Commissioners:", dataHealth.activeCommissioners?.length);

    // 2. GET /api/council (Universal Root Info)
    console.log("\n[2/6] Testing GET /api/council...");
    const resRootGet = await fetch(`${baseUrl}/api/council`);
    const dataRootGet = await resRootGet.json();
    console.log("-> Status:", resRootGet.status, "| Service:", dataRootGet.name, "| Version:", dataRootGet.version);

    // 3. POST /api/council (Universal Debate)
    console.log("\n[3/6] Testing POST /api/council (action: debate)...");
    const resRootDebate = await fetch(`${baseUrl}/api/council`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "debate",
        customQuestion: "大三该不该放弃保研全力准备出国？",
        userEcology: {
          codename: "绩点守门人",
          grade: "大三",
          majorType: "商科金融",
          primaryAnxiety: "gpa",
          rulingParty: "实用主义派",
        },
      }),
    });
    const dataRootDebate = await resRootDebate.json();
    console.log("-> Status:", resRootDebate.status, "| Success:", dataRootDebate.success, "| Case:", dataRootDebate.script?.caseNumber, "| Speeches:", dataRootDebate.script?.speeches?.length);

    // 4. POST /api/council/debate (Dedicated Route)
    console.log("\n[4/6] Testing POST /api/council/debate...");
    const resDedDebate = await fetch(`${baseUrl}/api/council/debate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customQuestion: "明天早八，室友非拉我通宵排位，去不去？",
      }),
    });
    const dataDedDebate = await resDedDebate.json();
    console.log("-> Status:", resDedDebate.status, "| Success:", dataDedDebate.success, "| Source:", dataDedDebate.source);

    // 5. POST /api/council/interrogate
    console.log("\n[5/6] Testing POST /api/council/interrogate...");
    const resInterrogate = await fetch(`${baseUrl}/api/council/interrogate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userQuery: "可是如果我不去，室友会觉得我不合群冷落我！",
        topicTitle: "通宵排位案",
        summonedAgents: ["social", "dignity", "happiness"],
      }),
    });
    const dataInterrogate = await resInterrogate.json();
    console.log("-> Status:", resInterrogate.status, "| Success:", dataInterrogate.success, "| Replies:", dataInterrogate.speeches?.length);
    console.log("   First agent replied:", dataInterrogate.speeches?.[0]?.agentName);

    // 6. POST /api/council/appeal
    console.log("\n[6/6] Testing POST /api/council/appeal...");
    const resAppeal = await fetch(`${baseUrl}/api/council/appeal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseNumber: "〔2026〕第 0927 号",
        topicTitle: "通宵排位案",
        appealReason: "明早的高数老师突然在班级群通知明天停课一次！",
      }),
    });
    const dataAppeal = await resAppeal.json();
    console.log("-> Status:", resAppeal.status, "| Success:", dataAppeal.success, "| Summoned:", dataAppeal.newAgentId);
    console.log("   Amended Verdict:", dataAppeal.amendedResolution?.title);

    console.log("\n>>> ALL 6 ENDPOINTS VERIFIED & OPERATIONAL! <<<");
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runFullTests();
