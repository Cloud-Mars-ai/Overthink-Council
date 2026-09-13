"use client";

import React, { useEffect, useState } from "react";
import { Cpu, Key, Settings, ShieldCheck, Sparkles, X } from "lucide-react";
import { ApiConfig, ApiProvider } from "@/lib/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

const PROVIDER_LABELS: Record<ApiProvider, string> = {
  gemini: "Google Gemini（服务端配置）",
  openai: "OpenAI 兼容接口（DeepSeek / Qwen / SiliconFlow）",
  procedural: "内置离线引擎（无需 Key）",
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [draft, setDraft] = useState<ApiConfig>(config);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const syncId = window.setTimeout(() => setDraft(config), 0);
    return () => window.clearTimeout(syncId);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const updateDraft = <K extends keyof ApiConfig>(key: K, value: ApiConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...draft,
      apiKey: draft.apiKey.trim(),
      baseUrl: draft.baseUrl.trim().replace(/\/$/, ""),
      model: draft.model.trim(),
    });
    setSaved(true);
    window.setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-[#0c0d16] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-red-500" />
            <h3 id="settings-dialog-title" className="text-sm font-bold text-white">
              大模型推理引擎配置
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭设置"
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="model-provider" className="mb-1.5 block text-xs font-semibold text-zinc-300">
              模型服务商
            </label>
            <select
              id="model-provider"
              value={draft.provider}
              onChange={(e) => updateDraft("provider", e.target.value as ApiProvider)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
            >
              {(Object.keys(PROVIDER_LABELS) as ApiProvider[]).map((provider) => (
                <option key={provider} value={provider}>
                  {PROVIDER_LABELS[provider]}
                </option>
              ))}
            </select>
          </div>

          {draft.provider === "openai" && (
            <>
              <div>
                <label htmlFor="api-base-url" className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  OpenAI 兼容接口地址
                </label>
                <input
                  id="api-base-url"
                  type="url"
                  value={draft.baseUrl}
                  onChange={(e) => updateDraft("baseUrl", e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="api-model" className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  模型名称
                </label>
                <input
                  id="api-model"
                  type="text"
                  value={draft.model}
                  onChange={(e) => updateDraft("model", e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
                />
              </div>
            </>
          )}

          {draft.provider !== "procedural" && (
            <div>
              <label htmlFor="api-key" className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-zinc-300">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                API Key（仅保存在当前会话）
              </label>
              <input
                id="api-key"
                type="password"
                autoComplete="off"
                value={draft.apiKey}
                onChange={(e) => updateDraft("apiKey", e.target.value)}
                placeholder="留空即使用内置离线引擎"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              />
            </div>
          )}

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-[11px] leading-relaxed text-emerald-300">
            <div className="mb-0.5 flex items-center gap-1 font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>双引擎守护：</span>
            </div>
            <p>
              <Sparkles className="mr-1 inline h-3 w-3" />
              未填 Key、接口不可用或选择离线引擎时，会自动切换到内置剧本生成器。
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-[11px] leading-relaxed text-zinc-400">
            <div className="mb-1 flex items-center gap-1 font-semibold text-zinc-300">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>隐私提示</span>
            </div>
            API Key 不会写入 localStorage；如果使用第三方接口，请确认其数据处理政策。
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
