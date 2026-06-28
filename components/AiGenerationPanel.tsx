"use client";
import { useState } from "react";
import type { Generation } from "@/lib/recommend/generate";

export function AiGenerationPanel({ reelId }: { reelId: string }) {
  const [gen, setGen] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onGenerate() {
    setLoading(true);
    setError("");
    setGen(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "생성 실패");
        return;
      }
      setGen(data);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">✨ AI 맞춤 생성</h3>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="border rounded px-3 py-1 bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "생성 중…" : "대본 생성하기"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {gen && (
        <div className="mt-3 space-y-4 text-sm">
          <section>
            <h4 className="font-medium mb-1">🎬 3초 훅 3안</h4>
            <ul className="list-disc pl-5 space-y-1">
              {gen.hooks.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="font-medium mb-1">🏁 엔딩 3안</h4>
            <ul className="space-y-1">
              {gen.endings.map((e, i) => (
                <li key={i}>
                  <span className="text-purple-700 font-medium">[{e.type}]</span> {e.text}
                </li>
              ))}
            </ul>
          </section>

          {gen.segmentNotes.length > 0 && (
            <section>
              <h4 className="font-medium mb-1">🔧 구간별 처방</h4>
              <ul className="space-y-1">
                {gen.segmentNotes.map((s, i) => (
                  <li key={i}>
                    <span className="text-red-600">
                      {s.startSec}~{s.endSec}초
                    </span>{" "}
                    — {s.comment} → <span className="text-neutral-700">{s.fix}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h4 className="font-medium mb-1">💬 콘텐츠 코멘트</h4>
            <p className="text-neutral-700">{gen.contentComment}</p>
          </section>
        </div>
      )}
    </div>
  );
}
