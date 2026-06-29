import { RefreshCw, Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui";

interface AppBarProps {
  onSync: () => void;
  syncing: boolean;
}

export function AppBar({ onSync, syncing }: AppBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div />
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
