import { Card } from "@/components/ui/card"
import { Package, CheckCircle, AlertCircle } from "lucide-react"

interface OrangeStatsProps {
  totalOranges: number
  categoryA: number
  categoryB: number
}

export default function OrangeStats({ totalOranges, categoryA, categoryB }: OrangeStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Oranges */}
      <Card className="border border-border bg-card hover:bg-card/80 transition-colors">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Jeruk</h3>
            <Package className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-3xl font-bold text-secondary">{totalOranges}</div>
          <p className="text-xs text-muted-foreground mt-2">buah</p>
        </div>
      </Card>

      {/* Category A */}
      <Card className="border border-border bg-card hover:bg-card/80 transition-colors">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Jeruk Kategori A</h3>
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-primary">{categoryA}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {totalOranges > 0 ? `${((categoryA / totalOranges) * 100).toFixed(1)}%` : "0%"}
          </p>
        </div>
      </Card>

      {/* Category B */}
      <Card className="border border-border bg-card hover:bg-card/80 transition-colors">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Jeruk Kategori B</h3>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-yellow-500">{categoryB}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {totalOranges > 0 ? `${((categoryB / totalOranges) * 100).toFixed(1)}%` : "0%"}
          </p>
        </div>
      </Card>
    </div>
  )
}
