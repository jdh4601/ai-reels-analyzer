"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "./cn";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 접근 불가(비보안 컨텍스트 등) — 조용히 무시
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      title="복사"
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-surface-muted hover:text-neutral-700",
        className,
      )}
    >
      {copied ? <Check size={13} className="text-band-strong" /> : <Copy size={13} />}
    </button>
  );
}
