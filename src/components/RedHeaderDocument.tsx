import React, { useState } from "react";
import { CouncilResolution, ProposalPlan } from "@/lib/types";
import { AGENT_PROFILES } from "@/lib/agents-data";
import { Copy, Check, Printer, RefreshCw, CheckCircle2, AlertOctagon, Camera } from "lucide-react";
import { toPng } from "html-to-image";
import { SocialPosterModal } from "@/components/SocialPosterModal";

interface RedHeaderDocumentProps {
  resolution: CouncilResolution;
  winningPlan: ProposalPlan;
  onAccept?: (planId?: ProposalPlan["id"]) => void;
  onReject?: () => void;
  onOpenAppeal?: () => void;
  compact?: boolean;
}

export const RedHeaderDocument: React.FC<RedHeaderDocumentProps> = ({
  resolution,
  winningPlan,
  onAccept,
  onReject,
  onOpenAppeal,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [rejectWarn, setRejectWarn] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const supervisingName =
    AGENT_PROFILES[resolution.supervisingAgent]?.name || "脑内监察特别专员";
  const stampDate = resolution.stampDate || new Date().toLocaleDateString("zh-CN");
  const nextAction = resolution.nextAction || `先完成「${winningPlan.title}」的第一步，再在固定时间复盘。`;
  const actionWindow = resolution.actionWindow || "今天内完成第一步";
  const confidence = Math.max(0, Math.min(100, resolution.confidence ?? 68));
  const canAppeal = Boolean(onOpenAppeal && resolution.appealCount < 1);

  // 格式化复制文本（标准公文格式）
  const officialDocumentText = `学园内耗特别审议委员会文件
${resolution.caseNumber}
--------------------------------------------------
密级：内部绝密（脑内限定）           签发人：至高额叶审判长

《关于对“${resolution.title}”之内耗议题的终局执行决议》

主送：当事人中枢神经系统、各大生理器官、全体脑内情感委员：

针对当事人近期反复出现的深夜精神内耗及额叶决策瘫痪状况，本委员会依据《脑内民意代表法》与《大学生保命守则》，召开多智能体紧急审议联席会议。经全体委员独立陈述、交叉质询与民主表决，现就本案正式作出终局裁决并下达强制执行令：

一、核准执行主导方案：【${winningPlan.title}】
经表决，此方案获得当事人脑内各派别绝对多数票通过。方案核心主旨：${winningPlan.desc}

二、强制实施细则及行为禁令：
${resolution.stipulations.map((s, idx) => `（${["一", "二", "三", "四", "五"][idx] || idx + 1}）${s}`).join("\n")}

三、履职监督与罚则：
本决议特设【${supervisingName}】为法定监督人。若当事人再次出现私自推翻决议、深夜反复横跳或过度自责之行为，监督机构有权当即扣发次日多巴胺定额，并处以通宵困倦连带惩戒。

四、生效效力与抗告：
本裁决自法槌击落之秒起即刻生效，当事人身体各生理机能应即刻停摆内耗、遵照执行。保留当事人一次提交重大新证据申请二审复核之法定抗告权。

学园内耗特别审议委员会
${stampDate}（已加盖公章）`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(officialDocumentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePoster = async () => {
    const node = document.getElementById("official-red-header-doc");
    if (!node) return;
    setIsGeneratingPoster(true);
    try {
      const dataUrl = await toPng(node, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#fffdf9",
        cacheBust: true,
      });
      setPosterUrl(dataUrl);
      setIsPosterModalOpen(true);
    } catch (err) {
      console.error("生成海报失败:", err);
      alert("海报生成失败，请重试或直接使用系统截图！");
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${compact ? "text-sm" : ""}`}>
      <div className="mb-4 grid gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/50 to-zinc-900/80 p-4 font-sans shadow-[0_0_25px_rgba(245,158,11,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">执行摘要 · 请把裁决变成行动</p>
            <p className="mt-1 text-sm font-bold text-white">{nextAction}</p>
          </div>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-950/50 px-2.5 py-1 text-[11px] font-mono text-emerald-300">
            把握度 {confidence}%
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-zinc-300">
          <span className="rounded-lg bg-black/30 px-2 py-1">行动窗口：{actionWindow}</span>
          <span className="rounded-lg bg-black/30 px-2 py-1">娱乐型辅助决策，不替代医疗、法律或财务建议</span>
        </div>
      </div>
      {/* 真实红头文件 A4 纸张主体 */}
      <div
        id="official-red-header-doc"
        className="relative bg-[#fffdf9] text-zinc-900 rounded-xl sm:rounded-2xl border border-[#e5dec9] shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-5 sm:p-12 font-serif transition-all overflow-hidden"
      >
        {/* 右上角红框特急印记 */}
        <div className="absolute top-4 right-4 sm:top-7 sm:right-8 border-2 border-[#cf1919] text-[#cf1919] px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-black tracking-widest rotate-[3deg] shadow-sm select-none">
          特急件 · 脑内绝密
        </div>

        {/* 顶部密级与发文号 */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-600 font-sans tracking-wide pb-2">
          <span>密级：内部绝密（脑内限定）</span>
          <span>保密期限：至大学毕业</span>
        </div>

        {/* 核心红头大字（醒目庄严的红头文件标准头部） */}
        <div className="text-center pt-2 sm:pt-4 pb-2">
          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-[#cf1919] tracking-[0.18em] sm:tracking-[0.25em] leading-tight select-none">
            学园内耗特别审议委员会文件
          </h1>
          <div className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-sans font-bold text-zinc-700 tracking-wider">
            {resolution.caseNumber}
          </div>
        </div>

        {/* 经典红头双红线（上粗下细） */}
        <div className="my-3 sm:my-5">
          <div className="h-[3.5px] bg-[#cf1919] w-full rounded-full" />
          <div className="h-[1px] bg-[#cf1919] w-full mt-[2.5px]" />
        </div>

        {/* 签发人与主送单位 */}
        <div className="space-y-2 text-xs sm:text-sm font-sans border-b border-zinc-200 pb-3 mb-4 sm:mb-6">
          <div className="flex items-center justify-between text-zinc-600">
            <span>签发人：<strong className="text-zinc-900 font-bold">至高额叶审判长</strong></span>
            <span>成文日期：<strong className="text-zinc-900 font-medium">{stampDate}</strong></span>
          </div>
          <div className="text-zinc-800 pt-1 font-bold">
            主送：<span className="font-normal text-zinc-700">当事人中枢神经系统、各大生理器官、全体脑内情感委员：</span>
          </div>
        </div>

        {/* 正式公文标题 */}
        <div className="text-center my-4 sm:my-7">
          <h2 className="text-base sm:text-2xl font-black text-zinc-950 tracking-wide leading-snug">
            关于对“{resolution.title}”之内耗议题
            <span className="block mt-0.5 sm:mt-1 text-[#cf1919]">的终局执行决议</span>
          </h2>
        </div>

        {/* 正文条款 */}
        <div className="space-y-4 sm:space-y-6 text-xs sm:text-[15px] text-zinc-800 leading-relaxed sm:leading-[1.85] text-justify font-sans">
          {/* 导语段落 */}
          <p className="indent-7 sm:indent-8">
            针对当事人近期反复出现的深夜精神内耗及额叶决策瘫痪状况，本委员会依据《学园脑内民意代表法》与《大学生保命守则》，特召开多智能体紧急审议联席会议。经全体委员独立陈述、交叉质询与全员民主投票，现就本案正式作出终局裁决并下达强制执行令：
          </p>

          {/* 第一条：核准方案 */}
          <div>
            <h3 className="font-bold text-zinc-950 flex items-baseline gap-1">
              <span className="text-[#cf1919]">一、</span>
              <span>核准执行主导方案：【{winningPlan.title}】</span>
            </h3>
            <p className="indent-7 sm:indent-8 mt-1 text-zinc-700">
              经特别审议会充分辩论及民主表决，此方案获得脑内多数票认可，确立为当前最具可行性与保命价值之决案。方案主旨要义：
              <span className="text-zinc-900 font-medium">“{winningPlan.desc}”</span>
              {winningPlan.compromiseNotes && (
                <span className="text-zinc-600 block sm:inline mt-0.5 sm:mt-0">
                  （妥协附款：{winningPlan.compromiseNotes}）
                </span>
              )}
            </p>
          </div>

          {/* 第二条：强制实施细则 */}
          <div>
            <h3 className="font-bold text-zinc-950 flex items-baseline gap-1">
              <span className="text-[#cf1919]">二、</span>
              <span>强制实施细则及行为禁令：</span>
            </h3>
            <div className="mt-1.5 space-y-2 pl-2 sm:pl-4">
              {resolution.stipulations.map((stip, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-zinc-800">
                  <span className="font-bold text-[#cf1919] shrink-0 font-mono">
                    （{["一", "二", "三", "四", "五"][idx] || idx + 1}）
                  </span>
                  <span>{stip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 第三条：履职监督与问责惩戒 */}
          <div>
            <h3 className="font-bold text-zinc-950 flex items-baseline gap-1">
              <span className="text-[#cf1919]">三、</span>
              <span>履职监督与问责惩戒机制：</span>
            </h3>
            <p className="indent-7 sm:indent-8 mt-1 text-zinc-700">
              本决议指定<strong className="text-zinc-950 font-bold">【{supervisingName}】</strong>为法定第一监督人，全天候巡查脑神经突触。若发现当事人私自推翻决议、深夜反复横跳或过度自责之行为，监督机构有权当即扣发次日多巴胺定额，并处以通宵困倦连带惩戒。
            </p>
          </div>

          {/* 第四条：生效与抗告 */}
          <div>
            <h3 className="font-bold text-zinc-950 flex items-baseline gap-1">
              <span className="text-[#cf1919]">四、</span>
              <span>效力声明与法定抗告权：</span>
            </h3>
            <p className="indent-7 sm:indent-8 mt-1 text-zinc-700">
              本决议自法槌击落之秒起即刻具备最高法律效力，当事人体内各大机能器官应即刻停摆内耗、全员遵照执行。当事人保留一次在发掘重大关键新证据前提下的二审特别抗告权。
            </p>
          </div>
        </div>

        {/* 底部落款与正式防伪鲜红印章（骑年盖月） */}
        <div className="relative mt-8 sm:mt-14 pt-4 border-t border-dashed border-zinc-300 flex justify-end">
          <div className="relative text-right space-y-1 sm:space-y-1.5 pr-2 sm:pr-6 z-10 select-none">
            <p className="text-sm sm:text-base font-bold text-zinc-900 tracking-wider">
              学园内耗特别审议委员会
            </p>
            <p className="text-xs sm:text-sm font-sans text-zinc-600">
              {stampDate}
            </p>
            <p className="text-[10px] text-zinc-400 font-mono">
              （正式红印归档 · 严禁擅改）
            </p>
          </div>

          {/* 真实矢量鲜红公章（覆盖在落款日期上：骑年盖月） */}
          <div className="absolute right-0 sm:right-4 -top-6 sm:-top-8 pointer-events-none select-none z-20">
            <svg
              viewBox="0 0 200 200"
              className="w-32 h-32 sm:w-40 sm:h-40 opacity-90 rotate-[-5deg] mix-blend-multiply drop-shadow-[0_2px_4px_rgba(207,25,25,0.25)]"
            >
              {/* 外圈双圆 */}
              <circle cx="100" cy="100" r="92" stroke="#cf1919" strokeWidth="4" fill="none" />
              <circle cx="100" cy="100" r="86" stroke="#cf1919" strokeWidth="1" fill="none" />

              {/* 环形弧形文字路径 */}
              <path id="seal-text-path" d="M 22,100 A 78,78 0 1,1 178,100" fill="none" />
              <text fill="#cf1919" fontSize="16" fontWeight="900" letterSpacing="3">
                <textPath href="#seal-text-path" startOffset="50%" textAnchor="middle">
                  学园内耗特别审议委员会
                </textPath>
              </text>

              {/* 中心鲜红五角星 */}
              <polygon
                points="100,56 108,80 134,80 113,96 121,120 100,105 79,120 87,96 66,80 92,80"
                fill="#cf1919"
              />

              {/* 下部横排标语 */}
              <text
                x="100"
                y="152"
                fill="#cf1919"
                fontSize="12.5"
                fontWeight="900"
                textAnchor="middle"
                letterSpacing="1.5"
              >
                ★ 审定裁决专用章 ★
              </text>
            </svg>
          </div>
        </div>

        {/* 海报专属防伪公信水印与裂变底栏 */}
        <div className="mt-8 pt-4 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400 font-sans select-none">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-serif font-bold text-zinc-600">学园内耗特别审议委员会 · 官方终审裁决令存根</span>
          </div>
          <div className="text-right text-zinc-500 font-medium">
            <span>扫码 / 搜索「学园内耗特别审议委员会」· 审判你的脑内小剧场</span>
          </div>
        </div>
      </div>

      {/* 拒不执行警告提示 */}
      {rejectWarn && (
        <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-950/40 p-3 text-xs text-amber-300 animate-fadeIn">
          ⚠️ 【审议会严正警告】拒不执行红头决议将自动触发“今晚失眠 + 明日自责”连带惩罚，建议遵照执行！
        </div>
      )}

      {/* 底部交互操作工具栏 */}
      <div className="print-hidden mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#0c1022]/90 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 一键生成朋友圈/小红书长图分享海报按钮 */}
          <button
            onClick={handleGeneratePoster}
            disabled={isGeneratingPoster}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-950/70 via-red-950/60 to-rose-900/60 px-3.5 py-2 text-xs font-bold text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            {isGeneratingPoster ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-rose-400" />
                <span>正在渲染高清海报...</span>
              </>
            ) : (
              <>
                <Camera className="h-3.5 w-3.5 text-rose-400" />
                <span>📸 生成朋友圈/小红书长图</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-cyan-500 hover:text-white active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">已复制红头公文！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-cyan-400" />
                <span>复制公文正文</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>打印 / PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onReject && (
            <button
              onClick={() => {
                setRejectWarn(true);
                onReject();
              }}
              className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-amber-700 hover:text-amber-400 active:scale-95"
            >
              <AlertOctagon className="h-3.5 w-3.5" />
              <span>拒不执行</span>
            </button>
          )}

          {canAppeal && (
            <button
              type="button"
              onClick={onOpenAppeal}
              className="flex items-center gap-1 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-950/50 to-zinc-900 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition hover:brightness-110 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>申请二审（新证据）</span>
            </button>
          )}

          {onAccept && (
            <button
              type="button"
              onClick={() => onAccept()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition hover:brightness-110 active:scale-95"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>遵照执行，平息内耗</span>
            </button>
          )}
        </div>
      </div>

      {/* 小红书/朋友圈高清长图海报预览弹窗 */}
      <SocialPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        imageUrl={posterUrl}
        caseTitle={resolution.title}
      />
    </div>
  );
};
