"use client";

import { useState, useMemo } from "react";
import { Package, Plus, Trash2, Copy, Check, Download } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type OutputTab = "Chart.yaml" | "values.yaml" | "deployment.yaml";

interface EnvVar {
  key: string;
  value: string;
}

interface HelmConfig {
  // Chart info
  chartName: string;
  chartVersion: string;
  appVersion: string;
  description: string;
  chartType: "application" | "library";
  // Container
  imageRepo: string;
  imageTag: string;
  pullPolicy: "IfNotPresent" | "Always" | "Never";
  replicas: number;
  containerPort: string;
  // Resources
  cpuRequest: string;
  cpuLimit: string;
  memRequest: string;
  memLimit: string;
  // Service
  serviceType: "ClusterIP" | "NodePort" | "LoadBalancer";
  servicePort: string;
  // Ingress
  ingressEnabled: boolean;
  ingressHost: string;
  ingressTls: boolean;
  // Env vars
  envVars: EnvVar[];
}

// ── YAML generators ───────────────────────────────────────────────────────────

function generateChartYaml(c: HelmConfig): string {
  const name = c.chartName || "my-app";
  return `apiVersion: v2
name: ${name}
description: ${c.description || `A Helm chart for Kubernetes`}
type: ${c.chartType}
version: ${c.chartVersion || "0.1.0"}
appVersion: "${c.appVersion || "1.0.0"}"
`;
}

function generateValuesYaml(c: HelmConfig): string {
  const name = c.chartName || "my-app";
  const envBlock =
    c.envVars.filter((e) => e.key.trim()).length
      ? c.envVars
          .filter((e) => e.key.trim())
          .map((e) => `  ${e.key}: "${e.value}"`)
          .join("\n")
      : "  {}";

  const ingressBlock = c.ingressEnabled
    ? `ingress:
  enabled: true
  host: "${c.ingressHost || ""}"
  tls: ${c.ingressTls}
`
    : `ingress:
  enabled: false
  host: ""
  tls: false
`;

  return `replicaCount: ${c.replicas}

image:
  repository: ${c.imageRepo || "nginx"}
  pullPolicy: ${c.pullPolicy}
  tag: "${c.imageTag || "latest"}"

service:
  type: ${c.serviceType}
  port: ${c.servicePort || "80"}

resources:
  requests:
    cpu: ${c.cpuRequest || "100m"}
    memory: ${c.memRequest || "128Mi"}
  limits:
    cpu: ${c.cpuLimit || "500m"}
    memory: ${c.memLimit || "512Mi"}

${ingressBlock}
env:
${envBlock === "  {}" ? "{}" : envBlock}
`;
}

