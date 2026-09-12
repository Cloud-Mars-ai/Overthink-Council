"use client";

import React, { useState } from "react";
import { X, Download, Copy, Check, Sparkles, Share2, ShieldCheck, Heart } from "lucide-react";

interface SocialPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  caseTitle: string;
}

export const SocialPosterModal: React.FC<SocialPosterModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  caseTitle,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `学园内耗特别裁决令_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyImage = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 降级：如果浏览器不支持写入图片，复制提示
      alert("浏览器暂不支持直接写入剪贴板，请点击【下载高清海报】或在手机上长按保存！");
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl my-auto rounded-3xl border border-rose-500/30 bg-[#0a0d1c] p-4 sm:p-6 shadow-[0_0_80px_rgba(225,29,72,0.35)] cursor-default space-y-4"
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-1.5">
                <span>小红书 / 朋友圈高清裁决长图</span>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  2X 超清导出
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                法定防伪公章已合成 · 可直接发动态晒出你的脑内处分令
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 海报预览图展示区 */}
        <div className="relative max-h-[58vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 p-2 shadow-inner group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="学园内耗终审裁决令海报"
            className="w-full h-auto rounded-xl shadow-2xl transition duration-300"
          />
        </div>

        {/* 手机端长按保存温馨提示 */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-rose-950/30 border border-rose-500/25 text-[11px] text-rose-200/90 font-sans">
          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400 shrink-0" />
            <span>手机端：长按上方图片即可「保存到相册」或直接发给微信好友</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">PNG 格式</span>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs text-zinc-300 hover:text-white transition"
          >
            关闭
          </button>

          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:border-cyan-400 hover:text-white transition active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>已复制到剪贴板！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>复制图片</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] transition hover:brightness-110 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>下载高清海报</span>
          </button>
        </div>
      </div>
    </div>
  );
};
