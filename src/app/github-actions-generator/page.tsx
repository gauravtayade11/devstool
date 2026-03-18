"use client";

import { useState, useMemo } from "react";
import { GitMerge, Plus, Trash2, Copy, Check, Download } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EnvVar {
  key: string;
  value: string;
}

type StepType = "uses" | "run";

interface Step {
  name: string;
  type: StepType;
  uses: string;
  run: string;
}

interface Job {
  id: string;
  runsOn: string;
  steps: Step[];
  env: EnvVar[];
}

interface Triggers {
  push: boolean;
  pull_request: boolean;
  workflow_dispatch: boolean;
  schedule: boolean;
  cron: string;
  branches: string;
}

interface WorkflowConfig {
  name: string;
  triggers: Triggers;
  jobs: Job[];
}

// ── YAML generator ─────────────────────────────────────────────────────────────

function generateYAML(config: WorkflowConfig): string {
  const name = config.name.trim() || "CI";
  const { triggers } = config;

  // on: block
  const onLines: string[] = [];
  const hasBranchTrigger = triggers.push || triggers.pull_request;
  const branchList = triggers.branches
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
  const branchesYaml =
    branchList.length > 0
      ? `    branches: [${branchList.join(", ")}]`
      : `    branches: [main]`;

  if (triggers.push) {
    onLines.push(`  push:`);
    onLines.push(branchesYaml);
  }
  if (triggers.pull_request) {
    onLines.push(`  pull_request:`);
    onLines.push(branchesYaml);
  }
  if (triggers.workflow_dispatch) {
    onLines.push(`  workflow_dispatch:`);
  }
  if (triggers.schedule) {
    const cron = triggers.cron.trim() || "0 0 * * *";
    onLines.push(`  schedule:`);
    onLines.push(`    - cron: "${cron}"`);
  }

  if (onLines.length === 0) {
    onLines.push(`  push:`);
    onLines.push(`    branches: [main]`);
  }

  // jobs block
  const jobsLines: string[] = [];
  const validJobs = config.jobs.filter((j) => j.id.trim());

  for (const job of validJobs) {
    const jobId = job.id.trim() || "build";
    jobsLines.push(`  ${jobId}:`);
    jobsLines.push(`    runs-on: ${job.runsOn}`);

    const validSteps = job.steps.filter(
      (s) => s.name.trim() || s.uses.trim() || s.run.trim()
    );
    if (validSteps.length > 0) {
      jobsLines.push(`    steps:`);
      for (const step of validSteps) {
        const stepName = step.name.trim();
        if (stepName) {
          jobsLines.push(`      - name: ${stepName}`);
        } else {
          jobsLines.push(`      -`);
        }
        if (step.type === "uses") {
          const uses = step.uses.trim() || "actions/checkout@v4";
          jobsLines.push(`        uses: ${uses}`);
        } else {
          const runLines = step.run
            .split("\n")
            .map((l) => l.trimEnd())
            .filter((l) => l.trim());
          if (runLines.length === 1) {
            jobsLines.push(`        run: ${runLines[0]}`);
          } else if (runLines.length > 1) {
            jobsLines.push(`        run: |`);
            for (const line of runLines) {
              jobsLines.push(`          ${line}`);
            }
          }
        }
      }
    }

    const validEnv = job.env.filter((e) => e.key.trim());
    if (validEnv.length > 0) {
      jobsLines.push(`    env:`);
      for (const e of validEnv) {
        jobsLines.push(`      ${e.key}: ${e.value}`);
      }
    }
  }

  const jobsBlock =
    jobsLines.length > 0
      ? jobsLines.join("\n")
      : `  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4`;

  return `name: ${name}

on:
${onLines.join("\n")}

jobs:
${jobsBlock}
`.trimEnd();
}

