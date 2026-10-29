import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

// Shared "nothing here yet" panel for list pages, so an empty list still looks designed
export default function EmptyState({ icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-space-900/60 px-6 py-14 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/10 blur-3xl" />
      <div className="relative mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-accent-300/25 bg-accent-400/5 text-accent-200">
        {icon}
      </div>
      <h3 className="relative text-base font-semibold text-white">{title}</h3>
      {children && <div className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/60">{children}</div>}
      {action && <div className="relative mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
