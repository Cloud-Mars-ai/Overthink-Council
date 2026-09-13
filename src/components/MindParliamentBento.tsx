"use client";

import React, { useState } from "react";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { AgentId } from "@/lib/types";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { playTextBlip } from "@/lib/audio";
import {
  Sparkles,
  Zap,
  TrendingUp,
  HeartHandshake,
  Swords,
  Flame,
  Scale,
  SlidersHorizontal,
} from "lucide-react";

interface FactionParty {
  id: string;
  leaderId: AgentId;
  name: string;
  shortName: string;
  subTitle: string;
  baseSeats: number;
  color: string;
  borderColor: string;
  glowColor: string;
  slogan: string;
  currentBill: string;
  nemesisParty: string;
  statusTag: string;
  stance: "ruling" | "opposition" | "neutral";
}

const FACTIONS: FactionParty[] = [
  {
    id: "gpa",
    leaderId: "gpa",
    name: "GPA学委执政党",
    shortName: "学术严选司",
    subTitle: "学业与绩点终身督导委",
    baseSeats: 32,
    color: "#06b6d4",
    borderColor: "rgba(6, 182, 212, 0.6)",
    glowColor: "rgba(6, 182, 212, 0.3)",
    slogan: "“挂科不仅是400块重修费，更是大二整个盛夏在补考考场的耻辱。”",
    currentBill: "《关于建立早八必修课零缺勤防线与平时分保全特急令》",
    nemesisParty: "多巴胺享乐工会（蜜柑）",
    statusTag: "第一执政党",
    stance: "ruling",
  },
  {
    id: "happiness",
    leaderId: "happiness",
    name: "多巴胺享乐工会",
    shortName: "即时快乐总署",
    subTitle: "夜间内啡肽与精神放飞部",
    baseSeats: 26,
    color: "#f59e0b",
    borderColor: "rgba(245, 158, 11, 0.6)",
    glowColor: "rgba(245, 158, 11, 0.3)",
    slogan: "“按部就班那是老干部的活！大学四年就这么长，此时不爽更待何时？！”",
    currentBill: "《关于宿舍夜间五排排位赛免于被点名追责之全员豁免条例》",
    nemesisParty: "发际线维稳极左派（悠悠）",
    statusTag: "第一大在野党",
    stance: "opposition",
  },
  {
    id: "social",
    leaderId: "social",
    name: "寝室政治合群党",
    shortName: "人情资本联络处",
    subTitle: "微型社交圈与集体认同司",
    baseSeats: 18,
    color: "#ec4899",
    borderColor: "rgba(236, 72, 153, 0.6)",
    glowColor: "rgba(236, 72, 153, 0.3)",
    slogan: "“大学是个微缩社会，今天不合群，明天在宿舍连代拿外卖都没人搭理。”",
    currentBill: "《关于周五晚间强制AA制聚餐破冰与感情升温特别拨款案》",
    nemesisParty: "尊严与傲骨阵营（冷锋）",
    statusTag: "关键造王者",
    stance: "neutral",
  },
  {
    id: "wallet",
    leaderId: "wallet",
    name: "生活费资产风控党",
    shortName: "恩格尔防线守门司",
    subTitle: "财政资产与负债警戒部",
    baseSeats: 14,
    color: "#10b981",
    borderColor: "rgba(16, 185, 129, 0.6)",
    glowColor: "rgba(16, 185, 129, 0.3)",
    slogan: "“冲动消费前请看一眼支付宝余额，恩格尔系数已经飙到92%了！”",
    currentBill: "《关于对深夜冲动炸鸡烧烤外卖征收惩罚性精神关税之动议》",
    nemesisParty: "多巴胺享乐工会（暴食/蜜柑）",
    statusTag: "绝对否决权",
    stance: "ruling",
  },
  {
    id: "sleep",
    leaderId: "sleep",
    name: "发际线维稳极左派",
    shortName: "特困生权益保障会",
    subTitle: "褪黑素储量与心肌安保部",
    baseSeats: 10,
    color: "#8b5cf6",
    borderColor: "rgba(139, 92, 246, 0.6)",
    glowColor: "rgba(139, 92, 246, 0.3)",
    slogan: "“再不让我闭眼睡觉，明天上午就让大脑额叶死机+心肌抗议给你看！”",
    currentBill: "《关于凌晨01:30在全脑中枢执行不可逆断网断电睡眠戒严法案》",
    nemesisParty: "全体夜猫子阵营",
    statusTag: "高频被否决",
    stance: "opposition",
  },
];

import { UserEcologyProfile } from "@/lib/types";

interface MindParliamentBentoProps {
  userEcology?: UserEcologyProfile | null;
  onOpenCalibration?: () => void;
}

type StressScenario = "default" | "my_ecology" | "exam_week" | "game_night" | "crush_text";

