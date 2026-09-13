"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ApiConfig, CouncilSpeech, AgentId } from "@/lib/types";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { playGavel, playObjection, playTextBlip, playTypewriterKey } from "@/lib/audio";
import { generateInterrogationResponse } from "@/lib/council-engine";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import {
  Scale,
  FastForward,
  Play,
  Pause,
  AlertTriangle,
  Send,
  Sparkles,
  MessageCircle,
  Gamepad2,
  ListFilter,
  Zap,
  Clock,
} from "lucide-react";

interface CouncilDebateRoomProps {
  caseNumber: string;
  topicTitle: string;
  speeches: CouncilSpeech[];
  onFinishDebate: () => void;
  summonedAgentIds?: AgentId[];
  apiConfig?: ApiConfig;
}

const QUICK_CHALLENGES = [
  "可是我明天喝双倍浓缩咖啡能撑住！",
  "万一今晚手感爆棚一路连胜呢？！",
  "为什么就不能既要成绩又要快乐？！",
  "可是她真的很难约，错过就没了！",
];

export const CouncilDebateRoom: React.FC<CouncilDebateRoomProps> = ({
  caseNumber,
  topicTitle,
  speeches,
  onFinishDebate,
  summonedAgentIds,
  apiConfig,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [isSlowMode, setIsSlowMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"visual_novel" | "chat_feed">("visual_novel");
  const [userComment, setUserComment] = useState<string>("");
  const [liveSpeeches, setLiveSpeeches] = useState<CouncilSpeech[]>(() => speeches);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [showObjectionBanner, setShowObjectionBanner] = useState<boolean>(false);
  const [isScreenRumbling, setIsScreenRumbling] = useState<boolean>(false);
  const [streamedText, setStreamedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const objectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userSpeechIdRef = useRef(0);

  // 全屏鲜红异议与镜头震颤触发器
  const triggerObjectionEffect = useCallback(() => {
    playObjection();
    setShowObjectionBanner(true);
    setIsScreenRumbling(true);
    if (typeof document !== "undefined") {
      document.body.classList.add("animate-camera-shake");
    }
    if (objectionTimerRef.current) clearTimeout(objectionTimerRef.current);
    objectionTimerRef.current = setTimeout(() => {
      setShowObjectionBanner(false);
      setIsScreenRumbling(false);
      if (typeof document !== "undefined") {
        document.body.classList.remove("animate-camera-shake");
      }
    }, 1600);
  }, []);

  useEffect(() => () => {
    if (objectionTimerRef.current) clearTimeout(objectionTimerRef.current);
    if (typeof document !== "undefined") document.body.classList.remove("animate-camera-shake");
  }, []);

  // 每当发言切换时，音效与异议判定触发
  useEffect(() => {
    const sp = liveSpeeches[currentIdx];
    if (!sp) return;

    if (sp.phase === "chairman") {
      playGavel();
    } else if (
      sp.interrupted ||
      sp.content.includes("异议") ||
      sp.content.includes("反对") ||
      sp.content.includes("打断") ||
      sp.content.includes("荒谬") ||
      sp.content.includes("慢着") ||
      sp.content.includes("且慢")
    ) {
      const effectTimer = window.setTimeout(() => triggerObjectionEffect(), 0);
      return () => window.clearTimeout(effectTimer);
    } else {
      playTextBlip();
    }
  }, [currentIdx, liveSpeeches, triggerObjectionEffect]);

  // 逐字流式打字机效果 (Typewriter Engine + 拟真机械键盘微击音)
  useEffect(() => {
    const sp = liveSpeeches[currentIdx];
    if (!sp?.content) return;

    const fullContent = sp.content;
    let charIdx = 0;

    let timeoutId: NodeJS.Timeout | undefined;

    const typeNextChar = () => {
      if (charIdx < fullContent.length) {
        charIdx++;
        const nextSubstr = fullContent.slice(0, charIdx);
        setStreamedText(nextSubstr);

        // 每隔2个汉字敲击一次机械键盘微音效（既有真实击键感又避免刺耳过密）
        if (charIdx % 2 === 0) {
          playTypewriterKey();
        }

        // 针对标点符号提供自然的口语留白微停顿
        const lastChar = fullContent[charIdx - 1];
        const isPunctuation = /[，。！？；：、“”…—\n]/.test(lastChar);
        const baseSpeed = isSlowMode ? 40 : 26;
        const delay = isPunctuation ? baseSpeed + 60 : baseSpeed;

        timeoutId = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
      }
    };

    const startTimer = setTimeout(() => {
      setIsTyping(true);
      setStreamedText("");
      timeoutId = setTimeout(typeNextChar, 120);
    }, 0);

    return () => {
      clearTimeout(startTimer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentIdx, liveSpeeches, isSlowMode]);

  // 点击对话框快速跳过打字，直接显示整句
  const handleRevealFullSentence = () => {
    const sp = liveSpeeches[currentIdx];
    if (sp && isTyping) {
      setStreamedText(sp.content);
      setIsTyping(false);
    }
  };

  // 翻到下一句：若还在打字则先展示全句；若已打完则切到下一发言
  const handleNextSpeech = () => {
    if (isTyping) {
      handleRevealFullSentence();
    } else {
      setCurrentIdx((prev) => Math.min(liveSpeeches.length - 1, prev + 1));
    }
  };

  // 独立的舒适阅读自动播放计时器（打字完成后给予充足阅读留白，从容不迫）
  useEffect(() => {
    if (!autoPlay || isAnswering || isTyping) return;

    if (currentIdx < liveSpeeches.length - 1) {
      const sp = liveSpeeches[currentIdx];
      const isObjection =
        sp?.interrupted ||
        sp?.content.includes("异议") ||
        sp?.content.includes("反对") ||
        sp?.content.includes("慢着");

      // 智能阅读留白时长：基础留白 3500ms + 每10字 180ms
      const contentLength = sp?.content?.length || 40;
      const baseDelay = Math.max(3500, Math.min(7500, contentLength * 60 + 2600));
      const objectionBonus = isObjection ? 1800 : 0;
      const delay = Math.round((baseDelay + objectionBonus) * (isSlowMode ? 1.35 : 1.0));

      const timer = setTimeout(() => {
        setCurrentIdx((prev) => {
          if (prev < liveSpeeches.length - 1) return prev + 1;
          return prev;
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentIdx, autoPlay, isSlowMode, liveSpeeches, isAnswering, isTyping]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentIdx, liveSpeeches]);

  const displayedSpeeches = liveSpeeches.slice(0, currentIdx + 1);
  const activeSpeechIndex = Math.min(Math.max(0, currentIdx), liveSpeeches.length - 1);
  const activeSpeech = liveSpeeches[activeSpeechIndex] || liveSpeeches[0];
  const activeAgent = activeSpeech ? AGENT_PROFILES[activeSpeech.agentId] : null;

  const handleUserInterrogation = async (queryText: string) => {
    if (!queryText.trim()) return;

    triggerObjectionEffect();
    setIsAnswering(true);

    const userSpeech: CouncilSpeech = {
      id: `user_${userSpeechIdRef.current++}`,
      agentId: "dignity",
      agentName: "当事人（脑细胞总动员）",
      phase: "interjection",
      content: `【当庭抗辩】“${queryText.trim()}”`,
      interrupted: true,
      timestamp: "刚才",
    };

    let replies: CouncilSpeech[] = [];
    try {
      const res = await fetch("/api/council/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: queryText.trim(),
          topicTitle,
          summonedAgents:
            summonedAgentIds && summonedAgentIds.length > 0
              ? summonedAgentIds
              : ["gpa", "sleep", "happiness", "future"],
          apiKey: apiConfig?.apiKey,
          apiProvider: apiConfig?.provider,
          apiBaseUrl: apiConfig?.baseUrl,
          apiModel: apiConfig?.model,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.speeches) && data.speeches.length > 0) {
          replies = data.speeches;
        }
      }
    } catch (err) {
      console.warn("Backend interrogation fetch failed, using fallback:", err);
    }

    if (replies.length === 0) {
      replies = generateInterrogationResponse(
        queryText.trim(),
        topicTitle,
        summonedAgentIds && summonedAgentIds.length > 0
          ? summonedAgentIds
          : ["gpa", "sleep", "happiness", "future"]
      );
    }

    const updated = [
      ...liveSpeeches.slice(0, currentIdx + 1),
      userSpeech,
      ...replies,
      ...liveSpeeches.slice(currentIdx + 1),
    ];

    setLiveSpeeches(updated);
    // 立即切到当事人的抗辩发言
    setCurrentIdx((prev) => prev + 1);
    setUserComment("");
    setIsAnswering(false);
    setAutoPlay(true);
  };

  return (
    <>
      {/* 逆转裁判式：真正全屏 FIXED 鲜红“异议あり！/ 严正反对！”震撼冲击波与闪电爆闪 */}
      {showObjectionBanner && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none overflow-hidden select-none">
          {/* 闪电白光瞬间爆闪 */}
          <div className="absolute inset-0 bg-white animate-lightning-flash" />

          {/* 全屏鲜红深渊暗角与疾速动态速度线 */}
          <div className="absolute inset-0 bg-red-950/90 shadow-[inset_0_0_240px_rgba(220,38,38,1)] crimson-speed-lines animate-pulse" />

          {/* 巨幅倾斜斩击横幅 */}
          <div className="relative w-full py-6 sm:py-14 crimson-objection-banner text-center transform -rotate-3 animate-crimson-objection shadow-[0_0_120px_rgba(220,38,38,1)] px-3">
            <div className="flex items-center justify-center gap-2 sm:gap-6">
              <span className="text-3xl sm:text-7xl animate-bounce text-yellow-300 drop-shadow-[0_0_25px_rgba(234,179,8,1)]">⚡</span>
              <div className="flex flex-col items-center">
                <h1 className="font-serif text-3xl sm:text-7xl lg:text-8xl font-black text-yellow-300 tracking-wider drop-shadow-[0_8px_30px_rgba(0,0,0,1)] uppercase">
                  異議あり！
                </h1>
                <span className="text-xs sm:text-2xl font-black text-white tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mt-1">
                  【严 正 反 对 · 强 制 驳 回】
                </span>
              </div>
              <span className="text-3xl sm:text-7xl animate-bounce text-yellow-300 drop-shadow-[0_0_25px_rgba(234,179,8,1)]">⚡</span>
            </div>
            <p className="text-[10px] sm:text-base font-mono text-yellow-200 mt-2 sm:mt-3 font-black tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              ★ OBJECTION! 发现重大逻辑漏洞与自我欺骗 · 当庭推翻！ ★
            </p>
          </div>
        </div>
      )}

      <div
        className={`relative flex flex-col h-[calc(100dvh-120px)] min-h-[580px] sm:h-[720px] w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-cyan-500/30 bg-[#0a0d18] shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden transition-all duration-300 ${
          isScreenRumbling ? "animate-screen-rumble ring-4 ring-red-500/90 shadow-[0_0_90px_rgba(239,68,68,0.6)]" : ""
        }`}
      >
        {/* 顶部控制栏 */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-950/80 px-3 py-2.5 sm:px-6 sm:py-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Scale className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-mono text-cyan-400 font-bold truncate">
                {caseNumber} · 二次元辩论对决法庭
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[190px] sm:max-w-md">
                {topicTitle}
              </h3>
            </div>
          </div>

          {/* 模式切换与播控 */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 手动发动全屏异议按钮 */}
            <button
              onClick={triggerObjectionEffect}
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-2.5 py-1 text-[11px] font-black text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:brightness-110 active:scale-95 transition"
              title="手动发动全屏逆转裁判式异议反对特效"
            >
              <Zap className="h-3 w-3" />
              <span>异议！</span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === "visual_novel" ? "chat_feed" : "visual_novel")}
              className="flex items-center gap-1 rounded-xl border border-cyan-700/60 bg-cyan-950/40 px-2.5 py-1 text-[11px] font-bold text-cyan-300 transition hover:bg-cyan-900/60"
              title="切换二次元视觉小说模式 / 卷宗聊天流模式"
            >
              {viewMode === "visual_novel" ? <ListFilter className="h-3.5 w-3.5" /> : <Gamepad2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">
                {viewMode === "visual_novel" ? "卷宗流" : "GAL剧场"}
              </span>
            </button>

            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-zinc-500"
            >
              {autoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span className="hidden sm:inline">{autoPlay ? "暂停" : "自动"}</span>
            </button>

            {/* 慢速阅读模式切换器 */}
            <button
              onClick={() => setIsSlowMode(!isSlowMode)}
              className={`flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-bold transition ${
                isSlowMode
                  ? "border-amber-500/60 bg-amber-950/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  : "border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200"
              }`}
              title="切换阅读语速：默认已放慢，慢速模式为长句提供更长驻留时间"
            >
              <Clock className="h-3 w-3" />
              <span>{isSlowMode ? "慢速 0.7x" : "标准 1.0x"}</span>
            </button>

            <button
              onClick={onFinishDebate}
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-[11px] sm:text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>进入表决</span>
            </button>
          </div>
        </div>

      {/* 核心内容区 */}
      {viewMode === "visual_novel" ? (
        /* 🎮 模式 A：二次元视觉小说对决模式 (Visual Novel Battle Stage) */
        <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 overflow-hidden relative">
          {/* 角色大立绘展示台 */}
          <div className="relative flex-1 flex flex-col items-center justify-center min-h-0">
            {activeAgent && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 my-auto animate-fadeIn">
                <div className="relative group">
                  <CharacterAvatar
                    agentId={activeSpeech.agentId}
                    size="xl"
                    isSpeaking={true}
                    className={
                      activeSpeech.interrupted || activeSpeech.content.includes("反对") || activeSpeech.content.includes("异议")
                        ? "shadow-[0_0_45px_rgba(239,68,68,0.6)] ring-4 ring-red-500 animate-pulse"
                        : "shadow-[0_0_35px_rgba(6,182,212,0.25)] ring-4 ring-cyan-500/40"
                    }
                  />
                  <div
                    className="absolute -bottom-2 -left-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black text-white border shadow"
                    style={{
                      backgroundColor: activeAgent.color,
                      borderColor: activeAgent.borderColor,
                    }}
                  >
                    {activeAgent.partyName}
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-1 max-w-xs">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-serif font-black text-xl sm:text-2xl text-white">
                      {activeAgent.name}
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold border"
                      style={{
                        color: activeAgent.color,
                        borderColor: `${activeAgent.color}60`,
                        backgroundColor: `${activeAgent.color}15`,
                      }}
                    >
                      {activeAgent.badge}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {activeAgent.objective}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-mono text-cyan-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>发言阶段：{activeSpeechIndex + 1}/{liveSpeeches.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GALGAME 对话框 (Visual Novel Text Box) */}
          <div
            onClick={handleRevealFullSentence}
            className={`relative z-20 w-full rounded-2xl sm:rounded-3xl border-2 p-4 sm:p-5 transition-all duration-300 cursor-pointer ${
              activeSpeech?.interrupted || activeSpeech?.content.includes("反对") || activeSpeech?.content.includes("异议")
                ? "border-red-500/80 bg-gradient-to-br from-[#1a0808] to-[#0d091a] shadow-[0_0_40px_rgba(239,68,68,0.35)]"
                : "border-cyan-500/40 vn-box shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            }`}
            title={isTyping ? "点击立即显示整句" : "点击推进"}
          >
            {/* 角色姓名栏 */}
            <div
              className={`absolute -top-3.5 left-5 flex items-center gap-1.5 rounded-full px-3.5 py-0.5 text-xs font-bold text-white shadow-lg border ${
                activeSpeech?.interrupted || activeSpeech?.content.includes("反对") || activeSpeech?.content.includes("异议")
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-600 border-amber-300 text-amber-100 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-300"
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>{activeSpeech?.agentName || "主审官"}</span>
            </div>

            {/* 角色正文大台词 (逐字打字机流式字符效果 + 拟真光标) */}
            <p className="text-sm sm:text-base font-serif text-white leading-relaxed tracking-wide min-h-[52px] pt-1 select-none">
              {streamedText || activeSpeech?.content}
              {isTyping && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
            </p>

            {/* 底部翻页控制器 */}
            <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-xs text-zinc-500">
              <span
                className={`font-mono text-[10px] flex items-center gap-1.5 ${
                  activeSpeech?.interrupted || activeSpeech?.content.includes("反对")
                    ? "text-red-400 font-bold animate-pulse"
                    : "text-cyan-400"
                }`}
              >
                {isTyping ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>委员正在陈述中（点击可跳过打字）</span>
                  </>
                ) : activeSpeech?.interrupted || activeSpeech?.content.includes("反对") ? (
                  "🚨【强势打断 · 严正反对中】"
                ) : (
                  "● 庭审对战进行中"
                )}
              </span>

              <div className="flex items-center gap-2">
                {isTyping && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRevealFullSentence();
                    }}
                    className="rounded px-2 py-0.5 bg-zinc-800 text-cyan-300 border border-cyan-500/30 text-[10px] hover:text-white transition"
                  >
                    跳过打字
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx((p) => Math.max(0, p - 1));
                  }}
                  className="rounded px-2 py-0.5 bg-zinc-800/80 text-zinc-300 hover:text-white transition text-xs"
                >
                  上一句
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextSpeech();
                  }}
                  className="rounded px-3 py-0.5 bg-cyan-600 text-white font-bold hover:bg-cyan-500 shadow transition text-xs"
                >
                  {isTyping ? "展开全句" : "下一句 ▼"}
                </button>
              </div>
            </div>

            {/* 辩论终结法槌收官引导 (Debate Formal Conclusion Card) */}
            {currentIdx >= liveSpeeches.length - 1 && (
              <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-indigo-950/80 border border-cyan-500/60 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-[0_0_30px_rgba(6,182,212,0.35)] animate-fadeIn">
                <div className="flex items-center gap-2 text-center sm:text-left">
                  <span className="text-xl">🔨</span>
                  <div>
                    <div className="text-xs sm:text-sm font-serif font-black text-cyan-300">
                      “全案争论焦点已充分显露，本庭宣布辩论正式终结！”
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      各方利益与诉求已全部核实，请全体起立，进入法定各方案全员表决程序。
                    </p>
                  </div>
                </div>
                <button
                  onClick={onFinishDebate}
                  className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 transition"
                >
                  <FastForward className="h-4 w-4" />
                  <span>开启全员表决程序</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 📜 模式 B：卷宗聊天流模式 (Transcript Feed) */
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {displayedSpeeches.map((sp) => {
            const profile = AGENT_PROFILES[sp.agentId] || AGENT_PROFILES.chairman;
            const isChairman = sp.agentId === "chairman";
            const isInterrupted = sp.interrupted;
            const isReply = sp.replyToUser;

            if (isChairman) {
              return (
                <div
                  key={sp.id}
                  className="my-2.5 mx-auto max-w-xl rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/50 via-zinc-950 to-indigo-950/50 p-3 sm:p-4 text-center shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-fadeIn"
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400 mb-1">
                    <Scale className="h-4 w-4" />
                    <span>【内耗委员会主审官 · 法槌整肃】</span>
                  </div>
                  <p className="text-xs sm:text-sm font-serif text-zinc-200 leading-relaxed">
                    {activeSpeech?.id === sp.id && isTyping ? streamedText : sp.content}
                    {activeSpeech?.id === sp.id && isTyping && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={sp.id}
                className={`flex gap-2.5 sm:gap-3.5 animate-fadeIn ${
                  isInterrupted ? "border-l-2 border-cyan-400 pl-2 sm:pl-3" : ""
                } ${isReply ? "border-l-2 border-amber-400 pl-2 sm:pl-3" : ""}`}
              >
                <CharacterAvatar
                  agentId={sp.agentId}
                  size="md"
                  isSpeaking={activeSpeech?.id === sp.id}
                />

                <div className="flex-1 max-w-2xl min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-white">{profile.name}</span>
                    <span
                      className="rounded px-1.5 py-0.2 text-[9px] sm:text-[10px] font-medium border"
                      style={{
                        color: profile.color,
                        borderColor: `${profile.color}40`,
                        backgroundColor: `${profile.color}10`,
                      }}
                    >
                      {profile.badge}
                    </span>
                    {isInterrupted && (
                      <span className="flex items-center gap-0.5 rounded bg-cyan-600 px-1.5 py-0.2 text-[9px] font-bold text-white animate-pulse">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        紧急打断
                      </span>
                    )}
                    {isReply && (
                      <span className="flex items-center gap-0.5 rounded bg-amber-500/90 px-1.5 py-0.2 text-[9px] font-bold text-white">
                        <MessageCircle className="h-2.5 w-2.5" />
                        当庭答辩
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-zinc-500 ml-auto">
                      {sp.timestamp}
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl border p-3 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                      isInterrupted
                        ? "border-cyan-500/50 bg-gradient-to-br from-cyan-950/40 to-zinc-900 text-zinc-100 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        : isReply
                        ? "border-amber-500/50 bg-gradient-to-br from-amber-950/30 to-zinc-900 text-zinc-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "border-zinc-800 bg-zinc-900/80 text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    {activeSpeech?.id === sp.id && isTyping ? streamedText : sp.content}
                    {activeSpeech?.id === sp.id && isTyping && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={chatBottomRef} />
        </div>
      )}

      {/* 底部交互区：玩家时刻追问质询 */}
      <div className="border-t border-zinc-800/80 bg-zinc-950/90 p-2.5 sm:p-4 shrink-0 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] sm:text-xs text-zinc-400 no-scrollbar">
          <span className="shrink-0 text-cyan-400 font-mono flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>当庭质询：</span>
          </span>
          {QUICK_CHALLENGES.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isAnswering}
              onClick={() => handleUserInterrogation(chip)}
              className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-cyan-400 hover:text-white disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserInterrogation(userComment);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={userComment}
              disabled={isAnswering}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="向台上委员发起实时质询（输入任何狡辩借口）..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isAnswering || !userComment.trim()}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition hover:brightness-110 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <span>{isAnswering ? "答辩中..." : "当庭质询"}</span>
            <Send className="h-3 w-3" />
          </button>
        </form>
      </div>
    </div>
    </>
  );
};
