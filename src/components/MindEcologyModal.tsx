"use client";

import React, { useState } from "react";
import { UserEcologyProfile, AgentId } from "@/lib/types";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { playVoteTick, playGavel, playStamp } from "@/lib/audio";
import confetti from "canvas-confetti";
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Crown,
  Scale,
  Brain,
  Zap,
  Flame,
  Shield,
  Heart,
  BookOpen,
  Coffee,
  Wallet,
  X,
} from "lucide-react";

interface MindEcologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserEcologyProfile) => void;
  existingProfile?: UserEcologyProfile | null;
}

const GRADE_OPTIONS = [
  {
    id: "大一萌新",
    title: "大一萌新 · 误以为大学很闲",
    desc: "刚刚告别高考，满怀憧憬但正逐渐被早八和高数毒打",
    emoji: "🎒",
    boostAgent: "happiness" as AgentId,
  },
  {
    id: "大二大三",
    title: "大二大三 · 专业课连环轰炸",
    desc: "专业核心课满排，大作业与考勤红线生死拉扯",
    emoji: "📚",
    boostAgent: "gpa" as AgentId,
  },
  {
    id: "大四老生",
    title: "大四老油条 · 考研秋招前线",
    desc: "考研、保研、考公、秋招四面受敌，心智逐渐沧桑透彻",
    emoji: "💼",
    boostAgent: "future" as AgentId,
  },
  {
    id: "研究生",
    title: "赛博研究生 · 天天被催进度",
    desc: "日夜兼程跑实验改论文，咖啡因重度依赖者",
    emoji: "🔬",
    boostAgent: "sleep" as AgentId,
  },
];

const ANXIETY_OPTIONS = [
  {
    id: "gpa" as const,
    title: "绩点推免与期末及格保卫战",
    desc: "害怕平时分被扣、400元重修费与盛夏酷暑补考耻辱",
    emoji: "📚",
    badge: "学业高危",
    agentId: "gpa" as AgentId,
  },
  {
    id: "sleep" as const,
    title: "通宵修仙成瘾与生物钟粉碎",
    desc: "心率手环狂震报警，想睡睡不着，早八起不来",
    emoji: "😴",
    badge: "精力枯竭",
    agentId: "sleep" as AgentId,
  },
  {
    id: "wallet" as const,
    title: "恩格尔系数94%与月末赤字",
    desc: "微信零钱跌入三位数，害怕任何突发聚餐与社交AA",
    emoji: "💰",
    badge: "财务告急",
    agentId: "wallet" as AgentId,
  },
  {
    id: "love" as const,
    title: "纯爱战神深夜消息心动拉扯",
    desc: "秒回当备胎还是晾着装高冷？恋爱脑与自尊反复肉搏",
    emoji: "❤️",
    badge: "荷尔蒙过载",
    agentId: "love" as AgentId,
  },
  {
    id: "ambition" as const,
    title: "简历一片空白与同龄人断层焦虑",
    desc: "看着同龄人拿大厂Offer和国奖，自己迷茫一事无成",
    emoji: "🚀",
    badge: "前途内卷",
    agentId: "ambition" as AgentId,
  },
  {
    id: "social" as const,
    title: "寝室小团体政治与人际孤独",
    desc: "害怕被集体孤立，在迎合奉承与特立独行间内耗",
    emoji: "🍻",
    badge: "社交内耗",
    agentId: "social" as AgentId,
  },
];

