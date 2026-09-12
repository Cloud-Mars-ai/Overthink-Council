"use client";

import React, { useState, useEffect } from "react";
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
import { PRESET_SCRIPTS, generateProceduralCouncil, getRealtimeScript, CouncilMeetingScript } from "@/lib/council-engine";
import { PresetTopic, MeetingPhase, UserEcologyProfile } from "@/lib/types";
import { playBell, playAlarm, playVoteTick } from "@/lib/audio";
import { Scale, Sparkles, Send, ShieldAlert, ArrowLeft, Zap, Flame, Compass, X, Users, FileText } from "lucide-react";

export default function Home() {
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [phase, setPhase] = useState<MeetingPhase>("idle");
  const [activeScript, setActiveScript] = useState<CouncilMeetingScript | null>(null);

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

  // API配置
  const [apiKey, setApiKey] = useState<string>("");
  const [apiProvider, setApiProvider] = useState<string>("gemini");

  // 初次启动检测：校准脑内神经元生态 & 全局 Escape 键监听
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mind_council_user_ecology");
      if (saved) {
        setUserEcology(JSON.parse(saved));
      } else {
        // 未曾校准，开局主动弹窗引导校准
        const timer = setTimeout(() => {
          setIsEcologyModalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. 选择经典预设议题（调用后端注入当下真实时间与动态开场）
  const handleSelectPreset = async (topic: PresetTopic) => {
    setIsDossiersOpen(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/council/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: topic.id,
          userEcology,
          apiKey,
          apiProvider,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.script) {
          setActiveScript(data.script);
          setPhase("analyzing");
          return;
        }
      }
    } catch (err) {
      console.warn("Backend debate fetch failed, falling back to local:", err);
    } finally {
      setIsLoading(false);
    }

    // 离线/降级兜底
    const script = getRealtimeScript(topic.id, topic.question);
    setActiveScript(script);
    setPhase("analyzing");
  };

  // 2. 提交自定义内耗问题（调用后端神经元引擎在线/高保真生成）
  const handleSubmitCustom = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const query = (directText || customQuestion).trim();
    if (!query) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/council/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customQuestion: query,
          userEcology,
          apiKey,
          apiProvider,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.script) {
          setActiveScript(data.script);
          setPhase("analyzing");
          return;
        }
      }
    } catch (err) {
      console.warn("Backend custom debate fetch failed, falling back to local:", err);
    } finally {
      setIsLoading(false);
    }

    // 离线/降级兜底
    const script = generateProceduralCouncil(query);
    setActiveScript(script);
    setPhase("analyzing");
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
          apiKey,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.newAgentId && data.emergencySpeeches) {
          setActiveScript({
            ...activeScript,
            caseNumber: data.amendedResolution.caseNumber,
            summonedAgentIds: [...activeScript.summonedAgentIds, data.newAgentId],
            speeches: [...activeScript.speeches, ...data.emergencySpeeches],
            resolution: data.amendedResolution,
          });
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
    if (activeScript.appealScript) {
      const { newAgentId, emergencySpeeches, amendedResolution } = activeScript.appealScript;
      setActiveScript({
        ...activeScript,
        caseNumber: amendedResolution.caseNumber,
        summonedAgentIds: [...activeScript.summonedAgentIds, newAgentId],
        speeches: [...activeScript.speeches, ...emergencySpeeches],
        resolution: amendedResolution,
      });
    } else {
      const dynScript = generateProceduralCouncil(activeScript.topicTitle + " (已提交新证据：" + evidence + ")");
      setActiveScript(dynScript);
    }

    setPhase("opening");
  };

  // 6. 接受判决
  const handleAcceptVerdict = () => {
    setPhase("idle");
    setCustomQuestion("");
    const el = document.getElementById("mind-ecosystem");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleRejectVerdict = () => {
    // 记录抗命
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
        {/* 立案分析弹窗 */}
        {phase === "analyzing" && activeScript && (
          <SituationAnalyzerModal
            caseNumber={activeScript.caseNumber}
            topicTitle={activeScript.topicTitle}
            category={activeScript.category}
            urgency={activeScript.urgency}
            keyConflict={activeScript.keyConflict}
            summonedAgentIds={activeScript.summonedAgentIds}
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
              caseNumber={activeScript.caseNumber}
              topicTitle={activeScript.topicTitle}
              speeches={activeScript.speeches}
              onFinishDebate={handleFinishDebate}
              summonedAgentIds={activeScript.summonedAgentIds}
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl my-auto cursor-default"
          >
            <button
              onClick={() => setIsRosterOpen(false)}
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl my-auto cursor-default"
          >
            <button
              onClick={() => setIsDossiersOpen(false)}
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl my-auto cursor-default"
          >
            <button
              onClick={() => setIsParliamentOpen(false)}
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
        apiKey={apiKey}
        apiProvider={apiProvider}
        onSave={(key, provider) => {
          setApiKey(key);
          setApiProvider(provider);
        }}
      />

      {/* 底部版权与二次元审议注记 */}
      <footer className="w-full border-t border-white/[0.08] bg-[#03050a] py-6 px-4 text-center text-[11px] sm:text-xs text-zinc-500">
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
