"use client";

import React from "react";
import { CouncilResolution } from "@/lib/types";
import { RedHeaderDocument } from "@/components/RedHeaderDocument";
import { X, FileText } from "lucide-react";

interface OfficialResolutionCardProps {
  resolution: CouncilResolution;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialResolutionCard: React.FC<OfficialResolutionCardProps> = ({
  resolution,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md animate-fadeIn overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="official-resolution-dialog-title">
      <div className="relative w-full max-w-4xl my-auto max-h-[95vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/[0.15] bg-[#0c1022] p-3 sm:p-6 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#cf1919] text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 id="official-resolution-dialog-title" className="text-xs sm:text-sm font-bold text-white font-serif">
                学园内耗特别审议会 · 正式红头公文归档
              </h3>
              <p className="text-[10px] text-zinc-400 font-sans">
                法定防伪印章已加盖 · 具最高强制执行效力
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="关闭红头公文归档"
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 核心公文渲染 */}
        <div className="p-1 sm:p-2">
          <RedHeaderDocument
            resolution={resolution}
            winningPlan={resolution.winningPlan}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
};
