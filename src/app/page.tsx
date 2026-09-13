"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { PresetAccordion } from "@/components/PresetAccordion";
import { CommissionerRoster } from "@/components/CommissionerRoster";
import { SituationAnalyzerModal } from "@/components/SituationAnalyzerModal";
import { CouncilDebateRoom } from "@/components/CouncilDebateRoom";
import { VotingChamber } from "@/components/VotingChamber";
import { AppealModal } from "@/components/AppealModal";
import { MindParliamentBento } from "@/components/MindParliamentBento";
import { OfficialResolutionCard } from "@/components/OfficialResolutionCard";
import { SettingsModal } from "@/components/SettingsModal";
import { MindEcologyModal } from "@/components/MindEcologyModal";
import { generateProceduralCouncil, getRealtimeScript, CouncilMeetingScript } from "@/lib/council-engine";
import { AgentId, ApiConfig, ApiProvider, PresetTopic, MeetingPhase, UserEcologyProfile } from "@/lib/types";
import { playBell, playAlarm } from "@/lib/audio";
import { Scale, Sparkles, Send, ArrowLeft, Compass, X, Users, FileText } from "lucide-react";

type GenerationSource = "gemini" | "openai" | "procedural" | "preset";

interface StreamStatus {
  caseNumber: string;
  agentName: string;
  text: string;
  speechIndex: number;
  source: GenerationSource;
}

interface DebatePayload {
  topicId?: string;
  customQuestion?: string;
  userEcology: UserEcologyProfile | null;
  apiKey: string;
  apiProvider: ApiProvider;
  apiBaseUrl: string;
  apiModel: string;
}

interface SavedCase {
  caseNumber: string;
  topicTitle: string;
  savedAt: string;
  script: CouncilMeetingScript;
}

async function consumeDebateStream(
  payload: DebatePayload,
  onEvent: (event: string, data: Record<string, unknown>) => void,
  signal: AbortSignal
): Promise<CouncilMeetingScript> {
  const response = await fetch("/api/council/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`stream request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completedScript: CouncilMeetingScript | null = null;

  const processBlock = (block: string) => {
    const lines = block.split("\n");
    let eventName = "message";
    let dataText = "";
    for (const line of lines) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      if (line.startsWith("data:")) dataText += line.slice(5).trim();
    }
    if (!dataText) return;
    const data = JSON.parse(dataText) as Record<string, unknown>;
    if (eventName === "done" && data.fullScript) {
      completedScript = data.fullScript as CouncilMeetingScript;
    }
    if (eventName === "error") {
      throw new Error(typeof data.message === "string" ? data.message : "流式传输异常");
    }
    onEvent(eventName, data);
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";
    blocks.forEach(processBlock);
    if (done) break;
  }
  if (buffer.trim()) processBlock(buffer);

  if (!completedScript) throw new Error("流式结果不完整");
  return completedScript;
}

