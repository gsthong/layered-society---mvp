import { globalPRNG } from "../core/PRNG";
import React, { useState } from "react";
import { Agent, AgentMilestone } from "../types";
import { Sparkles, History, Bot, Loader2, Bookmark, ShieldAlert, Zap, Skull, RefreshCw, Flame } from "lucide-react";

interface ReflectionPanelProps {
  agent: Agent | null;
  onUpdateAgent: () => void;
}

export const ReflectionPanel: React.FC<ReflectionPanelProps> = ({
  agent,
}) => {
  const [loading, setLoading] = useState(false);
  const [lastResponseInfo, setLastResponseInfo] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  if (!agent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#5C6570] bg-[#101317] border border-[#20252C] font-mono text-xs">
        <p className="text-[#C9CFD6] font-bold uppercase tracking-wider mb-2">
          [NO REFLECTIVE SOUL SELECTED]
        </p>
        <p className="text-[11px] text-[#5C6570] max-w-xs">
          SELECT AN AGENT NODE TO VIEW BIOGRAPHICAL MILESTONES & GEMINI L4 REFLECTIONS
        </p>
      </div>
    );
  }

  const handleFetchGeminiReflection = async () => {
    if (loading) return;
    setLoading(true);
    setLastResponseInfo(null);

    try {
      const response = await fetch("/api/gemini/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.id,
          agentRole: agent.isSleeper ? "Sleeper Infiltrator" : "Standard Citizen",
          energy: agent.energy,
          belief: agent.belief,
          isSleeper: agent.isSleeper,
          recentEvents: agent.memoryStream.slice(0, 5),
          neighborsCount: agent.neighborsCount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newReflection = {
          tick: agent.lifetimeTicks,
          thought: data.thought,
          strategy: data.strategy,
          isFallback: data.fallback || false,
          timestamp: new Date().toLocaleTimeString(),
        };

        agent.reflections.unshift(newReflection);

        // Also append to biography logs
        if (!agent.biographyLogs) agent.biographyLogs = [];
        agent.biographyLogs.unshift({
          id: globalPRNG.nextFloat(0, 1).toString(36).substring(2, 9),
          tick: agent.lifetimeTicks,
          type: "reflection",
          message: `L4 Generative Reflection: "${data.thought}" Strategy: ${data.strategy}`,
          timestamp: new Date().toLocaleTimeString(),
        });

        if (data.fallback) {
          setLastResponseInfo("GENERATED VIA OFFLINE LOGIC.");
        } else {
          setLastResponseInfo("GENERATED LIVE VIA GEMINI 3.6 FLASH");
        }
      }
    } catch (err: any) {
      console.error("Reflection error:", err);
      setLastResponseInfo("ERROR FETCHING GEMINI REFLECTION.");
    } finally {
      setLoading(false);
    }
  };

  const bioLogs: AgentMilestone[] = agent.biographyLogs || [];

  const filteredLogs = bioLogs.filter((log) => {
    if (filterType === "ALL") return true;
    return log.type.toUpperCase() === filterType;
  });

  const getMilestoneBadge = (type: AgentMilestone["type"]) => {
    switch (type) {
      case "birth":
        return { label: "BIRTH", color: "bg-[#8FE0AE]/10 text-[#8FE0AE] border-[#8FE0AE]/30", icon: <Sparkles className="w-2.5 h-2.5" /> };
      case "harvest":
        return { label: "HARVEST", color: "bg-[#8FE0AE]/10 text-[#8FE0AE] border-[#8FE0AE]/30", icon: <Zap className="w-2.5 h-2.5" /> };
      case "influence":
        return { label: "INFLUENCE", color: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30", icon: <Bookmark className="w-2.5 h-2.5" /> };
      case "disaster":
        return { label: "DISASTER", color: "bg-[#E2673F]/10 text-[#E2673F] border-[#E2673F]/30", icon: <Flame className="w-2.5 h-2.5" /> };
      case "depletion":
        return { label: "DEPLETED", color: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30", icon: <Skull className="w-2.5 h-2.5" /> };
      case "respawn":
        return { label: "RESPAWN", color: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30", icon: <RefreshCw className="w-2.5 h-2.5" /> };
      case "sleeper":
        return { label: "SLEEPER", color: "bg-[#E2673F]/10 text-[#E2673F] border-[#E2673F]/30", icon: <ShieldAlert className="w-2.5 h-2.5" /> };
      case "reflection":
        return { label: "REFLECTION", color: "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30", icon: <Bot className="w-2.5 h-2.5" /> };
      default:
        return { label: "EVENT", color: "bg-[#5C6570]/10 text-[#C9CFD6] border-[#5C6570]/30", icon: <History className="w-2.5 h-2.5" /> };
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#101317] border border-[#20252C] p-3 text-[#C9CFD6] font-mono text-xs select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#20252C] mb-2">
        <div>
          <h3 className="text-xs font-bold text-[#C9CFD6] uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[#8FE0AE]">●</span> L4 GENERATIVE SOUL & BIOGRAPHY — AGENT #{agent.id < 10 ? `0${agent.id}` : agent.id}
          </h3>
          <p className="text-[10px] text-[#5C6570] font-mono">
            BIOGRAPHICAL MILESTONES • MEMORY STREAM • INNER MONOLOGUE
          </p>
        </div>

        <button
          onClick={handleFetchGeminiReflection}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] uppercase font-mono px-2.5 py-1 bg-[#0A0C0F] hover:bg-[#151920] text-[#8FE0AE] border border-[#8FE0AE] transition-colors cursor-pointer disabled:opacity-50 font-bold shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Bot className="w-3 h-3" />
          )}
          {loading ? "REFLECTING..." : "GEMINI REFLECT"}
        </button>
      </div>

      {/* Quick Agent Overview Bar */}
      <div className="grid grid-cols-4 gap-1.5 mb-2 bg-[#0A0C0F] p-1.5 border border-[#20252C] text-[10px]">
        <div>
          <span className="text-[#5C6570] block">ROLE:</span>
          <span className={agent.isSleeper ? "text-[#E2673F] font-bold" : "text-[#8FE0AE] font-bold"}>
            {agent.isSleeper ? "SLEEPER INFILTRATOR" : "CITIZEN"}
          </span>
        </div>
        <div>
          <span className="text-[#5C6570] block">HP / ENERGY:</span>
          <span className="text-[#8FE0AE] font-bold">{agent.energy.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-[#5C6570] block">GATHERED:</span>
          <span className="text-[#C9CFD6] font-bold">{agent.resourcesGathered.toFixed(0)} E</span>
        </div>
        <div>
          <span className="text-[#5C6570] block">LIFETIME:</span>
          <span className="text-[#C9CFD6] font-bold">{agent.lifetimeTicks} Ticks</span>
        </div>
      </div>

      {lastResponseInfo && (
        <div className="mb-2 px-2 py-1 bg-[#0A0C0F] border border-[#20252C] text-[10px] font-mono text-[#8FE0AE]">
          {lastResponseInfo}
        </div>
      )}

      {/* Latest Reflection Display */}
      {agent.reflections.length > 0 ? (
        <div className="bg-[#0A0C0F] p-2 border border-[#20252C] mb-2 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-[#8FE0AE] font-mono mb-1 uppercase font-bold">
            <span className="flex items-center gap-1">
              LATEST INNER REFLECTION
            </span>
            <span className="text-[#5C6570]">{agent.reflections[0].timestamp}</span>
          </div>

          <p className="text-[11px] text-[#C9CFD6] mb-1.5 leading-relaxed bg-[#101317] p-2 border border-[#20252C]">
            "{agent.reflections[0].thought}"
          </p>

          <div className="text-[10px] font-mono bg-[#101317] p-1.5 border border-[#20252C] text-[#C9CFD6]">
            <strong className="text-[#8FE0AE] uppercase">STRATEGY:</strong>{" "}
            {agent.reflections[0].strategy}
          </div>
        </div>
      ) : null}

      {/* Biographical Narrative Log Feed */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0A0C0F] p-2 border border-[#20252C]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-[#8FE0AE] uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3 h-3" />
            BIOGRAPHICAL MILESTONES ({filteredLogs.length})
          </h4>

          {/* Filter Pills */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {["ALL", "BIRTH", "HARVEST", "INFLUENCE", "DISASTER", "DEPLETION", "SLEEPER"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`text-[9px] uppercase px-1.5 py-0.5 border font-mono transition-colors cursor-pointer ${
                  filterType === cat
                    ? "bg-[#8FE0AE] text-[#0A0C0F] border-[#8FE0AE] font-bold"
                    : "bg-[#101317] text-[#5C6570] border-[#20252C] hover:text-[#C9CFD6]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Milestone Timeline List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-6 text-[10px] text-[#5C6570] uppercase">
              NO MILESTONES MATCHING FILTER.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getMilestoneBadge(log.type);
              return (
                <div
                  key={log.id}
                  className="p-2 bg-[#101317] border border-[#20252C] text-[#C9CFD6] flex flex-col gap-1 hover:border-[#303844] transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`inline-flex items-center gap-1 border px-1.5 py-0.2 font-bold ${badge.color}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-[#5C6570] font-mono text-[10px]">
                      Tick #{log.tick} • {log.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#C9CFD6]">
                    {log.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

