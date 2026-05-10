import { cn } from "@/lib/utils";
import { STATUS_MAP } from "@/lib/demo-data";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        config.bg,
        config.color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.bg.split(" ")[0].replace("bg-", "bg-").replace("50", "500"))} />
      {config.label}
    </span>
  );
}