export default function Home() {
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [phase, setPhase] = useState<MeetingPhase>("idle");
  const [activeScript, setActiveScript] = useState<CouncilMeetingScript | null>(null);
  const [generationSource, setGenerationSource] = useState<GenerationSource>("procedural");
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [verdictNotice, setVerdictNotice] = useState<string | null>(null);
  const [recentCases, setRecentCases] = useState<SavedCase[]>([]);
  const debateAbortRef = useRef<AbortController | null>(null);

  // 用户脑内生态画像 (User Ecology Profile)
  const [userEcology, setUserEcology] = useState<UserEcologyProfile | null>(null);
  const [isEcologyModalOpen, setIsEcologyModalOpen] = useState<boolean>(false);

  // 顶部主要模块弹窗状态（首页极净化）
  const [isRosterOpen, setIsRosterOpen] = useState<boolean>(false);
  const [isDossiersOpen, setIsDossiersOpen] = useState<boolean>(false);
  const [isParliamentOpen, setIsParliamentOpen] = useState<boolean>(false);

  // 弹窗状态
  const [isAppealOpen, setIsAppealOpen] = useState<boolean>(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // API 配置：密钥只保存在当前会话内，不写入 localStorage
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    provider: "gemini",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  });

  // 初次启动检测：校准脑内神经元生态 & 全局 Escape 键监听
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mind_council_user_ecology");
      if (saved) {
        const parsed = JSON.parse(saved) as UserEcologyProfile;
        window.setTimeout(() => setUserEcology(parsed), 0);
      }
    } catch {
      // 忽略损坏的画像数据，用户仍可从首页手动开启校准
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsRosterOpen(false);
        setIsDossiersOpen(false);
        setIsParliamentOpen(false);
        setIsAppealOpen(false);
        setIsShareCardOpen(false);
        setIsSettingsOpen(false);
        setIsEcologyModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const historyTimer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("mind_council_recent_cases");
        if (!saved) return;
        const parsed = JSON.parse(saved) as SavedCase[];
        if (Array.isArray(parsed)) {
          setRecentCases(parsed.filter((entry) => entry?.script?.resolution && entry?.script?.caseNumber).slice(0, 3));
        }
      } catch {
        // 忽略损坏或过期的本地历史，保证主流程可用
      }
    }, 0);
    return () => window.clearTimeout(historyTimer);
  }, []);

  const anyModalOpen = isRosterOpen || isDossiersOpen || isParliamentOpen || isAppealOpen || isShareCardOpen || isSettingsOpen || isEcologyModalOpen;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (anyModalOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [anyModalOpen]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getPriorityAgents = (): AgentId[] => userEcology
    ? (Object.entries(userEcology.powerMap) as Array<[AgentId, number]>)
        .filter(([agentId]) => agentId !== "chairman")
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([agentId]) => agentId)
    : [];

  const rememberScript = (script: CouncilMeetingScript) => {
    const entry: SavedCase = {
      caseNumber: script.caseNumber,
      topicTitle: script.topicTitle,
      savedAt: new Date().toLocaleString("zh-CN"),
      script,
    };
    setRecentCases((current) => {
      const next = [entry, ...current.filter((item) => item.caseNumber !== script.caseNumber)].slice(0, 3);
      try {
        localStorage.setItem("mind_council_recent_cases", JSON.stringify(next));
      } catch {
        // 历史记录不是主流程依赖，存储空间不足时静默跳过
      }
      return next;
    });
  };

  const runDebate = async (payload: DebatePayload, fallbackQuestion: string) => {
    debateAbortRef.current?.abort();
    const controller = new AbortController();
    debateAbortRef.current = controller;
    setIsLoading(true);
    setGenerationError(null);
    setStreamStatus(null);
    setVerdictNotice(null);

    try {
      let streamSource: GenerationSource = payload.topicId ? "preset" : "procedural";
      try {
        const script = await consumeDebateStream(payload, (event, data) => {
          if (event === "connected") {
            streamSource = (data.source as GenerationSource) || streamSource;
            setStreamStatus({
              caseNumber: typeof data.caseNumber === "string" ? data.caseNumber : "立案中",
              agentName: "委员会主任",
              text: "正在连接脑内议会并准备第一份陈述…",
              speechIndex: 0,
              source: streamSource,
            });
          } else if (event === "speech_start") {
            setStreamStatus((current) => ({
              caseNumber: current?.caseNumber || "审理中",
              agentName: typeof data.agentName === "string" ? data.agentName : "委员",
              text: "",
              speechIndex: typeof data.index === "number" ? data.index + 1 : current?.speechIndex || 1,
              source: current?.source || "procedural",
            }));
          } else if (event === "speech_chunk") {
            setStreamStatus((current) => current ? { ...current, text: `${current.text}${typeof data.chunk === "string" ? data.chunk : ""}` } : current);
          } else if (event === "speech_end") {
            setStreamStatus((current) => current ? { ...current, text: typeof data.content === "string" ? data.content : current.text } : current);
          }
        }, controller.signal);
        setGenerationSource(streamSource);
        setActiveScript(script);
        rememberScript(script);
        setPhase("analyzing");
        return;
      } catch (streamError) {
        if (controller.signal.aborted) return;
        console.warn("SSE debate stream failed, trying JSON fallback:", streamError);
      }

      const response = await fetch("/api/council/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success && data.script) {
        setGenerationSource((data.source as GenerationSource) || (payload.topicId ? "preset" : "procedural"));
        setActiveScript(data.script as CouncilMeetingScript);
        rememberScript(data.script as CouncilMeetingScript);
        setPhase("analyzing");
        return;
      }

      const fallback = payload.topicId
        ? getRealtimeScript(payload.topicId, fallbackQuestion)
        : generateProceduralCouncil(fallbackQuestion, getPriorityAgents());
      setGenerationSource(payload.topicId ? "preset" : "procedural");
      setActiveScript(fallback);
      rememberScript(fallback);
      setPhase("analyzing");
      setGenerationError("在线引擎暂时不可用，已切换到本地离线引擎，内容仍可正常体验。");
    } catch (error) {
      if (!controller.signal.aborted) {
        console.warn("Debate generation failed:", error);
        const fallback = payload.topicId
          ? getRealtimeScript(payload.topicId, fallbackQuestion)
          : generateProceduralCouncil(fallbackQuestion, getPriorityAgents());
        setGenerationSource(payload.topicId ? "preset" : "procedural");
        setActiveScript(fallback);
        rememberScript(fallback);
        setPhase("analyzing");
        setGenerationError("网络连接异常，已使用本地离线引擎完成审议。");
      }
    } finally {
      if (debateAbortRef.current === controller) debateAbortRef.current = null;
      setIsLoading(false);
      setStreamStatus(null);
    }
  };

  const handleCancelGeneration = () => {
    debateAbortRef.current?.abort();
    debateAbortRef.current = null;
    setIsLoading(false);
    setStreamStatus(null);
    setGenerationError("本次审议已取消。");
  };

  const handleRestoreCase = (savedCase: SavedCase) => {
    debateAbortRef.current?.abort();
    setActiveScript(savedCase.script);
    setGenerationSource("procedural");
    setGenerationError(null);
    setVerdictNotice("已恢复最近裁决，可继续阅读、质询或进入表决。");
    setPhase("analyzing");
  };

  // 1. 选择经典预设议题
  const handleSelectPreset = async (topic: PresetTopic) => {
    setIsDossiersOpen(false);
    await runDebate({
      topicId: topic.id,
      userEcology,
      apiKey: apiConfig.apiKey,
      apiProvider: apiConfig.provider,
      apiBaseUrl: apiConfig.baseUrl,
      apiModel: apiConfig.model,
    }, topic.question);
  };

  // 2. 提交自定义内耗问题
  const handleSubmitCustom = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const query = (directText || customQuestion).trim();
    if (!query || isLoading) return;
    await runDebate({
      customQuestion: query,
      userEcology,
      apiKey: apiConfig.apiKey,
      apiProvider: apiConfig.provider,
      apiBaseUrl: apiConfig.baseUrl,
      apiModel: apiConfig.model,
    }, query);
  };

  // 3. 从立案弹窗进入议会辩论室
  const handleEnterDebate = () => {
    setPhase("opening");
    playBell();
  };

  // 4. 辩论结束进入表决厅
  const handleFinishDebate = () => {
    setPhase("deliberation");
  };

  // 5. 二审上诉流程（黑客松炸场绝杀：调用后端特派新委员介入与重新裁定）
  const handleOpenAppeal = () => {
    setIsAppealOpen(true);
  };

  const handleSubmitAppeal = async (evidence: string) => {
    setIsAppealOpen(false);
    if (!activeScript) return;

    if (activeScript.resolution.appealCount >= 1) {
      setVerdictNotice("本案的二审特别抗告权已经使用完毕。");
      return;
    }

    playAlarm();
    setIsLoading(true);

    try {
      const res = await fetch("/api/council/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseNumber: activeScript.caseNumber,
          topicTitle: activeScript.topicTitle,
          appealReason: evidence,
          activeScript,
          userEcology,
          apiKey: apiConfig.apiKey,
          apiProvider: apiConfig.provider,
          apiBaseUrl: apiConfig.baseUrl,
          apiModel: apiConfig.model,
        }),
      });
      if (res.ok) {
        const data = await res.json();
          if (data.success && data.newAgentId && data.emergencySpeeches) {
            const nextScript = data.amendedScript as CouncilMeetingScript | undefined;
            if (nextScript) {
              setActiveScript(nextScript);
              rememberScript(nextScript);
            } else {
              const amendedPlans = activeScript.plans.map((plan) =>
                plan.id === data.amendedResolution.winningPlan.id ? data.amendedResolution.winningPlan : plan
              );
              const mergedScript = {
                ...activeScript,
                caseNumber: data.amendedResolution.caseNumber,
                summonedAgentIds: Array.from(new Set([...activeScript.summonedAgentIds, data.newAgentId])),
                speeches: [...activeScript.speeches, ...data.emergencySpeeches],
                plans: amendedPlans,
                resolution: data.amendedResolution,
                appealScript: undefined,
              };
              setActiveScript(mergedScript);
              rememberScript(mergedScript);
            }
            setGenerationSource("procedural");
            setPhase("opening");
            return;
        }
      }
    } catch (err) {
      console.warn("Backend appeal fetch failed, falling back:", err);
    } finally {
      setIsLoading(false);
    }

    // 降级兜底
    const dynScript = generateProceduralCouncil(`${activeScript.topicTitle}（二审新证据：${evidence}）`);
    setActiveScript(dynScript);
    rememberScript(dynScript);
    setGenerationSource("procedural");

    setPhase("opening");
  };

  // 6. 接受判决
  const handleAcceptVerdict = (planId?: "A" | "B" | "C") => {
    if (activeScript && planId) {
      const selectedPlan = activeScript.plans.find((plan) => plan.id === planId);
      if (selectedPlan) {
        setActiveScript({
          ...activeScript,
          resolution: { ...activeScript.resolution, winningPlan: selectedPlan },
        });
      }
    }
    setPhase("idle");
    setCustomQuestion("");
    setVerdictNotice(null);
    const el = document.getElementById("mind-ecosystem");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleRejectVerdict = () => {
    setVerdictNotice("已记录：你暂缓执行本次裁决。建议保留一个明确的重新决策时间，避免无限复盘。");
  };

  return (
    <div className="relative min-h-screen bg-[#05070e] text-zinc-100 flex flex-col selection:bg-cyan-900 selection:text-cyan-100">
      {/* 顶部导航 */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRoster={() => setIsRosterOpen(true)}
        onOpenDossiers={() => setIsDossiersOpen(true)}
        onOpenParliament={() => setIsParliamentOpen(true)}
        userEcology={userEcology}
        onOpenCalibration={() => setIsEcologyModalOpen(true)}
      />

      {/* 动态背景：极光渐变与超精细深空网格 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[560px] aurora-ambient-glow pointer-events-none" />

      {/* 主工作区 */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-16">
        {verdictNotice && (
          <div className="mx-auto mb-4 max-w-4xl rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-xs text-amber-200" role="status">
            {verdictNotice}
          </div>
        )}
        {/* 立案分析弹窗 */}
        {phase === "analyzing" && activeScript && (
          <SituationAnalyzerModal
            caseNumber={activeScript.caseNumber}
            topicTitle={activeScript.topicTitle}
            category={activeScript.category}
            urgency={activeScript.urgency}
            keyConflict={activeScript.keyConflict}
            summonedAgentIds={activeScript.summonedAgentIds}
            source={generationSource}
            onEnterCourt={handleEnterDebate}
          />
        )}

        {/* 核心辩论直播室 */}
        {(phase === "opening" || phase === "rebuttal") && activeScript && (
          <div className="animate-fadeIn">
            <div className="mb-2.5 sm:mb-4 flex items-center justify-between">
              <button
                onClick={() => setPhase("idle")}
                className="text-xs text-zinc-400 hover:text-cyan-300 transition flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>休会并返回首页</span>
              </button>
            </div>
            <CouncilDebateRoom
              key={`${activeScript.caseNumber}-${activeScript.speeches.length}`}
              caseNumber={activeScript.caseNumber}
              topicTitle={activeScript.topicTitle}
              speeches={activeScript.speeches}
              onFinishDebate={handleFinishDebate}
              summonedAgentIds={activeScript.summonedAgentIds}
              apiConfig={apiConfig}
            />
          </div>
        )}

        {/* 表决大厅与裁决书 */}
        {(phase === "deliberation" || phase === "verdict") && activeScript && (
          <div className="animate-fadeIn">
            <div className="mb-2.5 sm:mb-4 flex items-center justify-between">
              <button
                onClick={() => setPhase("opening")}
                className="text-xs text-zinc-400 hover:text-cyan-300 transition flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>重看辩论记录</span>
              </button>
            </div>
            <VotingChamber
              plans={activeScript.plans}
              votes={activeScript.votes}
              resolution={activeScript.resolution}
              onAcceptVerdict={handleAcceptVerdict}
              onRejectVerdict={handleRejectVerdict}
              onOpenAppeal={handleOpenAppeal}
              onShareResolution={() => setIsShareCardOpen(true)}
            />
          </div>
        )}

        {/* 初始状态：极简聚焦单对话框首页 */}
        {phase === "idle" && (
          <div className="min-h-[72vh] flex flex-col justify-center items-center py-6 sm:py-12 animate-fadeIn">
            {streamStatus && (
              <div className="mb-5 w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]" role="status" aria-live="polite">
                <div className="flex items-center justify-between gap-3 text-xs text-cyan-300">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    脑内议会正在实时开庭 · {streamStatus.agentName}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">{streamStatus.speechIndex > 0 ? `第 ${streamStatus.speechIndex} 位发言` : "连接中"}</span>
                </div>
                <p className="mt-2 min-h-10 text-xs leading-relaxed text-zinc-200">{streamStatus.text || "正在等待委员起立陈述…"}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-zinc-500 font-mono">{streamStatus.caseNumber}</span>
                  <button type="button" onClick={handleCancelGeneration} className="rounded-lg border border-zinc-700 px-2.5 py-1 text-[10px] text-zinc-300 transition hover:border-red-400 hover:text-red-300">取消审议</button>
                </div>
              </div>
            )}
            {generationError && !isLoading && (
              <div className="mb-4 w-full max-w-2xl rounded-xl border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-200" role="status">
                {generationError}
              </div>
            )}
            {recentCases.length > 0 && !isLoading && (
              <details className="mb-5 w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-3 text-left">
                <summary className="cursor-pointer list-none text-xs font-bold text-zinc-300">
                  <span className="mr-2 text-cyan-400">↺</span>恢复最近裁决（仅保存在本机）
                </summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {recentCases.map((savedCase) => (
                    <button
                      key={savedCase.caseNumber}
                      type="button"
                      onClick={() => handleRestoreCase(savedCase)}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 text-left transition hover:border-cyan-500/60 hover:bg-cyan-950/30"
                    >
                      <span className="block truncate text-[11px] font-bold text-white">{savedCase.topicTitle}</span>
                      <span className="mt-1 block text-[10px] font-mono text-zinc-500">{savedCase.caseNumber} · {savedCase.savedAt}</span>
                    </button>
                  ))}
                </div>
              </details>
            )}
            {/* 高定奢华 Hero 核心区 */}
            <div className="text-center w-full max-w-4xl mx-auto space-y-6 sm:space-y-8">
              {/* 顶部核心功能快捷按钮群 (Top Action Ribbon) */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsRosterOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl luxury-glass border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:border-indigo-400 hover:text-white transition shadow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 active:scale-95"
                >
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  <span>十一委员巡礼</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDossiersOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl luxury-glass border border-sky-500/30 text-xs font-bold text-sky-300 hover:border-sky-400 hover:text-white transition shadow-sm hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:-translate-y-0.5 active:scale-95"
                >
                  <FileText className="h-3.5 w-3.5 text-sky-400" />
                  <span>经典卷宗画廊</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsParliamentOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl luxury-glass border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:border-cyan-400 hover:text-white transition shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:-translate-y-0.5 active:scale-95"
                >
                  <Scale className="h-3.5 w-3.5 text-cyan-400" />
                  <span>100席议会沙盘</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEcologyModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl luxury-glass border border-amber-500/30 text-xs font-bold text-amber-300 hover:border-amber-400 hover:text-white transition shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{userEcology ? `脑内生态 (${userEcology.codename})` : "脑内生态校准"}</span>
                </button>
              </div>

              {/* 核心主标题：强制单行呈现，自适应全屏幕 */}
              <div className="py-2 overflow-hidden">
                <h1 className="font-serif whitespace-nowrap text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[82px] font-black text-white tracking-tight sm:tracking-tighter leading-tight select-none py-2 drop-shadow-[0_12px_45px_rgba(0,0,0,0.9)] flex items-center justify-center">
                  <span>今天又在</span>
                  <span className="relative inline-block px-1.5 sm:px-4 mx-0.5 sm:mx-1 shrink-0">
                    <span className="absolute -inset-2 sm:-inset-5 rounded-3xl bg-gradient-to-r from-rose-500/30 via-cyan-500/35 to-indigo-500/35 blur-2xl sm:blur-3xl pointer-events-none animate-pulse" />
                    <span className="relative bg-gradient-to-r from-cyan-200 via-white to-sky-200 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(6,182,212,0.7)]">
                      内耗
                    </span>
                  </span>
                  <span>什么？</span>
                </h1>

                {/* 哲理化副标题 */}
                <p className="mt-4 sm:mt-6 text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed px-2 font-sans font-medium">
                  把脑内的每一次深夜精神拉扯，开成一场全员到齐的二次元多智能体审议会。
                  <span className="block text-cyan-300/90 font-medium mt-1 text-xs sm:text-sm">
                    「辩论可以无限跑偏，但今晚必须给你一个荒唐却坚定的裁决！」
                  </span>
                </p>
              </div>

              {/* 极简核心对话框 (The Central Command Console) */}
              <form
                onSubmit={handleSubmitCustom}
                className="relative max-w-2xl mx-auto px-1 group"
              >
                <div className="relative flex flex-col rounded-2xl sm:rounded-3xl luxury-glass p-4 sm:p-6 border-2 border-cyan-500/35 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300 focus-within:border-cyan-400 focus-within:shadow-[0_0_50px_rgba(6,182,212,0.35)] space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Compass className="h-4 w-4" />
                      <span>当庭呈报你的内耗纠结：</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-white/[0.06] hidden sm:inline">
                      Enter ↵ 召开
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitCustom();
                      }
                    }}
                    placeholder="把纠结的事情写在这里...（如：明天早八高数课，舍友非拉我通宵五排瓦，到底该不该去？；月末只剩200块同学喊吃海底捞去不去？）"
                    className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed font-sans"
                  />

                  {/* 底部快捷灵感与发起按钮 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      <span className="text-[11px] font-mono text-zinc-500 shrink-0">速选：</span>
                      {[
                        { label: "📚 早八高数", text: "明天早八高数课，要不要翘课在宿舍睡觉？" },
                        { label: "🎮 熬夜打瓦", text: "明天早八，舍友喊我再来一把瓦，去不去？" },
                        { label: "💔 暗恋秒回", text: "喜欢的人半夜发'睡了吗'，我该秒回吗？" },
                        { label: "💰 生活费告急", text: "月末生活费只剩200块，同学喊我聚餐去不去？" },
                        { label: "🍗 半夜炸鸡", text: "半夜一点半，肚子很饿要不要点炸鸡可乐？" },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => {
                            setCustomQuestion(chip.text);
                            handleSubmitCustom(undefined, chip.text);
                          }}
                          className="shrink-0 rounded-full border border-white/[0.08] bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400 hover:border-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-950/40 transition"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] transition duration-200 hover:brightness-110 active:scale-95 shrink-0 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-cyan-200" />
                          <span>神经元召集中...</span>
                        </>
                      ) : (
                        <>
                          <span>召开脑内审议</span>
                          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* 1. 十一脑内常任委员巡礼弹窗 */}
      {isRosterOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRosterOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="脑内委员巡礼"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl my-auto cursor-default"
          >
            <button
              type="button"
              onClick={() => setIsRosterOpen(false)}
              aria-label="关闭脑内委员巡礼"
              className="absolute -top-3 -right-3 z-50 rounded-full bg-zinc-900 border border-white/20 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-lg"
              title="关闭"
            >
              <X className="h-5 w-5" />
            </button>
            <CommissionerRoster />
          </div>
        </div>
      )}

      {/* 2. 经典卷宗画廊弹窗 */}
      {isDossiersOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDossiersOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="经典内耗卷宗"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl my-auto cursor-default"
          >
            <button
              type="button"
              onClick={() => setIsDossiersOpen(false)}
              aria-label="关闭经典内耗卷宗"
              className="absolute -top-3 -right-3 z-50 rounded-full bg-zinc-900 border border-white/20 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-lg"
              title="关闭"
            >
              <X className="h-5 w-5" />
            </button>
            <PresetAccordion
              onSelectTopic={(topic) => {
                setIsDossiersOpen(false);
                handleSelectPreset(topic);
              }}
            />
          </div>
        </div>
      )}

      {/* 3. 100席议会沙盘与派系格局弹窗 */}
      {isParliamentOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsParliamentOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="100席脑内议会沙盘"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl my-auto cursor-default"
          >
            <button
              type="button"
              onClick={() => setIsParliamentOpen(false)}
              aria-label="关闭议会沙盘"
              className="absolute -top-3 -right-3 z-50 rounded-full bg-zinc-900 border border-white/20 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-lg"
              title="关闭"
            >
              <X className="h-5 w-5" />
            </button>
            <MindParliamentBento
              userEcology={userEcology}
              onOpenCalibration={() => {
                setIsParliamentOpen(false);
                setIsEcologyModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* 脑内神经元初始校准仪式弹窗 (Startup Calibration Wizard) */}
      <MindEcologyModal
        isOpen={isEcologyModalOpen}
        onClose={() => setIsEcologyModalOpen(false)}
        existingProfile={userEcology}
        onComplete={(profile: UserEcologyProfile) => {
          setUserEcology(profile);
          setIsEcologyModalOpen(false);
        }}
      />

      {/* 二审上诉弹窗 */}
      <AppealModal
        isOpen={isAppealOpen}
        onClose={() => setIsAppealOpen(false)}
        onSubmitAppeal={handleSubmitAppeal}
      />

      {/* 红头公文通报分享卡弹窗 */}
      {activeScript && (
        <OfficialResolutionCard
          resolution={activeScript.resolution}
          isOpen={isShareCardOpen}
          onClose={() => setIsShareCardOpen(false)}
        />
      )}

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={setApiConfig}
      />

      {/* 底部版权与二次元审议注记 */}
      <footer className="w-full border-t border-white/[0.08] bg-[#03050a] py-6 px-4 text-center text-[11px] sm:text-xs text-zinc-500 print-hidden">
        <div className="flex items-center justify-center gap-2 mb-2 font-mono text-[10px] text-cyan-400">
          <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>意识流神经网络运作中 · 学园内耗特别审议会 2.5次元法庭系统</span>
        </div>
        <p className="font-mono text-zinc-400">
          《内耗委员会 · Campus》——把大学生每天深夜的自我内耗，开成一场超燃的 AI 多智能体视觉小说审议会。
        </p>
        <p className="mt-1 text-[10px] sm:text-[11px] text-zinc-600 font-mono">
          受《学园脑神经保护法案》保护 · 最终裁决权归内心深处良知所有
        </p>
      </footer>
    </div>
  );
}
