import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface WeightChartProps {
  data: { time: string; weight: number }[]
}

export default function WeightChart({ data }: WeightChartProps) {

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 border border-border rounded-lg shadow-md">
          <p className="text-foreground font-medium">{label}</p>
          <p className="text-primary font-bold">
            weight : {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-6 text-foreground">Grafik Berat Buah</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 247, 250, 0.2)" vertical={true} horizontal={true} />          
          <XAxis 
            dataKey="time" 
            stroke="var(--muted-foreground)" 
            tick={{ fill: "#f5f7fa" }} 
            axisLine={{ stroke: "rgba(245, 247, 250, 0.3)" }}
            tickLine={{ stroke: "rgba(245, 247, 250, 0.3)" }}
          />
          <YAxis 
            stroke="var(--muted-foreground)" 
            tick={{ fill: "#f5f7fa" }} 
            axisLine={{ stroke: "rgba(245, 247, 250, 0.3)" }}
            tickLine={{ stroke: "rgba(245, 247, 250, 0.3)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#ff6b35"
            strokeWidth={3}
            dot={{ fill: "#ff6b35", r: 5, strokeWidth: 0 }}
            activeDot={{ r: 7, fill: "#ff6b35", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
