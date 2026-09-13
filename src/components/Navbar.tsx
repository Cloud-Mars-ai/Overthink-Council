"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Settings, Sparkles, Scale, Clock, Users, FileText } from "lucide-react";
import { getSoundMuted, setSoundMuted, playBell } from "@/lib/audio";
import { UserEcologyProfile } from "@/lib/types";

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenRoster?: () => void;
  onOpenDossiers?: () => void;
  onOpenParliament?: () => void;
  userEcology?: UserEcologyProfile | null;
  onOpenCalibration?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenRoster,
  onOpenDossiers,
  onOpenParliament,
  userEcology,
  onOpenCalibration,
}) => {
  const [muted, setMuted] = useState(false);
  const [timeStr, setTimeStr] = useState("01:24:18");

  useEffect(() => {
    const muteSync = window.setTimeout(() => setMuted(getSoundMuted()), 0);
    const interval = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTimeStr(`${h}:${m}:${s}`);
    }, 1000);
    return () => {
      window.clearTimeout(muteSync);
      clearInterval(interval);
    };
  }, []);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) {
      playBell();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-900/30 bg-[#080b16]/95 backdrop-blur-md print-hidden">
      {/* 顶部二次元学园流光缎带 */}
      <div className="h-1 w-full anime-header-ribbon" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6 sm:py-2.5">
        {/* 左侧：机构 Logo 与正规二次元官方称号 */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/60 to-indigo-900/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center rounded-full bg-cyan-500 text-[7px] sm:text-[8px] font-black text-white shadow">
              庭
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif text-base sm:text-lg font-black tracking-tight text-white truncate">
                学园内耗审议会
              </span>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.2 text-[9px] sm:text-[10px] font-bold text-cyan-300 border border-cyan-700/50 shrink-0">
                OVERTHINK PARLIAMENT
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 font-mono flex items-center gap-1 truncate">
              <span className="truncate">脑内特异多智能体议会</span>
              <span className="inline-block h-1 w-1 rounded-full bg-cyan-400 shrink-0 animate-ping" />
            </p>
          </div>
        </div>

        {/* 右侧：状态指示器与功能按钮群 */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* 委员巡礼按钮 */}
          {onOpenRoster && (
            <button
              type="button"
              onClick={onOpenRoster}
              className="flex items-center gap-1 rounded-xl border border-indigo-500/30 bg-indigo-950/25 px-2 sm:px-2.5 py-1 text-xs text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-900/40"
              title="查看十一脑内常任委员人设名录"
            >
              <Users className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="hidden md:inline font-bold">委员巡礼</span>
            </button>
          )}

          {/* 经典卷宗按钮 */}
          {onOpenDossiers && (
            <button
              type="button"
              onClick={onOpenDossiers}
              className="flex items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-950/25 px-2 sm:px-2.5 py-1 text-xs text-sky-300 transition hover:border-sky-400 hover:bg-sky-900/40"
              title="查看特急内耗卷宗与典型案件"
            >
              <FileText className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span className="hidden md:inline font-bold">经典卷宗</span>
            </button>
          )}

          {/* 议会沙盘按钮 */}
          {onOpenParliament && (
            <button
              type="button"
              onClick={onOpenParliament}
              className="flex items-center gap-1 rounded-xl border border-cyan-800/40 bg-cyan-950/30 px-2 sm:px-2.5 py-1 text-xs text-cyan-300 transition hover:border-cyan-600 hover:bg-cyan-900/40"
              title="查看 100 席脑内议会权力沙盘"
            >
              <Scale className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="hidden md:inline font-bold">议会格局</span>
            </button>
          )}

          {/* 用户脑内生态校准状态胶囊 */}
          {userEcology ? (
            <button
              type="button"
              onClick={onOpenCalibration}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 px-2 sm:px-2.5 py-1 text-xs text-amber-300 transition hover:border-amber-400 hover:bg-amber-900/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              title="点击查看并重新校准脑内神经元生态"
            >
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="font-bold font-mono text-[11px] sm:text-xs truncate max-w-[80px] sm:max-w-[140px]">
                {userEcology.codename}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCalibration}
              className="flex items-center gap-1 rounded-xl border border-cyan-500/50 bg-cyan-950/40 px-2 sm:px-2.5 py-1 text-xs font-bold text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-900/50 shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-pulse"
              title="启动脑内神经元初始校准仪式"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-300 shrink-0" />
              <span className="text-[11px] sm:text-xs">生态校准</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1 text-xs font-mono text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>{timeStr}</span>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "开启音效" : "静音"}
            title={muted ? "开启音效" : "静音"}
            className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-300 transition hover:border-cyan-700 hover:text-white"
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
                <div className="flex items-center gap-0.5 h-2.5 sm:h-3">
                  <span className="w-0.5 bg-cyan-400 sound-bar-1" />
                  <span className="w-0.5 bg-cyan-400 sound-bar-2" />
                </div>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="配置大模型推理引擎"
            title="配置大模型推理引擎"
            className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/80 p-1.5 text-zinc-400 transition hover:border-cyan-700 hover:text-white"
          >
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
