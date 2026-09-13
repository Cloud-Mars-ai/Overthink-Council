"use client";

import React, { useState } from "react";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { AgentId } from "@/lib/types";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { playTextBlip } from "@/lib/audio";
import { Users, Shield, Sparkles, Skull, AlertCircle, Quote } from "lucide-react";

// 十一大脑内委员专属深度人设档案（不启动辩论，纯沉浸式人设鉴赏）
interface AgentLoreArchive {
  catchphrase: string;
  rival: string;
  vulnerability: string;
  rageTrigger: string;
  representativeCase: string;
}

const AGENT_LORE_ARCHIVES: Record<string, AgentLoreArchive> = {
  gpa: {
    catchphrase: "“挂科不仅是400块重修费，更是大二整个盛夏在闷热阶梯教室补考的耻辱。”",
    rival: "快乐委员·蜜柑（永远在当事人耳边吹'大学四年不嗨就老了'的邪风）",
    vulnerability: "面对任课老师随机点名系统和教务处绩点排名公示表时极度紧绷",
    rageTrigger: "看到当事人凌晨还在打游戏且明天上午第一节是专业必修课时直接报警",
    representativeCase: "早八专业课考勤 VS 凌晨三点全宿舍开黑生死决战",
  },
  sleep: {
    catchphrase: "“再不让我闭眼睡觉，明天上午我就让全身肌肉酸痛+额叶死机给你看！”",
    rival: "恋爱委员 & 快乐委员（一个半夜发消息，一个通宵组车队，合伙剥夺睡眠）",
    vulnerability: "褪黑素储量跌破20%，心率监测表发出红色震动报警",
    rageTrigger: "当事人嘴上说着'再刷五分钟短视频就睡'，实际刷到凌晨三点半",
    representativeCase: "今晚只睡了4小时20分，是否仍要坚持硬撑早八",
  },
  happiness: {
    catchphrase: "“按部就班那是老干部的活！大学这四年一眨眼就没了，此时不爽更待何时？！”",
    rival: "GPA委员·椎名学委（张口闭口概率模型与未来就业，极度扫兴）",
    vulnerability: "害怕期末成绩单寄回老家被家长当场拆封",
    rageTrigger: "当事人在大好周末好不容易放假，却非要坐在自习室假装焦虑学习",
    representativeCase: "周末是跟死党通宵打瓦，还是在图书馆枯坐看PPT",
  },
  wallet: {
    catchphrase: "“在冲动消费前请先看一眼支付宝余额，恩格尔系数已经飙到92%了！”",
    rival: "胃部代表 & 恋爱委员（一个半夜馋炸鸡，一个约会想喝人均45的网红咖啡）",
    vulnerability: "银行卡余额跌至三位数，花呗账单日迫在眉睫",
    rageTrigger: "看到当事人为了'面子'在根本不熟的社团局上主动抢着AA请客买单",
    representativeCase: "月末生活费只剩200块，同学非要拉我去吃人均150的海底捞",
  },
  social: {
    catchphrase: "“大学是个小型微缩社会，你现在不合群，明天在宿舍连水都没人给你带！”",
    rival: "尊严委员（动不动就劝当事人'别讨好别人，要有傲骨'）",
    vulnerability: "寝室群突然陷入长达三个小时的死寂，怀疑自己被拉了私聊小群孤立",
    rageTrigger: "全宿舍都在讨论同一个话题，唯独当事人戴着耳机置身事外",
    representativeCase: "宿舍其他人都在联机游戏，我一个人在卷绩点被阴阳怪气怎么办",
  },
  ambition: {
    catchphrase: "“平庸的选择只会换来平庸的人生！简历上没有硬核履历，秋招你拿什么跟别人拼？！”",
    rival: "睡眠委员（天天倡导躺平佛系，阻碍当事人起飞）",
    vulnerability: "看到同届同学在朋友圈晒出大厂实习Offer或国家级竞赛一等奖",
    rageTrigger: "当事人面对含金量极高但难度很大的项目竞赛，第一反应居然是'我肯定不行'",
    representativeCase: "要不要竞选学生会部长？听说全是繁琐杂事但能给简历贴金",
  },
  future: {
    catchphrase: "“我是三年后的你。我可以明确告诉你：你现在纠结的破事，三年后连屁都不算。”",
    rival: "当事人的即时伪焦虑（被眼前几天的琐事无限放大折磨）",
    vulnerability: "担心当事人在大学关键分水岭做出不可逆的自毁型选择",
    rageTrigger: "看到当事人在一段毫无意义的内耗人际关系里反复自我怀疑、哭湿枕头",
    representativeCase: "大二还没实习，该考研、考公还是直接去找小厂打杂",
  },
  love: {
    catchphrase: "“夜深人静防线失守，对方第一个找你！这不是天赐良机是什么？给我上！”",
    rival: "尊严委员（张口闭口备胎警告，逼当事人装高冷）",
    vulnerability: "微信聊天框显示'对方正在输入...'随后突然消失，陷入无尽胡思乱想",
    rageTrigger: "当事人好不容易跟心仪对象聊得火热，尊严委突然跳出来说'别回了，晾着Ta'",
    representativeCase: "暗恋对象凌晨一点半突然发来一句'睡了吗'，我该秒回还是晾5分钟",
  },
  dignity: {
    catchphrase: "“秒回等于自愿盖章终身备胎！收起你的讨好型人格，给自己留点体面！”",
    rival: "恋爱委员（恋爱脑上头，随时准备把自尊扔在地上让人踩）",
    vulnerability: "在公众场合被调侃或被忽视，脸部毛细血管迅速充血发红",
    rageTrigger: "看到当事人为了维持塑料友情，在聚会里卑微赔笑当小丑",
    representativeCase: "社团聚餐被学长当众开低俗玩笑，我是当场翻脸还是尴尬赔笑",
  },
  stomach: {
    catchphrase: "“生理胃酸正在发出紧急报警！卡路里就是生命力，先吃了这顿炸鸡再说！”",
    rival: "钱包委员 & 尊严委员（一个心疼外卖费，一个担心发胖走形）",
    vulnerability: "半夜刷到美食探店视频，胃酸咕噜狂叫，口腔剧烈分泌唾液",
    rageTrigger: "当事人明明饿得前胸贴后背，却硬灌白开水企图'欺骗胃部'",
    representativeCase: "半夜一点半，肚子突然疯狂咕噜叫，要不要点一整份香辣炸鸡配可乐",
  },
  chairman: {
    catchphrase: "“肃静！脑内议会不是菜市场！吵吵闹闹成何体统，本庭自有公道裁决！”",
    rival: "全员失控暴走（11个委员同时抢话互骂，导致当事人当场头痛欲裂）",
    vulnerability: "当事人心智不坚定，裁决书发下去之后第二天当事人又出尔反尔反悔",
    rageTrigger: "某委员试图搞'一票否决权'绑架全体大脑中枢神经",
    representativeCase: "脑子里的各个念头天天神仙打架，急需最高权威法槌一锤定音",
  },
};

