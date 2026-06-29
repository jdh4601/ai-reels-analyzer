"use client";
import { Suspense, useState, type ChangeEvent, type DragEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ImagePlus, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Upload, X } from "lucide-react";
import type { ScreenshotParse } from "@/lib/schemas";
import type { ImageType } from "@/lib/parsing/screenshot";
import { Card, CardBody, Input, Button } from "@/components/ui";

const TYPE_OPTIONS: { key: ImageType; label: string; desc: string }[] = [
  { key: "edit", label: "EDIT 인사이트", desc: "3초 훅 · 잔존 곡선 · 유입 소스" },
  { key: "audience", label: "팔로워/논팔", desc: "팔로워 vs 팔로워가 아닌 사람 비중" },
  { key: "watchTime", label: "시청 지속", desc: "얼마나 오래 보는지 구간별 분포" },
  { key: "skipRate", label: "Skip Rate", desc: "3초 이후 스킵 비율 → 잔존률로 변환" },
];

type ItemState = "idle" | "converting" | "parsing" | "done" | "error";

interface FileItem {
  id: string;
  file: File;
  preview: string;
  state: ItemState;
  message: string;
}

// HEIC/PNG 등을 JPEG로 변환 (Vision API 지원 + 용량 감소)
function convertToJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas를 생성할 수 없습니다"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("이미지 변환 실패"));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(",")[1];
            resolve(base64);
          };
          reader.onerror = () => reject(new Error("이미지 읽기 실패"));
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러올 수 없습니다"));
    };
    img.src = url;
  });
}

function parsedSummary(p: ScreenshotParse, imageType: ImageType): string {
  const bits: string[] = [];
  if (imageType === "edit") {
    if (typeof p.hookRetention3s === "number") bits.push(`3초 훅 ${p.hookRetention3s}%`);
    if (p.retentionCurve?.length) bits.push(`잔존 곡선 ${p.retentionCurve.length}포인트`);
    if (p.reachSources) bits.push("유입 소스");
  }
  if (imageType === "audience" && p.audienceBreakdown) {
    bits.push(`논팔 ${p.audienceBreakdown.nonFollowersPct}%`);
  }
  if (imageType === "watchTime" && p.watchTimeBuckets?.length) {
    bits.push(`분포 ${p.watchTimeBuckets.length}구간`);
  }
  if (imageType === "skipRate" && typeof p.skipRate === "number") {
    bits.push(`스킵 ${p.skipRate}% → 잔존 ${(100 - p.skipRate).toFixed(1)}%`);
  }
  return bits.length ? `저장됨 — ${bits.join(" · ")}` : "저장됨 (추출된 지표 없음)";
}

