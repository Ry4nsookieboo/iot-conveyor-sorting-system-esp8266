interface StatusIndicatorProps {
  status: string
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
      <div
        className={`w-3 h-3 rounded-full ${status === "ON" ? "bg-primary animate-pulse-glow" : "bg-muted-foreground"}`}
      />
      <span className="text-sm font-medium text-foreground">{status === "ON" ? "Motor Aktif" : "Motor Standby"}</span>
    </div>
  )
}
