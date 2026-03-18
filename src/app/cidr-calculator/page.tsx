"use client";

import { useState, useMemo } from "react";
import { Network, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

// ── Pure CIDR math ──────────────────────────────────────────────────────────

function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function numToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function numToBinary(n: number): string {
  return n.toString(2).padStart(32, "0").match(/.{8}/g)!.join(".");
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
  });
}

function isValidCidr(cidr: string): boolean {
  const [ip, prefix] = cidr.split("/");
  if (!ip || prefix === undefined) return false;
  const pfx = parseInt(prefix, 10);
  return isValidIp(ip) && !isNaN(pfx) && pfx >= 0 && pfx <= 32;
}

interface CidrInfo {
  ip: string;
  prefix: number;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalIPs: number;
  usableHosts: number;
  wildcardMask: string;
  ipClass: string;
  ipBinary: string;
  maskBinary: string;
  networkBinary: string;
}

function parseCidr(cidr: string): CidrInfo {
  const [ip, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);

  const ipNum = ipToNum(ip);
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const wildcard = (~mask) >>> 0;

  const firstHost = prefix < 31 ? network + 1 : network;
  const lastHost = prefix < 31 ? broadcast - 1 : broadcast;
  const totalIPs = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalIPs : Math.max(0, totalIPs - 2);

  const firstOctet = parseInt(ip.split(".")[0], 10);
  let ipClass = "A";
  if (firstOctet >= 128 && firstOctet <= 191) ipClass = "B";
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = "C";
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = "D (Multicast)";
  else if (firstOctet >= 240) ipClass = "E (Reserved)";

  return {
    ip,
    prefix,
    subnetMask: numToIp(mask),
    networkAddress: numToIp(network),
    broadcastAddress: numToIp(broadcast),
    firstHost: numToIp(firstHost),
    lastHost: numToIp(lastHost),
    totalIPs,
    usableHosts,
    wildcardMask: numToIp(wildcard),
    ipClass,
    ipBinary: numToBinary(ipNum),
    maskBinary: numToBinary(mask),
    networkBinary: numToBinary(network),
  };
}

function isIpInRange(ip: string, cidr: string): boolean {
  if (!isValidIp(ip) || !isValidCidr(cidr)) return false;
  const info = parseCidr(cidr);
  const ipNum = ipToNum(ip);
  const netNum = ipToNum(info.networkAddress);
  const bcastNum = ipToNum(info.broadcastAddress);
  return ipNum >= netNum && ipNum <= bcastNum;
}

// ── Common subnets reference ────────────────────────────────────────────────

const COMMON_CIDRS = [
  { label: "Class A Private", cidr: "10.0.0.0/8" },
  { label: "Class B Private", cidr: "172.16.0.0/12" },
  { label: "Class C Private", cidr: "192.168.0.0/16" },
  { label: "Loopback", cidr: "127.0.0.0/8" },
  { label: "VPC /16", cidr: "10.0.0.0/16" },
  { label: "Subnet /24", cidr: "10.0.1.0/24" },
  { label: "Subnet /28", cidr: "10.0.1.0/28" },
  { label: "Host only /32", cidr: "192.168.1.1/32" },
];

// ── Copy button ─────────────────────────────────────────────────────────────

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-1 p-0.5 text-zinc-600 hover:text-zinc-300 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── Binary visualizer ────────────────────────────────────────────────────────

