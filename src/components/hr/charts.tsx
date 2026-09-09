import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: 11 },
};

export function TurnoverChart({
  data,
}: {
  data: { month: string; hires: number; exits: number; turnover: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ left: -18, right: 4, top: 8 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} />
        <YAxis yAxisId="r" orientation="right" {...axis} unit="%" />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
        <Bar dataKey="hires" name="Hires" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="exits" name="Exits" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="r"
          type="monotone"
          dataKey="turnover"
          name="Turnover %"
          stroke="var(--chart-2)"
          strokeWidth={2.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function FunnelChart({
  data,
}: {
  data: { stage: string; value: number; rate: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 18, right: 24 }}>
        <CartesianGrid stroke="var(--grid)" horizontal={false} />
        <XAxis type="number" {...axis} />
        <YAxis type="category" dataKey="stage" width={78} {...axis} />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number, _n, p) => [`${v.toLocaleString()} (${p.payload.rate}%)`, "Candidates"]}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SatisfactionScatter({
  data,
}: {
  data: { satisfaction: number; performance: number; tenure: number; id: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ left: -14, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--grid)" />
        <XAxis
          type="number"
          dataKey="satisfaction"
          name="Satisfaction"
          domain={[1.5, 5]}
          {...axis}
        />
        <YAxis type="number" dataKey="performance" name="Performance" domain={[2, 5]} {...axis} />
        <ZAxis type="number" dataKey="tenure" range={[24, 190]} name="Tenure (yrs)" />
        <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill="var(--chart-1)" fillOpacity={0.55} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function ForecastChart({
  data,
}: {
  data: { month: string; actual: number | null; forecast: number | null; upper: number | null; lower: number | null }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
        <Area
          dataKey="upper"
          name="Upper band"
          stroke="none"
          fill="var(--chart-2)"
          fillOpacity={0.18}
          connectNulls
        />
        <Area
          dataKey="lower"
          name="Lower band"
          stroke="none"
          fill="var(--background)"
          fillOpacity={0.9}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual hires"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast need"
          stroke="var(--chart-2)"
          strokeWidth={2.5}
          strokeDasharray="5 4"
          dot={{ r: 3 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function EngagementRadar({
  data,
}: {
  data: { dept: string; satisfaction: number; performance: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--grid)" />
        <PolarAngleAxis dataKey="dept" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
        <PolarRadiusAxis domain={[2.5, 5]} tick={false} axisLine={false} />
        <Tooltip {...tooltipStyle} />
        <Radar
          name="Satisfaction"
          dataKey="satisfaction"
          stroke="var(--chart-1)"
          fill="var(--chart-1)"
          fillOpacity={0.28}
        />
        <Radar
          name="Performance"
          dataKey="performance"
          stroke="var(--chart-2)"
          fill="var(--chart-2)"
          fillOpacity={0.2}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function HeadcountArea({ data }: { data: { month: string; headcount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ left: -22, right: 4, top: 6 }}>
        <defs>
          <linearGradient id="hc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} domain={["dataMin - 10", "dataMax + 10"]} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey="headcount"
          name="Headcount"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#hc)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
