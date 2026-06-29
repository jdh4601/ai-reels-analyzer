import { Users, Eye, Film, Heart } from "lucide-react";
import { Stat } from "@/components/ui";
import { fmtPct } from "@/lib/ui/format";
import type { AccountOverview as Overview } from "@/lib/analysis/accountOverview";

interface AccountOverviewProps {
  overview: Overview;
}

function followerHint(delta: number | null): string {
  if (delta === null) return "추이 데이터 부족";
  if (delta === 0) return "직전 대비 변화 없음";
  const sign = delta > 0 ? "▲" : "▼";
  return `직전 대비 ${sign}${Math.abs(delta).toLocaleString()}`;
}

export function AccountOverview({ overview }: AccountOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat
        label="팔로워"
        value={overview.followers.toLocaleString()}
        icon={<Users size={16} />}
        hint={followerHint(overview.followerDelta)}
      />
      <Stat
        label="7일 도달"
        value={overview.reachLast7d.toLocaleString()}
        icon={<Eye size={16} />}
      />
      <Stat label="릴스 수" value={overview.reelCount.toLocaleString()} icon={<Film size={16} />} />
      <Stat
        label="평균 인게이지먼트"
        value={fmtPct(overview.avgEngagementRate)}
        icon={<Heart size={16} />}
      />
    </div>
  );
}
