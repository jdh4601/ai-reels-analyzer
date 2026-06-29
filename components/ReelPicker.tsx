"use client";
import { useMemo, useState } from "react";
import { Search, Film, Eye, Zap, Calendar } from "lucide-react";
import type { Reel } from "@/lib/schemas";
import { reelTitle } from "@/lib/ui/reelTitle";
import { selectReels, SORT_LABELS, type ReelSort } from "@/lib/ui/reelSelect";
import { fmtCount } from "@/lib/ui/format";
import { cn } from "@/components/ui";

interface Props {
  reels: Reel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ReelPicker({ reels, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ReelSort>("latest");

  const visible = useMemo(() => selectReels(reels, query, sort), [reels, query, sort]);

  if (reels.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border-subtle bg-surface-muted p-8 text-center text-sm text-neutral-500">
        <Film className="mx-auto mb-2 text-neutral-300" size={28} />
        아직 릴스가 없습니다. 상단의 <b>동기화</b>로 Instagram에서 가져오세요.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목·캡션 검색"
            className="h-9 w-full rounded-lg border border-border-subtle bg-surface pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-border-subtle bg-surface p-0.5">
          {(Object.keys(SORT_LABELS) as ReelSort[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                sort === s ? "bg-brand-600 text-white" : "text-neutral-600 hover:bg-surface-muted",
              )}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-500">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((r) => (
            <ReelCard
              key={r.id}
              reel={r}
              selected={r.id === selectedId}
              onSelect={() => onSelect(r.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ReelCard({
  reel,
  selected,
  onSelect,
}: {
  reel: Reel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group overflow-hidden rounded-card border bg-surface text-left shadow-card transition-all hover:shadow-card-hover",
        selected ? "border-brand-500 ring-2 ring-brand-200" : "border-border-subtle",
      )}
    >
      <div className="relative aspect-[9/16] bg-neutral-100">
        {reel.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={reel.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <Film size={28} />
          </div>
        )}
        <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
          <Eye size={11} />
          {fmtCount(reel.views)}
        </span>
      </div>
      <div className="space-y-1 p-2.5">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
          {reelTitle(reel)}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span className="inline-flex items-center gap-0.5">
            <Calendar size={11} />
            {reel.postedAt.slice(0, 10)}
          </span>
          {typeof reel.hookRetention3s === "number" && (
            <span className="inline-flex items-center gap-0.5">
              <Zap size={11} />
              {reel.hookRetention3s}%
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
