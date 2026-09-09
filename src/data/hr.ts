// Realistic synthetic HR dataset used across the analytics dashboard.

export type Dept =
  | "Engineering"
  | "Sales"
  | "Support"
  | "Marketing"
  | "Finance"
  | "People Ops";

export const DEPARTMENTS: Dept[] = [
  "Engineering",
  "Sales",
  "Support",
  "Marketing",
  "Finance",
  "People Ops",
];

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type MonthRow = {
  month: string;
  dept: Dept;
  applicants: number;
  screened: number;
  interviewed: number;
  offers: number;
  hires: number;
  exits: number;
  headcount: number;
  timeToHire: number; // days
  costPerHire: number; // USD
  satisfaction: number; // 1-5
  performance: number; // 1-5
  openRoles: number;
};

// Deterministic pseudo-random generator so numbers never jump between renders.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const baseHeadcount: Record<Dept, number> = {
  Engineering: 184,
  Sales: 96,
  Support: 72,
  Marketing: 41,
  Finance: 28,
  "People Ops": 19,
};

const attritionBias: Record<Dept, number> = {
  Engineering: 0.9,
  Sales: 1.9,
  Support: 2.1,
  Marketing: 1.2,
  Finance: 0.7,
  "People Ops": 0.8,
};

export const rows: MonthRow[] = (() => {
  const out: MonthRow[] = [];
  DEPARTMENTS.forEach((dept, di) => {
    const rand = rng(1000 + di * 77);
    let headcount = baseHeadcount[dept];
    MONTHS.forEach((month, mi) => {
      const seasonal = 1 + 0.22 * Math.sin((mi / 12) * Math.PI * 2 - 0.6);
      const applicants = Math.round(
        (36 + baseHeadcount[dept] * 0.55) * seasonal * (0.85 + rand() * 0.35),
      );
      const screened = Math.round(applicants * (0.36 + rand() * 0.08));
      const interviewed = Math.round(screened * (0.44 + rand() * 0.1));
      const offers = Math.round(interviewed * (0.3 + rand() * 0.08));
      const hires = Math.max(1, Math.round(offers * (0.72 + rand() * 0.14)));
      const exits = Math.max(
        0,
        Math.round((headcount * 0.012 * attritionBias[dept]) * (0.6 + rand() * 1.1)),
      );
      headcount = headcount + hires - exits;
      out.push({
        month,
        dept,
        applicants,
        screened,
        interviewed,
        offers,
        hires,
        exits,
        headcount,
        timeToHire: Math.round(24 + attritionBias[dept] * 6 + rand() * 14),
        costPerHire: Math.round(3200 + rand() * 2600 + (dept === "Engineering" ? 1800 : 0)),
        satisfaction: +(4.35 - attritionBias[dept] * 0.28 + rand() * 0.4).toFixed(2),
        performance: +(3.5 + rand() * 1.1).toFixed(2),
        openRoles: Math.max(0, Math.round(2 + baseHeadcount[dept] * 0.03 * seasonal + rand() * 3)),
      });
    });
  });
  return out;
})();

export type Employee = {
  id: string;
  dept: Dept;
  tenure: number; // years
  satisfaction: number;
  performance: number;
  flightRisk: number; // 0-1
};

export const employees: Employee[] = (() => {
  const out: Employee[] = [];
  const rand = rng(4242);
  DEPARTMENTS.forEach((dept) => {
    const n = Math.round(baseHeadcount[dept] / 4);
    for (let i = 0; i < n; i++) {
      const satisfaction = +(2.1 + rand() * 2.85 - attritionBias[dept] * 0.12).toFixed(2);
      const performance = +(2.3 + rand() * 2.6).toFixed(2);
      const tenure = +(rand() * 9).toFixed(1);
      const flightRisk = Math.min(
        0.97,
        Math.max(
          0.03,
          0.9 - satisfaction * 0.14 - performance * 0.04 + (tenure < 1.5 ? 0.12 : 0) + rand() * 0.08,
        ),
      );
      out.push({
        id: `${dept.slice(0, 2).toUpperCase()}-${100 + i}`,
        dept,
        tenure,
        satisfaction,
        performance,
        flightRisk: +flightRisk.toFixed(2),
      });
    }
  });
  return out;
})();

// ---------- aggregation helpers ----------

export function filterRows(dept: Dept | "All") {
  return dept === "All" ? rows : rows.filter((r) => r.dept === dept);
}

export function monthlySeries(dept: Dept | "All") {
  const src = filterRows(dept);
  return MONTHS.map((month) => {
    const m = src.filter((r) => r.month === month);
    const headcount = m.reduce((a, r) => a + r.headcount, 0);
    const hires = m.reduce((a, r) => a + r.hires, 0);
    const exits = m.reduce((a, r) => a + r.exits, 0);
    return {
      month,
      hires,
      exits,
      headcount,
      net: hires - exits,
      turnover: +((exits / Math.max(1, headcount)) * 100).toFixed(2),
      applicants: m.reduce((a, r) => a + r.applicants, 0),
      satisfaction: +(m.reduce((a, r) => a + r.satisfaction, 0) / Math.max(1, m.length)).toFixed(2),
      performance: +(m.reduce((a, r) => a + r.performance, 0) / Math.max(1, m.length)).toFixed(2),
      timeToHire: Math.round(m.reduce((a, r) => a + r.timeToHire, 0) / Math.max(1, m.length)),
      openRoles: m.reduce((a, r) => a + r.openRoles, 0),
    };
  });
}

