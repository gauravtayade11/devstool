"use client";

import React, { useState, useMemo } from "react";
import { Search, Server, Network, Filter, ArrowUpDown } from "lucide-react";

interface PortInfo {
  port: number;
  protocol: "TCP" | "UDP" | "TCP/UDP";
  service: string;
  description: string;
}

const COMMON_PORTS: PortInfo[] = [
  { port: 20, protocol: "TCP", service: "FTP-DATA", description: "File Transfer Protocol (Data Transfer)" },
  { port: 21, protocol: "TCP", service: "FTP", description: "File Transfer Protocol (Command Control)" },
  { port: 22, protocol: "TCP", service: "SSH", description: "Secure Shell - Secure log in and data transfer" },
  { port: 23, protocol: "TCP", service: "Telnet", description: "Unencrypted text communications" },
  { port: 25, protocol: "TCP", service: "SMTP", description: "Simple Mail Transfer Protocol (Email Routing)" },
  { port: 53, protocol: "TCP/UDP", service: "DNS", description: "Domain Name System" },
  { port: 67, protocol: "UDP", service: "DHCP", description: "Dynamic Host Configuration Protocol (Server)" },
  { port: 68, protocol: "UDP", service: "DHCP", description: "Dynamic Host Configuration Protocol (Client)" },
  { port: 80, protocol: "TCP", service: "HTTP", description: "Hypertext Transfer Protocol (Web)" },
  { port: 110, protocol: "TCP", service: "POP3", description: "Post Office Protocol v3 (Email Retrieval)" },
  { port: 123, protocol: "UDP", service: "NTP", description: "Network Time Protocol" },
  { port: 137, protocol: "TCP/UDP", service: "NetBIOS-NS", description: "NetBIOS Name Service" },
  { port: 138, protocol: "TCP/UDP", service: "NetBIOS-DGM", description: "NetBIOS Datagram Service" },
  { port: 139, protocol: "TCP/UDP", service: "NetBIOS-SSN", description: "NetBIOS Session Service" },
  { port: 143, protocol: "TCP", service: "IMAP", description: "Internet Message Access Protocol" },
  { port: 161, protocol: "UDP", service: "SNMP", description: "Simple Network Management Protocol" },
  { port: 389, protocol: "TCP/UDP", service: "LDAP", description: "Lightweight Directory Access Protocol" },
  { port: 443, protocol: "TCP", service: "HTTPS", description: "Hypertext Transfer Protocol Secure (Web)" },
  { port: 445, protocol: "TCP", service: "SMB", description: "Server Message Block (Windows File Sharing)" },
  { port: 465, protocol: "TCP", service: "SMTPS", description: "SMTP over SSL (Deprecated, but common)" },
  { port: 514, protocol: "UDP", service: "Syslog", description: "System Logging Protocol" },
  { port: 587, protocol: "TCP", service: "SMTP", description: "SMTP (Message Submission)" },
  { port: 636, protocol: "TCP/UDP", service: "LDAPS", description: "LDAP over SSL" },
  { port: 873, protocol: "TCP", service: "Rsync", description: "Rsync File Transfer Services" },
  { port: 993, protocol: "TCP", service: "IMAPS", description: "IMAP over SSL" },
  { port: 995, protocol: "TCP", service: "POP3S", description: "POP3 over SSL" },
  { port: 1080, protocol: "TCP/UDP", service: "SOCKS", description: "SOCKS Proxy" },
  { port: 1194, protocol: "UDP", service: "OpenVPN", description: "OpenVPN Default Port" },
  { port: 1433, protocol: "TCP", service: "MS-SQL", description: "Microsoft SQL Server Database" },
  { port: 1521, protocol: "TCP", service: "Oracle", description: "Oracle Database Default Listener" },
  { port: 1723, protocol: "TCP", service: "PPTP", description: "Point-to-Point Tunneling Protocol" },
  { port: 2049, protocol: "TCP/UDP", service: "NFS", description: "Network File System" },
  { port: 3128, protocol: "TCP", service: "Squid", description: "Squid Web Proxy" },
  { port: 3306, protocol: "TCP", service: "MySQL", description: "MySQL Database" },
  { port: 3389, protocol: "TCP", service: "RDP", description: "Remote Desktop Protocol (Windows)" },
  { port: 5432, protocol: "TCP", service: "PostgreSQL", description: "PostgreSQL Database" },
  { port: 5672, protocol: "TCP", service: "AMQP", description: "Advanced Message Queuing Protocol (RabbitMQ)" },
  { port: 5900, protocol: "TCP", service: "VNC", description: "Virtual Network Computing" },
  { port: 6379, protocol: "TCP", service: "Redis", description: "Redis Key-Value Store" },
  { port: 8080, protocol: "TCP", service: "HTTP-ALT", description: "HTTP Alternate (Commonly Tomcat, Proxy)" },
  { port: 8443, protocol: "TCP", service: "HTTPS-ALT", description: "HTTPS Alternate" },
  { port: 9092, protocol: "TCP", service: "Kafka", description: "Apache Kafka Default Broker" },
  { port: 9200, protocol: "TCP", service: "Elasticsearch", description: "Elasticsearch REST API" },
  { port: 11211, protocol: "TCP/UDP", service: "Memcached", description: "Memcached Memory Cache" },
  { port: 27017, protocol: "TCP", service: "MongoDB", description: "MongoDB Database Default" },
];