const DISPOSITION_OPTIONS = [
  {
    id: "风控保命同盟",
    title: "🛡️ 严谨防守风控同盟",
    desc: "以不挂科、不社死、不破产为第一生存法则，拒绝盲目冲动",
    color: "#3b82f6",
    coreAgents: ["gpa", "wallet", "sleep"] as AgentId[],
  },
  {
    id: "多巴胺在野党",
    title: "🎮 即时行乐多巴胺派",
    desc: "高数可以补考，但二十岁的快乐过期不候，青春就要尖叫",
    color: "#f59e0b",
    coreAgents: ["happiness", "stomach", "social"] as AgentId[],
  },
  {
    id: "傲骨体面自尊党",
    title: "👑 傲骨自尊防小丑派",
    desc: "宁可骄傲地孤独，绝不下贱地讨好当备胎，体面大于天",
    color: "#eab308",
    coreAgents: ["dignity", "ambition"] as AgentId[],
  },
  {
    id: "虚无超脱看客党",
    title: "🌌 虚无超脱时空看客派",
    desc: "三年后回看连微尘都不算，爱咋咋地，放过自己安心睡觉",
    color: "#f43f5e",
    coreAgents: ["future", "sleep"] as AgentId[],
  },
];

const CODENAME_CHIPS = [
  "某不知名早八受害者",
  "高数重修预备役",
  "纯爱战神重伤患",
  "月末吃土型选手",
  "咖啡因重度依赖者",
  "熬夜冠军退役选手",
  "期末突击复习特种兵",
  "赛博寝室守门员",
];

