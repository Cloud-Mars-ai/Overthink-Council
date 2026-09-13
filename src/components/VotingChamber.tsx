"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ProposalPlan, AgentVote, CouncilResolution } from "@/lib/types";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { RedHeaderDocument } from "@/components/RedHeaderDocument";
import { playVoteTick, playGavel, playStamp } from "@/lib/audio";
import confetti from "canvas-confetti";
import {
  Scale,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  FileText,
  Share2,
  Zap,
  TrendingUp,
  Flame,
  Gavel,
  Crown,
} from "lucide-react";

interface VotingChamberProps {
  plans: ProposalPlan[];
  votes: AgentVote[];
  resolution: CouncilResolution;
  onAcceptVerdict: (planId?: ProposalPlan["id"]) => void;
  onRejectVerdict: () => void;
  onOpenAppeal: () => void;
  onShareResolution: () => void;
}

export const VotingChamber: React.FC<VotingChamberProps> = ({
  plans,
  votes,
  resolution,
  onAcceptVerdict,
  onRejectVerdict,
  onOpenAppeal,
  onShareResolution,
}) => {
  const [phase, setPhase] = useState<"voting" | "decisive" | "gavel" | "verdict">("voting");
  const [revealedVotes, setRevealedVotes] = useState<number>(0);
  const [verdictTab, setVerdictTab] = useState<"red_header" | "cyber">("red_header");
  const [flipAgentId, setFlipAgentId] = useState<string | null>(null);
  const [userVotedPlan, setUserVotedPlan] = useState<ProposalPlan["id"] | null>(null);
  const decisiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gavelTimerRef = useRef<NodeJS.Timeout | null>(null);

  const winningPlan = resolution.winningPlan;

  const triggerGavel = useCallback((chosenPlanId?: ProposalPlan["id"]) => {
    if (decisiveTimerRef.current) clearTimeout(decisiveTimerRef.current);
    if (gavelTimerRef.current) clearTimeout(gavelTimerRef.current);
    const finalPlanId = chosenPlanId || userVotedPlan || winningPlan.id;
    setUserVotedPlan(finalPlanId);
    setPhase("gavel");
    playGavel();
    gavelTimerRef.current = setTimeout(() => {
      setPhase("verdict");
      playStamp();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#d92626", "#06b6d4", "#38bdf8", "#fbbf24", "#8b5cf6"],
        });
      } catch {
        // ignore
      }
    }, 750);
  }, [userVotedPlan, winningPlan.id]);

  // 倒戈委员小巧思设定（第3或第4票触发）
  const flipIndex = Math.min(votes.length - 1, Math.max(2, Math.floor(votes.length * 0.6)));

  useEffect(() => {
    if (phase === "voting") {
      const timer = setInterval(() => {
        setRevealedVotes((prev) => {
          if (prev < votes.length) {
            playVoteTick();
            // 如果刚好到达反水票，触发戏剧化倒戈提示
            if (prev === flipIndex && votes[prev]) {
              setFlipAgentId(votes[prev].agentId);
            }
            return prev + 1;
          }
          clearInterval(timer);
          // 投票完成，进入“当事人最终裁量权”交互环节
          setPhase("decisive");
          return prev;
        });
      }, 420);

      return () => clearInterval(timer);
    }
  }, [phase, votes, flipIndex]);

  // 当进入 decisive 阶段，如果 5 秒内用户未点击，自动落槌
  useEffect(() => {
    if (phase === "decisive") {
      decisiveTimerRef.current = setTimeout(() => {
        triggerGavel();
      }, 5500);

      return () => {
        if (decisiveTimerRef.current) clearTimeout(decisiveTimerRef.current);
      };
    }
  }, [phase, triggerGavel]);

  useEffect(() => () => {
    if (decisiveTimerRef.current) clearTimeout(decisiveTimerRef.current);
    if (gavelTimerRef.current) clearTimeout(gavelTimerRef.current);
  }, []);

  const effectiveWinningPlan = plans.find((plan) => plan.id === userVotedPlan) || winningPlan;

  // 实时统计各方案当前得票
  const currentVotes = votes.slice(0, revealedVotes);
  const planACount = currentVotes.filter((v) => v.planId === "A").length;
  const planBCount = currentVotes.filter((v) => v.planId === "B").length;
  const planCCount = currentVotes.filter((v) => v.planId === "C").length;
  const totalCount = Math.max(1, revealedVotes);
  const pctA = Math.round((planACount / totalCount) * 100);
  const pctB = Math.round((planBCount / totalCount) * 100);
  const pctC = Math.round((planCCount / totalCount) * 100);
  const effectiveWinningPct = effectiveWinningPlan.id === "A" ? pctA : effectiveWinningPlan.id === "B" ? pctB : pctC;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 px-1 sm:px-0">
      {/* 阶段 1: 表决大厅 */}
      {phase === "voting" && (
        <div className="rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#0c1022]/95 p-4 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl animate-fadeIn">
          {/* 顶栏信息 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 sm:pb-4 mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-cyan-400 shrink-0" />
              <div>
                <h2 className="text-base sm:text-xl font-serif font-black text-white">
                  脑内多智能体法定表决程序
                </h2>
                <p className="text-[11px] text-zinc-400 font-sans">
                  依照《内耗审议章程》，各委员正逐一投下法定效力票
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] sm:text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-full animate-pulse">
                ● 票箱解封进度 {revealedVotes}/{votes.length}
              </span>
            </div>
          </div>

          {/* 小巧思 1: 实时动态民意天平拉锯条 (Dynamic Vote Tension Swing Bar) */}
          <div className="mb-6 rounded-2xl border border-white/[0.08] bg-black/40 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>实时民意天平拉扯动态：</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-cyan-300">A案: {pctA}%</span>
                <span className="text-sky-300">B案: {pctB}%</span>
                {plans.length > 2 && <span className="text-amber-300">C案: {pctC}%</span>}
              </div>
            </div>

            {/* 炫彩进度条 */}
            <div className="h-3.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex transition-all">
              <div
                style={{ width: `${pctA}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300 relative group"
              />
              <div
                style={{ width: `${pctB}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              />
              {plans.length > 2 && (
                <div
                  style={{ width: `${pctC}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-300"
                />
              )}
            </div>
          </div>

          {/* 小巧思 2: 临场反水突发事件提示横幅 (Sudden Betrayal Banner) */}
          {flipAgentId && (
            <div className="mb-5 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-zinc-900 to-amber-950/60 p-3 text-xs text-amber-200 animate-fadeIn flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400 animate-bounce" />
                <span className="font-bold text-amber-300">🚨【突发倒戈】</span>
                <span>
                  【{AGENT_PROFILES[flipAgentId as keyof typeof AGENT_PROFILES]?.name || "委员"}】在看到严峻战况后，当场推翻预定立场，反水倒戈把票投给主导方案！
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700 shrink-0 hidden sm:inline">
                逆转局势！
              </span>
            </div>
          )}

          {/* 备选方案卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {plans.map((p) => {
              const count = currentVotes.filter((v) => v.planId === p.id).length;
              const isLeading = p.id === winningPlan.id;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 relative overflow-hidden ${
                    isLeading
                      ? "border-cyan-400/60 bg-cyan-950/30 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30"
                      : "border-white/[0.08] bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-white border border-zinc-700 font-mono">
                      {p.id}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      {count} 票
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{p.title}</h4>
                  <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed line-clamp-2">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* 小巧思 3: 委员出票明细卡 + 角色内心名言对话气泡 (Comic Quote Callouts) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>委员投票出票明细与现场陈词：</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {votes.map((v, i) => {
                const isRevealed = i < revealedVotes;
                const prof = AGENT_PROFILES[v.agentId];
                return (
                  <div
                    key={`${v.agentId}_${i}`}
                    className={`flex flex-col justify-between rounded-xl border p-3 text-xs transition-all duration-300 ${
                      isRevealed
                        ? "border-cyan-500/40 bg-[#0e1428] opacity-100 scale-100 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "border-white/[0.04] bg-zinc-950/40 opacity-25 scale-95"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 truncate">
                        <CharacterAvatar agentId={v.agentId} size="sm" />
                        <span className="font-bold text-white truncate">{prof?.name}</span>
                        <span className="text-[9px] text-zinc-400 font-mono hidden sm:inline">
                          {prof?.partyName}
                        </span>
                      </div>
                      {isRevealed && (
                        <span className="shrink-0 rounded bg-cyan-950 border border-cyan-500/60 px-2 py-0.5 font-mono font-bold text-cyan-300 text-[10px] sm:text-xs">
                          投给 {v.planId} 案
                        </span>
                      )}
                    </div>

                    {/* 角色投票原由气泡 */}
                    {isRevealed && (
                      <div className="mt-1 bg-black/40 rounded-lg p-2 text-[11px] text-zinc-300 font-serif border border-white/[0.05] italic">
                        “{v.reason || "依据内耗平衡法则审慎投票。"}”
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 小巧思 4: 阶段 1.5: 当事人保命决胜一票 (Decisive Vote / Tie-Breaker Moment) */}
      {phase === "decisive" && (
        <div className="relative rounded-2xl sm:rounded-3xl border-2 border-cyan-500/60 bg-[#0d142b] p-6 sm:p-10 text-center shadow-[0_0_60px_rgba(6,182,212,0.3)] animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 border border-cyan-500 px-3 py-1 text-xs font-mono text-cyan-300 mb-3 animate-pulse">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span>全案票数已定格 · 审判长请当事人落锤</span>
          </div>

          <h2 className="font-serif text-xl sm:text-3xl font-black text-white tracking-wide">
            “当事人拥有最后【一锤定音权】”
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
            委员会各智能体表决完毕，【{winningPlan.title}】获得最高票。你也可以改选其他方案，作为大脑唯一当事人加盖最终批准。
          </p>

          <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setUserVotedPlan(plan.id)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  (userVotedPlan || winningPlan.id) === plan.id
                    ? "border-cyan-400 bg-cyan-950/60 text-white ring-1 ring-cyan-400/60"
                    : "border-zinc-700 bg-zinc-900/70 text-zinc-400 hover:border-cyan-500 hover:text-white"
                }`}
              >
                <span className="font-mono text-[10px] text-cyan-300">{plan.id} 案</span>
                <span className="mt-1 block text-xs font-bold">{plan.title}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => triggerGavel(userVotedPlan || winningPlan.id)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 transition"
            >
              <Gavel className="h-4 w-4" />
              <span>一锤定音，批准【{userVotedPlan || winningPlan.id} 案】！</span>
            </button>

            <button
              type="button"
              onClick={() => triggerGavel()}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-xs font-semibold text-zinc-300 hover:border-cyan-500 hover:text-white transition"
            >
              <span>沿用最高票方案</span>
            </button>
          </div>

          <div className="mt-4 text-[10px] font-mono text-zinc-500">
            5秒内未操作将自动敲锤宣判...
          </div>
        </div>
      )}

      {/* 阶段 2: 法槌敲定定格 */}
      {phase === "gavel" && (
        <div className="relative flex flex-col items-center justify-center h-72 sm:h-80 rounded-2xl sm:rounded-3xl border border-cyan-500/50 bg-[#0d1224] p-6 text-center shadow-[0_0_60px_rgba(6,182,212,0.3)] animate-fadeIn">
          <div className="absolute h-32 w-32 sm:h-36 sm:w-36 rounded-full border-2 border-cyan-400 animate-shockwave pointer-events-none" />
          <div className="text-5xl sm:text-6xl animate-gavel mb-3">🔨</div>
          <h2 className="font-serif text-xl sm:text-2xl font-black tracking-wide text-white">
            “全案辩论终结，法槌落定！”
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-cyan-400 font-mono">
            {resolution.caseNumber} · 主审官签署签发【红头文件】
          </p>
        </div>
      )}

      {/* 阶段 3: 最终裁决书（红头文件 & 赛博令切换） */}
      {phase === "verdict" && (
        <div className="space-y-4 animate-fadeIn">
          {/* 模式切换选项卡 */}
          <div className="flex items-center justify-between bg-[#0c1022]/90 border border-white/[0.08] p-1.5 rounded-2xl">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVerdictTab("red_header")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  verdictTab === "red_header"
                    ? "bg-[#cf1919] text-white shadow-[0_0_15px_rgba(207,25,25,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>正式红头文件（终局公文）</span>
              </button>

              <button
                onClick={() => setVerdictTab("cyber")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  verdictTab === "cyber"
                    ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>赛博通报令（二次元）</span>
              </button>
            </div>

            <button
              onClick={onShareResolution}
              className="flex items-center gap-1 text-xs text-zinc-300 hover:text-cyan-400 px-3 py-1.5 rounded-xl transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">生成通报卡</span>
            </button>
          </div>

          {/* 视图 A: 正式红头文件 (Official Red Header Document) */}
          {verdictTab === "red_header" ? (
            <RedHeaderDocument
              resolution={{ ...resolution, winningPlan: effectiveWinningPlan }}
              winningPlan={effectiveWinningPlan}
              onAccept={onAcceptVerdict}
              onReject={onRejectVerdict}
              onOpenAppeal={onOpenAppeal}
            />
          ) : (
            /* 视图 B: 赛博二次元公文令 */
            <div className="relative rounded-2xl sm:rounded-3xl border-2 border-cyan-600/40 vn-box p-4 sm:p-10 shadow-[0_0_60px_rgba(6,182,212,0.2)] overflow-hidden">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

              {/* 公文头 */}
              <div className="text-center border-b-2 border-cyan-700/60 pb-4 sm:pb-6 mb-5 sm:mb-6">
                <h1 className="font-serif text-xl sm:text-3xl font-black tracking-wider text-cyan-400 drop-shadow">
                  学园内耗特别审议会
                </h1>
                <p className="mt-1 font-serif text-xs sm:text-sm tracking-widest text-indigo-300">
                  正式裁定呈批令
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-xs font-mono text-zinc-400 border-t border-cyan-900/40 pt-2">
                  <span>文号：{resolution.caseNumber}</span>
                  <span className="text-amber-400">效力：脑内强制生效</span>
                  <span>签署：{resolution.stampDate}</span>
                </div>
              </div>

              {/* 裁决标题 */}
              <div className="mb-5 sm:mb-6">
                <h3 className="font-serif text-base sm:text-xl font-bold text-white leading-snug">
                  {resolution.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-cyan-400 border border-cyan-800">
                    表决通过：【{winningPlan.title}】
                  </span>
                  <span className="text-[11px] sm:text-xs text-zinc-400">
                    得票率：{effectiveWinningPct}%（委员会票）
                  </span>
                </div>
              </div>

              {/* 强制条例 */}
              <div className="space-y-2.5 rounded-2xl border border-cyan-900/50 bg-black/40 p-3.5 sm:p-5 mb-6 sm:mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span>本案强制执行细则（不可抗拒附款）</span>
                </h4>
                <div className="space-y-2 text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                  {resolution.stipulations.map((stip, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-cyan-900/60 text-cyan-300 text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-snug">{stip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按钮组 */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  onClick={onRejectVerdict}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-amber-700 hover:text-amber-400 active:scale-95"
                >
                  <AlertOctagon className="h-4 w-4" />
                  <span>拒不执行</span>
                </button>

                <button
                  onClick={onOpenAppeal}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-950/60 to-zinc-900 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition hover:brightness-110 active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>申请二审（提交新证据）</span>
                </button>

                <button
                  onClick={() => onAcceptVerdict(effectiveWinningPlan.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] transition hover:brightness-110 active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>遵照执行，平息内耗</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
