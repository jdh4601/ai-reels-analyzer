"use client";
import type { Reel } from "@/lib/schemas";

interface Props {
  reels: Reel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ReelPicker({ reels, selectedId, onSelect }: Props) {
  return (
    <select
      className="border rounded px-2 py-1"
      value={selectedId ?? ""}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="" disabled>
        릴스 선택…
      </option>
      {reels.map((r) => (
        <option key={r.id} value={r.id}>
          {r.id} ({r.durationSec}s)
        </option>
      ))}
    </select>
  );
}