type SortField = "port" | "service";
type SortOrder = "asc" | "desc";

export default function PortReference() {
  const [searchTerm, setSearchTerm] = useState("");
  const [protocolFilter, setProtocolFilter] = useState<"All" | "TCP" | "UDP">("All");
  const [sortField, setSortField] = useState<SortField>("port");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const filteredAndSortedPorts = useMemo(() => {
    let result = COMMON_PORTS;

    // Filter by protocol
    if (protocolFilter !== "All") {
      result = result.filter(p => p.protocol.includes(protocolFilter));
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.port.toString().includes(lowerSearch) ||
        p.service.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "port") {
        comparison = a.port - b.port;
      } else if (sortField === "service") {
        comparison = a.service.localeCompare(b.service);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [searchTerm, protocolFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getProtocolColor = (protocol: string) => {
    if (protocol === "TCP") return "text-blue-400 bg-blue-400/10 border-blue-500/20";
    if (protocol === "UDP") return "text-purple-400 bg-purple-400/10 border-purple-500/20";
    return "text-teal-400 bg-teal-400/10 border-teal-500/20"; // TCP/UDP
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <Server className="w-6 h-6 mr-3 text-rose-500" />
          Port Reference Guide
        </h1>
        <p className="text-zinc-400 text-sm mt-1">A searchable database of common networking ports, protocols, and their descriptions.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                  type="text"
                  placeholder="Search by port, service (e.g., SSH), or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-shadow"
              />
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-1 flex">
                  {["All", "TCP", "UDP"].map((p) => (
                      <button
                          key={p}
                          onClick={() => setProtocolFilter(p as any)}
                          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                              protocolFilter === p 
                              ? "bg-zinc-800 text-white shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                          }`}
                      >
                          {p}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      <div className="flex-1 rounded-xl border border-zinc-800 bg-[#121214] overflow-hidden flex flex-col shadow-xl">
         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr className="bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 font-semibold select-none">
                        <th 
                           className="py-4 px-6 cursor-pointer hover:text-zinc-300 transition-colors group w-32"
                           onClick={() => toggleSort("port")}
                        >
                           <div className="flex items-center">
                               Port Number
                               <ArrowUpDown className={`w-3.5 h-3.5 ml-2 transition-opacity ${sortField === 'port' ? 'opacity-100 text-rose-500' : 'opacity-0 group-hover:opacity-50'}`} />
                           </div>
                        </th>
                        <th className="py-4 px-6 w-32">Protocol</th>
                        <th 
                           className="py-4 px-6 cursor-pointer hover:text-zinc-300 transition-colors group w-48"
                           onClick={() => toggleSort("service")}
                        >
                           <div className="flex items-center">
                               Service
                               <ArrowUpDown className={`w-3.5 h-3.5 ml-2 transition-opacity ${sortField === 'service' ? 'opacity-100 text-rose-500' : 'opacity-0 group-hover:opacity-50'}`} />
                           </div>
                        </th>
                        <th className="py-4 px-6">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                    {filteredAndSortedPorts.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-12 text-center text-zinc-500">
                                <Network className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                No ports found matching your criteria.
                            </td>
                        </tr>
                    ) : (
                        filteredAndSortedPorts.map((portInfo) => (
                            <tr key={`${portInfo.port}-${portInfo.protocol}`} className="hover:bg-zinc-900/50 transition-colors group">
                                <td className="py-3 px-6 font-mono text-rose-400 font-bold text-[15px]">
                                    {portInfo.port}
                                </td>
                                <td className="py-3 px-6">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider border ${getProtocolColor(portInfo.protocol)}`}>
                                        {portInfo.protocol}
                                    </span>
                                </td>
                                <td className="py-3 px-6 font-semibold text-zinc-300 group-hover:text-white transition-colors">
                                    {portInfo.service}
                                </td>
                                <td className="py-3 px-6 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                    {portInfo.description}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
             </table>
         </div>
      </div>
    </div>
  );
}
