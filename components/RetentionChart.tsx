"use client";
import { LineChart, Line, XAxis, YAxis, ReferenceArea, Tooltip, ResponsiveContainer } from "recharts";
import type { RetentionPoint } from "@/lib/schemas";
import type { DropSegment } from "@/lib/analysis/dropDetection";

interface Props {
  curve: RetentionPoint[];
  drops: DropSegment[];
}

export function RetentionChart({ curve, drops }: Props) {
  if (curve.length === 0) {
    return <p className="text-sm text-neutral-400">잔존 곡선 데이터 없음 (스크린샷 업로드 필요)</p>;
  }
  return (
    <div>
      <h3 className="font-semibold mb-2">📉 잔존 곡선 + 텐션 저하</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={curve}>
          <XAxis dataKey="sec" unit="s" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip />
          {drops.map((d, i) => (
            <ReferenceArea key={i} x1={d.startSec} x2={d.endSec} fill="#ef4444" fillOpacity={0.15} />
          ))}
          <Line type="monotone" dataKey="pct" stroke="#2563eb" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1 text-sm">
        {drops.map((d, i) => (
          <li key={i} className="text-red-600">
            {d.startSec}~{d.endSec}초: {Math.round(d.dropPct)}%p 이탈
            {d.lines.length > 0 && (
              <span className="text-neutral-600"> — “{d.lines.map((l) => l.text).join(" ")}”</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