function generateDeploymentYaml(c: HelmConfig): string {
  const name = c.chartName || "my-app";
  const envBlock =
    c.envVars.filter((e) => e.key.trim()).length
      ? `\n          env:\n${c.envVars
          .filter((e) => e.key.trim())
          .map(
            (e) =>
              `            - name: ${e.key}\n              value: "{{ .Values.env.${e.key} | default "${e.value}" }}"`
          )
          .join("\n")}`
      : "";

  const ingressBlock = `{{- if .Values.ingress.enabled }}
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "${name}.fullname" . }}
  labels:
    {{- include "${name}.labels" . | nindent 4 }}
spec:
  {{- if .Values.ingress.tls }}
  tls:
    - hosts:
        - {{ .Values.ingress.host }}
      secretName: {{ include "${name}.fullname" . }}-tls
  {{- end }}
  rules:
    - host: {{ .Values.ingress.host }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: {{ include "${name}.fullname" . }}
                port:
                  number: {{ .Values.service.port }}
{{- end }}`;

  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "${name}.fullname" . }}
  labels:
    {{- include "${name}.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "${name}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "${name}.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: ${c.containerPort || "80"}
              protocol: TCP
          resources:
            {{- toYaml .Values.resources | nindent 12 }}${envBlock}
---
apiVersion: v1
kind: Service
metadata:
  name: {{ include "${name}.fullname" . }}
  labels:
    {{- include "${name}.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "${name}.selectorLabels" . | nindent 4 }}
${ingressBlock}
`;
}

// ── Reusable components ───────────────────────────────────────────────────────

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

const inputCls =
  "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors font-mono w-full";

const selectCls =
  "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors w-full";

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength = 200,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      type="text"
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
      placeholder={placeholder}
      spellCheck={false}
      className={inputCls}
    />
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
          <input
            type="text"
            value={item.key}
            maxLength={100}
            onChange={(e) => update(i, "key", e.target.value.slice(0, 100))}
            placeholder="KEY"
            spellCheck={false}
            className={`${inputCls} flex-1`}
          />
          <input
            type="text"
            value={item.value}
            maxLength={500}
            onChange={(e) => update(i, "value", e.target.value.slice(0, 500))}
            placeholder="value"
            spellCheck={false}
            className={`${inputCls} flex-1`}
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
        <Plus className="w-3.5 h-3.5" /> Add row
      </button>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Default state ─────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: HelmConfig = {
  chartName: "my-app",
  chartVersion: "0.1.0",
  appVersion: "1.0.0",
  description: "",
  chartType: "application",
  imageRepo: "nginx",
  imageTag: "latest",
  pullPolicy: "IfNotPresent",
  replicas: 1,
  containerPort: "80",
  cpuRequest: "100m",
  cpuLimit: "500m",
  memRequest: "128Mi",
  memLimit: "512Mi",
  serviceType: "ClusterIP",
  servicePort: "80",
  ingressEnabled: false,
  ingressHost: "",
  ingressTls: false,
  envVars: [],
};

const TABS: OutputTab[] = ["Chart.yaml", "values.yaml", "deployment.yaml"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HelmChartGeneratorPage() {
  const [config, setConfig] = useState<HelmConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<OutputTab>("Chart.yaml");
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof HelmConfig>(k: K, v: HelmConfig[K]) =>
    setConfig((prev) => ({ ...prev, [k]: v }));

  const outputs = useMemo(
    () => ({
      "Chart.yaml": generateChartYaml(config),
      "values.yaml": generateValuesYaml(config),
      "deployment.yaml": generateDeploymentYaml(config),
    }),
    [config]
  );

  const activeOutput = outputs[activeTab];

  const copy = () => {
    navigator.clipboard.writeText(activeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([activeOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              Helm Chart Generator
            </h1>
            <p className="text-xs text-zinc-500">
              Generate Chart.yaml, values.yaml, and deployment template
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
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download {activeTab}
          </button>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left: form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto no-scrollbar flex flex-col gap-5">
          <Section title="Chart Info">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Chart Name">
                <TextInput
                  value={config.chartName}
                  onChange={(v) => set("chartName", v)}
                  placeholder="my-app"
                />
              </Field>
              <Field label="Type">
                <select
                  value={config.chartType}
                  onChange={(e) =>
                    set("chartType", e.target.value as HelmConfig["chartType"])
                  }
                  className={selectCls}
                >
                  <option value="application">application</option>
                  <option value="library">library</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Chart Version">
                <TextInput
                  value={config.chartVersion}
                  onChange={(v) => set("chartVersion", v)}
                  placeholder="0.1.0"
                />
              </Field>
              <Field label="App Version">
                <TextInput
                  value={config.appVersion}
                  onChange={(v) => set("appVersion", v)}
                  placeholder="1.0.0"
                />
              </Field>
            </div>
            <Field label="Description">
              <TextInput
                value={config.description}
                onChange={(v) => set("description", v)}
                placeholder="A Helm chart for Kubernetes"
              />
            </Field>
          </Section>

          <Section title="Container">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Image Repository">
                <TextInput
                  value={config.imageRepo}
                  onChange={(v) => set("imageRepo", v)}
                  placeholder="nginx"
                />
              </Field>
              <Field label="Image Tag">
                <TextInput
                  value={config.imageTag}
                  onChange={(v) => set("imageTag", v)}
                  placeholder="latest"
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pull Policy">
                <select
                  value={config.pullPolicy}
                  onChange={(e) =>
                    set(
                      "pullPolicy",
                      e.target.value as HelmConfig["pullPolicy"]
                    )
                  }
                  className={selectCls}
                >
                  <option>IfNotPresent</option>
                  <option>Always</option>
                  <option>Never</option>
                </select>
              </Field>
              <Field label="Replicas">
                <input
                  type="number"
                  min={1}
                  value={config.replicas}
                  onChange={(e) =>
                    set("replicas", parseInt(e.target.value) || 1)
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Container Port">
                <TextInput
                  value={config.containerPort}
                  onChange={(v) => set("containerPort", v)}
                  placeholder="80"
                />
              </Field>
            </div>
          </Section>

          <Section title="Resources">
            <div className="grid grid-cols-2 gap-3">
              <Field label="CPU Request">
                <TextInput
                  value={config.cpuRequest}
                  onChange={(v) => set("cpuRequest", v)}
                  placeholder="100m"
                />
              </Field>
              <Field label="CPU Limit">
                <TextInput
                  value={config.cpuLimit}
                  onChange={(v) => set("cpuLimit", v)}
                  placeholder="500m"
                />
              </Field>
              <Field label="Memory Request">
                <TextInput
                  value={config.memRequest}
                  onChange={(v) => set("memRequest", v)}
                  placeholder="128Mi"
                />
              </Field>
              <Field label="Memory Limit">
                <TextInput
                  value={config.memLimit}
                  onChange={(v) => set("memLimit", v)}
                  placeholder="512Mi"
                />
              </Field>
            </div>
          </Section>

          <Section title="Service">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Service Type">
                <select
                  value={config.serviceType}
                  onChange={(e) =>
                    set(
                      "serviceType",
                      e.target.value as HelmConfig["serviceType"]
                    )
                  }
                  className={selectCls}
                >
                  <option>ClusterIP</option>
                  <option>NodePort</option>
                  <option>LoadBalancer</option>
                </select>
              </Field>
              <Field label="Service Port">
                <TextInput
                  value={config.servicePort}
                  onChange={(v) => set("servicePort", v)}
                  placeholder="80"
                />
              </Field>
            </div>
          </Section>

          <Section title="Ingress">
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.ingressEnabled}
                onChange={(e) => set("ingressEnabled", e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-cyan-500 cursor-pointer"
              />
              Enable Ingress
            </label>
            {config.ingressEnabled && (
              <div className="flex flex-col gap-3 pl-6">
                <Field label="Host">
                  <TextInput
                    value={config.ingressHost}
                    onChange={(v) => set("ingressHost", v)}
                    placeholder="app.example.com"
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.ingressTls}
                    onChange={(e) => set("ingressTls", e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-cyan-500 cursor-pointer"
                  />
                  Enable TLS
                </label>
              </div>
            )}
          </Section>

          <Section title="Environment Variables">
            <KVList
              items={config.envVars}
              onChange={(v) => set("envVars", v)}
            />
          </Section>
        </div>

        {/* Right: output with tabs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex bg-zinc-950 border-b border-zinc-800 p-1 gap-0.5 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors font-mono ${
                  activeTab === tab
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Output */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4">
            <pre className="font-mono text-xs text-zinc-300 whitespace-pre leading-5">
              {activeOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
