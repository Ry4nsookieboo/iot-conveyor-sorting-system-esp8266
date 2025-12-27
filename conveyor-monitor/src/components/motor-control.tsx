"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Power } from "lucide-react"

interface MotorControlProps {
  status: string
  onToggle: () => void
}

export default function MotorControl({ status, onToggle }: MotorControlProps) {
  return (
    <Card className="border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-6 text-foreground">Kontrol Motor</h3>

      <div className="space-y-6">
        {/* Status Display */}
        <div className="relative">
          <div
            className={`w-full h-32 rounded-lg border-2 flex items-center justify-center transition-all ${
              status === "ON" ? "border-primary bg-primary/10 animate-pulse-glow" : "border-muted bg-muted/10"
            }`}
          >
            <div className="text-center">
              <Power className={`w-8 h-8 mx-auto mb-2 ${status === "ON" ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`text-sm font-medium ${status === "ON" ? "text-primary" : "text-muted-foreground"}`}>
                {status === "ON" ? "Motor Aktif" : "Motor Mati"}
              </p>
            </div>
          </div>
        </div>

        {/* Control Button */}
        <Button
          onClick={onToggle}
          className={`w-full py-6 text-base font-semibold transition-all ${
            status === "ON"
              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {status === "ON" ? "Matikan Motor" : "Nyalakan Motor"}
        </Button>

        {/* Info */}
        <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
          <p>• Tekan tombol untuk mengontrol motor conveyor</p>
          <p>• Status akan diperbarui secara real-time</p>
          <p>• Pastikan area aman sebelum mengaktifkan</p>
        </div>
      </div>
    </Card>
  )
}
