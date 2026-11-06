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
import { STATUS_OPTIONS } from "@/lib/constants";

interface Props {
  data: { status: string; count: number }[];
}

/**
 * Horizontal single-hue bars. Each status is identified by its axis label
 * (not color), so there's no color-identity dependency.
 */
export function StatusChart({ data }: Props) {
  const { theme } = useTheme();
  const barColor = theme === "dark" ? "#2dd4bf" : "#0d9488";
  const gridColor = theme === "dark" ? "#1e293b" : "#e2e8f0";
  const axisColor = theme === "dark" ? "#94a3b8" : "#64748b";

  // Ensure every status appears, even with zero count
  const rows = STATUS_OPTIONS.map((status) => ({
    status,
    count: data.find((d) => d.status === status)?.count ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        layout="vertical"
        data={rows}
        margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="status"
          width={78}
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
          formatter={(value: number) => [value, "Appointments"]}
        />
        <Bar dataKey="count" fill={barColor} radius={[0, 4, 4, 0]} maxBarSize={28}>
          <LabelList
            dataKey="count"
            position="right"
            fill={axisColor}
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