export const CommissionerRoster: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("gpa");

  const agentIds = Object.keys(AGENT_PROFILES) as AgentId[];
  const activeProfile = AGENT_PROFILES[selectedAgentId] || AGENT_PROFILES["gpa"];
  const activeLore = AGENT_LORE_ARCHIVES[selectedAgentId] || AGENT_LORE_ARCHIVES["gpa"];

  const handleSelect = (id: string) => {
    setSelectedAgentId(id);
    playTextBlip();
  };

  return (
    <div className="w-full mt-6 sm:mt-10">
      {/* 头部标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            <Users className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-black text-white tracking-wide">
              十一脑内常任委员全席巡礼 · 人设名录全景图鉴
            </h3>
            <p className="text-[11px] text-zinc-400 font-sans">
              纯人设专属展厅：点击立绘深度解密脑内11大派别当庭性格、宿敌、致命弱点与口头禅（纯人物志，不开启辩论）
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-0.5 rounded-full">
            ● 纯人设档案 · 无需直达辩论
          </span>
        </div>
      </div>

      {/* 11位委员圆形立绘轨道栏 (Avatar Ribbon) */}
      <div className="relative rounded-2xl luxury-glass p-3 sm:p-4 mb-4 overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
          {agentIds.map((aid) => {
            const prof = AGENT_PROFILES[aid];
            const isSelected = selectedAgentId === aid;

            return (
              <button
                key={aid}
                onClick={() => handleSelect(aid)}
                className={`group flex flex-col items-center gap-1.5 shrink-0 transition-all duration-300 focus:outline-none ${
                  isSelected ? "scale-105" : "opacity-70 hover:opacity-100 hover:scale-100"
                }`}
              >
                <div className="relative">
                  <CharacterAvatar
                    agentId={aid}
                    size="md"
                    className={`transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                        : "group-hover:ring-1 group-hover:ring-white/40"
                    }`}
                  />
                  {isSelected && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-black text-white shadow">
                      ✓
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold transition-colors ${
                    isSelected ? "text-cyan-300 font-serif" : "text-zinc-400 group-hover:text-white"
                  }`}
                >
                  {prof.name.replace(/委员|代表|主任/, "")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 选定委员深度人设情报卡 (Persona Lore Dossier Card) */}
      {activeProfile && activeLore && (
        <div className="rounded-2xl sm:rounded-3xl luxury-glass p-5 sm:p-7 border border-white/[0.1] relative overflow-hidden transition-all duration-300 animate-fadeIn">
          {/* 背景光斑 */}
          <div
            className="absolute -right-12 -top-12 h-64 w-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: activeProfile.color }}
          />

          <div className="relative z-10 space-y-5">
            {/* 上部：立绘、身份、阵营与话语权 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <CharacterAvatar
                    agentId={activeProfile.id}
                    size="lg"
                    className="shadow-[0_0_25px_rgba(0,0,0,0.6)] ring-2"
                  />
                  <span
                    className="absolute -bottom-2 -left-1 px-2 py-0.2 rounded-full text-[9px] font-mono font-bold text-white border shadow"
                    style={{
                      backgroundColor: activeProfile.color,
                      borderColor: activeProfile.borderColor,
                    }}
                  >
                    {activeProfile.partyName}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif text-xl sm:text-2xl font-black text-white">
                      {activeProfile.name}
                    </h4>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
                      style={{
                        color: activeProfile.color,
                        borderColor: `${activeProfile.color}60`,
                        backgroundColor: `${activeProfile.color}15`,
                      }}
                    >
                      {activeProfile.badge}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                      脑内话语权: {activeProfile.powerPercent}%
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-cyan-300/90 font-medium">
                    常设司局：<span className="text-white">{activeProfile.roleTitle}</span>
                  </div>
                </div>
              </div>

              {/* 性格特质摘要标签 */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <span className="rounded-lg bg-black/40 border border-white/[0.08] px-2.5 py-1 text-[11px] text-zinc-300 font-mono">
                  性格：{activeProfile.personality}
                </span>
              </div>
            </div>

            {/* 中部：口头禅引语框 */}
            <div className="rounded-xl border border-white/[0.08] bg-black/30 p-3.5 sm:p-4 relative">
              <Quote className="h-5 w-5 text-cyan-400/40 absolute top-2.5 right-3" />
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>当庭经典口头禅</span>
              </div>
              <p className="text-xs sm:text-sm font-serif italic text-white leading-relaxed pr-6">
                {activeLore.catchphrase}
              </p>
            </div>

            {/* 下部：人设三要素网格 (纲领、宿敌、暴走点) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* 核心施政纲领 */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1.5">
                  <Shield className="h-3.5 w-3.5 text-cyan-400" />
                  <span>核心施政纲领</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {activeProfile.objective}
                </p>
              </div>

              {/* 宿敌与克星关系 */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-1.5">
                  <Skull className="h-3.5 w-3.5 text-rose-400" />
                  <span>宿敌与相互克制</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {activeLore.rival}
                </p>
              </div>

              {/* 暴走与倒戈触发点 */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>暴走 / 临场反水触发点</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {activeLore.rageTrigger}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
