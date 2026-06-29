import { RefreshCw, Upload, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui";

interface AppBarProps {
  onSync: () => void;
  syncing: boolean;
}

export function AppBar({ onSync, syncing }: AppBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <BarChart3 size={18} />
          </span>
          <span className="text-sm font-semibold text-neutral-900">릴스 분석</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onSync} disabled={syncing} icon={<RefreshCw size={14} className={syncing ? "animate-spin" : undefined} />}>
            {syncing ? "동기화 중…" : "동기화"}
          </Button>
          <a href="/upload" title="업로드" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-surface-muted">
            <Upload size={16} />
          </a>
          <a href="/settings" title="설정" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-surface-muted">
            <Settings size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
