"use client";

import React, { useState } from "react";
import { PRESET_TOPICS } from "@/lib/agents-data";
import { PresetTopic } from "@/lib/types";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { ArrowRight, FileText, ShieldAlert, Sparkles } from "lucide-react";

interface PresetAccordionProps {
  onSelectTopic: (topic: PresetTopic) => void;
}

export const PresetAccordion: React.FC<PresetAccordionProps> = ({ onSelectTopic }) => {
  const [activeId, setActiveId] = useState<string>("topic_valo");

  return (
    <div className="w-full mt-6 sm:mt-10">
      {/* 头部标题 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-black tracking-wide text-white">
              特急内耗卷宗画廊 · 经典案由速查
            </h3>
            <p className="text-[11px] text-zinc-400 font-sans">
              评委直通：收录大学生各大高频深渊困局，点击即刻进入多智能体激辩
            </p>
          </div>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400/90 bg-cyan-950/40 border border-cyan-800/60 px-2.5 py-1 rounded-full">
          ● 预设典型案例库
        </span>
      </div>

      {/* Accordion 展开画廊 (二次元高定案卷感) */}
      <div className="flex flex-col md:flex-row gap-3.5 h-auto md:h-[310px] w-full transition-all duration-500 ease-out">
        {PRESET_TOPICS.map((topic) => {
          const isActive = activeId === topic.id;

          return (
            <div
              key={topic.id}
              onClick={() => setActiveId(topic.id)}
              onMouseEnter={() => setActiveId(topic.id)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 cursor-pointer transition-all duration-500 ease-out ${
                isActive
                  ? "md:flex-[3.8] luxury-glass border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/30"
                  : "md:flex-1 bg-[#090d1c]/70 border border-white/[0.06] hover:border-white/[0.15] hover:bg-[#0c1226]/80"
              }`}
            >
              {/* 背景微光 */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-500 group-hover:opacity-30"
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${topic.accentColor} 0%, transparent 65%)`,
                }}
              />

              {/* 顶部标签 */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold border"
                  style={{
                    backgroundColor: `${topic.accentColor}18`,
                    color: topic.accentColor,
                    borderColor: `${topic.accentColor}40`,
                  }}
                >
                  {topic.category}
                </span>

                <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-700/50">
                  <ShieldAlert className="h-3 w-3" />
                  <span>{topic.urgency}</span>
                </span>
              </div>

              {/* 中间核心标题与详情 */}
              <div className="relative z-10 my-auto py-2.5">
                <div className="text-[10px] text-zinc-500 font-mono mb-1 flex items-center gap-1">
                  <span>档案编号：{topic.id.toUpperCase()}</span>
                  <span>·</span>
                  <span>{topic.timeTag}</span>
                </div>
                <h4
                  className={`font-serif font-black transition-all text-white ${
                    isActive
                      ? "text-base sm:text-lg lg:text-xl text-white leading-snug"
                      : "text-xs sm:text-sm text-zinc-300 line-clamp-2 md:line-clamp-4"
                  }`}
                >
                  {topic.title}
                </h4>

                {isActive && (
                  <div className="mt-2.5 space-y-2 animate-fadeIn">
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 sm:line-clamp-3 font-sans">
                      {topic.question}
                    </p>
                    <p className="text-[11px] text-cyan-300 italic flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      <span>{topic.teaser}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* 底部召集委员头像与立案按钮 */}
              <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/[0.08]">
                {/* 委员头像缩略图 */}
                <div className="flex -space-x-1.5 items-center">
                  {topic.summonedAgents.slice(0, 5).map((aid) => (
                    <CharacterAvatar
                      key={aid}
                      agentId={aid}
                      size="sm"
                      className="border border-zinc-700 shadow-md"
                    />
                  ))}
                </div>

                {/* 立即立案按钮 */}
                {isActive ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTopic(topic);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition hover:brightness-110 active:scale-95"
                  >
                    <span>即刻开庭审议</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 font-mono group-hover:text-cyan-300 transition-colors">
                    展开卷宗 ↵
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
