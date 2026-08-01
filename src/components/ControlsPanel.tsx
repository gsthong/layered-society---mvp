import React from "react";
import { SimulationConfig } from "../types";
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Network,
  Flame,
  Download,
  Zap,
  Sliders,
  Layers,
  Footprints,
} from "lucide-react";

interface ControlsPanelProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: Partial<SimulationConfig>) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onTriggerDisaster: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onExportAgentCSV: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  config,
  onChangeConfig,
  isRunning,
  onTogglePlay,
  onReset,
  onTriggerDisaster,
  onExportJSON,
  onExportCSV,
  onExportAgentCSV,
}) => {
  return (
    <div className="bg-[#101317] border border-[#20252C] p-2 text-[#C9CFD6] font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Play / Pause / Reset controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs uppercase font-bold border transition-colors cursor-pointer ${
              isRunning
                ? "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]"
                : "bg-[#0A0C0F] text-[#E2673F] border-[#E2673F]"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Play
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0A0C0F] hover:bg-[#151920] text-[#C9CFD6] border border-[#20252C] transition-colors cursor-pointer uppercase text-xs"
            title="Reset simulation to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5C6570]" /> Reset
          </button>
        </div>

        {/* Sliders */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Agent Count */}
          <div className="flex items-center gap-2 bg-[#0A0C0F] px-2 py-0.5 border border-[#20252C]">
            <span className="text-[#5C6570] font-mono text-[10px] uppercase">Agents</span>
            <input
              type="range"
              min={10}
              max={200}
              step={10}
              value={config.agentCount}
              onChange={(e) =>
                onChangeConfig({ agentCount: parseInt(e.target.value, 10) })
              }
              className="w-16 accent-[#8FE0AE] cursor-pointer"
            />
            <span className="font-mono font-bold text-[#8FE0AE] w-7 text-right text-[11px]">
              {config.agentCount}
            </span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-2 bg-[#0A0C0F] px-2 py-0.5 border border-[#20252C]">
            <span className="text-[#5C6570] font-mono text-[10px] uppercase">Speed</span>
            <input
              type="range"
              min={0.2}
              max={4.0}
              step={0.2}
              value={config.simSpeed}
              onChange={(e) =>
                onChangeConfig({ simSpeed: parseFloat(e.target.value) })
              }
              className="w-14 accent-[#8FE0AE] cursor-pointer"
            />
            <span className="font-mono font-bold text-[#8FE0AE] w-7 text-right text-[11px]">
              {config.simSpeed.toFixed(1)}x
            </span>
          </div>

          {/* Sleeper Ratio */}
          <div className="flex items-center gap-2 bg-[#0A0C0F] px-2 py-0.5 border border-[#20252C]">
            <span className="text-[#5C6570] font-mono text-[10px] uppercase">Sleepers</span>
            <input
              type="range"
              min={0.0}
              max={0.4}
              step={0.05}
              value={config.sleeperRatio}
              onChange={(e) =>
                onChangeConfig({ sleeperRatio: parseFloat(e.target.value) })
              }
              className="w-14 accent-[#E2673F] cursor-pointer"
            />
            <span className="font-mono font-bold text-[#E2673F] w-6 text-right text-[11px]">
              {Math.round(config.sleeperRatio * 100)}%
            </span>
          </div>
        </div>

        {/* View & Heatmap Mode Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              onChangeConfig({ showVisionLines: !config.showVisionLines })
            }
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-mono uppercase border transition-colors cursor-pointer ${
              config.showVisionLines
                ? "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]"
                : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C]"
            }`}
            title="Toggle Sensory Vision Lines"
          >
            Vision
          </button>

          <button
            onClick={() =>
              onChangeConfig({ showGraphOverlay: !config.showGraphOverlay })
            }
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-mono uppercase border transition-colors cursor-pointer ${
              config.showGraphOverlay
                ? "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]"
                : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C]"
            }`}
            title="Toggle Network Edges Overlay"
          >
            Graph
          </button>

          <button
            onClick={() =>
              onChangeConfig({ showMotionTrails: !config.showMotionTrails })
            }
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-mono uppercase border transition-colors cursor-pointer ${
              config.showMotionTrails
                ? "bg-[#0A0C0F] text-[#8FE0AE] border-[#8FE0AE]"
                : "bg-[#0A0C0F] text-[#5C6570] border-[#20252C]"
            }`}
            title="Toggle Motion Trails Behind Agents"
          >
            Trails
          </button>

          {/* Heatmap Selector */}
          <div className="flex items-center gap-1 bg-[#0A0C0F] px-1.5 py-0.5 border border-[#20252C]">
            <select
              value={config.heatmapMode}
              onChange={(e) =>
                onChangeConfig({
                  heatmapMode: e.target.value as SimulationConfig["heatmapMode"],
                })
              }
              className="bg-transparent text-[11px] text-[#C9CFD6] font-mono outline-none cursor-pointer uppercase"
            >
              <option value="none" className="bg-[#101317]">Normal View</option>
              <option value="belief" className="bg-[#101317]">Belief Heatmap</option>
              <option value="energy" className="bg-[#101317]">Energy Heatmap</option>
              <option value="sleeper" className="bg-[#101317]">Sleeper Map</option>
            </select>
          </div>
        </div>

        {/* Environment Disasters & Export */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTriggerDisaster}
            className="flex items-center gap-1 px-2.5 py-1 uppercase text-[11px] font-mono font-bold bg-[#0A0C0F] hover:bg-[#151920] text-[#E2673F] border border-[#E2673F] transition-colors cursor-pointer"
            title="Trigger severe drought event"
          >
            <Flame className="w-3.5 h-3.5" /> Drought
          </button>

          <button
            onClick={onExportJSON}
            className="flex items-center gap-1 px-2.5 py-1 uppercase text-[11px] font-mono bg-[#0A0C0F] hover:bg-[#151920] text-[#C9CFD6] border border-[#20252C] transition-colors cursor-pointer"
            title="Export full tick state as JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#5C6570]" /> Export JSON
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 uppercase text-[11px] font-mono font-bold bg-[#0A0C0F] hover:bg-[#151920] text-[#A855F7] border border-[#A855F7] transition-colors cursor-pointer"
            title="Run 5000 Ticks and Export Global Metrics CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#A855F7]" /> BATCH CSV
          </button>

          <button
            onClick={onExportAgentCSV}
            className="flex items-center gap-1 px-2.5 py-1 uppercase text-[11px] font-mono font-bold bg-[#0A0C0F] hover:bg-[#151920] text-[#3B82F6] border border-[#3B82F6] transition-colors cursor-pointer"
            title="Export Agent-Level ML Dataset (2000 Ticks)"
          >
            <Download className="w-3.5 h-3.5 text-[#3B82F6]" /> ML DATA
          </button>
        </div>
      </div>
    </div>
  );
};
