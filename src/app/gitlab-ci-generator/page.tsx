"use client";

import { useState, useMemo } from "react";
import { GitBranch, Plus, Trash2, Copy, Check, Download } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type RuleType = "always" | "main-only" | "tags-only" | "manual";

interface CacheConfig {
  key: string;
  paths: string;
}

interface CIJob {
  name: string;
  stage: string;
  imageOverride: string;
  script: string;
  artifactPaths: string;
  rules: RuleType;
  allowFailure: boolean;
}

interface PipelineConfig {
  image: string;
  stages: string[];
  cache: CacheConfig;
  jobs: CIJob[];
}

// ── YAML generator ─────────────────────────────────────────────────────────────

function generateYAML(config: PipelineConfig): string {
  const image = config.image.trim() || "node:20-alpine";
  const validStages = config.stages.map((s) => s.trim()).filter(Boolean);

  const lines: string[] = [];

  lines.push(`image: ${image}`);
  lines.push(``);

  if (validStages.length > 0) {
    lines.push(`stages:`);
    for (const stage of validStages) {
      lines.push(`  - ${stage}`);
    }
    lines.push(``);
  }

  // cache
  const cachePaths = config.cache.paths
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  if (cachePaths.length > 0) {
    const cacheKey = config.cache.key.trim() || "$CI_COMMIT_REF_SLUG";
    lines.push(`cache:`);
    lines.push(`  key: "${cacheKey}"`);
    lines.push(`  paths:`);
    for (const p of cachePaths) {
      lines.push(`    - ${p}`);
    }
    lines.push(``);
  }

  // jobs
  const validJobs = config.jobs.filter((j) => j.name.trim());
  for (const job of validJobs) {
    lines.push(`${job.name.trim()}:`);

    const stage = job.stage.trim();
    if (stage) {
      lines.push(`  stage: ${stage}`);
    }

    if (job.imageOverride.trim()) {
      lines.push(`  image: ${job.imageOverride.trim()}`);
    }

    const scriptLines = job.script
      .split("\n")
      .map((l) => l.trimEnd())
      .filter((l) => l.trim());
    if (scriptLines.length > 0) {
      lines.push(`  script:`);
      for (const sl of scriptLines) {
        lines.push(`    - ${sl}`);
      }
    }

    const artifactPaths = job.artifactPaths
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    if (artifactPaths.length > 0) {
      lines.push(`  artifacts:`);
      lines.push(`    paths:`);
      for (const p of artifactPaths) {
        lines.push(`      - ${p}`);
      }
    }

    if (job.rules !== "always") {
      lines.push(`  rules:`);
      if (job.rules === "main-only") {
        lines.push(`    - if: '$CI_COMMIT_BRANCH == "main"'`);
      } else if (job.rules === "tags-only") {
        lines.push(`    - if: '$CI_COMMIT_TAG'`);
      } else if (job.rules === "manual") {
        lines.push(`    - when: manual`);
      }
    }

    if (job.allowFailure) {
      lines.push(`  allow_failure: true`);
    }

    lines.push(``);
  }

  return lines.join("\n").trimEnd();
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
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Stages editor ──────────────────────────────────────────────────────────────

function StagesEditor({
  stages,
  onChange,
}: {
  stages: string[];
  onChange: (s: string[]) => void;
}) {
  const update = (i: number, v: string) => {
    const next = [...stages];
    next[i] = v;
    onChange(next);
  };
  const add = () => onChange([...stages, ""]);
  const remove = (i: number) => onChange(stages.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {stages.map((stage, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            value={stage}
            onChange={(v) => update(i, v)}
            placeholder="stage-name"
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
        <Plus className="w-3.5 h-3.5" /> Add stage
      </button>
    </div>
  );
}

// ── Job editor ─────────────────────────────────────────────────────────────────

const RULE_OPTIONS = [
  { label: "Always", value: "always" },
  { label: "Main branch only", value: "main-only" },
  { label: "Tags only", value: "tags-only" },
  { label: "Manual", value: "manual" },
];

function JobEditor({
  job,
  index,
  stages,
  onChange,
  onRemove,
}: {
  job: CIJob;
  index: number;
  stages: string[];
  onChange: (j: CIJob) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof CIJob>(k: K, v: CIJob[K]) =>
    onChange({ ...job, [k]: v });

  const stageOptions = stages
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ label: s, value: s }));

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
        <Field label="Job Name">
          <Input
            value={job.name}
            onChange={(v) => set("name", v)}
            placeholder="build"
          />
        </Field>
        <Field label="Stage">
          {stageOptions.length > 0 ? (
            <Select
              value={job.stage}
              onChange={(v) => set("stage", v)}
              options={stageOptions}
            />
          ) : (
            <Input
              value={job.stage}
              onChange={(v) => set("stage", v)}
              placeholder="build"
            />
          )}
        </Field>
      </div>

      <Field label="Image override (optional)">
        <Input
          value={job.imageOverride}
          onChange={(v) => set("imageOverride", v)}
          placeholder="node:18-alpine"
        />
      </Field>

      <Field label="Script (one command per line)">
        <Textarea
          value={job.script}
          onChange={(v) => set("script", v)}
          placeholder={"npm ci\nnpm run build"}
          rows={3}
        />
      </Field>

      <Field label="Artifacts paths (one per line, optional)">
        <Textarea
          value={job.artifactPaths}
          onChange={(v) => set("artifactPaths", v)}
          placeholder={"dist/\nbuild/"}
          rows={2}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3 items-end">
        <Field label="Only / Rules">
          <Select
            value={job.rules}
            onChange={(v) => set("rules", v as RuleType)}
            options={RULE_OPTIONS}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer pb-2">
          <input
            type="checkbox"
            checked={job.allowFailure}
            onChange={(e) => set("allowFailure", e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-0 focus:ring-offset-0"
          />
          <span className="text-xs">Allow failure</span>
        </label>
      </div>
    </div>
  );
}

// ── Default state ──────────────────────────────────────────────────────────────

const defaultConfig: PipelineConfig = {
  image: "node:20-alpine",
  stages: ["build", "test", "deploy"],
  cache: {
    key: "$CI_COMMIT_REF_SLUG",
    paths: "node_modules/",
  },
  jobs: [
    {
      name: "build",
      stage: "build",
      imageOverride: "",
      script: "npm ci\nnpm run build",
      artifactPaths: "dist/",
      rules: "always",
      allowFailure: false,
    },
    {
      name: "test",
      stage: "test",
      imageOverride: "",
      script: "npm test",
      artifactPaths: "",
      rules: "always",
      allowFailure: false,
    },
  ],
};

// ── Main page ──────────────────────────────────────────────────────────────────

export default function GitLabCIGeneratorPage() {
  const [config, setConfig] = useState<PipelineConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);

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
    a.download = ".gitlab-ci.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addJob = () =>
    setConfig((c) => ({
      ...c,
      jobs: [
        ...c.jobs,
        {
          name: "job",
          stage: c.stages[0]?.trim() || "build",
          imageOverride: "",
          script: "",
          artifactPaths: "",
          rules: "always",
          allowFailure: false,
        },
      ],
    }));

  const updateJob = (i: number, job: CIJob) =>
    setConfig((c) => {
      const next = [...c.jobs];
      next[i] = job;
      return { ...c, jobs: next };
    });

  const removeJob = (i: number) =>
    setConfig((c) => ({ ...c, jobs: c.jobs.filter((_, idx) => idx !== i) }));

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              GitLab CI Generator
            </h1>
            <p className="text-xs text-zinc-500">
              Build pipeline YAML visually — download ready to commit
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-500 rounded-lg text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download .yml
          </button>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left: form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto no-scrollbar flex flex-col gap-5">
          {/* Global image */}
          <Field label="Default Docker Image">
            <Input
              value={config.image}
              onChange={(v) => setConfig((c) => ({ ...c, image: v }))}
              placeholder="node:20-alpine"
            />
          </Field>

          {/* Stages */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-400 font-medium">Stages</p>
            <StagesEditor
              stages={config.stages}
              onChange={(s) => setConfig((c) => ({ ...c, stages: s }))}
            />
          </div>

          {/* Cache */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-400 font-medium">Cache</p>
            <Field label="Cache key">
              <Input
                value={config.cache.key}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    cache: { ...c.cache, key: v },
                  }))
                }
                placeholder="$CI_COMMIT_REF_SLUG"
              />
            </Field>
            <Field label="Cached paths (one per line)">
              <Textarea
                value={config.cache.paths}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    cache: { ...c.cache, paths: v },
                  }))
                }
                placeholder={"node_modules/\n.npm/"}
                rows={2}
              />
            </Field>
          </div>

          {/* Jobs */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-400 font-medium">Jobs</p>
            {config.jobs.map((job, i) => (
              <JobEditor
                key={i}
                job={job}
                index={i}
                stages={config.stages}
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
            .gitlab-ci.yml
          </p>
          <pre className="font-mono text-xs text-zinc-300 whitespace-pre leading-5">
            {yaml}
          </pre>
        </div>
      </div>
    </div>
  );
}
