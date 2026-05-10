"use client";

import { useState, useMemo } from "react";
import { Container, Plus, Trash2, Copy, Check, Download } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type ResourceType = "Deployment" | "Service" | "ConfigMap" | "Ingress" | "HPA";

interface EnvVar { key: string; value: string }
interface Label  { key: string; value: string }

interface DeploymentConfig {
  name: string;
  namespace: string;
  image: string;
  tag: string;
  replicas: number;
  cpuRequest: string;
  cpuLimit: string;
  memRequest: string;
  memLimit: string;
  containerPort: string;
  envVars: EnvVar[];
  labels: Label[];
  pullPolicy: "Always" | "IfNotPresent" | "Never";
  generateService: boolean;
  serviceType: "ClusterIP" | "NodePort" | "LoadBalancer";
  servicePort: string;
}

interface ServiceConfig {
  name: string;
  namespace: string;
  type: "ClusterIP" | "NodePort" | "LoadBalancer";
  port: string;
  targetPort: string;
  selector: Label[];
}

interface ConfigMapConfig {
  name: string;
  namespace: string;
  data: EnvVar[];
}

interface IngressConfig {
  name: string;
  namespace: string;
  host: string;
  path: string;
  serviceName: string;
  servicePort: string;
  tlsEnabled: boolean;
  secretName: string;
}

interface HPAConfig {
  name: string;
  namespace: string;
  targetName: string;
  minReplicas: number;
  maxReplicas: number;
  cpuUtilization: number;
}

// ── YAML generators ──────────────────────────────────────────────────────────

function labelsToYaml(labels: Label[], indent = 4): string {
  const valid = labels.filter((l) => l.key.trim());
  if (!valid.length) return "";
  return valid.map((l) => `${" ".repeat(indent)}${l.key}: "${l.value}"`).join("\n");
}

function generateDeployment(c: DeploymentConfig): string {
  const name = c.name || "my-app";
  const ns = c.namespace || "default";
  const image = `${c.image || "nginx"}:${c.tag || "latest"}`;
  const selectorLabels = c.labels.filter((l) => l.key.trim());
  const defaultLabel = [{ key: "app", value: name }];
  const lbls = selectorLabels.length ? selectorLabels : defaultLabel;
  const labelsBlock = labelsToYaml(lbls, 8);
  const selectorBlock = labelsToYaml(lbls, 6);

  const envBlock = c.envVars.filter((e) => e.key.trim()).length
    ? `\n        env:\n${c.envVars.filter((e) => e.key.trim()).map((e) => `          - name: ${e.key}\n            value: "${e.value}"`).join("\n")}`
    : "";

  const resources = (c.cpuRequest || c.cpuLimit || c.memRequest || c.memLimit)
    ? `\n        resources:\n${c.cpuRequest || c.memRequest ? `          requests:\n${c.cpuRequest ? `            cpu: "${c.cpuRequest}"\n` : ""}${c.memRequest ? `            memory: "${c.memRequest}"\n` : ""}` : ""}${c.cpuLimit || c.memLimit ? `          limits:\n${c.cpuLimit ? `            cpu: "${c.cpuLimit}"\n` : ""}${c.memLimit ? `            memory: "${c.memLimit}"\n` : ""}` : ""}`
    : "";

  const portBlock = c.containerPort ? `\n        ports:\n          - containerPort: ${c.containerPort}` : "";

  let yaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${ns}
  labels:
${labelsBlock}
spec:
  replicas: ${c.replicas}
  selector:
    matchLabels:
${selectorBlock}
  template:
    metadata:
      labels:
${labelsBlock}
    spec:
      containers:
        - name: ${name}
          image: ${image}
          imagePullPolicy: ${c.pullPolicy}${portBlock}${envBlock}${resources}
`;

  if (c.generateService) {
    const svcPort = c.servicePort || c.containerPort || "80";
    yaml += `
---
apiVersion: v1
kind: Service
metadata:
  name: ${name}-svc
  namespace: ${ns}
  labels:
${labelsBlock}
spec:
  type: ${c.serviceType}
  selector:
${selectorBlock}
  ports:
    - port: ${svcPort}
      targetPort: ${c.containerPort || svcPort}
      protocol: TCP
`;
  }

  return yaml.trimEnd();
}

function generateService(c: ServiceConfig): string {
  const name = c.name || "my-service";
  const ns = c.namespace || "default";
  const selector = c.selector.filter((l) => l.key.trim());
  const selectorBlock = selector.length ? labelsToYaml(selector, 4) : `    app: "${name}"`;
  return `apiVersion: v1
kind: Service
metadata:
  name: ${name}
  namespace: ${ns}
spec:
  type: ${c.type}
  selector:
${selectorBlock}
  ports:
    - port: ${c.port || "80"}
      targetPort: ${c.targetPort || c.port || "80"}
      protocol: TCP`.trimEnd();
}

function generateConfigMap(c: ConfigMapConfig): string {
  const name = c.name || "my-config";
  const ns = c.namespace || "default";
  const data = c.data.filter((d) => d.key.trim());
  const dataBlock = data.length
    ? data.map((d) => `  ${d.key}: "${d.value}"`).join("\n")
    : "  KEY: value";
  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${name}
  namespace: ${ns}
data:
${dataBlock}`.trimEnd();
}

