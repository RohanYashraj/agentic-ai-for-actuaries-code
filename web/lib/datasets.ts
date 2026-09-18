/** Every file in data/, described once. All figures are synthetic and
 * deterministic: data/generate_data.py rebuilds them byte for byte from a
 * fixed seed. Meridian Re, the reinsurer they describe, is fictional. */

export type Dataset = {
  file: string;
  kind: "csv" | "json" | "pdf" | "txt";
  summary: string;
  columns?: string[];
  rows?: number;
  /** Chapter numbers whose scripts read the file. Empty when none do. */
  usedBy: number[];
  note?: string;
};

export const DATASETS: Dataset[] = [
  {
    file: "meridian_motor_india_triangle.csv",
    kind: "csv",
    summary:
      "Motor India paid and reported loss triangle, accident years 2018 to 2023, development 12 to 72 months, cumulative USD. Four defects are seeded for the data-quality agent to find.",
    columns: [
      "accident_year",
      "dev_period_months",
      "paid_loss_usd",
      "reported_loss_usd",
      "case_reserve_usd",
      "claim_count",
    ],
    rows: 21,
    usedBy: [9],
    note: "Defects: two blank cells, one negative case reserve, one row where reported is below paid, and one understated claim count.",
  },
  {
    file: "meridian_motor_india_triangle_clean.csv",
    kind: "csv",
    summary:
      "The same triangle without the seeded defects, for the reserving workflows.",
    columns: [
      "accident_year",
      "dev_period_months",
      "paid_loss_usd",
      "reported_loss_usd",
      "case_reserve_usd",
      "claim_count",
    ],
    rows: 21,
    usedBy: [11, 14],
  },
  {
    file: "ialm_2012_14_ulp.csv",
    kind: "csv",
    summary:
      "A Gompertz-shaped synthetic mortality table with the structure of IALM 2012-14 ULP: ages 18 to 99, by gender and smoker status. Not the real table; do not use it for real work.",
    columns: ["age", "gender", "smoker_status", "mortality_rate"],
    rows: 328,
    usedBy: [10],
  },
  {
    file: "internal_loss_db.csv",
    kind: "csv",
    summary:
      "Sixty comparable commercial property accounts with total insured value, premium and five-year incurred losses, for underwriting benchmarks.",
    columns: [
      "account_id",
      "construction",
      "occupancy",
      "protection_class",
      "tiv_usd",
      "annual_premium_usd",
      "five_year_incurred_usd",
    ],
    rows: 60,
    usedBy: [13],
  },
  {
    file: "submissions/MR-CHI-2025-Q3-018.pdf",
    kind: "pdf",
    summary:
      "A synthetic broker submission for a Chicago commercial property risk, read by the COPE extraction tool.",
    usedBy: [13],
  },
  {
    file: "term_life_india_policies.csv",
    kind: "csv",
    summary:
      "Five hundred term life policies: age at entry, sum assured in INR, term, premium frequency, smoker status, lapse indicator.",
    columns: [
      "policy_id",
      "age_at_entry",
      "gender",
      "sum_assured_inr",
      "policy_term_years",
      "premium_frequency",
      "smoker_status",
      "issue_date",
      "lapse_indicator",
    ],
    rows: 500,
    usedBy: [],
    note: "Generated for the Chapter 12 narrative; no script reads it yet.",
  },
  {
    file: "xs_reports/fy2024/*.txt",
    kind: "txt",
    summary:
      "Three quarterly experience-study notes for term life India, the archive the Chapter 12 vector-knowledge agent indexes.",
    usedBy: [12],
  },
  {
    file: "uk_annuity_members.csv",
    kind: "csv",
    summary:
      "Three hundred UK annuity members: date of birth, annual pension in GBP, commencement date, level or escalating, dependant indicator.",
    columns: [
      "member_id",
      "dob",
      "gender",
      "annual_pension_gbp",
      "commencement_date",
      "pension_type",
      "dependant_indicator",
    ],
    rows: 300,
    usedBy: [15],
  },
  {
    file: "capital_snapshots.json",
    kind: "json",
    summary:
      "Two capital-model snapshots, FY2025 Q1 and Q2, with six SCR modules and the parameter versions behind each.",
    usedBy: [16],
  },
  {
    file: "metrics_registry.json",
    kind: "json",
    summary:
      "Monitoring thresholds and seven-day metrics for two deployed agents: tool error rate, tool calls per run, p95 latency, escalation rate, schema failures, cost per run.",
    usedBy: [17],
  },
];
