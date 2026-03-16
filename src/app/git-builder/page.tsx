"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Terminal, Copy, Check, Info } from "lucide-react";

type GitCommandCategory = "branching" | "remote" | "undo" | "stashing";

interface CommandTemplate {
  id: string;
  name: string;
  category: GitCommandCategory;
  description: string;
  template: string;
  args: {
    id: string;
    label: string;
    type: "text" | "checkbox";
    default?: string;
    placeholder?: string;
    helpText?: string;
  }[];
}

const COMMANDS: CommandTemplate[] = [
  // Branching
  {
    id: "create-branch",
    name: "Create & Switch Branch",
    category: "branching",
    description: "Create a new branch and switch to it immediately.",
    template: "git checkout -b {branch_name} {base_branch}",
    args: [
      { id: "branch_name", label: "New Branch Name", type: "text", placeholder: "feature/new-ui" },
      { id: "base_branch", label: "Base Branch (Optional)", type: "text", placeholder: "main", helpText: "Leave empty to branch from current." }
    ]
  },
  {
    id: "delete-branch",
    name: "Delete Branch",
    category: "branching",
    description: "Delete a local branch. Force delete if unmerged.",
    template: "git branch {force} {branch_name}",
    args: [
      { id: "branch_name", label: "Branch to Delete", type: "text", placeholder: "feature/old-ui" },
      { id: "force", label: "Force Delete (-D)", type: "checkbox", default: "false" }
    ]
  },
  
  // Remote
  {
    id: "push-new",
    name: "Push New Branch",
    category: "remote",
    description: "Push a newly created local branch to the remote repository and set upstream.",
    template: "git push -u origin {branch_name}",
    args: [
      { id: "branch_name", label: "Branch Name", type: "text", placeholder: "feature/new-ui" }
    ]
  },
  {
    id: "fetch-prune",
    name: "Fetch & Prune",
    category: "remote",
    description: "Fetch from remote and remove local references to deleted remote branches.",
    template: "git fetch {remote} --prune",
    args: [
      { id: "remote", label: "Remote", type: "text", default: "origin", placeholder: "origin" }
    ]
  },

  // Undo
  {
    id: "reset-soft",
    name: "Undo Last Commit (Keep Changes)",
    category: "undo",
    description: "Undo the last commit but keep the files modified in your working directory.",
    template: "git reset --soft HEAD~{count}",
    args: [
      { id: "count", label: "Number of commits", type: "text", default: "1", placeholder: "1" }
    ]
  },
  {
    id: "reset-hard",
    name: "Hard Reset (DESTROY Changes)",
    category: "undo",
    description: "Completely discard all local changes and commits, reverting to a specific state.",
    template: "git reset --hard {target}",
    args: [
      { id: "target", label: "Target (Branch/Commit)", type: "text", default: "origin/main", placeholder: "origin/main" }
    ]
  },

  // Stashing
  {
    id: "stash-save",
    name: "Save Stash with Message",
    category: "stashing",
    description: "Save your uncommitted changes to a new stash with a descriptive message.",
    template: 'git stash push -m "{message}" {include_untracked}',
    args: [
      { id: "message", label: "Stash Message", type: "text", placeholder: "WIP: auth flow" },
      { id: "include_untracked", label: "Include Untracked Files (-u)", type: "checkbox", default: "false" }
    ]
  }
];

