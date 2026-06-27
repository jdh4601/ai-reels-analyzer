"use client";
import { useState, type ChangeEvent } from "react";

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export default function UploadPage() {
  const [reelId, setReelId] = useState("");
  const [status, setStatus] = useState<string>("");

  async function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !reelId) {
      setStatus("릴스 ID와 이미지를 모두 지정하세요");
      return;
    }
    setStatus("Vision 파싱 중…");
    const imageBase64 = await fileToBase64(file);
    const res = await fetch("/api/parse-screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mediaType: file.type }),
    });
    if (!res.ok) {
      setStatus("파싱 실패: " + (await res.text()));
      return;
    }
    const parsed = await res.json();
    setStatus("파싱 완료: " + JSON.stringify(parsed));
    // 참고: Phase 1에서는 파싱 결과를 화면에 표시. 릴스 병합 저장 UI는 후속.
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="text-lg font-bold">📷 스크린샷 업로드</h1>
      <input
        className="border rounded px-2 py-1 w-full"
        placeholder="릴스 ID (예: interview-12)"
        value={reelId}
        onChange={(e) => setReelId(e.target.value)}
      />
      <input type="file" accept="image/*" capture="environment" onChange={onUpload} />
      {status && <p className="text-sm text-neutral-600 break-all">{status}</p>}
    </main>
  );
}