export const MindParliamentBento: React.FC<MindParliamentBentoProps> = ({
  userEcology,
  onOpenCalibration,
}) => {
  const [selectedFactionId, setSelectedFactionId] = useState<string>("gpa");
  const [activeTab, setActiveTab] = useState<"chamber" | "rivalries">("chamber");
  const [scenario, setScenario] = useState<StressScenario>(userEcology ? "my_ecology" : "default");

  const getDynamicSeats = (factionId: string): number => {
    if (scenario === "my_ecology" && userEcology) {
      const pm = userEcology.powerMap;
      if (factionId === "gpa") return pm.gpa || 30;
      if (factionId === "happiness") return (pm.happiness || 20) + (pm.stomach ? Math.floor(pm.stomach / 2) : 0);
      if (factionId === "social") return (pm.social || 15) + (pm.love ? Math.floor(pm.love / 2) : 0);
      if (factionId === "wallet") return pm.wallet || 15;
      if (factionId === "sleep") return (pm.sleep || 15) + (pm.dignity ? Math.floor(pm.dignity / 2) : 0);
    } else if (scenario === "exam_week") {
      if (factionId === "gpa") return 49;
      if (factionId === "wallet") return 18;
      if (factionId === "happiness") return 11;
      if (factionId === "sleep") return 7;
      if (factionId === "social") return 15;
    } else if (scenario === "game_night") {
      if (factionId === "happiness") return 44;
      if (factionId === "social") return 26;
      if (factionId === "gpa") return 14;
      if (factionId === "sleep") return 6;
      if (factionId === "wallet") return 10;
    } else if (scenario === "crush_text") {
      if (factionId === "social") return 36;
      if (factionId === "happiness") return 28;
      if (factionId === "sleep") return 6;
      if (factionId === "gpa") return 18;
      if (factionId === "wallet") return 12;
    }
    const f = FACTIONS.find((x) => x.id === factionId);
    return f ? f.baseSeats : 20;
  };

  const handleSelectFaction = (id: string) => {
    setSelectedFactionId(id);
    playTextBlip();
  };

  const activeFaction = FACTIONS.find((f) => f.id === selectedFactionId) || FACTIONS[0];
  const activeProfile = AGENT_PROFILES[activeFaction.leaderId] || AGENT_PROFILES.gpa;

  const seatGrid: { index: number; factionId: string; color: string }[] = [];
  let currentAccumulator = 0;
  FACTIONS.forEach((f) => {
    const seatCount = getDynamicSeats(f.id);
    for (let i = 0; i < seatCount; i++) {
      seatGrid.push({
        index: currentAccumulator,
        factionId: f.id,
        color: f.color,
      });
      currentAccumulator++;
    }
  });

  return (
    <section id="mind-ecosystem" className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-2 sm:px-4">
      {/* 头部标题与定位 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300 mb-2.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>脑内多智能体政治生态 · 势力格局全景沙盘</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>我的脑内议会 · 派系势力格局</span>
            <span className="text-xs sm:text-sm font-sans font-normal text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
              100席动态选票
            </span>
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 font-sans">
            每一次纠结与当庭决议，都在实时重构你大脑各常任司局的执政话语权与妥协平衡。
          </p>
        </div>

        {/* 交互 Tab 切换器 */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.08] w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => {
              setActiveTab("chamber");
              playTextBlip();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === "chamber"
                ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>议事全景座席</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("rivalries");
              playTextBlip();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === "rivalries"
                ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Swords className="h-3.5 w-3.5" />
            <span>派系暗斗互克</span>
          </button>
        </div>
      </div>

      {/* 快捷情境压力测试模拟条 (Stress-Test Scenario Switcher) */}
      <div className="mb-5 p-3 rounded-2xl luxury-glass border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold text-white">当事人脑内情境压力模拟：</span>
          </div>
          {onOpenCalibration && (
            <button
              onClick={onOpenCalibration}
              className="sm:hidden px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition"
            >
              🔄 重测生态
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {userEcology && (
            <button
              onClick={() => {
                setScenario("my_ecology");
                playTextBlip();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                scenario === "my_ecology"
                  ? "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-300"
                  : "bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              ✨ 我的专属生态 ({userEcology.codename})
            </button>
          )}
          {[
            { id: "default", label: "⚖️ 日常平衡态", desc: "基准稳定状态" },
            { id: "exam_week", label: "📚 期末考倒计时7天", desc: "GPA党暴涨" },
            { id: "game_night", label: "🎮 舍友深夜狂吼五排", desc: "享乐工会夺权" },
            { id: "crush_text", label: "💔 心仪对象发'睡了吗'", desc: "社交情感决战" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setScenario(item.id as StressScenario);
                playTextBlip();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                scenario === item.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-1 ring-cyan-300"
                  : "bg-black/30 border border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15]"
              }`}
            >
              {item.label}
            </button>
          ))}
          {onOpenCalibration && (
            <button
              onClick={onOpenCalibration}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition"
            >
              🔄 重新校准
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: 议事堂 100 席半环形座席与派系切片 */}
      {activeTab === "chamber" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fadeIn">
          {/* 左侧：100席半环形座席全景展示台 */}
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl luxury-glass p-4 sm:p-6 border border-white/[0.1] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-black text-white">
                  脑内最高议事堂 · 100席全员议事图谱
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans">
                  下方每个光点代表1点意志席位，悬停或点击右侧派系查看席位所属
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded-full shrink-0">
                实名表决制
              </span>
            </div>

            {/* 100席半环形圆点座席阵列 (Parliament Hemicycle Matrix) */}
            <div className="my-auto py-3 px-1 sm:py-4 sm:px-2">
              <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 justify-center items-center max-w-[310px] sm:max-w-md mx-auto p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/[0.06] shadow-inner">
                {seatGrid.slice(0, 100).map((seat) => {
                  const isHighlight = seat.factionId === selectedFactionId;

                  return (
                    <div
                      key={seat.index}
                      className={`h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isHighlight
                          ? "scale-125 ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10"
                          : "opacity-40 hover:opacity-100 hover:scale-110"
                      }`}
                      style={{
                        backgroundColor: seat.color,
                        boxShadow: isHighlight ? `0 0 14px ${seat.color}` : "none",
                      }}
                      onClick={() => handleSelectFaction(seat.factionId)}
                      title={`席位 #${seat.index + 1} - ${seat.factionId}`}
                    />
                  );
                })}
              </div>

              {/* 阵营对比量度条 */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-cyan-400 flex items-center gap-1 font-bold">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span>学术保底同盟 (GPA+钱包): {getDynamicSeats("gpa") + getDynamicSeats("wallet")}席</span>
                  </span>
                  <span className="text-amber-400 flex items-center gap-1 font-bold">
                    <span>即时享乐派 (快乐+睡眠+社交): {getDynamicSeats("happiness") + getDynamicSeats("sleep") + getDynamicSeats("social")}席</span>
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-white/[0.08] flex">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${getDynamicSeats("gpa") + getDynamicSeats("wallet")}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${getDynamicSeats("happiness") + getDynamicSeats("sleep") + getDynamicSeats("social")}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 底部当事人意识状态解读 */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>当庭决议法定门槛：过半数（51席）</span>
              <span className="text-cyan-300 font-bold">
                {scenario === "exam_week"
                  ? "🚨 警戒：GPA党席位过近半数，进入强制戒严"
                  : scenario === "game_night"
                  ? "🔥 暴走：多巴胺派夺得多数，防御全线崩溃"
                  : "● 均势：正反拉锯，全靠议长一锤定音"}
              </span>
            </div>
          </div>

          {/* 右侧：派系列表与激活派系高定情报卡 */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* 派系快速选择胶囊 */}
            <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/[0.08]">
              {FACTIONS.map((f) => {
                const isSelected = f.id === selectedFactionId;
                const seats = getDynamicSeats(f.id);

                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFaction(f.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      isSelected
                        ? "bg-white/[0.1] border shadow-lg"
                        : "opacity-60 hover:opacity-100 hover:bg-white/[0.03]"
                    }`}
                    style={{
                      borderColor: isSelected ? f.color : "transparent",
                    }}
                  >
                    <CharacterAvatar agentId={f.leaderId} size="sm" />
                    <span className="text-[10px] font-bold text-white truncate max-w-full">
                      {f.name.slice(0, 4)}
                    </span>
                    <span
                      className="text-[10px] font-mono font-black rounded px-1"
                      style={{
                        color: f.color,
                        backgroundColor: `${f.color}15`,
                      }}
                    >
                      {seats}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 选定派系深度情报档案 */}
            <div
              className="flex-1 rounded-2xl sm:rounded-3xl luxury-glass p-5 border relative overflow-hidden transition-all duration-300 animate-fadeIn"
              style={{ borderColor: activeFaction.borderColor }}
            >
              <div
                className="absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: activeFaction.color }}
              />

              <div className="relative z-10 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-3">
                    <CharacterAvatar agentId={activeFaction.leaderId} size="md" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-serif text-base font-black text-white">
                          {activeFaction.name}
                        </h4>
                        <span
                          className="text-[9px] font-bold px-2 py-0.2 rounded-full border"
                          style={{
                            color: activeFaction.color,
                            borderColor: `${activeFaction.color}60`,
                            backgroundColor: `${activeFaction.color}15`,
                          }}
                        >
                          {activeFaction.statusTag}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-sans mt-0.5">
                        领袖：{activeProfile.name} · {activeFaction.subTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xl font-black" style={{ color: activeFaction.color }}>
                      {getDynamicSeats(activeFaction.id)} 席
                    </div>
                    <div className="text-[10px] text-zinc-500">占脑内话语权</div>
                  </div>
                </div>

                {/* 施政立院信条 */}
                <div className="rounded-xl bg-black/30 p-3 border border-white/[0.06]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" style={{ color: activeFaction.color }} />
                    <span>党派立院信条</span>
                  </div>
                  <p className="text-xs font-serif italic text-zinc-200 leading-relaxed">
                    {activeFaction.slogan}
                  </p>
                </div>

                {/* 当前强推提案 */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                    <span>本会期核心提案：</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed bg-white/[0.02] p-2 rounded-lg border border-white/[0.06]">
                    {activeFaction.currentBill}
                  </p>
                </div>

                {/* 宿敌与死敌 */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Swords className="h-3.5 w-3.5 text-rose-400" />
                    <span>死敌派系：</span>
                  </span>
                  <span className="font-bold text-rose-300 font-sans">
                    {activeFaction.nemesisParty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 派系暗斗互克与秘密结盟矩阵 */}
      {activeTab === "rivalries" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          {/* 对抗组 1: 快乐工会 VS 睡眠极左派 */}
          <div className="rounded-2xl sm:rounded-3xl luxury-glass p-5 border border-rose-500/30 flex flex-col justify-between shadow-[0_0_25px_rgba(244,63,94,0.1)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2.5 py-0.5 rounded-full">
                  ⚡ 世纪死斗 · 永恒僵局
                </span>
                <Swords className="h-4 w-4 text-rose-400" />
              </div>
              <div className="flex items-center justify-center gap-3 my-3">
                <CharacterAvatar agentId="happiness" size="md" />
                <span className="font-black text-rose-400 text-lg">VS</span>
                <CharacterAvatar agentId="sleep" size="md" />
              </div>
              <h4 className="text-sm font-bold text-white text-center">
                多巴胺享乐工会 × 睡眠发际线保卫派
              </h4>
              <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-sans">
                “再开一把Valorant / 再刷五分钟”与“再不睡明天额叶死机”的历史纠缠。本月睡眠委累计提出 34 次紧急断网提议，31 次被快乐党以“大学就这么长”强行否决。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-rose-300/80 flex items-center justify-between">
              <span>当事人头痛发生率</span>
              <span className="font-bold">96.4%</span>
            </div>
          </div>

          {/* 对抗组 2: GPA党 + 钱包党 现实防御同盟 */}
          <div className="rounded-2xl sm:rounded-3xl luxury-glass p-5 border border-cyan-500/30 flex flex-col justify-between shadow-[0_0_25px_rgba(6,182,212,0.1)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                  🛡️ 现实刚性 · 执政铁盟
                </span>
                <HeartHandshake className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="flex items-center justify-center gap-3 my-3">
                <CharacterAvatar agentId="gpa" size="md" />
                <span className="font-black text-cyan-400 text-lg">+</span>
                <CharacterAvatar agentId="wallet" size="md" />
              </div>
              <h4 className="text-sm font-bold text-white text-center">
                学术严选司 × 生活费资产风控党
              </h4>
              <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-sans">
                共同筑牢大学生尊严底线。算账逻辑简单粗暴：挂科不仅丢人，400块重修费相当于吃20顿疯狂星期四。只要涉及挂科和破产，两党联合行使绝对一票否决权。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-cyan-300/80 flex items-center justify-between">
              <span>资产与绩点拦截率</span>
              <span className="font-bold">88.2%</span>
            </div>
          </div>

          {/* 对抗组 3: 社交党 VS 尊严傲骨派 */}
          <div className="rounded-2xl sm:rounded-3xl luxury-glass p-5 border border-pink-500/30 flex flex-col justify-between shadow-[0_0_25px_rgba(236,72,153,0.1)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-pink-400 bg-pink-950/60 border border-pink-800/60 px-2.5 py-0.5 rounded-full">
                  💔 人际心智 · 微型拉锯
                </span>
                <Flame className="h-4 w-4 text-pink-400" />
              </div>
              <div className="flex items-center justify-center gap-3 my-3">
                <CharacterAvatar agentId="social" size="md" />
                <span className="font-black text-pink-400 text-lg">VS</span>
                <CharacterAvatar agentId="dignity" size="md" />
              </div>
              <h4 className="text-sm font-bold text-white text-center">
                寝室人情合群党 × 尊严体面代表
              </h4>
              <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-sans">
                “为了合群赔笑”与“拒绝当小丑保持清高”的哲学较量。在收到喜欢的人微信时尤为激烈：小圆力主松弛回复维持连接，冷锋警告“秒回等于自愿盖章终身备胎”。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-pink-300/80 flex items-center justify-between">
              <span>聊天框反复删改率</span>
              <span className="font-bold">100%</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