function BinaryBar({ binary, prefix }: { binary: string; prefix: number }) {
  const bits = binary.replace(/\./g, "");
  return (
    <div className="flex flex-wrap gap-px font-mono text-[10px]">
      {bits.split("").map((bit, i) => {
        const isNet = i < prefix;
        const isDot = i === 7 || i === 15 || i === 23;
        return (
          <span key={i}>
            {isDot && <span className="text-zinc-600 mx-0.5">.</span>}
            <span
              className={`inline-flex w-4 h-5 items-center justify-center rounded-sm ${
                isNet
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {bit}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ── Result row ───────────────────────────────────────────────────────────────

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800/60 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <div className="flex items-center gap-1">
        <span className={`text-sm text-zinc-200 ${mono ? "font-mono" : ""}`}>{value}</span>
        <CopyValue value={value} />
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function CidrCalculatorPage() {
  const [input, setInput] = useState("");
  const [checkIp, setCheckIp] = useState("");
  const [showBinary, setShowBinary] = useState(false);

  const info = useMemo(() => {
    const trimmed = input.trim();
    if (!isValidCidr(trimmed)) return null;
    return parseCidr(trimmed);
  }, [input]);

  const inRange = useMemo(() => {
    if (!info || !checkIp.trim()) return null;
    return isIpInRange(checkIp.trim(), `${info.networkAddress}/${info.prefix}`);
  }, [info, checkIp]);

  const isError = input.length > 5 && !info;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Network className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">CIDR / Subnet Calculator</h1>
          <p className="text-xs text-zinc-500">Network address, host range, subnet mask from CIDR notation</p>
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 192.168.1.0/24"
            spellCheck={false}
            className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors ${
              isError
                ? "border-red-500/50 focus:border-red-500"
                : "border-zinc-800 focus:border-zinc-600"
            }`}
          />
          {isError && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400">
              Invalid CIDR
            </span>
          )}
        </div>

        {/* Quick-pick */}
        <div className="flex flex-wrap gap-1.5">
          {COMMON_CIDRS.map((c) => (
            <button
              key={c.cidr}
              onClick={() => setInput(c.cidr)}
              className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors font-mono"
            >
              {c.cidr}
              <span className="ml-1.5 text-zinc-600 font-sans">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {info && (
        <>
          {/* Main info card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Network Info</p>
            </div>
            <div className="px-4">
              <Row label="Network Address" value={info.networkAddress} />
              <Row label="Broadcast Address" value={info.broadcastAddress} />
              <Row label="Subnet Mask" value={info.subnetMask} />
              <Row label="Wildcard Mask" value={info.wildcardMask} />
              <Row label="First Usable Host" value={info.prefix >= 32 ? "N/A" : info.firstHost} />
              <Row label="Last Usable Host" value={info.prefix >= 32 ? "N/A" : info.lastHost} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total IPs", value: info.totalIPs.toLocaleString() },
              { label: "Usable Hosts", value: info.usableHosts.toLocaleString() },
              { label: "IP Class", value: info.ipClass },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                <p className="text-lg font-semibold text-white font-mono">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Binary visualizer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowBinary((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="uppercase tracking-wider">Binary Representation</span>
              {showBinary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showBinary && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-800">
                <div className="pt-3">
                  <p className="text-xs text-zinc-600 mb-1.5">IP Address</p>
                  <BinaryBar binary={info.ipBinary} prefix={info.prefix} />
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-1.5">Subnet Mask</p>
                  <BinaryBar binary={info.maskBinary} prefix={info.prefix} />
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-1.5">Network Address</p>
                  <BinaryBar binary={info.networkBinary} prefix={info.prefix} />
                </div>
                <p className="text-xs text-zinc-700 pt-1">
                  <span className="inline-block w-3 h-3 bg-indigo-500/20 rounded-sm mr-1 align-middle" />
                  Network bits &nbsp;
                  <span className="inline-block w-3 h-3 bg-zinc-800 rounded-sm mr-1 align-middle" />
                  Host bits
                </p>
              </div>
            )}
          </div>

          {/* IP in range checker */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Is IP in this range?</p>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={checkIp}
                onChange={(e) => setCheckIp(e.target.value)}
                placeholder="e.g. 192.168.1.55"
                spellCheck={false}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
              {checkIp && inRange !== null && (
                <span
                  className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
                    inRange
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {inRange ? "In range" : "Out of range"}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!info && !isError && (
        <div className="text-center py-16 text-zinc-600 text-sm">
          Enter a CIDR block above to calculate subnet details
        </div>
      )}
    </div>
  );
}
