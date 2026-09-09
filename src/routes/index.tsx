import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Briefcase,
  CalendarClock,
  Gauge,
  Heart,
  LogOut,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { KpiCard } from "@/components/hr/KpiCard";
import { Panel } from "@/components/hr/Panel";
import {
  EngagementRadar,
  ForecastChart,
  FunnelChart,
  HeadcountArea,
  SatisfactionScatter,
  TurnoverChart,
} from "@/components/hr/charts";
import {
  DEPARTMENTS,
  deptSummary,
  employees,
  funnel,
  hiringForecast,
  kpis,
  monthlySeries,
  type Dept,
} from "@/data/hr";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HR Analytics Dashboard — Workforce & Hiring Insights" },
      {
        name: "description",
        content:
          "Interactive HR analytics dashboard tracking recruitment funnel, turnover, employee satisfaction, performance and predictive hiring forecasts.",
      },
      { property: "og:title", content: "HR Analytics Dashboard — Workforce & Hiring Insights" },
      {
        property: "og:description",
        content:
          "Track recruitment metrics, turnover, engagement and forecast hiring needs in one interactive workforce dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const filters: (Dept | "All")[] = ["All", ...DEPARTMENTS];

function Dashboard() {
  const [dept, setDept] = useState<Dept | "All">("All");
  const [growth, setGrowth] = useState(12);

  const k = useMemo(() => kpis(dept), [dept]);
  const series = useMemo(() => monthlySeries(dept), [dept]);
  const funnelData = useMemo(() => funnel(dept), [dept]);
  const forecast = useMemo(() => hiringForecast(dept, growth), [dept, growth]);
  const summary = useMemo(() => deptSummary(), []);
  const scatter = useMemo(
    () => (dept === "All" ? employees : employees.filter((e) => e.dept === dept)),
    [dept],
  );
  const atRisk = useMemo(
    () =>
      [...scatter]
        .sort((a, b) => b.flightRisk - a.flightRisk)
        .slice(0, 6),
    [scatter],
  );

  const h1 = series[0]!.hires + series[1]!.hires + series[2]!.hires;
  const h2 = series[9]!.hires + series[10]!.hires + series[11]!.hires;
  const hireDelta = +(((h2 - h1) / Math.max(1, h1)) * 100).toFixed(1);
  const e1 = series.slice(0, 3).reduce((a, s) => a + s.exits, 0);
  const e2 = series.slice(9).reduce((a, s) => a + s.exits, 0);
  const exitDelta = +(((e2 - e1) / Math.max(1, e1)) * 100).toFixed(1);

  return (
    <main className="min-h-screen grid-backdrop">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="label-eyebrow">People Intelligence · FY rolling 12 months</span>
            <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-4xl">
              Human Resources Analytics
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Recruitment throughput, attrition, engagement and a predictive hiring plan — filtered
              by department.
            </p>
          </div>
          <div className="panel flex items-center gap-3 px-4 py-3">
            <Users className="size-5 text-primary" aria-hidden />
            <div>
              <p className="label-eyebrow">Active headcount</p>
              <p className="stat-value text-xl">{k.headcount.toLocaleString()}</p>
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by department">
          {filters.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              aria-pressed={dept === d}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                dept === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-secondary-foreground hover:bg-surface-2"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Hires (12 mo)"
            value={k.hires.toLocaleString()}
            delta={hireDelta}
            hint="Q4 vs Q1 pace"
            icon={UserPlus}
          />
          <KpiCard
            label="Voluntary exits"
            value={k.exits.toLocaleString()}
            delta={exitDelta}
            goodWhen="down"
            hint={`${k.turnover}% turnover rate`}
            icon={LogOut}
          />
          <KpiCard
            label="Avg time to hire"
            value={`${k.timeToHire} d`}
            hint={`Offer accept ${k.offerAccept}%`}
            icon={CalendarClock}
          />
          <KpiCard
            label="Cost per hire"
            value={`$${k.costPerHire.toLocaleString()}`}
            hint="Sourcing + agency + referral"
            icon={Banknote}
          />
          <KpiCard
            label="Satisfaction"
            value={`${k.satisfaction}/5`}
            hint="Quarterly pulse survey"
            icon={Heart}
          />
          <KpiCard
            label="Performance"
            value={`${k.performance}/5`}
            hint="Manager review average"
            icon={Gauge}
          />
          <KpiCard
            label="Flight risk"
            value={`${k.atRisk}`}
            goodWhen="down"
            hint={`of ${k.staff} reviewed employees`}
            icon={AlertTriangle}
          />
          <KpiCard
            label="Open roles"
            value={`${k.openRoles}`}
            hint="Currently requisitioned"
            icon={Briefcase}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Hiring vs attrition"
            subtitle="Monthly hires, exits and turnover rate"
          >
            <TurnoverChart data={series} />
          </Panel>
          <Panel title="Recruitment funnel" subtitle="Conversion from applicant to hire">
            <FunnelChart data={funnelData} />
            <p className="mt-3 text-xs text-muted-foreground">
              Applicant-to-hire conversion{" "}
              <span className="font-semibold text-primary">
                {funnelData[funnelData.length - 1]!.rate}%
              </span>
              , offer acceptance{" "}
              <span className="font-semibold text-primary">{k.offerAccept}%</span>.
            </p>
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Satisfaction vs performance"
            subtitle="Each dot is an employee; bubble size is tenure"
          >
            <SatisfactionScatter data={scatter} />
          </Panel>
          <Panel title="Engagement by department" subtitle="Satisfaction and performance profile">
            <EngagementRadar data={summary} />
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Predictive hiring forecast"
            subtitle="Next 6 months of hiring need, from attrition trend + growth target"
            action={
              <div className="min-w-[190px]">
                <label htmlFor="growth" className="label-eyebrow">
                  Growth target {growth}% / yr
                </label>
                <input
                  id="growth"
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={growth}
                  onChange={(e) => setGrowth(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
            }
          >
            <ForecastChart data={forecast.data} />
          </Panel>
          <div className="grid content-start gap-4">
            <Panel title="Forecast summary" subtitle="Model: least-squares trend + seasonality">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Hires needed (6 mo)</dt>
                  <dd className="stat-value text-lg text-primary">{forecast.totalNeed}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Monthly average</dt>
                  <dd className="stat-value">{forecast.monthlyAvg}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Backfill share</dt>
                  <dd className="stat-value">{forecast.backfillShare}%</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Attrition trend</dt>
                  <dd className="stat-value capitalize">{forecast.trend}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Recruiter capacity</dt>
                  <dd className="stat-value">
                    {Math.max(1, Math.ceil(forecast.monthlyAvg / 4))} FTE
                  </dd>
                </div>
              </dl>
              <p className="mt-4 flex gap-2 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
                <TrendingUp className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                Start requisitions{" "}
                <span className="font-semibold text-foreground">{k.timeToHire} days</span> ahead to
                land starts on plan.
              </p>
            </Panel>
            <Panel title="Headcount trajectory" subtitle="Net of hires and exits">
              <HeadcountArea data={series} />
            </Panel>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2 overflow-x-auto"
            title="Department scorecard"
            subtitle="Turnover, engagement and recruiting efficiency"
          >
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {[
                    "Department",
                    "Headcount",
                    "Hires",
                    "Exits",
                    "Turnover",
                    "Sat.",
                    "Perf.",
                    "TTH",
                    "At risk",
                  ].map((h) => (
                    <th key={h} className="label-eyebrow pb-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.map((r) => (
                  <tr key={r.dept} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{r.dept}</td>
                    <td className="py-2.5 tabular-nums">{r.headcount}</td>
                    <td className="py-2.5 tabular-nums">{r.hires}</td>
                    <td className="py-2.5 tabular-nums">{r.exits}</td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                          r.turnover > 18
                            ? "bg-destructive/15 text-destructive"
                            : r.turnover > 12
                              ? "bg-warning/15 text-warning"
                              : "bg-success/15 text-success"
                        }`}
                      >
                        {r.turnover}%
                      </span>
                    </td>
                    <td className="py-2.5 tabular-nums">{r.satisfaction}</td>
                    <td className="py-2.5 tabular-nums">{r.performance}</td>
                    <td className="py-2.5 tabular-nums">{r.timeToHire}d</td>
                    <td className="py-2.5 tabular-nums">{r.atRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Retention watchlist" subtitle="Highest predicted attrition risk">
            <ul className="space-y-2.5">
              {atRisk.map((e) => (
                <li key={e.id} className="rounded-lg bg-secondary/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{e.id}</span>
                    <span className="text-xs font-semibold text-destructive tabular-nums">
                      {Math.round(e.flightRisk * 100)}% risk
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.dept} · {e.tenure} yrs · sat {e.satisfaction} · perf {e.performance}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-destructive"
                      style={{ width: `${e.flightRisk * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <BadgeCheck className="size-4 text-primary" aria-hidden />
              Risk score blends satisfaction, performance and tenure.
            </p>
          </Panel>
        </div>

        <footer className="mt-8 text-xs text-muted-foreground">
          Figures are realistic sample HR data generated for demonstration — swap in your HRIS
          export to go live.
        </footer>
      </div>
    </main>
  );
}
