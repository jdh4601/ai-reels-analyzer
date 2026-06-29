import { Lightbulb, Zap } from "lucide-react";
import type { Prescription } from "@/lib/recommend/playbook";
import { Card, CardHeader, CardBody, EmptyState } from "@/components/ui";

export function SolutionsPanel({ prescriptions }: { prescriptions: Prescription[] }) {
  return (
    <Card>
      <CardHeader title="해결책 (룰 기반)" icon={<Lightbulb size={16} className="text-brand-600" />} />
      <CardBody>
        {prescriptions.length === 0 ? (
          <EmptyState icon={<Lightbulb size={26} />} title="처방할 약점이 없습니다" hint="현재 균형이 잘 잡혀 있어요." />
        ) : (
          <ul className="space-y-2">
            {prescriptions.map((p, i) => {
              const high = p.severity === "high";
              return (
                <li
                  key={i}
                  className={`rounded-lg border p-3 ${high ? "border-band-weak-border bg-band-weak-soft" : "border-border-subtle bg-surface"}`}
                >
                  <p className="flex items-center gap-1.5 font-medium text-neutral-900">
                    {high && <Zap size={14} className="text-band-weak" />}
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-700">{p.action}</p>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
