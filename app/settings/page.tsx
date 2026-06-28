"use client";
import { useEffect, useState, type FormEvent } from "react";

type ProviderId = "anthropic" | "openai" | "kimi" | "gemini";

const PROVIDER_LABELS: Record<ProviderId, string> = {
  anthropic: "Anthropic (Claude)",
  openai: "OpenAI",
  kimi: "Kimi (Moonshot)",
  gemini: "Google Gemini",
};
const PROVIDER_ORDER: ProviderId[] = ["anthropic", "openai", "kimi", "gemini"];

interface MaskedProvider {
  configured: boolean;
  maskedKey: string | null;
  model: string;
}
interface MaskedSettings {
  activeProvider: ProviderId;
  providers: Record<ProviderId, MaskedProvider>;
  instagram: { configured: boolean; maskedKey: string | null };
}

export default function SettingsPage() {
  const [data, setData] = useState<MaskedSettings | null>(null);
  const [active, setActive] = useState<ProviderId>("anthropic");
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [modelInputs, setModelInputs] = useState<Record<string, string>>({});
  const [igToken, setIgToken] = useState("");
  const [status, setStatus] = useState("");

  function load(d: MaskedSettings) {
    setData(d);
    setActive(d.activeProvider);
    const models: Record<string, string> = {};
    for (const id of PROVIDER_ORDER) models[id] = d.providers[id].model;
    setModelInputs(models);
  }

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(load);
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setStatus("저장 중…");
    const providers: Record<string, { apiKey: string; model: string }> = {};
    for (const id of PROVIDER_ORDER) {
      providers[id] = { apiKey: keyInputs[id] ?? "", model: modelInputs[id] ?? "" };
    }
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeProvider: active, providers, instagram: { accessToken: igToken } }),
    });
    if (!res.ok) {
      setStatus("저장 실패");
      return;
    }
    load(await res.json());
    setKeyInputs({});
    setIgToken("");
    setStatus("저장됨 ✓");
  }

  if (!data) return <main className="p-6">불러오는 중…</main>;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">⚙️ LLM 제공자 설정</h1>
        <a href="/" className="text-sm text-blue-600 underline">
          ← 대시보드
        </a>
      </div>
      <p className="text-sm text-neutral-500">
        키는 이 PC의 <code>data/settings.json</code>에만 저장되며 화면에는 마스킹되어 표시됩니다.
        스크린샷 파싱은 vision 지원 모델에서만 동작합니다.
      </p>

      <form onSubmit={onSave} className="space-y-3">
        {PROVIDER_ORDER.map((id) => {
          const p = data.providers[id];
          return (
            <div key={id} className="rounded-lg border border-neutral-200 p-4 space-y-2">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="radio"
                  name="active"
                  checked={active === id}
                  onChange={() => setActive(id)}
                />
                {PROVIDER_LABELS[id]}
                {p.configured && <span className="text-xs text-green-600">● 키 등록됨</span>}
              </label>
              <input
                type="password"
                className="border rounded px-2 py-1 w-full text-sm"
                placeholder={p.configured ? `등록됨 (${p.maskedKey}) — 변경 시에만 입력` : "API 키 입력"}
                value={keyInputs[id] ?? ""}
                onChange={(e) => setKeyInputs({ ...keyInputs, [id]: e.target.value })}
              />
              <input
                type="text"
                className="border rounded px-2 py-1 w-full text-sm"
                placeholder="모델명"
                value={modelInputs[id] ?? ""}
                onChange={(e) => setModelInputs({ ...modelInputs, [id]: e.target.value })}
              />
            </div>
          );
        })}

        <div className="rounded-lg border border-pink-200 bg-pink-50/40 p-4 space-y-2">
          <h2 className="font-semibold">📷 Instagram 연동 (Phase 2 자동 수집)</h2>
          <p className="text-xs text-neutral-500">
            Meta 개발자 앱에서 발급한 Instagram 액세스 토큰을 붙여넣으세요. 대시보드의
            "Instagram 동기화"로 릴스 집계 지표·팔로워 수가 자동 갱신됩니다.
            {data.instagram.configured && (
              <span className="text-green-600"> · 현재 등록됨({data.instagram.maskedKey})</span>
            )}
          </p>
          <input
            type="password"
            className="border rounded px-2 py-1 w-full text-sm"
            placeholder={
              data.instagram.configured
                ? `등록됨 (${data.instagram.maskedKey}) — 변경 시에만 입력`
                : "Instagram 액세스 토큰 붙여넣기"
            }
            value={igToken}
            onChange={(e) => setIgToken(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="border rounded px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-700">
            저장
          </button>
          {status && <span className="text-sm text-neutral-600">{status}</span>}
        </div>
      </form>
    </main>
  );
}
