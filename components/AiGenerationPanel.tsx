"use client";
import { useState } from "react";
import { Sparkles, Film, Flag, Wrench, MessageSquare, AlertCircle } from "lucide-react";
import type { Generation } from "@/lib/recommend/generate";
import { Card, CardHeader, CardBody, Button, Skeleton, CopyButton } from "@/components/ui";

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
    <Card>
      <CardHeader
        title="AI 맞춤 생성"
        icon={<Sparkles size={16} className="text-brand-600" />}
        action={
          <Button variant="primary" size="sm" onClick={onGenerate} disabled={loading}>
            {loading ? "생성 중…" : "대본 생성하기"}
          </Button>
        }
      />
      <CardBody>
        {error && (
          <p className="flex items-center gap-1.5 rounded-lg border border-band-weak-border bg-band-weak-soft px-3 py-2 text-sm text-band-weak">
            <AlertCircle size={15} /> {error}
          </p>
        )}

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {!loading && !gen && !error && (
          <p className="text-sm text-neutral-500">
            선택한 릴스의 진단·급락·자막을 바탕으로 훅·엔딩·구간별 처방을 생성합니다.
          </p>
        )}

        {gen && (
          <div className="space-y-4 text-sm">
            <Section icon={<Film size={14} className="text-brand-600" />} title="3초 훅 3안">
              <ul className="space-y-1">
                {gen.hooks.map((h, i) => (
                  <li key={i} className="flex items-start justify-between gap-2">
                    <span>{h}</span>
                    <CopyButton text={h} />
                  </li>
                ))}
              </ul>
            </Section>

            <Section icon={<Flag size={14} className="text-brand-600" />} title="엔딩 3안">
              <ul className="space-y-1">
                {gen.endings.map((e, i) => (
                  <li key={i} className="flex items-start justify-between gap-2">
                    <span>
                      <span className="font-medium text-brand-700">[{e.type}]</span> {e.text}
                    </span>
                    <CopyButton text={e.text} />
                  </li>
                ))}
              </ul>
            </Section>

            {gen.segmentNotes.length > 0 && (
              <Section icon={<Wrench size={14} className="text-brand-600" />} title="구간별 처방">
                <ul className="space-y-1">
                  {gen.segmentNotes.map((s, i) => (
                    <li key={i}>
                      <span className="text-band-weak">
                        {s.startSec}~{s.endSec}초
                      </span>{" "}
                      — {s.comment} → <span className="text-neutral-700">{s.fix}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section icon={<MessageSquare size={14} className="text-brand-600" />} title="콘텐츠 코멘트">
              <p className="text-neutral-700">{gen.contentComment}</p>
            </Section>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="mb-1 flex items-center gap-1.5 font-medium text-neutral-800">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  );
}
