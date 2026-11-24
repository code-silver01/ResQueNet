import React from "react";

export type SourceBadgeType = "OFFICIAL" | "USER-REPORTED" | "SIMULATED";

export default function SourceBadge({
  type,
  confirmed,
  lastChecked,
}: {
  type?: SourceBadgeType | string;
  confirmed?: boolean | number;
  lastChecked?: string;
}) {
  const badgeType = (type || "SIMULATED") as SourceBadgeType;

  const styleMap: Record<SourceBadgeType, string> = {
    OFFICIAL: "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    "USER-REPORTED": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    SIMULATED: "bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  };

  const style = styleMap[badgeType] || styleMap.SIMULATED;

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5 text-xs">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold border tracking-wider uppercase text-[10px] ${style}`}>
        {badgeType}
      </span>
      {confirmed !== undefined && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium border ${
            confirmed
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
          }`}
        >
          {confirmed ? "✓ Confirmed" : "? Unverified"}
        </span>
      )}
      {lastChecked && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {new Date(lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}
