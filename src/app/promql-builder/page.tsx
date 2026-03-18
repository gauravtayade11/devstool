"use client";

import { useState, useMemo } from "react";
import { Activity, Plus, Trash2, Copy, Check } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type LabelOp = "=" | "!=" | "=~" | "!~";

interface LabelFilter {
  key: string;
  op: LabelOp;
  value: string;
}

type RangeFunc =
  | "rate"
  | "irate"
  | "increase"
  | "delta"
  | "avg_over_time"
  | "sum_over_time";

type AggFunc =
  | "none"
  | "sum"
  | "avg"
  | "max"
  | "min"
  | "count"
  | "topk"
  | "bottomk";

type WrapFunc =
  | "none"
  | "abs"
  | "ceil"
  | "floor"
  | "round"
  | "sqrt"
  | "exp"
  | "ln"
  | "rate"
  | "histogram_quantile";

interface PromQLState {
  metric: string;
  labelFilters: LabelFilter[];
  // Range
  useRange: boolean;
  duration: string;
  rangeFunc: RangeFunc;
  // Aggregation
  aggFunc: AggFunc;
  topkValue: string;
  byLabels: string;
  // Function
  wrapFunc: WrapFunc;
  phi: string;
}

// ── Query assembler ───────────────────────────────────────────────────────────

function buildQuery(s: PromQLState): string {
  const metric = s.metric.trim();
  if (!metric) return "";

  // Label selector
  const validFilters = s.labelFilters.filter((f) => f.key.trim());
  const filterStr =
    validFilters.length
      ? `{${validFilters.map((f) => `${f.key}${f.op}"${f.value}"`).join(", ")}}`
      : "";

  let expr = `${metric}${filterStr}`;

  // Range
  if (s.useRange) {
    const dur = s.duration.trim() || "5m";
    expr = `${s.rangeFunc}(${expr}[${dur}])`;
  }

  // Aggregation
  if (s.aggFunc !== "none") {
    const byClause = s.byLabels.trim()
      ? ` by (${s.byLabels
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
          .join(", ")})`
      : "";

    if (s.aggFunc === "topk" || s.aggFunc === "bottomk") {
      const k = s.topkValue.trim() || "5";
      expr = `${s.aggFunc}(${k}, ${expr})${byClause}`;
    } else {
      expr = `${s.aggFunc}(${expr})${byClause}`;
    }
  }

  // Wrapper function
  if (s.wrapFunc !== "none") {
    if (s.wrapFunc === "histogram_quantile") {
      const phi = s.phi.trim() || "0.99";
      expr = `histogram_quantile(${phi}, ${expr})`;
    } else {
      expr = `${s.wrapFunc}(${expr})`;
    }
  }

  return expr;
}

// ── Reusable components ───────────────────────────────────────────────────────

const inputCls =
  "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors font-mono w-full";

const selectCls =
  "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors w-full";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Common metrics ────────────────────────────────────────────────────────────

const COMMON_METRICS = [
  "http_requests_total",
  "container_cpu_usage_seconds_total",
  "node_memory_MemAvailable_bytes",
  "up",
  "process_resident_memory_bytes",
];

// ── Default state ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: PromQLState = {
  metric: "http_requests_total",
  labelFilters: [],
  useRange: true,
  duration: "5m",
  rangeFunc: "rate",
  aggFunc: "sum",
  topkValue: "5",
  byLabels: "",
  wrapFunc: "none",
  phi: "0.99",
};

