"use client";

import React, { useState, useEffect } from "react";
import { Settings, Key, ShieldCheck, X, Sparkles, Cpu } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  apiProvider: string;
  onSave: (key: string, provider: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  apiProvider,
  onSave,
}) => {
  const [key, setKey] = useState(apiKey);
  const [provider, setProvider] = useState(apiProvider || "gemini");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKey(apiKey);
    setProvider(apiProvider || "gemini");
  }, [apiKey, apiProvider]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(key.trim(), provider);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-[#0c0d16] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-bold text-white">大模型推理引擎配置</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              模型服务商
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
            >
              <option value="gemini">Google Gemini 2.0 / 2.5 Flash</option>
              <option value="openai">OpenAI 兼容接口 (DeepSeek / Qwen / SiliconFlow)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              API Key (可选，黑客松演示默认内置高保真离线引擎，免配置即用)
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="留空即使用内置极速离线剧本与动态解构引擎"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-[11px] text-emerald-300 leading-relaxed">
            <div className="flex items-center gap-1 font-bold mb-0.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>黑客松双引擎守护承诺：</span>
            </div>
            若未填 Key 或现场网络波动，系统将自动无缝切换至内置的多智能体离线对战生成器，100% 杜绝答辩现场翻车！
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-400 hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-red-500 active:scale-95"
            >
              {saved ? "已保存生效！" : "保存设置"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
