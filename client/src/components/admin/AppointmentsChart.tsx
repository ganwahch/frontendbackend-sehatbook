import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  data: { date: string; label: string; count: number }[];
}

/** Single-series magnitude chart: one brand hue, labels identify the days. */
export function AppointmentsChart({ data }: Props) {
  const { theme } = useTheme();
  const barColor = theme === "dark" ? "#2dd4bf" : "#0d9488";
  const gridColor = theme === "dark" ? "#1e293b" : "#e2e8f0";
  const axisColor = theme === "dark" ? "#94a3b8" : "#64748b";

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: barColor, fillOpacity: 0.08 }}
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${gridColor}`,
            background: theme === "dark" ? "#0f172a" : "#ffffff",
            fontSize: 12,
          }}
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.date ?? ""
          }
          formatter={(value: number) => [value, "Appointments"]}
        />
        <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={44}>
          <LabelList
            dataKey="count"
            position="top"
            fill={axisColor}
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
