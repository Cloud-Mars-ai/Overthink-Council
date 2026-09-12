"use client";

import React, { useState } from "react";
import { playAlarm } from "@/lib/audio";
import { ShieldAlert, RefreshCw, AlertTriangle, Sparkles, X, Zap } from "lucide-react";

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAppeal: (evidence: string) => void;
}

const QUICK_EVIDENCE_PROMPTS = [
  "可是暗恋的女生刚刚也进了五排车队！",
  "辅导员刚刚在年级大群说这次比赛保研立项加分翻倍！",
  "高中发小刚发语音哭着说他失恋了，特意来找我借肩膀！",
  "高数老师刚刚在朋友圈发了在门诊挂吊针的照片！",
];

export const AppealModal: React.FC<AppealModalProps> = ({
  isOpen,
  onClose,
  onSubmitAppeal,
}) => {
  const [evidence, setEvidence] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidence.trim()) return;
    playAlarm();
    onSubmitAppeal(evidence.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 border-cyan-500/60 bg-[#0b0e1d] p-5 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.35)] animate-alert">
        {/* 顶部标题与关闭 */}
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Zap className="h-4 w-4" />
            </span>
            <h3 className="font-serif text-sm sm:text-lg font-bold text-white">
              重大情势变更 · 申请二审复核
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 警告文案 */}
        <div className="rounded-xl border border-cyan-800/50 bg-cyan-950/40 p-3 text-[11px] sm:text-xs text-cyan-200 leading-relaxed mb-3 sm:mb-4">
          <span className="font-bold text-amber-300">⚠️ 审理准则第 1 条：</span>
          普通撒娇不属于有效抗辩。必须提供足以动摇原有利益平衡模型的【决定性新事实证据】，方可准予特别法庭重开！
        </div>

        {/* 快捷证据标签 */}
        <div className="mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 mb-2 block">
            高频翻案证据库（点击快捷填入）：
          </span>
          <div className="flex flex-col gap-1.5">
            {QUICK_EVIDENCE_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setEvidence(item)}
                className="text-left rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-[11px] sm:text-xs text-zinc-300 transition hover:border-cyan-500/60 hover:bg-cyan-950/30 hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 输入框 */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <textarea
              rows={3}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="请输入新的重大案件事实（例如：‘可是她真的答应晚上和我聊心事’）..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-400 transition hover:text-white"
            >
              取消
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 sm:px-5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition hover:brightness-110 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>拉响警报 · 立即重开审理！</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