export default function GitBuilder() {
  const [activeCategory, setActiveCategory] = useState<GitCommandCategory>("branching");
  const [selectedCmdId, setSelectedCmdId] = useState<string>(COMMANDS[0].id);
  const [argValues, setArgValues] = useState<Record<string, string | boolean>>({});
  const [generatedCommand, setGeneratedCommand] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const selectedCommand = COMMANDS.find(c => c.id === selectedCmdId);
  const categoryCommands = COMMANDS.filter(c => c.category === activeCategory);

  // Initialize default arguments when command changes
  useEffect(() => {
    if (selectedCommand) {
      const initialArgs: Record<string, string | boolean> = {};
      selectedCommand.args.forEach(arg => {
        if (arg.type === "checkbox") {
          initialArgs[arg.id] = arg.default === "true";
        } else {
          initialArgs[arg.id] = arg.default || "";
        }
      });
      setArgValues(initialArgs);
    }
  }, [selectedCmdId]);

  // Generate the actual command string
  useEffect(() => {
    if (!selectedCommand) return;

    let cmd = selectedCommand.template;
    selectedCommand.args.forEach(arg => {
      const val = argValues[arg.id];
      
      if (arg.type === "checkbox") {
        if (arg.id === "force") cmd = cmd.replace("{force}", val ? "-D" : "-d");
        else if (arg.id === "include_untracked") cmd = cmd.replace("{include_untracked}", val ? "-u" : "");
      } else {
        const strVal = (val as string) || "";
        // Remove token + preceding space if empty (optional args), else substitute
        if (strVal) {
          cmd = cmd.replace(`{${arg.id}}`, strVal);
        } else {
          cmd = cmd.replace(` {${arg.id}}`, "").replace(`{${arg.id}}`, "");
        }
      }
    });

    // Cleanup extra spaces
    cmd = cmd.replace(/\s+/g, ' ').trim();
    setGeneratedCommand(cmd);
  }, [argValues, selectedCommand]);

  const handleArgChange = (id: string, value: string | boolean) => {
    setArgValues(prev => ({ ...prev, [id]: value }));
  };

  const handleCopy = async () => {
    if (!generatedCommand) return;
    try {
      await navigator.clipboard.writeText(generatedCommand);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <GitBranch className="w-6 h-6 mr-3 text-orange-500" />
          Git Command Builder
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Visually construct complex or rarely-used Git commands without checking the man pages.</p>
      </div>

      <div className="grid lg:grid-cols-[250px_1fr] gap-8">
        
        {/* Sidebar Categories */}
        <div className="flex flex-col space-y-2">
           <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">Categories</h3>
           {[
             { id: "branching", label: "Branching & Merging" },
             { id: "remote", label: "Remote & Fetching" },
             { id: "undo", label: "Undoing Changes" },
             { id: "stashing", label: "Stashing" },
           ].map(cat => (
             <button
               key={cat.id}
               onClick={() => {
                   setActiveCategory(cat.id as GitCommandCategory);
                   const firstCmd = COMMANDS.find(c => c.category === cat.id);
                   if (firstCmd) setSelectedCmdId(firstCmd.id);
               }}
               className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                 activeCategory === cat.id 
                 ? "bg-zinc-800 text-white shadow-sm" 
                 : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
               }`}
             >
               {cat.label}
             </button>
           ))}
        </div>

        {/* Main Builder Area */}
        <div className="flex flex-col space-y-6">
           
           {/* Command Selector */}
           <div className="grid sm:grid-cols-2 gap-3">
               {categoryCommands.map(cmd => (
                   <button
                       key={cmd.id}
                       onClick={() => setSelectedCmdId(cmd.id)}
                       className={`p-4 rounded-xl border text-left transition-all ${
                           selectedCmdId === cmd.id
                           ? "bg-zinc-900 border-orange-500/50 shadow-md ring-1 ring-orange-500/20"
                           : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                       }`}
                   >
                       <h4 className={`font-semibold text-sm mb-1 ${selectedCmdId === cmd.id ? "text-orange-400" : "text-zinc-300"}`}>
                           {cmd.name}
                       </h4>
                       <p className="text-xs text-zinc-500 line-clamp-2">{cmd.description}</p>
                   </button>
               ))}
           </div>

           {selectedCommand && (
               <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
                   <div className="mb-6 pb-6 border-b border-zinc-800/50">
                       <h3 className="text-lg font-semibold text-white mb-2">{selectedCommand.name}</h3>
                       <p className="text-sm text-zinc-400">{selectedCommand.description}</p>
                   </div>
                   
                   {/* Form Inputs */}
                   <div className="space-y-6">
                       {selectedCommand.args.map(arg => {
                           if (arg.type === "checkbox") {
                               return (
                                   <label key={arg.id} className="flex items-center space-x-3 cursor-pointer group w-max">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only"
                                                checked={argValues[arg.id] as boolean || false}
                                                onChange={(e) => handleArgChange(arg.id, e.target.checked)}
                                            />
                                            <div className={`w-5 h-5 rounded border ${argValues[arg.id] ? 'bg-orange-500 border-orange-500' : 'bg-zinc-950 border-zinc-700 group-hover:border-zinc-500'} transition-colors flex items-center justify-center`}>
                                                {argValues[arg.id] && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-zinc-300 select-none">{arg.label}</span>
                                            {arg.helpText && <span className="text-xs text-zinc-500">{arg.helpText}</span>}
                                        </div>
                                   </label>
                               );
                           }

                           return (
                               <div key={arg.id}>
                                   <label className="block text-sm font-medium text-zinc-300 mb-2">{arg.label}</label>
                                   <input
                                       type="text"
                                       placeholder={arg.placeholder || ""}
                                       value={(argValues[arg.id] as string) || ""}
                                       onChange={(e) => handleArgChange(arg.id, e.target.value)}
                                       className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 font-mono transition-shadow placeholder:text-zinc-700"
                                   />
                                   {arg.helpText && (
                                       <p className="mt-2 text-xs text-zinc-500 flex items-center">
                                           <Info className="w-3.5 h-3.5 mr-1.5" />
                                           {arg.helpText}
                                       </p>
                                   )}
                               </div>
                           );
                       })}
                   </div>
               </div>
           )}

           {/* Output Terminal */}
           <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0d0d0f] shadow-2xl relative">
              <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-500 flex items-center justify-between">
                 <div className="flex items-center">
                     <Terminal className="w-4 h-4 mr-2" />
                     Generated Command
                 </div>
                 <button 
                      onClick={handleCopy}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors flex items-center bg-zinc-800/50"
                      title="Copy Command"
                 >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                      <span className="text-[11px] font-medium uppercase tracking-wider">{isCopied ? 'Copied!' : 'Copy'}</span>
                 </button>
              </div>
              <div className="p-6 overflow-x-auto custom-scrollbar">
                  <div className="font-mono text-[15px] leading-relaxed relative">
                      <span className="text-orange-400 font-semibold mr-2">$</span>
                      <span className="text-zinc-200">
                          {generatedCommand.split(' ').map((part, i) => {
                              // Pseudo-highlighting
                              if (part.startsWith('git')) return <span key={i} className="text-cyan-400 mr-2">{part}</span>;
                              if (part.startsWith('-')) return <span key={i} className="text-zinc-500 mr-2">{part}</span>;
                              if (part.startsWith('[')) return <span key={i} className="text-rose-400/80 mr-2">{part}</span>;
                              return <span key={i} className="mr-2">{part}</span>;
                          })}
                      </span>
                  </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