// ── Reusable field components ──────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 500))}
      placeholder={placeholder}
      spellCheck={false}
      maxLength={500}
      className={`bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors font-mono ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 500))}
      placeholder={placeholder}
      spellCheck={false}
      maxLength={500}
      rows={rows}
      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors font-mono w-full resize-y"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function KVList({
  items,
  onChange,
}: {
  items: EnvVar[];
  onChange: (items: EnvVar[]) => void;
}) {
  const update = (i: number, field: "key" | "value", v: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: v };
    onChange(next);
  };
  const add = () => onChange([...items, { key: "", value: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            value={item.key}
            onChange={(v) => update(i, "key", v)}
            placeholder="KEY"
            className="flex-1"
          />
          <Input
            value={item.value}
            onChange={(v) => update(i, "value", v)}
            placeholder="value"
            className="flex-1"
          />
          <button
            onClick={() => remove(i)}
            className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors self-start"
      >
        <Plus className="w-3.5 h-3.5" /> Add variable
      </button>
    </div>
  );
}

// ── Step editor ────────────────────────────────────────────────────────────────

function StepEditor({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: Step;
  index: number;
  onChange: (s: Step) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof Step>(k: K, v: Step[K]) =>
    onChange({ ...step, [k]: v });

  return (
    <div className="border border-zinc-800 rounded-lg p-3 flex flex-col gap-2 bg-zinc-950/40">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-500 font-mono">Step {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => set("type", step.type === "uses" ? "run" : "uses")}
            className="text-xs px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors font-mono"
          >
            {step.type === "uses" ? "uses" : "run"}
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <Input
        value={step.name}
        onChange={(v) => set("name", v)}
        placeholder="Step name"
      />
      {step.type === "uses" ? (
        <Input
          value={step.uses}
          onChange={(v) => set("uses", v)}
          placeholder="actions/checkout@v4"
        />
      ) : (
        <Textarea
          value={step.run}
          onChange={(v) => set("run", v)}
          placeholder={"npm ci\nnpm test"}
          rows={3}
        />
      )}
    </div>
  );
}

// ── Job editor ─────────────────────────────────────────────────────────────────

const RUNNERS = [
  "ubuntu-latest",
  "ubuntu-22.04",
  "windows-latest",
  "macos-latest",
];

function JobEditor({
  job,
  index,
  onChange,
  onRemove,
}: {
  job: Job;
  index: number;
  onChange: (j: Job) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof Job>(k: K, v: Job[K]) =>
    onChange({ ...job, [k]: v });

  const addStep = () =>
    set("steps", [
      ...job.steps,
      { name: "", type: "run", uses: "", run: "" },
    ]);

  const updateStep = (i: number, s: Step) => {
    const next = [...job.steps];
    next[i] = s;
    set("steps", next);
  };

  const removeStep = (i: number) =>
    set(
      "steps",
      job.steps.filter((_, idx) => idx !== i)
    );

  return (
    <div className="border border-zinc-700 rounded-xl p-4 flex flex-col gap-3 bg-zinc-900/40">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
          Job {index + 1}
        </span>
        <button
          onClick={onRemove}
          className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Job ID">
          <Input
            value={job.id}
            onChange={(v) => set("id", v)}
            placeholder="build"
          />
        </Field>
        <Field label="Runs-on">
          <Select
            value={job.runsOn}
            onChange={(v) => set("runsOn", v)}
            options={RUNNERS}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-400">Steps</p>
        {job.steps.map((step, i) => (
          <StepEditor
            key={i}
            step={step}
            index={i}
            onChange={(s) => updateStep(i, s)}
            onRemove={() => removeStep(i)}
          />
        ))}
        <button
          onClick={addStep}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors self-start mt-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add step
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-400">Environment Variables</p>
        <KVList items={job.env} onChange={(v) => set("env", v)} />
      </div>
    </div>
  );
}

// ── Default state ──────────────────────────────────────────────────────────────

const defaultConfig: WorkflowConfig = {
  name: "CI",
  triggers: {
    push: true,
    pull_request: true,
    workflow_dispatch: false,
    schedule: false,
    cron: "0 0 * * *",
    branches: "main",
  },
  jobs: [
    {
      id: "build",
      runsOn: "ubuntu-latest",
      steps: [
        {
          name: "Checkout",
          type: "uses",
          uses: "actions/checkout@v4",
          run: "",
        },
        {
          name: "Run tests",
          type: "run",
          uses: "",
          run: "npm ci\nnpm test",
        },
      ],
      env: [{ key: "NODE_ENV", value: "test" }],
    },
  ],
};

// ── Main page ──────────────────────────────────────────────────────────────────

export default function GitHubActionsGeneratorPage() {
  const [config, setConfig] = useState<WorkflowConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);

  const setTrigger = <K extends keyof Triggers>(k: K, v: Triggers[K]) =>
    setConfig((c) => ({ ...c, triggers: { ...c.triggers, [k]: v } }));

  const yaml = useMemo(() => generateYAML(config), [config]);

  const copy = () => {
    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(config.name.trim() || "workflow").toLowerCase().replace(/\s+/g, "-")}.yml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addJob = () =>
    setConfig((c) => ({
      ...c,
      jobs: [
        ...c.jobs,
        {
          id: "job",
          runsOn: "ubuntu-latest",
          steps: [{ name: "", type: "run", uses: "", run: "" }],
          env: [],
        },
      ],
    }));

  const updateJob = (i: number, job: Job) =>
    setConfig((c) => {
      const next = [...c.jobs];
      next[i] = job;
      return { ...c, jobs: next };
    });

  const removeJob = (i: number) =>
    setConfig((c) => ({ ...c, jobs: c.jobs.filter((_, idx) => idx !== i) }));

  const { triggers } = config;
  const hasBranchTrigger = triggers.push || triggers.pull_request;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <GitMerge className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              GitHub Actions Generator
            </h1>
            <p className="text-xs text-zinc-500">
              Build workflow YAML visually — download ready to commit
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy YAML"}
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download .yml
          </button>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left: form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto no-scrollbar flex flex-col gap-5">
          {/* Workflow name */}
          <Field label="Workflow Name">
            <Input
              value={config.name}
              onChange={(v) => setConfig((c) => ({ ...c, name: v }))}
              placeholder="CI"
            />
          </Field>

          {/* Triggers */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-400 font-medium">Triggers</p>
            <div className="flex flex-col gap-2">
              {(
                [
                  ["push", "push"],
                  ["pull_request", "pull_request"],
                  ["workflow_dispatch", "workflow_dispatch"],
                  ["schedule", "schedule"],
                ] as [keyof Triggers, string][]
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={triggers[key] as boolean}
                    onChange={(e) => setTrigger(key, e.target.checked as Triggers[typeof key])}
                    className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="font-mono text-xs">{label}</span>
                </label>
              ))}
            </div>

            {hasBranchTrigger && (
              <Field label="Branches (comma-separated)">
                <Input
                  value={triggers.branches}
                  onChange={(v) => setTrigger("branches", v)}
                  placeholder="main, develop"
                />
              </Field>
            )}

            {triggers.schedule && (
              <Field label="Cron expression">
                <Input
                  value={triggers.cron}
                  onChange={(v) => setTrigger("cron", v)}
                  placeholder="0 0 * * *"
                />
              </Field>
            )}
          </div>

          {/* Jobs */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-400 font-medium">Jobs</p>
            {config.jobs.map((job, i) => (
              <JobEditor
                key={i}
                job={job}
                index={i}
                onChange={(j) => updateJob(i, j)}
                onRemove={() => removeJob(i)}
              />
            ))}
            <button
              onClick={addJob}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors self-start"
            >
              <Plus className="w-3.5 h-3.5" /> Add job
            </button>
          </div>
        </div>

        {/* Right: YAML output */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto no-scrollbar">
          <p className="text-xs text-zinc-600 mb-3 uppercase tracking-wider font-medium">
            .github/workflows/{(config.name.trim() || "workflow").toLowerCase().replace(/\s+/g, "-")}.yml
          </p>
          <pre className="font-mono text-xs text-zinc-300 whitespace-pre leading-5">
            {yaml}
          </pre>
        </div>
      </div>
    </div>
  );
}