export function funnel(dept: Dept | "All") {
  const src = filterRows(dept);
  const sum = (k: keyof MonthRow) => src.reduce((a, r) => a + (r[k] as number), 0);
  const stages = [
    { stage: "Applicants", value: sum("applicants") },
    { stage: "Screened", value: sum("screened") },
    { stage: "Interviewed", value: sum("interviewed") },
    { stage: "Offers", value: sum("offers") },
    { stage: "Hires", value: sum("hires") },
  ];
  const top = stages[0].value || 1;
  return stages.map((s) => ({ ...s, rate: +((s.value / top) * 100).toFixed(1) }));
}

export function deptSummary() {
  return DEPARTMENTS.map((dept) => {
    const m = rows.filter((r) => r.dept === dept);
    const last = m[m.length - 1];
    const hires = m.reduce((a, r) => a + r.hires, 0);
    const exits = m.reduce((a, r) => a + r.exits, 0);
    const avgHead = m.reduce((a, r) => a + r.headcount, 0) / m.length;
    const staff = employees.filter((e) => e.dept === dept);
    return {
      dept,
      headcount: last.headcount,
      hires,
      exits,
      turnover: +((exits / avgHead) * 100).toFixed(1),
      satisfaction: +(m.reduce((a, r) => a + r.satisfaction, 0) / m.length).toFixed(2),
      performance: +(m.reduce((a, r) => a + r.performance, 0) / m.length).toFixed(2),
      timeToHire: Math.round(m.reduce((a, r) => a + r.timeToHire, 0) / m.length),
      costPerHire: Math.round(m.reduce((a, r) => a + r.costPerHire, 0) / m.length),
      atRisk: staff.filter((e) => e.flightRisk > 0.55).length,
      openRoles: last.openRoles,
    };
  });
}

// ---------- predictive analytics ----------

function linreg(y: number[]) {
  const n = y.length;
  const xm = (n - 1) / 2;
  const ym = y.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  y.forEach((v, i) => {
    num += (i - xm) * (v - ym);
    den += (i - xm) ** 2;
  });
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: ym - slope * xm };
}

/**
 * Hiring-need forecast: projects attrition-driven backfill plus growth demand
 * from the trailing 12 months using a least-squares trend with seasonality.
 */
export function hiringForecast(dept: Dept | "All", growthPct: number, horizon = 6) {
  const series = monthlySeries(dept);
  const exits = series.map((s) => s.exits);
  const heads = series.map((s) => s.headcount);
  const { slope, intercept } = linreg(exits);
  const lastHead = heads[heads.length - 1];
  const avgExit = exits.reduce((a, b) => a + b, 0) / exits.length;

  const history = series.map((s) => ({
    month: s.month,
    actual: s.hires,
    forecast: null as number | null,
    lower: null as number | null,
    upper: null as number | null,
  }));

  const future: typeof history = [];
  for (let i = 1; i <= horizon; i++) {
    const idx = exits.length - 1 + i;
    const seasonal = 1 + 0.18 * Math.sin((idx / 12) * Math.PI * 2 - 0.6);
    const backfill = Math.max(0, (intercept + slope * idx) * seasonal);
    const growth = (lastHead * (growthPct / 100)) / 12;
    const need = backfill + growth;
    const band = Math.max(1, avgExit * 0.35 + need * 0.18);
    future.push({
      month: MONTHS[idx % 12],
      actual: null as unknown as number,
      forecast: +need.toFixed(1),
      lower: +Math.max(0, need - band).toFixed(1),
      upper: +(need + band).toFixed(1),
    });
  }

  const totalNeed = future.reduce((a, r) => a + (r.forecast ?? 0), 0);
  return {
    data: [...history, ...future],
    totalNeed: Math.round(totalNeed),
    monthlyAvg: +(totalNeed / horizon).toFixed(1),
    backfillShare: Math.round(
      (future.reduce((a, r, i) => {
        const idx = exits.length + i;
        const seasonal = 1 + 0.18 * Math.sin((idx / 12) * Math.PI * 2 - 0.6);
        return a + Math.max(0, (intercept + slope * idx) * seasonal);
      }, 0) /
        Math.max(1, totalNeed)) *
        100,
    ),
    trend: slope >= 0 ? "rising" : "easing",
  };
}

export function kpis(dept: Dept | "All") {
  const series = monthlySeries(dept);
  const hires = series.reduce((a, s) => a + s.hires, 0);
  const exits = series.reduce((a, s) => a + s.exits, 0);
  const avgHead = series.reduce((a, s) => a + s.headcount, 0) / series.length;
  const src = filterRows(dept);
  const staff = dept === "All" ? employees : employees.filter((e) => e.dept === dept);
  const offers = src.reduce((a, r) => a + r.offers, 0);
  return {
    headcount: series[series.length - 1].headcount,
    hires,
    exits,
    turnover: +((exits / avgHead) * 100).toFixed(1),
    offerAccept: +((hires / Math.max(1, offers)) * 100).toFixed(1),
    timeToHire: Math.round(src.reduce((a, r) => a + r.timeToHire, 0) / src.length),
    costPerHire: Math.round(src.reduce((a, r) => a + r.costPerHire, 0) / src.length),
    satisfaction: +(src.reduce((a, r) => a + r.satisfaction, 0) / src.length).toFixed(2),
    performance: +(src.reduce((a, r) => a + r.performance, 0) / src.length).toFixed(2),
    atRisk: staff.filter((e) => e.flightRisk > 0.55).length,
    staff: staff.length,
    openRoles: series[series.length - 1].openRoles,
  };
}