function generateIngress(c: IngressConfig): string {
  const name = c.name || "my-ingress";
  const ns = c.namespace || "default";
  const host = c.host || "example.com";
  const path = c.path || "/";
  const svcName = c.serviceName || "my-service";
  const svcPort = c.servicePort || "80";

  const tls = c.tlsEnabled
    ? `  tls:
    - hosts:
        - ${host}
      secretName: ${c.secretName || "tls-secret"}
`
    : "";

  return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${name}
  namespace: ${ns}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
${tls}  rules:
    - host: ${host}
      http:
        paths:
          - path: ${path}
            pathType: Prefix
            backend:
              service:
                name: ${svcName}
                port:
                  number: ${svcPort}`.trimEnd();
}

function generateHPA(c: HPAConfig): string {
  const name = c.name || "my-hpa";
  const ns = c.namespace || "default";
  return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${name}
  namespace: ${ns}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${c.targetName || "my-app"}
  minReplicas: ${c.minReplicas}
  maxReplicas: ${c.maxReplicas}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: ${c.cpuUtilization}`.trimEnd();
}

// ── Reusable field components ────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value, onChange, placeholder, className = "",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      className={`bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors font-mono ${className}`}
    />
  );
}

function Select({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function KVList({
  items, onChange, keyPlaceholder = "KEY", valPlaceholder = "value",
}: {
  items: EnvVar[]; onChange: (items: EnvVar[]) => void; keyPlaceholder?: string; valPlaceholder?: string;
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
          <Input value={item.key} onChange={(v) => update(i, "key", v)} placeholder={keyPlaceholder} className="flex-1" />
          <Input value={item.value} onChange={(v) => update(i, "value", v)} placeholder={valPlaceholder} className="flex-1" />
          <button onClick={() => remove(i)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
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

// ── Resource forms ────────────────────────────────────────────────────────────

function DeploymentForm({ config, onChange }: { config: DeploymentConfig; onChange: (c: DeploymentConfig) => void }) {
  const set = <K extends keyof DeploymentConfig>(k: K, v: DeploymentConfig[K]) =>
    onChange({ ...config, [k]: v });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><Input value={config.name} onChange={(v) => set("name", v)} placeholder="my-app" /></Field>
        <Field label="Namespace"><Input value={config.namespace} onChange={(v) => set("namespace", v)} placeholder="default" /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Image" ><Input value={config.image} onChange={(v) => set("image", v)} placeholder="nginx" className="w-full" /></Field>
        <Field label="Tag"><Input value={config.tag} onChange={(v) => set("tag", v)} placeholder="latest" /></Field>
        <Field label="Replicas">
          <input type="number" min={1} value={config.replicas} onChange={(e) => set("replicas", parseInt(e.target.value) || 1)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 w-full" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Container Port"><Input value={config.containerPort} onChange={(v) => set("containerPort", v)} placeholder="8080" /></Field>
        <Field label="Image Pull Policy"><Select value={config.pullPolicy} onChange={(v) => set("pullPolicy", v as DeploymentConfig["pullPolicy"])} options={["IfNotPresent", "Always", "Never"]} /></Field>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Field label="CPU Request"><Input value={config.cpuRequest} onChange={(v) => set("cpuRequest", v)} placeholder="100m" /></Field>
        <Field label="CPU Limit"><Input value={config.cpuLimit} onChange={(v) => set("cpuLimit", v)} placeholder="500m" /></Field>
        <Field label="Mem Request"><Input value={config.memRequest} onChange={(v) => set("memRequest", v)} placeholder="128Mi" /></Field>
        <Field label="Mem Limit"><Input value={config.memLimit} onChange={(v) => set("memLimit", v)} placeholder="512Mi" /></Field>
      </div>

      <div>
        <p className="text-xs text-zinc-400 mb-2">Environment Variables</p>
        <KVList items={config.envVars} onChange={(v) => set("envVars", v)} keyPlaceholder="ENV_VAR" valPlaceholder="value" />
      </div>

      <div>
        <p className="text-xs text-zinc-400 mb-2">Labels</p>
        <KVList items={config.labels} onChange={(v) => set("labels", v)} keyPlaceholder="key" valPlaceholder="value" />
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer mb-3">
          <input type="checkbox" checked={config.generateService} onChange={(e) => set("generateService", e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
          Also generate a Service
        </label>
        {config.generateService && (
          <div className="grid grid-cols-2 gap-3 pl-6">
            <Field label="Service Type"><Select value={config.serviceType} onChange={(v) => set("serviceType", v as DeploymentConfig["serviceType"])} options={["ClusterIP", "NodePort", "LoadBalancer"]} /></Field>
            <Field label="Service Port"><Input value={config.servicePort} onChange={(v) => set("servicePort", v)} placeholder="80" /></Field>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceForm({ config, onChange }: { config: ServiceConfig; onChange: (c: ServiceConfig) => void }) {
  const set = <K extends keyof ServiceConfig>(k: K, v: ServiceConfig[K]) => onChange({ ...config, [k]: v });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><Input value={config.name} onChange={(v) => set("name", v)} placeholder="my-service" /></Field>
        <Field label="Namespace"><Input value={config.namespace} onChange={(v) => set("namespace", v)} placeholder="default" /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Type"><Select value={config.type} onChange={(v) => set("type", v as ServiceConfig["type"])} options={["ClusterIP", "NodePort", "LoadBalancer"]} /></Field>
        <Field label="Port"><Input value={config.port} onChange={(v) => set("port", v)} placeholder="80" /></Field>
        <Field label="Target Port"><Input value={config.targetPort} onChange={(v) => set("targetPort", v)} placeholder="8080" /></Field>
      </div>
      <div>
        <p className="text-xs text-zinc-400 mb-2">Selector Labels</p>
        <KVList items={config.selector} onChange={(v) => set("selector", v)} />
      </div>
    </div>
  );
}

function ConfigMapForm({ config, onChange }: { config: ConfigMapConfig; onChange: (c: ConfigMapConfig) => void }) {
  const set = <K extends keyof ConfigMapConfig>(k: K, v: ConfigMapConfig[K]) => onChange({ ...config, [k]: v });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><Input value={config.name} onChange={(v) => set("name", v)} placeholder="my-config" /></Field>
        <Field label="Namespace"><Input value={config.namespace} onChange={(v) => set("namespace", v)} placeholder="default" /></Field>
      </div>
      <div>
        <p className="text-xs text-zinc-400 mb-2">Data</p>
        <KVList items={config.data} onChange={(v) => set("data", v)} keyPlaceholder="KEY" valPlaceholder="value" />
      </div>
    </div>
  );
}

function IngressForm({ config, onChange }: { config: IngressConfig; onChange: (c: IngressConfig) => void }) {
  const set = <K extends keyof IngressConfig>(k: K, v: IngressConfig[K]) => onChange({ ...config, [k]: v });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><Input value={config.name} onChange={(v) => set("name", v)} placeholder="my-ingress" /></Field>
        <Field label="Namespace"><Input value={config.namespace} onChange={(v) => set("namespace", v)} placeholder="default" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Host"><Input value={config.host} onChange={(v) => set("host", v)} placeholder="app.example.com" /></Field>
        <Field label="Path"><Input value={config.path} onChange={(v) => set("path", v)} placeholder="/" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Backend Service Name"><Input value={config.serviceName} onChange={(v) => set("serviceName", v)} placeholder="my-service" /></Field>
        <Field label="Backend Service Port"><Input value={config.servicePort} onChange={(v) => set("servicePort", v)} placeholder="80" /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
        <input type="checkbox" checked={config.tlsEnabled} onChange={(e) => set("tlsEnabled", e.target.checked)}
          className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
        Enable TLS
      </label>
      {config.tlsEnabled && (
        <Field label="TLS Secret Name">
          <Input value={config.secretName} onChange={(v) => set("secretName", v)} placeholder="tls-secret" />
        </Field>
      )}
    </div>
  );
}

function HPAForm({ config, onChange }: { config: HPAConfig; onChange: (c: HPAConfig) => void }) {
  const set = <K extends keyof HPAConfig>(k: K, v: HPAConfig[K]) => onChange({ ...config, [k]: v });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="HPA Name"><Input value={config.name} onChange={(v) => set("name", v)} placeholder="my-hpa" /></Field>
        <Field label="Namespace"><Input value={config.namespace} onChange={(v) => set("namespace", v)} placeholder="default" /></Field>
      </div>
      <Field label="Target Deployment Name">
        <Input value={config.targetName} onChange={(v) => set("targetName", v)} placeholder="my-app" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Min Replicas">
          <input type="number" min={1} value={config.minReplicas} onChange={(e) => set("minReplicas", parseInt(e.target.value) || 1)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 w-full" />
        </Field>
        <Field label="Max Replicas">
          <input type="number" min={1} value={config.maxReplicas} onChange={(e) => set("maxReplicas", parseInt(e.target.value) || 10)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 w-full" />
        </Field>
        <Field label="CPU Target (%)">
          <input type="number" min={1} max={100} value={config.cpuUtilization} onChange={(e) => set("cpuUtilization", parseInt(e.target.value) || 70)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 w-full" />
        </Field>
      </div>
    </div>
  );
}

// ── Default configs ───────────────────────────────────────────────────────────

const defaultDeployment: DeploymentConfig = {
  name: "", namespace: "default", image: "", tag: "latest", replicas: 1,
  cpuRequest: "", cpuLimit: "", memRequest: "", memLimit: "",
  containerPort: "", envVars: [], labels: [], pullPolicy: "IfNotPresent",
  generateService: false, serviceType: "ClusterIP", servicePort: "",
};
const defaultService: ServiceConfig = { name: "", namespace: "default", type: "ClusterIP", port: "80", targetPort: "8080", selector: [{ key: "app", value: "" }] };
const defaultConfigMap: ConfigMapConfig = { name: "", namespace: "default", data: [{ key: "", value: "" }] };
const defaultIngress: IngressConfig = { name: "", namespace: "default", host: "", path: "/", serviceName: "", servicePort: "80", tlsEnabled: false, secretName: "" };
const defaultHPA: HPAConfig = { name: "", namespace: "default", targetName: "", minReplicas: 1, maxReplicas: 10, cpuUtilization: 70 };

const RESOURCE_TYPES: ResourceType[] = ["Deployment", "Service", "ConfigMap", "Ingress", "HPA"];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function K8sGeneratorPage() {
  const [resource, setResource] = useState<ResourceType>("Deployment");
  const [deployment, setDeployment] = useState<DeploymentConfig>(defaultDeployment);
  const [service, setService] = useState<ServiceConfig>(defaultService);
  const [configMap, setConfigMap] = useState<ConfigMapConfig>(defaultConfigMap);
  const [ingress, setIngress] = useState<IngressConfig>(defaultIngress);
  const [hpa, setHPA] = useState<HPAConfig>(defaultHPA);
  const [copied, setCopied] = useState(false);

  const yaml = useMemo(() => {
    if (resource === "Deployment") return generateDeployment(deployment);
    if (resource === "Service") return generateService(service);
    if (resource === "ConfigMap") return generateConfigMap(configMap);
    if (resource === "Ingress") return generateIngress(ingress);
    return generateHPA(hpa);
  }, [resource, deployment, service, configMap, ingress, hpa]);

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
    a.download = `${resource.toLowerCase()}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Container className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Kubernetes Manifest Generator</h1>
            <p className="text-xs text-zinc-500">Generate production-ready K8s YAML from a form</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy YAML"}
          </button>
          <button onClick={download} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      {/* Resource type tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs w-fit shrink-0">
        {RESOURCE_TYPES.map((r) => (
          <button
            key={r}
            onClick={() => setResource(r)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              resource === r ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left: form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto no-scrollbar">
          {resource === "Deployment" && <DeploymentForm config={deployment} onChange={setDeployment} />}
          {resource === "Service" && <ServiceForm config={service} onChange={setService} />}
          {resource === "ConfigMap" && <ConfigMapForm config={configMap} onChange={setConfigMap} />}
          {resource === "Ingress" && <IngressForm config={ingress} onChange={setIngress} />}
          {resource === "HPA" && <HPAForm config={hpa} onChange={setHPA} />}
        </div>

        {/* Right: YAML output */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto no-scrollbar">
          <p className="text-xs text-zinc-600 mb-3 uppercase tracking-wider font-medium">{resource.toLowerCase()}.yaml</p>
          <pre className="font-mono text-xs text-zinc-300 whitespace-pre leading-5">{yaml}</pre>
        </div>
      </div>
    </div>
  );
}
