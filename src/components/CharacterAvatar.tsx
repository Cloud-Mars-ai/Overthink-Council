"use client";

import React, { useState } from "react";
import { AgentId } from "@/lib/types";
import { AGENT_PROFILES } from "@/lib/agents-data";

interface CharacterAvatarProps {
  agentId: AgentId;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isSpeaking?: boolean;
}

const AVATAR_MAP: Record<
  string,
  { src: string; alt: string; ringColor: string; shadowColor: string; objectPosition?: string }
> = {
  gpa: {
    src: "/avatars/gpa.jpg",
    alt: "GPA委员·椎名学委",
    ringColor: "border-cyan-400 ring-cyan-400/60",
    shadowColor: "rgba(6,182,212,0.6)",
    objectPosition: "object-top",
  },
  sleep: {
    src: "/avatars/sleep.jpg",
    alt: "睡眠委员·悠悠",
    ringColor: "border-purple-400 ring-purple-400/60",
    shadowColor: "rgba(168,85,247,0.6)",
    objectPosition: "object-top",
  },
  happiness: {
    src: "/avatars/happiness.jpg",
    alt: "快乐委员·蜜柑",
    ringColor: "border-amber-400 ring-amber-400/60",
    shadowColor: "rgba(245,158,11,0.6)",
    objectPosition: "object-top",
  },
  future: {
    src: "/avatars/future.jpg",
    alt: "未来的你",
    ringColor: "border-rose-400 ring-rose-400/60",
    shadowColor: "rgba(244,63,94,0.6)",
    objectPosition: "object-top",
  },
  dignity: {
    src: "/avatars/dignity.jpg",
    alt: "尊严委员",
    ringColor: "border-yellow-400 ring-yellow-400/60",
    shadowColor: "rgba(234,179,8,0.6)",
    objectPosition: "object-top",
  },
  wallet: {
    src: "/avatars/wallet.png",
    alt: "钱包委员",
    ringColor: "border-emerald-400 ring-emerald-400/60",
    shadowColor: "rgba(16,185,129,0.6)",
    objectPosition: "object-top",
  },
  social: {
    src: "/avatars/social.png",
    alt: "社交委员",
    ringColor: "border-pink-400 ring-pink-400/60",
    shadowColor: "rgba(236,72,153,0.6)",
    objectPosition: "object-top",
  },
  ambition: {
    src: "/avatars/ambition.png",
    alt: "野心委员",
    ringColor: "border-cyan-500 ring-cyan-500/60",
    shadowColor: "rgba(6,182,212,0.6)",
    objectPosition: "object-top",
  },
  love: {
    src: "/avatars/love.png",
    alt: "恋爱委员",
    ringColor: "border-rose-400 ring-rose-400/60",
    shadowColor: "rgba(251,113,133,0.6)",
    objectPosition: "object-top",
  },
  stomach: {
    src: "/avatars/stomach.png",
    alt: "胃部代表",
    ringColor: "border-orange-400 ring-orange-400/60",
    shadowColor: "rgba(249,115,22,0.6)",
    objectPosition: "object-top",
  },
  chairman: {
    src: "/avatars/chairman.png",
    alt: "主审官",
    ringColor: "border-indigo-400 ring-indigo-400/60",
    shadowColor: "rgba(99,102,241,0.6)",
    objectPosition: "object-top",
  },
};

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  agentId,
  size = "md",
  className = "",
  isSpeaking = false,
}) => {
  const [loadError, setLoadError] = useState(false);
  const profile = AGENT_PROFILES[agentId] || AGENT_PROFILES.chairman;
  const avatarConfig = AVATAR_MAP[agentId] || AVATAR_MAP.chairman;

  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-16 h-16 sm:w-20 sm:h-20",
    xl: "w-28 h-28 sm:w-36 sm:h-36",
  };

  return (
    <div
      className={`relative shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-[#090d1c] ${
        isSpeaking
          ? `${avatarConfig.ringColor} ring-2 scale-105`
          : "border-zinc-800/80 hover:border-cyan-500/60"
      } ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: isSpeaking ? `0 0 25px ${avatarConfig.shadowColor}` : undefined,
      }}
    >
      {!loadError ? (
        <img
          src={avatarConfig.src}
          alt={avatarConfig.alt}
          onError={() => setLoadError(true)}
          className={`w-full h-full object-cover ${avatarConfig.objectPosition || "object-top"} transition-transform duration-500 ${
            isSpeaking ? "scale-105" : "hover:scale-105"
          }`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white font-serif font-black text-xs">
          {profile.name.slice(0, 2)}
        </div>
      )}

      {/* 说话时的微光渐变与呼吸点 */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <span
            className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_#06b6d4]"
          />
        </>
      )}
    </div>
  );
};
