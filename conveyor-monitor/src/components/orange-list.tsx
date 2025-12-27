"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface Orange {
  id: string
  weight: number
  category: "A" | "B"
  timestamp: string
}

interface OrangeListProps {
  oranges: Orange[]
}

export default function OrangeList({ oranges }: OrangeListProps) {
  const [sortBy, setSortBy] = useState<"weight" | "time">("time")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const sortedOranges = [...oranges].sort((a, b) => {
    let comparison = 0
    if (sortBy === "weight") {
      comparison = a.weight - b.weight
    } else {
      comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    }
    return sortOrder === "asc" ? comparison : -comparison
  })

  const toggleSort = (field: "weight" | "time") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  return (
    <Card className="border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Detail Jeruk Terukur</h3>
        <div className="flex gap-2">
          <button
            onClick={() => toggleSort("time")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "time"
                ? "bg-primary/20 text-primary border border-primary/50"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Waktu
            {sortBy === "time" &&
              (sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </button>
          <button
            onClick={() => toggleSort("weight")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "weight"
                ? "bg-primary/20 text-primary border border-primary/50"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Berat
            {sortBy === "weight" &&
              (sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">No</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Berat (gram)</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Kategori</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {sortedOranges.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  Belum ada data jeruk yang tercatat
                </td>
              </tr>
            ) : (
              sortedOranges.map((orange, index) => (
                <tr key={orange.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground">{index + 1}</td>
                  <td className="py-3 px-4 font-semibold text-foreground">{orange.weight} g</td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`${
                        orange.category === "A"
                          ? "bg-primary/20 text-primary border border-primary/50"
                          : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50"
                      }`}
                    >
                      Kategori {orange.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(orange.timestamp).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {sortedOranges.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Berat Rata-rata</p>
            <p className="text-lg font-semibold text-foreground">
              {(sortedOranges.reduce((sum, o) => sum + o.weight, 0) / sortedOranges.length).toFixed(1)} g
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Berat Maksimal</p>
            <p className="text-lg font-semibold text-primary">{Math.max(...sortedOranges.map((o) => o.weight))} g</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Berat Minimal</p>
            <p className="text-lg font-semibold text-secondary">{Math.min(...sortedOranges.map((o) => o.weight))} g</p>
          </div>
        </div>
      )}
    </Card>
  )
}
