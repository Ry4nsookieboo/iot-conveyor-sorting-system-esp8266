"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Zap, TrendingUp, Download } from "lucide-react"
import WeightChart from "@/components/weight-chart"
import MotorControl from "@/components/motor-control"
import StatusIndicator from "@/components/status-indicator"
import OrangeStats from "@/components/orange-stats"
import OrangeList from "@/components/orange-list"
import WeightSettingsCard from "@/components/weight-settings-card"
import WeightTemplateCard from "@/components/weight-template-card"
import { db, ref, onValue, set } from "@/firebaseConfig"

export default function Home() {
  const [berat, setBerat] = useState<number>(0)
  const [statusMotor, setStatusMotor] = useState<string>("OFF")
  const [appActive, setAppActive] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(true)
  const [weightHistory, setWeightHistory] = useState<number[]>([])
  const [oranges, setOranges] = useState<{ id: string; weight: number; category: "A" | "B"; timestamp: string }[]>([])
  const [threshold, setThreshold] = useState<number>(120)
  const [chartData, setChartData] = useState<{ time: string; weight: number }[]>([])

  // Firebase realtime subscriptions
  useEffect(() => {
    const beratRef = ref(db, "conveyor/beratTerakhir")
    const motorRef = ref(db, "conveyor/statusMotor")
    const thresholdRef = ref(db, "settings/batasBerat")
    const appActiveRef = ref(db, "settings/aplikasiAktif")
    const historyRef = ref(db, "conveyor/history")

    onValue(beratRef, (snapshot) => {
      const v = snapshot.val()
      setBerat(typeof v === "number" ? v : Number(v ?? 0))
    })

    onValue(motorRef, (snapshot) => {
      const v = snapshot.val()
      setStatusMotor(typeof v === "string" ? v : String(v ?? "OFF"))
    })

    onValue(thresholdRef, (snapshot) => {
      const v = snapshot.val()
      setThreshold(typeof v === "number" ? v : Number(v ?? 120))
    })

    onValue(appActiveRef, (snapshot) => {
      const v = snapshot.val()
      setAppActive(typeof v === "boolean" ? v : String(v ?? "true") === "true")
    })

    onValue(historyRef, (snapshot) => {
      const data = snapshot.val() as Record<string, { berat?: number | string; status?: string; tanggal?: string; kategori?: string }>
      if (data) {
        const list = Object.keys(data).map((key) => {
          const item = data[key] || {}
          const weight = typeof item.berat === "number" ? item.berat : Number(item.berat ?? 0)
          const rawKategori = typeof item.kategori === "string" ? item.kategori : undefined
          const category: "A" | "B" = rawKategori === "A" || rawKategori === "B" ? (rawKategori as "A" | "B") : (weight < threshold ? "A" : "B")
          const ts = item.tanggal ? new Date(item.tanggal).toISOString() : new Date().toISOString()
          return { id: key, weight, category, timestamp: ts }
        })
        setOranges(list)

        const chart = list
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map((entry) => ({
            time: new Date(entry.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            weight: entry.weight,
          }))

        setChartData(chart)
      } else {
        setOranges([])
        setChartData([])
      }
    })

    setIsLoading(false)
  }, [])

  const handleToggleMotor = async () => {
    const newStatus = statusMotor === "ON" ? "OFF" : "ON"
    setStatusMotor(newStatus)
    // Motor toggle juga mengontrol aplikasi aktif
    const appShouldBeActive = newStatus === "ON"
    setAppActive(appShouldBeActive)
    await set(ref(db, "conveyor/statusMotor"), newStatus)
    await set(ref(db, "settings/aplikasiAktif"), appShouldBeActive)
  }

  const handleToggleApp = async () => {
    const newVal = !appActive
    setAppActive(newVal)
    await set(ref(db, "settings/aplikasiAktif"), newVal)
  }

  const handleExportData = () => {
    window.open("http://localhost:5000/api/export")
  }

  const totalOranges = oranges.length
  const categoryA = oranges.filter((o) => o.category === "A").length
  const categoryB = oranges.filter((o) => o.category === "B").length

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Conveyor Monitoring</h1>
                <p className="text-sm text-muted-foreground">Sistem Pemilah Berat Buah Jeruk</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusIndicator status={statusMotor} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Weight */}
          <Card className="border-border bg-card hover:bg-card/80 transition-colors animate-slide-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Berat Terakhir</h3>
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">{berat}</div>
                <p className="text-xs text-muted-foreground">gram</p>
              </div>
              <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${Math.min((berat / 5000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Motor Status */}
          <Card
            className="border-border bg-card hover:bg-card/80 transition-colors animate-slide-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Status Motor</h3>
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div className="space-y-4">
                <div
                  className={`text-3xl font-bold ${statusMotor === "ON" ? "text-primary" : "text-muted-foreground"}`}
                >
                  {statusMotor}
                </div>
                <Button
                  onClick={handleToggleMotor}
                  className={`w-full transition-all ${
                    statusMotor === "ON"
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {statusMotor === "ON" ? "Matikan Motor" : "Nyalakan Motor"}
                </Button>
              </div>
            </div>
          </Card>

          {/* System Health */}
          <Card
            className="border-border bg-card hover:bg-card/80 transition-colors animate-slide-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Kesehatan Sistem</h3>
                <Activity className="w-5 h-5 text-secondary" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Koneksi</span>
                  <span className="inline-flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                    <span className="text-sm font-medium">Aktif</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium">99.8%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Orange Statistics Section */}
        <div className="mb-8">
          <OrangeStats totalOranges={totalOranges} categoryA={categoryA} categoryB={categoryB} />
        </div>

        {/* Charts and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weight Chart */}
          <div className="lg:col-span-2">
            <WeightChart data={chartData} />
          </div>

          {/* Motor Control */}
          <div>
            <MotorControl status={statusMotor} onToggle={handleToggleMotor} />
          </div>
        </div>

        {/* Orange List Section */}
        <div className="mb-8">
          <OrangeList oranges={oranges} />
        </div>

        {/* Pengaturan & Template Berat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeightSettingsCard />
          <WeightTemplateCard />
        </div>

        {/* Export Section */}
        <Card className="border-border bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Export Data</h3>
                <p className="text-sm text-muted-foreground">Unduh data monitoring dalam format CSV</p>
              </div>
              <Button
                onClick={handleExportData}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}