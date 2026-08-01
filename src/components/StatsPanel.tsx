import React, { useState } from "react";
import { HistoricalMetric, LogEntry, Agent } from "../types";
import {
  Activity,
  ShieldAlert,
  Zap,
  Award,
  ScrollText,
  Flame,
  RotateCcw,
  Radio,
  Clock,
  GitCommit,
  AlertTriangle,
} from "lucide-react";

interface StatsPanelProps {
  history: HistoricalMetric[];
  logs: LogEntry[];
  agents: Agent[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  history,
  logs,
  agents,
}) => {
  const [activeTab, setActiveTab] = useState<"timeline" | "charts" | "leaderboard" | "logs">("timeline");
  const [logFilter, setLogFilter] = useState<string>("all");
  const [timelineCategory, setTimelineCategory] = useState<string>("all");

  const latest = history[history.length - 1] || {
    avgEnergy: 0,
    avgBelief: 0,
    activeCount: 0,
    depletedCount: 0,
    sleeperCount: 0,
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "all") return true;
    return log.category === logFilter;
  });

  const timelineEvents = logs.filter((log) => {
    const msg = log.message.toLowerCase();
    const isDisaster = log.category === "environment" || msg.includes("disaster") || msg.includes("drought");
    const isSleeper = log.category === "sleeper" || msg.includes("sleeper") || msg.includes("activated") || msg.includes("deactivated");
    const isReset = log.category === "system" && (msg.includes("initialized") || msg.includes("reset"));
    const isBelief = log.category === "belief" || msg.includes("misinformation") || msg.includes("panic");

    if (timelineCategory === "all") {
      return isDisaster || isSleeper || isReset || isBelief;
    }
    if (timelineCategory === "disasters") return isDisaster;
    if (timelineCategory === "sleepers") return isSleeper;
    if (timelineCategory === "resets") return isReset;
    if (timelineCategory === "belief") return isBelief;
    return true;
  });

  const leaderboard = [...agents]
    .sort((a, b) => b.lifetimeTicks - a.lifetimeTicks)
    .slice(0, 5);

  const getTimelineBadge = (log: LogEntry) => {
    const msg = log.message.toLowerCase();
    if (log.category === "environment" || msg.includes("disaster") || msg.includes("drought")) {
      return {
        label: "DISASTER",
        badgeStyle: "bg-[#0A0C0F] text-[#E2673F] border-[#E2673F]",
      };
    }
    if (log.category === "sleeper" || msg.includes("sleeper")) {
      return {
        label: "SLEEPER",
        badgeStyle: "bg-[#0A0C0F] text-[#E2673F] border-[#E2673F]",
      };
    }
    if (msg.includes("initialized") || msg.includes("reset")) {
      return {
        label: "SYSTEM RESET",
        badgeStyle: "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]",
      };
    }
    if (log.category === "belief" || msg.includes("misinformation")) {
      return {
        label: "BELIEF SPIKE",
        badgeStyle: "bg-[#0A0C0F] text-[#E2673F] border-[#E2673F]",
      };
    }
    return {
      label: "SYSTEM LOG",
      badgeStyle: "bg-[#0A0C0F] text-[#5C6570] border-[#20252C]",
    };
  };

  return (
    <div className="h-full flex flex-col bg-[#101317] border border-[#20252C] p-3 text-[#C9CFD6] font-mono text-xs select-none">
      {/* Top Quick Stats Bar */}
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        <div className="bg-[#0A0C0F] p-1.5 border border-[#20252C] text-center">
          <div className="text-[9px] text-[#5C6570] uppercase">ACTIVE / DEPLETED</div>
          <div className="text-xs font-bold text-[#8FE0AE]">
            {latest.activeCount} <span className="text-[#5C6570]">/</span>{" "}
            <span className="text-[#5C6570]">{latest.depletedCount}</span>
          </div>
        </div>

        <div className="bg-[#0A0C0F] p-1.5 border border-[#20252C] text-center">
          <div className="text-[9px] text-[#5C6570] uppercase">AVG ENERGY</div>
          <div className="text-xs font-bold text-[#8FE0AE]">
            {latest.avgEnergy.toFixed(1)}%
          </div>
        </div>

        <div className="bg-[#0A0C0F] p-1.5 border border-[#20252C] text-center">
          <div className="text-[9px] text-[#5C6570] uppercase">AVG BELIEF</div>
          <div className="text-xs font-bold text-[#E2673F]">
            {(latest.avgBelief * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-[#0A0C0F] p-1.5 border border-[#20252C] text-center">
          <div className="text-[9px] text-[#5C6570] uppercase">COHESION</div>
          <div className="text-xs font-bold text-[#8FE0AE]">
            {((latest.socialCohesion ?? 1.0) * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-[#0A0C0F] p-1.5 border border-[#20252C] text-center">
          <div className="text-[9px] text-[#5C6570] uppercase">SLEEPERS</div>
          <div className="text-xs font-bold text-[#E2673F]">
            {latest.sleeperCount}
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-1 border-b border-[#20252C] pb-2 mb-2 text-[10px] uppercase font-bold">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-2 py-0.5 border transition-colors cursor-pointer ${
            activeTab === "timeline"
              ? "bg-[#0A0C0F] text-[#E2673F] border-[#E2673F]"
              : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C] hover:text-[#C9CFD6]"
          }`}
        >
          EVENT TIMELINE
        </button>

        <button
          onClick={() => setActiveTab("charts")}
          className={`px-2 py-0.5 border transition-colors cursor-pointer ${
            activeTab === "charts"
              ? "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]"
              : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C] hover:text-[#C9CFD6]"
          }`}
        >
          TRAJECTORIES
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-2 py-0.5 border transition-colors cursor-pointer ${
            activeTab === "leaderboard"
              ? "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]"
              : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C] hover:text-[#C9CFD6]"
          }`}
        >
          RANKS
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-2 py-0.5 border transition-colors cursor-pointer ${
            activeTab === "logs"
              ? "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]"
              : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C] hover:text-[#C9CFD6]"
          }`}
        >
          LOGS ({logs.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "timeline" && (
          <div className="h-full flex flex-col bg-[#0A0C0F] p-2 border border-[#20252C] text-xs">
            {/* Timeline Filter Header */}
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#20252C]">
              <div className="text-[10px] font-bold text-[#8FE0AE] uppercase tracking-wider">
                SIGNIFICANT EVENT HISTORY
              </div>

              <div className="flex items-center gap-1 text-[9px] uppercase">
                {[
                  { id: "all", label: "ALL" },
                  { id: "disasters", label: "DISASTERS" },
                  { id: "sleepers", label: "SLEEPERS" },
                  { id: "resets", label: "RESETS" },
                  { id: "belief", label: "BELIEF" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTimelineCategory(cat.id)}
                    className={`px-1.5 py-0.5 border transition-colors cursor-pointer ${
                      timelineCategory === cat.id
                        ? "bg-[#101317] text-[#8FE0AE] border-[#8FE0AE] font-bold"
                        : "bg-[#101317] text-[#5C6570] border-[#20252C]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Timeline List */}
            <div className="flex-1 overflow-y-auto pr-1">
              {timelineEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#5C6570] text-[10px] uppercase p-4 text-center">
                  [NO TIMELINE EVENTS RECORDED]
                </div>
              ) : (
                <div className="relative pl-4 py-1 space-y-2">
                  <div className="absolute left-[5px] top-2 bottom-2 w-[1px] bg-[#20252C]" />

                  {timelineEvents.map((log) => {
                    const meta = getTimelineBadge(log);
                    return (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-4 top-1.5 w-2 h-2 bg-[#101317] border border-[#20252C] z-10" />

                        <div className="bg-[#101317] border border-[#20252C] p-2">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1 py-0.2 bg-[#0A0C0F] border border-[#20252C] font-bold text-[#8FE0AE]">
                                TICK #{log.tick}
                              </span>
                              <span className={`px-1 py-0.2 font-bold border ${meta.badgeStyle}`}>
                                {meta.label}
                              </span>
                            </div>
                            <span className="text-[#5C6570]">{log.timestamp}</span>
                          </div>

                          <p className="text-[11px] text-[#C9CFD6] leading-tight">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="h-full flex flex-col gap-2 bg-[#0A0C0F] p-2 border border-[#20252C] overflow-y-auto">
            {/* Chart 1: Avg Energy & Belief */}
            <div className="flex-1 min-h-[110px] flex flex-col justify-between bg-[#101317] p-2 border border-[#20252C]">
              <div className="text-[10px] text-[#5C6570] uppercase flex items-center justify-between mb-1">
                <span className="flex items-center gap-3 font-bold">
                  <span className="text-[#8FE0AE]">■ AVG ENERGY</span>
                  <span className="text-[#E2673F]">■ AVG BELIEF/PANIC</span>
                </span>
                <span>LAST {history.length} TICKS</span>
              </div>

              <div className="flex-1 w-full relative min-h-[70px] overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#20252C" strokeWidth="1" />
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#20252C" strokeWidth="1" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#20252C" strokeWidth="1" />

                  {history.length > 1 && (
                    <>
                      <polyline
                        fill="none"
                        stroke="#8FE0AE"
                        strokeWidth="1.5"
                        points={history
                          .map((h, i) => {
                            const x = (i / (history.length - 1)) * 300;
                            const y = 75 - (h.avgEnergy / 100) * 70;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />

                      <polyline
                        fill="none"
                        stroke="#E2673F"
                        strokeWidth="1.5"
                        points={history
                          .map((h, i) => {
                            const x = (i / (history.length - 1)) * 300;
                            const y = 75 - h.avgBelief * 70;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Chart 2: Social Cohesion Index (L2 Belief Convergence Mini-Chart) */}
            <div className="flex-1 min-h-[110px] flex flex-col justify-between bg-[#101317] p-2 border border-[#20252C]">
              <div className="text-[10px] text-[#5C6570] uppercase flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 font-bold text-[#8FE0AE]">
                  <span>■ SOCIAL COHESION INDEX</span>
                  <span className="text-[9px] text-[#C9CFD6] bg-[#0A0C0F] border border-[#20252C] px-1 py-0.2">
                    {((latest.socialCohesion ?? 1.0) * 100).toFixed(0)}% CONVERGED
                  </span>
                </span>
                <span className="text-[9px] text-[#5C6570]">
                  {(latest.socialCohesion ?? 1.0) > 0.65 ? "STABLE CONVERGENCE" : "POLARIZED FACTIONS"}
                </span>
              </div>

              <div className="flex-1 w-full relative min-h-[70px] overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#20252C" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#20252C" strokeWidth="1" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#20252C" strokeWidth="1" strokeDasharray="2,2" />

                  {history.length > 1 && (
                    <polyline
                      fill="none"
                      stroke={(latest.socialCohesion ?? 1.0) > 0.6 ? "#8FE0AE" : "#E2673F"}
                      strokeWidth="1.5"
                      points={history
                        .map((h, i) => {
                          const x = (i / (history.length - 1)) * 300;
                          const val = h.socialCohesion ?? 1.0;
                          const y = 75 - val * 70;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="h-full flex flex-col bg-[#0A0C0F] p-2 border border-[#20252C] uppercase text-[10px] overflow-y-auto">
            <h4 className="text-[10px] font-bold text-[#8FE0AE] mb-2 tracking-wider">
              SURVIVAL LEADERBOARD
            </h4>

            <div className="space-y-1">
              {leaderboard.map((agent, rank) => (
                <div
                  key={agent.id}
                  className="p-1.5 bg-[#101317] border border-[#20252C] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1 py-0.2 bg-[#0A0C0F] border border-[#20252C] text-[#8FE0AE] font-bold">
                      #{rank + 1}
                    </span>
                    <div>
                      <div className="font-bold text-[#C9CFD6]">
                        AGENT #{agent.id < 10 ? `0${agent.id}` : agent.id}
                        {agent.isSleeper && (
                          <span className="ml-2 text-[9px] text-[#E2673F] bg-[#0A0C0F] border border-[#E2673F] px-1 py-0.2 font-bold">
                            SLEEPER
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-[#5C6570]">
                        TICKS: {agent.lifetimeTicks} | ENERGY GATHERED: {Math.round(agent.resourcesGathered)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#8FE0AE] font-bold">
                      {Math.round(agent.energy)}% HP
                    </div>
                    <div className="text-[9px] text-[#E2673F]">
                      BELIEF: {(agent.belief * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="h-full flex flex-col bg-[#0A0C0F] p-2 border border-[#20252C] text-[10px] font-mono uppercase">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 mb-2">
              {["all", "system", "belief", "sleeper", "environment"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLogFilter(cat)}
                  className={`px-1.5 py-0.5 border transition-colors cursor-pointer ${
                    logFilter === cat
                      ? "bg-[#101317] text-[#8FE0AE] border-[#8FE0AE] font-bold"
                      : "bg-[#101317] text-[#5C6570] border-[#20252C]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-[10px]">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-1 bg-[#101317] border border-[#20252C] flex items-start gap-1.5"
                >
                  <span className="text-[#5C6570] shrink-0">[{log.timestamp}]</span>
                  <span
                    className={
                      log.category === "sleeper" || log.category === "environment" || log.category === "belief"
                        ? "text-[#E2673F] font-bold"
                        : "text-[#C9CFD6]"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