function UploadInner() {
  const search = useSearchParams();
  const [reelId, setReelId] = useState(search.get("reelId") ?? "");
  const [imageType, setImageType] = useState<ImageType>("edit");
  const [items, setItems] = useState<FileItem[]>([]);
  const [overall, setOverall] = useState<ItemState>("idle");
  const [dragging, setDragging] = useState(false);

  const lockedReel = !!search.get("reelId");
  const currentType = TYPE_OPTIONS.find((t) => t.key === imageType)!;

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newItems: FileItem[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
        state: "idle",
        message: "대기 중",
      });
    }
    setItems((prev) => [...prev, ...newItems]);
    setOverall("idle");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function uploadAll() {
    if (!reelId.trim()) {
      setOverall("error");
      return;
    }
    if (items.length === 0) return;

    setOverall("parsing");
    const targetId = reelId.trim();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.state === "done") continue;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, state: "parsing", message: "Vision 파싱 중…" } : it))
      );

      try {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, state: "converting", message: "JPEG 변환 중…" } : it))
        );
        const imageBase64 = await convertToJpeg(item.file);
        const res = await fetch(`/api/reels/${encodeURIComponent(targetId)}/screenshot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, mediaType: "image/jpeg", imageType }),
        });
        const data = await res.json();
        if (!res.ok) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, state: "error", message: typeof data.error === "string" ? data.error : "파싱 실패" }
                : it
            )
          );
          continue;
        }
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, state: "done", message: parsedSummary(data.parsed as ScreenshotParse, imageType) } : it
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "네트워크 오류";
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, state: "error", message } : it))
        );
      }
    }

    setOverall(items.some((it) => it.state === "error") ? "error" : "done");
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  const allDone = items.length > 0 && items.every((it) => it.state === "done");
  const isWorking = overall === "parsing" || items.some((it) => it.state === "parsing" || it.state === "converting");

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
          <ImagePlus size={20} className="text-brand-600" /> 스크린샷 업로드
        </h1>
        <a href="/" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
          <ArrowLeft size={14} /> 대시보드
        </a>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">릴스 ID</label>
            <Input
              className="mt-1 w-full"
              placeholder="예: interview-12"
              value={reelId}
              readOnly={lockedReel}
              onChange={(e) => setReelId(e.target.value)}
            />
            {lockedReel && (
              <p className="mt-1 text-xs text-neutral-400">QR로 지정된 릴스에 업로드합니다.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">스크린샷 종류</label>
            <div className="mt-1 flex rounded-lg border border-border-subtle p-1">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setImageType(t.key)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    imageType === t.key
                      ? "bg-brand-600 text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-neutral-400">{currentType.desc}</p>
          </div>

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
            <ImagePlus size={30} className="mb-2 text-neutral-300" />
            <p className="text-sm text-neutral-600">탭하여 갤러리에서 여러 장 선택</p>
            <p className="mt-0.5 text-xs text-neutral-400">또는 이미지를 여기로 드래그 · {currentType.label} 스크린샷</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onInputChange}
              className="hidden"
            />
          </label>

          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700">{items.length}장 선택됨</p>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isWorking || !reelId.trim()}
                  onClick={uploadAll}
                  className="gap-1"
                >
                  {isWorking ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {isWorking ? "처리 중…" : allDone ? "다시 업로드" : "한꺼번에 업로드"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((item) => (
                  <div key={item.id} className="relative rounded-card border border-border-subtle bg-surface-muted p-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isWorking}
                      className="absolute right-1 top-1 rounded-full bg-neutral-900/60 p-1 text-white hover:bg-neutral-900/80 disabled:opacity-50"
                    >
                      <X size={12} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="aspect-[9/16] w-full rounded-lg object-contain"
                    />
                    <p className="mt-1 truncate text-xs text-neutral-500">{item.file.name}</p>
                    <div
                      className={`mt-1 flex items-start gap-1 rounded-lg px-2 py-1.5 text-xs ${
                        item.state === "error"
                          ? "border border-band-weak-border bg-band-weak-soft text-band-weak"
                          : item.state === "done"
                            ? "border border-band-strong-border bg-band-strong-soft text-band-strong"
                            : item.state === "parsing"
                              ? "bg-surface-muted text-neutral-600"
                              : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {(item.state === "parsing" || item.state === "converting") && (
                        <Loader2 size={12} className="mt-0.5 shrink-0 animate-spin" />
                      )}
                      {item.state === "done" && <CheckCircle2 size={12} className="mt-0.5 shrink-0" />}
                      {item.state === "error" && <AlertCircle size={12} className="mt-0.5 shrink-0" />}
                      <span className="break-all">{item.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {overall === "error" && !isWorking && (
            <p className="rounded-lg border border-band-weak-border bg-band-weak-soft px-3 py-2 text-sm text-band-weak">
              일부 이미지 처리에 실패했습니다. 위 목록을 확인해주세요.
            </p>
          )}
        </CardBody>
      </Card>
    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<main className="p-5 text-sm text-neutral-500">불러오는 중…</main>}>
      <UploadInner />
    </Suspense>
  );
}
