"use client";
import { useRef, useState } from "react";
import { Captions, Upload, ThumbsUp, AlertTriangle, Trash2 } from "lucide-react";
import type { TranscriptAnalysis } from "@/lib/analysis/transcriptAnalysis";
import { Card, CardHeader, CardBody } from "@/components/ui";

interface Props {
  reelId: string;
  analysis: TranscriptAnalysis;
  onChange: () => void; // 업로드/삭제 후 상세 데이터 재요청
}

// CapCut에서 내보낸 .srt 자막을 올려 잘된 점/아쉬운 점을 지표와 함께 분석한다.
export function SrtUploadCard({ reelId, analysis, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasTranscript = analysis.lineCount > 0;

  async function uploadFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".srt")) {
      setError(".srt 파일만 업로드할 수 있어요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const srt = await file.text();
      const res = await fetch(`/api/reels/${reelId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ srt }),
      });
      if (!res.ok) {
        setError((await res.json()).error ?? "업로드 실패");
        return;
      }
      onChange();
    } catch {
      setError("네트워크 오류로 업로드하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTranscript() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/reels/${reelId}/transcript`, { method: "DELETE" });
      if (!res.ok) {
        setError((await res.json()).error ?? "삭제 실패");
        return;
      }
      onChange();
    } catch {
      setError("네트워크 오류로 삭제하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  const strengths = analysis.insights.filter((i) => i.kind === "strength");
  const weaknesses = analysis.insights.filter((i) => i.kind === "weakness");

  return (
    <Card>
      <CardHeader
        title="자막 분석 (SRT)"
        icon={<Captions size={16} className="text-brand-600" />}
        action={
          hasTranscript ? (
            <button
              onClick={removeTranscript}
              disabled={busy}
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-band-weak disabled:opacity-50"
            >
              <Trash2 size={13} /> 자막 삭제
            </button>
          ) : undefined
        }
      />
      <CardBody className="space-y-4">
        {!hasTranscript ? (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) uploadFile(file);
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed p-6 text-center transition-colors ${
                dragOver ? "border-brand-500 bg-brand-50" : "border-border-subtle hover:border-brand-300"
              }`}
            >
              <Upload size={22} className="text-neutral-400" />
              <p className="text-sm font-medium text-neutral-700">
                {busy ? "분석 중…" : "CapCut .srt 자막을 끌어다 놓거나 클릭"}
              </p>
              <p className="text-xs text-neutral-500">
                자막을 올리면 훅·CTA·급락 구간을 지표와 함께 분석해 드려요.
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".srt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                  e.target.value = "";
                }}
              />
            </div>
            {error && <p className="text-sm text-band-weak">{error}</p>}
          </>
        ) : (
          <>
            <p className="text-xs text-neutral-500">
              자막 {analysis.lineCount}줄 · 영상의 {Math.round(analysis.coveragePct)}%를 덮습니다.
            </p>
            {error && <p className="text-sm text-band-weak">{error}</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InsightColumn
                title="잘된 점"
                items={strengths}
                icon={<ThumbsUp size={15} className="text-band-strong" />}
                tone="border-band-strong-border bg-band-strong-soft"
                emptyCopy="자막에서 뚜렷한 강점은 아직 안 보여요."
              />
              <InsightColumn
                title="아쉬운 점"
                items={weaknesses}
                icon={<AlertTriangle size={15} className="text-band-weak" />}
                tone="border-band-weak-border bg-band-weak-soft"
                emptyCopy="자막 측면의 약점은 없어요."
              />
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

interface ColumnProps {
  title: string;
  items: TranscriptAnalysis["insights"];
  icon: React.ReactNode;
  tone: string;
  emptyCopy: string;
}

function InsightColumn({ title, items, icon, tone, emptyCopy }: ColumnProps) {
  const isEmpty = items.length === 0;
  const boxTone = isEmpty ? "border-neutral-200 bg-neutral-50" : tone;
  return (
    <div className={`rounded-card border p-4 ${boxTone}`}>
      <h3 className={`mb-2 flex items-center gap-1.5 text-sm font-semibold ${isEmpty ? "text-neutral-400" : ""}`}>
        {icon}
        {title}
      </h3>
      {isEmpty ? (
        <p className="text-sm text-neutral-400">{emptyCopy}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((it, i) => (
            <li key={i}>
              <p className="text-sm font-medium text-neutral-800">{it.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">{it.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
