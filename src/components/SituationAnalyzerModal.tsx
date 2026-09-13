"use client";

import React, { useEffect, useState } from "react";
import { AgentId } from "@/lib/types";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { playBell, playVoteTick } from "@/lib/audio";
import { Users, Sparkles, Zap } from "lucide-react";

interface SituationAnalyzerModalProps {
  caseNumber: string;
  topicTitle: string;
  category: string;
  urgency: string;
  keyConflict: string;
  summonedAgentIds: AgentId[];
  source?: "gemini" | "openai" | "procedural" | "preset";
  onEnterCourt: () => void;
}

export const SituationAnalyzerModal: React.FC<SituationAnalyzerModalProps> = ({
  caseNumber,
  topicTitle,
  category,
  urgency,
  keyConflict,
  summonedAgentIds,
  source = "procedural",
  onEnterCourt,
}) => {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    playBell();
    const timer = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev < summonedAgentIds.length) {
          playVoteTick();
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 280);

    return () => clearInterval(timer);
  }, [summonedAgentIds]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="situation-dialog-title">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-cyan-500/50 bg-[#0c1020] p-5 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)]">
        {/* 背景赛博光晕 */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        {/* 顶部公文立案标记 */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Zap className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs text-cyan-400 font-bold tracking-wider">
              {caseNumber} 特异紧急审理令
            </span>
          </div>

          <span className="rounded-full bg-cyan-950/80 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-cyan-400 border border-cyan-700/60 animate-pulse">
            ● 委员会全员召集中
          </span>
        </div>

        {/* 案件核心陈述 */}
        <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-cyan-300 border border-cyan-800/60">
              {category}
            </span>
            <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-indigo-300 border border-indigo-800/40">
              响应等级：{urgency}
            </span>
          </div>

          <h2 id="situation-dialog-title" className="font-serif text-lg sm:text-2xl font-black leading-snug text-white">
            {topicTitle}
          </h2>
          <div className="mt-2 inline-flex rounded-full border border-zinc-700 bg-zinc-950/60 px-2.5 py-1 text-[10px] text-zinc-300">
            生成方式：{source === "gemini" ? "Gemini" : source === "openai" ? "OpenAI 兼容接口" : source === "preset" ? "经典卷宗" : "本地离线引擎"}
          </div>

          <div className="rounded-2xl border border-cyan-900/40 bg-zinc-950/80 p-3 text-xs text-zinc-300">
            <span className="font-bold text-cyan-400">核心冲突焦点：</span>
            <p className="mt-1 text-zinc-300 leading-relaxed font-sans">{keyConflict}</p>
          </div>
        </div>

        {/* 委员点名入席名单 */}
        <div className="mt-5 sm:mt-6">
          <div className="flex items-center justify-between mb-2.5 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>参会二次元委员（{revealedCount}/{summonedAgentIds.length} 已就席）</span>
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] text-zinc-500">阵营相克机制</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {summonedAgentIds.map((aid, idx) => {
              const prof = AGENT_PROFILES[aid];
              const isRevealed = idx < revealedCount;

              return (
                <div
                  key={aid}
                  className={`flex items-center gap-2 sm:gap-2.5 rounded-xl border p-2 sm:p-2.5 transition-all duration-300 ${
                    isRevealed
                      ? "border-cyan-500/40 bg-zinc-900/90 opacity-100 scale-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "border-zinc-800/50 bg-zinc-950/40 opacity-30 scale-95"
                  }`}
                >
                  <CharacterAvatar
                    agentId={aid}
                    size="sm"
                    className="border border-zinc-700"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {prof?.name || aid}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {prof?.badge || "特派代表"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部进入开庭按钮 */}
        <div className="mt-6 sm:mt-8 flex justify-end">
          <button
            onClick={onEnterCourt}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-6 py-3 font-bold text-xs sm:text-sm text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] transition hover:brightness-110 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>推开议会大门 · 即刻开庭辩论</span>
          </button>
        </div>
      </div>
    </div>
  );
};
