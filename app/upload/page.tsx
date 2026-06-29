"use client";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { ImagePlus, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardBody, Input, Button } from "@/components/ui";

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

type State = "idle" | "parsing" | "done" | "error";

export default function UploadPage() {
  const [reelId, setReelId] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!reelId.trim()) {
      setState("error");
      setMessage("먼저 릴스 ID를 입력하세요.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setState("parsing");
    setMessage("Vision 파싱 중…");
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch("/api/parse-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType: file.type }),
      });
      if (!res.ok) {
        setState("error");
        setMessage("파싱 실패: " + (await res.text()));
        return;
      }
      const parsed = await res.json();
      setState("done");
      setMessage("파싱 완료: " + JSON.stringify(parsed));
    } catch {
      setState("error");
      setMessage("네트워크 오류");
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
          <ImagePlus size={20} className="text-brand-600" /> 스크린샷 업로드
        </h1>
        <a href="/" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
          <ArrowLeft size={14} /> 대시보드
        </a>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <label className="block text-sm font-medium text-neutral-700">릴스 ID</label>
          <Input
            className="w-full"
            placeholder="예: interview-12"
            value={reelId}
            onChange={(e) => setReelId(e.target.value)}
          />

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-8 text-center transition-colors ${
              dragging ? "border-brand-500 bg-brand-50" : "border-border-subtle bg-surface-muted hover:bg-brand-50/40"
            }`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="미리보기" className="max-h-56 rounded-lg object-contain" />
            ) : (
              <>
                <ImagePlus size={30} className="mb-2 text-neutral-300" />
                <p className="text-sm text-neutral-600">탭하여 선택하거나 이미지를 드래그</p>
                <p className="mt-0.5 text-xs text-neutral-400">EDIT 인사이트 스크린샷</p>
              </>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={onInputChange} className="hidden" />
          </label>

          {preview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPreview(null);
                setState("idle");
                setMessage("");
              }}
            >
              다시 선택
            </Button>
          )}

          {state !== "idle" && (
            <p
              className={`flex items-start gap-1.5 break-all rounded-lg px-3 py-2 text-sm ${
                state === "error"
                  ? "border border-band-weak-border bg-band-weak-soft text-band-weak"
                  : state === "done"
                    ? "border border-band-strong-border bg-band-strong-soft text-band-strong"
                    : "bg-surface-muted text-neutral-600"
              }`}
            >
              {state === "parsing" && <Loader2 size={15} className="mt-0.5 shrink-0 animate-spin" />}
              {state === "done" && <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}
              {state === "error" && <AlertCircle size={15} className="mt-0.5 shrink-0" />}
              {message}
            </p>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