const LABEL_OPS: LabelOp[] = ["=", "!=", "=~", "!~"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PromQLBuilderPage() {
  const [state, setState] = useState<PromQLState>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof PromQLState>(k: K, v: PromQLState[K]) =>
    setState((prev) => ({ ...prev, [k]: v }));

  const query = useMemo(() => buildQuery(state), [state]);

  const copy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Label filter helpers
  const updateFilter = (i: number, patch: Partial<LabelFilter>) => {
    const next = [...state.labelFilters];
    next[i] = { ...next[i], ...patch };
    set("labelFilters", next);
  };
  const addFilter = () =>
    set("labelFilters", [
      ...state.labelFilters,
      { key: "", op: "=", value: "" },
    ]);
  const removeFilter = (i: number) =>
    set(
      "labelFilters",
      state.labelFilters.filter((_, idx) => idx !== i)
    );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
          <Activity className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">PromQL Builder</h1>
          <p className="text-xs text-zinc-500">
            Build Prometheus queries visually — copy the expression instantly
          </p>
        </div>
      </div>

      {/* Query output */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            PromQL Expression
          </p>
          <button
            onClick={copy}
            disabled={!query}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 min-h-[56px] flex items-center">
          {query ? (
            <code className="font-mono text-sm text-yellow-300 break-all">
              {query}
            </code>
          ) : (
            <span className="font-mono text-sm text-zinc-600">
              Enter a metric name to start building...
            </span>
          )}
        </div>
      </div>

      {/* Section 1: Metric */}
      <Section title="1. Metric">
        <input
          type="text"
          value={state.metric}
          maxLength={200}
          onChange={(e) => {
            const v = e.target.value.slice(0, 200).replace(/[^a-zA-Z0-9_:]/g, "");
            set("metric", v);
          }}
          placeholder="metric_name"
          spellCheck={false}
          className={inputCls}
        />
        <div className="flex flex-wrap gap-2">
          {COMMON_METRICS.map((m) => (
            <button
              key={m}
              onClick={() => set("metric", m)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors font-mono ${
                state.metric === m
                  ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Section>

      {/* Section 2: Label Filters */}
      <Section title="2. Label Filters">
        {state.labelFilters.length === 0 && (
          <p className="text-xs text-zinc-600">
            No label filters — query will match all time series for this metric.
          </p>
        )}
        {state.labelFilters.map((f, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={f.key}
              maxLength={100}
              onChange={(e) =>
                updateFilter(i, { key: e.target.value.slice(0, 100) })
              }
              placeholder="label"
              spellCheck={false}
              className={`${inputCls} flex-1`}
            />
            <select
              value={f.op}
              onChange={(e) =>
                updateFilter(i, { op: e.target.value as LabelOp })
              }
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors font-mono w-16"
            >
              {LABEL_OPS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={f.value}
              maxLength={200}
              onChange={(e) =>
                updateFilter(i, { value: e.target.value.slice(0, 200) })
              }
              placeholder="value"
              spellCheck={false}
              className={`${inputCls} flex-1`}
            />
            <button
              onClick={() => removeFilter(i)}
              className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={addFilter}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" /> Add label filter
        </button>
      </Section>

      {/* Section 3: Range */}
      <Section title="3. Range">
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="radio"
              name="rangeMode"
              checked={!state.useRange}
              onChange={() => set("useRange", false)}
              className="accent-yellow-400"
            />
            Instant
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="radio"
              name="rangeMode"
              checked={state.useRange}
              onChange={() => set("useRange", true)}
              className="accent-yellow-400"
            />
            Range vector
          </label>
        </div>
        {state.useRange && (
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-zinc-400">Duration</label>
              <input
                type="text"
                value={state.duration}
                maxLength={20}
                onChange={(e) =>
                  set("duration", e.target.value.slice(0, 20))
                }
                placeholder="5m"
                spellCheck={false}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-zinc-400">Function</label>
              <select
                value={state.rangeFunc}
                onChange={(e) =>
                  set("rangeFunc", e.target.value as RangeFunc)
                }
                className={selectCls}
              >
                {(
                  [
                    "rate",
                    "irate",
                    "increase",
                    "delta",
                    "avg_over_time",
                    "sum_over_time",
                  ] as RangeFunc[]
                ).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Section>

      {/* Section 4: Aggregation */}
      <Section title="4. Aggregation">
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs text-zinc-400">Aggregation</label>
            <select
              value={state.aggFunc}
              onChange={(e) => set("aggFunc", e.target.value as AggFunc)}
              className={selectCls}
            >
              {(
                [
                  "none",
                  "sum",
                  "avg",
                  "max",
                  "min",
                  "count",
                  "topk",
                  "bottomk",
                ] as AggFunc[]
              ).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          {(state.aggFunc === "topk" || state.aggFunc === "bottomk") && (
            <div className="flex flex-col gap-1 w-24">
              <label className="text-xs text-zinc-400">k value</label>
              <input
                type="text"
                value={state.topkValue}
                maxLength={10}
                onChange={(e) =>
                  set("topkValue", e.target.value.slice(0, 10))
                }
                placeholder="5"
                spellCheck={false}
                className={inputCls}
              />
            </div>
          )}
          {state.aggFunc !== "none" && (
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs text-zinc-400">
                By labels (comma-separated)
              </label>
              <input
                type="text"
                value={state.byLabels}
                maxLength={200}
                onChange={(e) =>
                  set("byLabels", e.target.value.slice(0, 200))
                }
                placeholder="status_code, job"
                spellCheck={false}
                className={inputCls}
              />
            </div>
          )}
        </div>
      </Section>

      {/* Section 5: Functions */}
      <Section title="5. Functions">
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <label className="text-xs text-zinc-400">Wrapper function</label>
            <select
              value={state.wrapFunc}
              onChange={(e) => set("wrapFunc", e.target.value as WrapFunc)}
              className={selectCls}
            >
              {(
                [
                  "none",
                  "abs",
                  "ceil",
                  "floor",
                  "round",
                  "sqrt",
                  "exp",
                  "ln",
                  "rate",
                  "histogram_quantile",
                ] as WrapFunc[]
              ).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          {state.wrapFunc === "histogram_quantile" && (
            <div className="flex flex-col gap-1 w-28">
              <label className="text-xs text-zinc-400">Phi (0–1)</label>
              <input
                type="text"
                value={state.phi}
                maxLength={10}
                onChange={(e) => set("phi", e.target.value.slice(0, 10))}
                placeholder="0.99"
                spellCheck={false}
                className={inputCls}
              />
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
