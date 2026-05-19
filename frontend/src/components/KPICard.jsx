export default function KPICard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-ink/40 uppercase">
          {title}
        </span>
        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-surface text-accent">
          <Icon size={16} strokeWidth={2} />
        </span>
      </div>
      <p className="text-3xl font-bold text-ink tracking-tight">{value}</p>
      <p className="text-xs text-ink/40">{subtitle}</p>
    </div>
  )
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-ink/10 rounded" />
        <div className="h-8 w-8 bg-ink/10 rounded-md" />
      </div>
      <div className="h-9 w-32 bg-ink/10 rounded" />
      <div className="h-3 w-20 bg-ink/10 rounded" />
    </div>
  )
}