export const MindEcologyModal: React.FC<MindEcologyModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  existingProfile,
}) => {
  const [step, setStep] = useState<number>(1);
  const [grade, setGrade] = useState<string>(existingProfile?.grade || "大二大三");
  const [primaryAnxiety, setPrimaryAnxiety] = useState<UserEcologyProfile["primaryAnxiety"]>(
    existingProfile?.primaryAnxiety || "gpa"
  );
  const [rulingParty, setRulingParty] = useState<string>(
    existingProfile?.rulingParty || "风控保命同盟"
  );
  const [codename, setCodename] = useState<string>(
    existingProfile?.codename || "某不知名早八受害者"
  );
  const [isDone, setIsDone] = useState<boolean>(false);
  const [generatedProfile, setGeneratedProfile] = useState<UserEcologyProfile | null>(null);

  if (!isOpen) return null;

  // 根据问卷选择，动态计算出 100 席位的个性化分配
  const calculatePowerMap = (): Record<AgentId, number> => {
    // 基础席位分配
    const map: Record<AgentId, number> = {
      gpa: 10,
      sleep: 10,
      happiness: 10,
      wallet: 8,
      social: 8,
      ambition: 8,
      future: 10,
      love: 6,
      dignity: 6,
      stomach: 6,
      chairman: 18, // 主席法定控场席
    };

    // 1. 年级权重强化
    if (grade === "大一萌新") {
      map.happiness += 6;
      map.social += 4;
    } else if (grade === "大二大三") {
      map.gpa += 8;
      map.sleep += 2;
    } else if (grade === "大四老生") {
      map.ambition += 6;
      map.future += 4;
    } else if (grade === "研究生") {
      map.sleep += 6;
      map.gpa += 4;
    }

    // 2. 核心焦虑源强化 (+12)
    if (primaryAnxiety === "gpa") map.gpa += 12;
    else if (primaryAnxiety === "sleep") map.sleep += 12;
    else if (primaryAnxiety === "wallet") map.wallet += 12;
    else if (primaryAnxiety === "love") {
      map.love += 8;
      map.dignity += 4;
    } else if (primaryAnxiety === "ambition") map.ambition += 12;
    else if (primaryAnxiety === "social") map.social += 12;

    // 3. 灵魂执政派系强化
    if (rulingParty === "风控保命同盟") {
      map.gpa += 5;
      map.wallet += 4;
      map.sleep += 3;
    } else if (rulingParty === "多巴胺在野党") {
      map.happiness += 7;
      map.stomach += 5;
    } else if (rulingParty === "傲骨体面自尊党") {
      map.dignity += 7;
      map.ambition += 5;
    } else if (rulingParty === "虚无超脱看客党") {
      map.future += 7;
      map.sleep += 5;
    }

    // 归一化总数为 100 席
    const keys = Object.keys(map) as AgentId[];
    const sum = keys.reduce((acc, k) => acc + map[k], 0);
    const scaled: Record<AgentId, number> = {} as Record<AgentId, number>;
    let curTotal = 0;
    keys.forEach((k) => {
      const val = Math.round((map[k] / sum) * 100);
      scaled[k] = val;
      curTotal += val;
    });

    // 微调差额
    const diff = 100 - curTotal;
    scaled.chairman += diff;

    return scaled;
  };

  const handleFinishCalibration = () => {
    playGavel();
    const powerMap = calculatePowerMap();
    const profile: UserEcologyProfile = {
      codename: codename.trim() || "某不知名早八受害者",
      grade,
      majorType: "大学全学科",
      primaryAnxiety,
      rulingParty,
      powerMap,
      calibratedAt: new Date().toLocaleDateString("zh-CN"),
    };

    setGeneratedProfile(profile);
    setIsDone(true);
    playStamp();

    try {
      localStorage.setItem("mind_council_user_ecology", JSON.stringify(profile));
    } catch {
      // ignore
    }

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#f43f5e", "#fbbf24", "#8b5cf6", "#10b981"],
      });
    } catch {
      // ignore
    }
  };

  const handleApplyAndClose = () => {
    if (generatedProfile) {
      onComplete(generatedProfile);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-cyan-500/40 bg-[#090d1c] p-5 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.25)] text-white overflow-hidden my-auto transition-all">
        {/* 背景炫彩光晕 */}
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* 顶部标题与步骤指示 */}
        <div className="relative z-10 border-b border-white/[0.08] pb-4 mb-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-serif font-black tracking-wide text-white flex items-center gap-2">
                  <span>脑内神经元初始校准仪式</span>
                  <span className="rounded-full bg-cyan-950 border border-cyan-500/60 px-2 py-0.2 text-[10px] font-mono text-cyan-300 font-bold hidden sm:inline">
                    生态建构
                  </span>
                </h2>
                <p className="text-[11px] text-zinc-400 font-sans">
                  通过 4 步精神特质鉴定，生成你专属的 100 席脑内议会权力格局
                </p>
              </div>
            </div>

            {/* 关闭/跳过 */}
            {existingProfile && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 进度条 */}
          {!isDone && (
            <div className="mt-3.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                第 {step}/4 步
              </span>
            </div>
          )}
        </div>

        {/* 问卷内容分步 */}
        {!isDone ? (
          <div className="relative z-10 space-y-4">
            {/* Step 1: 年级身份 */}
            {step === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>STEP 1: 确认你当前的大学生学术生存状态</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GRADE_OPTIONS.map((opt) => {
                    const isSelected = grade === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setGrade(opt.id);
                          playVoteTick();
                        }}
                        className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-cyan-400 bg-gradient-to-br from-cyan-950/70 via-[#0a152e] to-[#090e1f] shadow-[0_0_25px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/80"
                            : "border-white/[0.08] bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-800/60 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl filter drop-shadow">{opt.emoji}</span>
                            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                              {opt.title}
                            </span>
                          </div>
                          {isSelected ? (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-scaleIn">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-white/20 bg-black/30 group-hover:border-white/40 transition" />
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-sans pl-8">
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: 致命内耗源 */}
            {step === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                  <Flame className="h-3.5 w-3.5" />
                  <span>STEP 2: 哪一件事最常在深夜让你辗转反侧、脑细胞发烫？</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ANXIETY_OPTIONS.map((opt) => {
                    const isSelected = primaryAnxiety === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setPrimaryAnxiety(opt.id);
                          playVoteTick();
                        }}
                        className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-rose-400 bg-gradient-to-br from-rose-950/70 via-[#1f0b14] to-[#0d0711] shadow-[0_0_25px_rgba(244,63,94,0.35)] ring-2 ring-rose-400/80"
                            : "border-white/[0.08] bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-800/60 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl filter drop-shadow">{opt.emoji}</span>
                            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                              {opt.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-rose-950/80 border border-rose-700/50 px-2 py-0.5 text-[9px] font-mono text-rose-300 font-bold">
                              {opt.badge}
                            </span>
                            {isSelected ? (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-scaleIn">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="h-4 w-4 shrink-0 rounded-full border border-white/20 bg-black/30 group-hover:border-white/40 transition" />
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-sans pl-7">
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: 灵魂执政倾向 */}
            {step === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Crown className="h-3.5 w-3.5" />
                  <span>STEP 3: 若选出一个派系执掌脑内大权，你的核心信条是？</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {DISPOSITION_OPTIONS.map((opt) => {
                    const isSelected = rulingParty === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setRulingParty(opt.id);
                          playVoteTick();
                        }}
                        className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-amber-400 bg-gradient-to-br from-amber-950/70 via-[#1f1508] to-[#0e0c06] shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/80"
                            : "border-white/[0.08] bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-800/60 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                              {opt.title}
                            </span>
                            <div className="flex items-center gap-1 -space-x-1">
                              {opt.coreAgents.map((aid) => (
                                <CharacterAvatar key={aid} agentId={aid} size="sm" />
                              ))}
                            </div>
                          </div>
                          {isSelected ? (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-scaleIn">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-white/20 bg-black/30 group-hover:border-white/40 transition" />
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-300 font-sans leading-relaxed">
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: 你的脑内代号 */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>STEP 4: 为你在这个脑内议会确立一个代号</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-400">选择经典大学生代号：</label>
                  <div className="flex flex-wrap gap-2">
                    {CODENAME_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setCodename(chip);
                          playVoteTick();
                        }}
                        className={`rounded-full px-3 py-1 text-xs transition duration-200 ${
                          codename === chip
                            ? "bg-cyan-500 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    或直接自定义输入你的专属代号：
                  </label>
                  <input
                    type="text"
                    value={codename}
                    maxLength={18}
                    onChange={(e) => setCodename(e.target.value)}
                    placeholder="如：高数受害者小张、信工熬夜冠军..."
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* 底部前后翻页与确定 */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((p) => p - 1)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-xl border border-zinc-800 transition"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>上一步</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    playVoteTick();
                    setStep((p) => p + 1);
                  }}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95 transition"
                >
                  <span>下一步</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishCalibration}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition"
                >
                  <Crown className="h-4 w-4 text-amber-300" />
                  <span>完成校准 · 成立我的脑内生态！</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* 校准成功证书卡 */
          generatedProfile && (
            <div className="relative z-10 space-y-5 animate-fadeIn text-center py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 text-white shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <span className="rounded-full bg-cyan-950 border border-cyan-500/60 px-3 py-1 text-[11px] font-mono text-cyan-300">
                  ★ 神经元图谱已烙印定型 ★
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-white mt-2">
                  【{generatedProfile.codename}】专属脑内议事堂正式成立！
                </h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto leading-relaxed">
                  当前执政核心：<strong className="text-cyan-300">{generatedProfile.rulingParty}</strong> · 
                  核心压力防线：<strong className="text-rose-300">
                    {ANXIETY_OPTIONS.find((a) => a.id === generatedProfile.primaryAnxiety)?.title}
                  </strong>
                </p>
              </div>

              {/* 100席权力分布预览条 */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-bold text-white">
                    <Scale className="h-3.5 w-3.5 text-cyan-400" />
                    <span>初始100议席实名权力占比：</span>
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400">已加盖脑神经戳印</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  {(Object.keys(generatedProfile.powerMap) as AgentId[])
                    .filter((aid) => aid !== "chairman")
                    .sort((a, b) => generatedProfile.powerMap[b] - generatedProfile.powerMap[a])
                    .slice(0, 6)
                    .map((aid) => {
                      const prof = AGENT_PROFILES[aid];
                      const pct = generatedProfile.powerMap[aid];
                      return (
                        <div
                          key={aid}
                          className="flex items-center justify-between rounded-lg bg-zinc-900/80 px-2.5 py-1.5 border border-white/[0.06]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <CharacterAvatar agentId={aid} size="sm" />
                            <span className="truncate text-zinc-200">{prof?.name}</span>
                          </div>
                          <span className="font-mono font-bold text-cyan-300">{pct}席</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyAndClose}
                  className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 transition"
                >
                  <span>立即开启今日内耗审议 ➔</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
