import React from "react";
import { NetworkTopology, SimulationConfig } from "../types";
import { Network, ShieldAlert, ShieldCheck, Activity, Users, Radio } from "lucide-react";

interface GraphInspectorProps {
  topology: NetworkTopology;
  config: SimulationConfig;
  onToggleSWMSR: () => void;
  onToggleSleepers: () => void;
  activeSleeperCount: number;
}

export const GraphInspector: React.FC<GraphInspectorProps> = ({
  topology,
  config,
  onToggleSWMSR,
  onToggleSleepers,
  activeSleeperCount,
}) => {
  const { fiedlerValue, clusteringCoeff, avgPathLength, factionCounts } = topology;

  return (
    <div className="h-full flex flex-col bg-[#101317] border border-[#20252C] p-3 text-[#C9CFD6] font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#20252C] mb-2">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#C9CFD6] uppercase tracking-wider">
              L2 & L3: NETWORK & BELIEF DYNAMICS
            </h3>
            <p className="text-[10px] text-[#5C6570] font-mono">
              WATTS-STROGATZ TOPOLOGY • SPM ATTACKS • SW-MSR DEFENSE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sleeper Attack Toggle Button */}
          <button
            onClick={onToggleSleepers}
            className={`flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 border transition-colors cursor-pointer font-bold ${
              activeSleeperCount > 0
                ? "bg-[#0A0C0F] text-[#E2673F] border-[#E2673F]"
                : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C]"
            }`}
          >
            <Radio className="w-3 h-3" />
            {activeSleeperCount > 0
              ? `SLEEPERS (${activeSleeperCount})`
              : "ACTIVATE SLEEPERS"}
          </button>

          {/* SW-MSR Defense Toggle Button */}
          <button
            onClick={onToggleSWMSR}
            className={`flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 border transition-colors cursor-pointer font-bold ${
              config.swMsrEnabled
                ? "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]"
                : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C]"
            }`}
          >
            {config.swMsrEnabled ? (
              <ShieldCheck className="w-3 h-3 text-[#8FE0AE]" />
            ) : (
              <ShieldAlert className="w-3 h-3 text-[#E2673F]" />
            )}
            SW-MSR: {config.swMsrEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Fiedler Value */}
        <div className="bg-[#0A0C0F] p-2 border border-[#20252C]">
          <div className="text-[#5C6570] text-[10px] uppercase mb-0.5">
            CONNECTIVITY
          </div>
          <div className="text-sm font-mono font-bold text-[#8FE0AE]">
            λ₂ = {fiedlerValue.toFixed(3)}
          </div>
          <p className="text-[9px] text-[#5C6570] mt-0.5 uppercase">FIEDLER INDEX</p>
        </div>

        {/* Clustering Coefficient */}
        <div className="bg-[#0A0C0F] p-2 border border-[#20252C]">
          <div className="text-[#5C6570] text-[10px] uppercase mb-0.5">
            CLUSTERING
          </div>
          <div className="text-sm font-mono font-bold text-[#C9CFD6]">
            {clusteringCoeff.toFixed(3)}
          </div>
          <p className="text-[9px] text-[#5C6570] mt-0.5 uppercase">TRIADIC DENSITY</p>
        </div>

        {/* Avg Path Length */}
        <div className="bg-[#0A0C0F] p-2 border border-[#20252C]">
          <div className="text-[#5C6570] text-[10px] uppercase mb-0.5">
            AVG PATH LENGTH
          </div>
          <div className="text-sm font-mono font-bold text-[#C9CFD6]">
            {avgPathLength.toFixed(2)} HOPS
          </div>
          <p className="text-[9px] text-[#5C6570] mt-0.5 uppercase">GEODESIC</p>
        </div>
      </div>

      {/* Faction Breakdown */}
      <div className="bg-[#0A0C0F] p-2 border border-[#20252C] flex-1 flex flex-col justify-between">
        <h4 className="text-[10px] font-bold text-[#8FE0AE] uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>SOCIAL FACTIONS DISTRIBUTION</span>
          <span className="text-[#5C6570]">BELIEF CLUSTERS</span>
        </h4>

        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          {/* Alpha Faction (Safe/Truth) */}
          <div className="bg-[#101317] p-2 border border-[#20252C] flex flex-col justify-between">
            <div className="text-[10px] text-[#8FE0AE] font-bold uppercase">ALPHA (TRUTH)</div>
            <div className="text-base font-bold text-[#C9CFD6] my-0.5">
              {factionCounts[0] || 0} UNITS
            </div>
            <div className="text-[9px] text-[#5C6570]">BELIEF &lt; 0.35</div>
          </div>

          {/* Beta Faction (Uncertain) */}
          <div className="bg-[#101317] p-2 border border-[#20252C] flex flex-col justify-between">
            <div className="text-[10px] text-[#5C6570] font-bold uppercase">BETA (UNCERTAIN)</div>
            <div className="text-base font-bold text-[#C9CFD6] my-0.5">
              {factionCounts[1] || 0} UNITS
            </div>
            <div className="text-[9px] text-[#5C6570]">BELIEF 0.35 - 0.70</div>
          </div>

          {/* Gamma Faction (Misinformed/Panic) */}
          <div className="bg-[#101317] p-2 border border-[#20252C] flex flex-col justify-between">
            <div className="text-[10px] text-[#E2673F] font-bold uppercase">GAMMA (PANIC)</div>
            <div className="text-base font-bold text-[#E2673F] my-0.5">
              {factionCounts[2] || 0} UNITS
            </div>
            <div className="text-[9px] text-[#5C6570]">BELIEF &gt; 0.70</div>
          </div>
        </div>

        {/* SW-MSR Status Bar */}
        <div className="mt-2 p-1.5 bg-[#101317] border border-[#20252C] text-[10px] text-[#5C6570] flex items-center gap-2 font-mono uppercase">
          <span className={`shrink-0 font-bold ${config.swMsrEnabled ? "text-[#8FE0AE]" : "text-[#E2673F]"}`}>
            SW-MSR STATUS:
          </span>
          <span>
            {config.swMsrEnabled
              ? "TRIMMING OUTLIER BELIEF SIGNALS DURING CONSENSUS."
              : "DEGROOT CONSENSUS ACTIVE. VULNERABLE TO PANIC CASCADES."}
          </span>
        </div>
      </div>
    </div>
  );
};
