import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { type?: "info" | "warning"; title?: string; children: React.ReactNode };

export function Callout({ type = "info", title, children }: Props) {
  const warning = type === "warning";
  const Icon = warning ? AlertTriangle : Info;
  return (
    <aside
      className={cn(
        "my-6 flex gap-3 rounded-md border p-4 text-[0.95rem]",
        warning ? "border-danger/40 bg-danger/5 text-ink-900" : "border-leaf-500/40 bg-leaf-100 text-leaf-900",
      )}
      role={warning ? "alert" : "note"}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", warning ? "text-danger" : "text-leaf-500")} aria-hidden />
      <div>
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="[&>p]:my-1">{children}</div>
      </div>
    </aside>
  );
}
