import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsBarChartProps {
  data: Array<Record<string, unknown>>;
  config: ChartConfig;
  xKey: string;
  bars: Array<{ dataKey: string; color: string; name?: string }>;
  height?: number;
  showGrid?: boolean;
}

export function AnalyticsBarChart({
  data,
  config,
  xKey,
  bars,
  height = 300,
  showGrid = true,
}: AnalyticsBarChartProps) {
  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <ChartTooltip content={<ChartTooltipContent />} />
        {bars.map(bar => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            name={bar.name || bar.dataKey}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

interface AnalyticsLineChartProps {
  data: Array<Record<string, unknown>>;
  config: ChartConfig;
  xKey: string;
  lines: Array<{ dataKey: string; color: string; name?: string }>;
  height?: number;
  showGrid?: boolean;
}

export function AnalyticsLineChart({
  data,
  config,
  xKey,
  lines,
  height = 300,
  showGrid = true,
}: AnalyticsLineChartProps) {
  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <ChartTooltip content={<ChartTooltipContent />} />
        {lines.map(line => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            name={line.name || line.dataKey}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
