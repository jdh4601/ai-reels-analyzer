import type { Prescription } from "@/lib/recommend/playbook";

export function SolutionsPanel({ prescriptions }: { prescriptions: Prescription[] }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">💡 해결책 (룰 기반)</h3>
      {prescriptions.length === 0 ? (
        <p className="text-sm text-neutral-400">처방할 약점이 없습니다</p>
      ) : (
        <ul className="space-y-2">
          {prescriptions.map((p, i) => (
            <li
              key={i}
              className={`rounded border p-3 ${p.severity === "high" ? "border-red-300 bg-red-50" : "border-neutral-200"}`}
            >
              <p className="font-medium">
                {p.title}
                {p.severity === "high" && " ⚡"}
              </p>
              <p className="text-sm text-neutral-700">{p.action}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
