import React, { useState, useEffect, useRef, useCallback } from "react";
import { SimulationConfig } from "./types";
import { WorldSimulation } from "./core/WorldSimulation";
import { WorldCanvas } from "./components/WorldCanvas";
import { ControlsPanel } from "./components/ControlsPanel";
import { BrainInspector } from "./components/BrainInspector";
import { GraphInspector } from "./components/GraphInspector";
import { ReflectionPanel } from "./components/ReflectionPanel";
import { StatsPanel } from "./components/StatsPanel";
import {
  Brain,
  Network,
  Sparkles,
  BarChart3,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>({
    agentCount: 50,
    resourceCount: 25,
    simSpeed: 1.0,
    visionRadius: 110,
    showVisionLines: true,
    showGraphOverlay: true,
    showMotionTrails: true,
    heatmapMode: "none",
    sleeperRatio: 0.15,
    swMsrEnabled: false,
    beliefDecay: 0.001,
    resourceRegenRate: 1.0,
    dayNightSpeed: 1.0,
    worldWidth: 800,
    worldHeight: 600,
  });

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"brain" | "graph" | "reflection" | "stats">("brain");
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Instantiated simulation core
  const simRef = useRef<WorldSimulation | null>(null);
  if (!simRef.current) {
    simRef.current = new WorldSimulation(config);
  }

  const simulation = simRef.current;

  // React force render update trigger
  const [, setTickCount] = useState<number>(0);

  // Update Config handler
  const handleConfigChange = (newConfig: Partial<SimulationConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (
        newConfig.agentCount !== undefined ||
        newConfig.resourceCount !== undefined ||
        newConfig.sleeperRatio !== undefined
      ) {
        simRef.current?.reset(updated);
      }
      return updated;
    });
  };

  const [perfStats, setPerfStats] = useState({
    fps: 60,
    tickTimeMs: 0.8,
    status: "NOMINAL",
  });

  // Main Simulation Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let accumulatedFpsTime = 0;
    let accumulatedTickTime = 0;

    const loop = (currentTime: number) => {
      if (isRunning && simRef.current) {
        const delta = currentTime - lastTime;
        // Step tick speed multiplier
        const targetMs = 1000 / (60 * config.simSpeed);

        if (delta >= targetMs) {
          const t0 = performance.now();
          simRef.current.tick(config);
          const t1 = performance.now();

          accumulatedTickTime += t1 - t0;
          accumulatedFpsTime += delta;
          frameCount++;

          if (frameCount >= 12) {
            const avgTickTime = accumulatedTickTime / frameCount;
            const avgFps = 1000 / (accumulatedFpsTime / frameCount);
            setPerfStats({
              fps: Math.min(60, Math.round(avgFps)),
              tickTimeMs: Math.round(avgTickTime * 100) / 100,
              status: avgFps >= 50 ? "NOMINAL" : avgFps >= 30 ? "HEAVY LOAD" : "PERF WARNING",
            });
            frameCount = 0;
            accumulatedTickTime = 0;
            accumulatedFpsTime = 0;
          }

          setTickCount((t) => t + 1);
          lastTime = currentTime;
        }
      } else {
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, config]);

  const handleTogglePlay = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    simRef.current?.reset(config);
    setSelectedAgentId(null);
    setTickCount(0);
  };

  const handleTriggerDisaster = () => {
    simRef.current?.triggerEnvironmentalDisaster();
    setTickCount((t) => t + 1);
  };

  const handleToggleSWMSR = () => {
    handleConfigChange({ swMsrEnabled: !config.swMsrEnabled });
  };

  const handleToggleSleepers = () => {
    simRef.current?.toggleSleeperActivation();
    setTickCount((t) => t + 1);
  };

  const handleExportJSON = () => {
    if (!simRef.current) return;
    const jsonStr = simRef.current.exportStateJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `layered-society-tick-${simRef.current.currentTick}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedAgent = simulation.agents.find((a) => a.id === selectedAgentId) || null;
  const activeSleeperCount = simulation.agents.filter((a) => a.isSleeper && a.isSleeperActivated).length;

  return (
    <div className="w-screen h-screen bg-[#0A0C0F] text-[#C9CFD6] flex flex-col font-sans overflow-hidden select-none">
      {/* Top Header */}
      <header className="px-4 py-2 bg-[#101317] border-b border-[#20252C] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-2 py-0.5 bg-[#0A0C0F] border border-[#20252C] font-mono text-xs text-[#8FE0AE] font-bold">
            [LS]
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-widest text-[#C9CFD6] flex items-center gap-2 uppercase font-mono">
              LAYERED SOCIETY
              <span className="text-[10px] text-[#5C6570]">
                MVP • RESEARCH SANDBOX
              </span>
            </h1>
            <p className="text-[10px] text-[#5C6570] font-mono uppercase tracking-wider">
              L0 WORLD • L1 BRAIN • L2 BELIEF • L3 GRAPH • L4 SOUL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 bg-[#0A0C0F] hover:bg-[#101317] text-[#C9CFD6] border border-[#20252C] transition-colors cursor-pointer uppercase tracking-wider"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#8FE0AE]" /> Guide
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-2 grid grid-cols-12 gap-2 min-h-0 overflow-hidden">
        {/* Left Col: World Canvas + Top Controls (7 Cols) */}
        <div className="col-span-7 flex flex-col gap-2 min-h-0">
          <ControlsPanel
            config={config}
            onChangeConfig={handleConfigChange}
            isRunning={isRunning}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            onTriggerDisaster={handleTriggerDisaster}
            onExportJSON={handleExportJSON}
          />

          <div className="flex-1 min-h-0 bg-[#101317] border border-[#20252C] p-1">
            <WorldCanvas
              simulation={simulation}
              config={config}
              selectedAgentId={selectedAgentId}
              onSelectAgent={(id) => {
                setSelectedAgentId(id);
                // Auto switch to brain tab
                if (activeTab === "stats") setActiveTab("brain");
              }}
            />
          </div>
        </div>

        {/* Right Col: Layer Inspection Tabs & Panels (5 Cols) */}
        <div className="col-span-5 flex flex-col gap-2 min-h-0">
          {/* Layer Tabs Header */}
          <div className="flex items-center bg-[#101317] border border-[#20252C] font-mono text-xs">
            <button
              onClick={() => setActiveTab("brain")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 border-r border-[#20252C] transition-colors cursor-pointer uppercase text-[11px] font-bold ${
                activeTab === "brain"
                  ? "bg-[#0A0C0F] text-[#8FE0AE] border-b-2 border-b-[#8FE0AE]"
                  : "text-[#5C6570] hover:text-[#C9CFD6]"
              }`}
            >
              01 · BRAIN
            </button>

            <button
              onClick={() => setActiveTab("graph")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 border-r border-[#20252C] transition-colors cursor-pointer uppercase text-[11px] font-bold ${
                activeTab === "graph"
                  ? "bg-[#0A0C0F] text-[#8FE0AE] border-b-2 border-b-[#8FE0AE]"
                  : "text-[#5C6570] hover:text-[#C9CFD6]"
              }`}
            >
              02 · BELIEF & GRAPH
            </button>

            <button
              onClick={() => setActiveTab("reflection")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 border-r border-[#20252C] transition-colors cursor-pointer uppercase text-[11px] font-bold ${
                activeTab === "reflection"
                  ? "bg-[#0A0C0F] text-[#8FE0AE] border-b-2 border-b-[#8FE0AE]"
                  : "text-[#5C6570] hover:text-[#C9CFD6]"
              }`}
            >
              03 · SOUL (GEMINI)
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 transition-colors cursor-pointer uppercase text-[11px] font-bold ${
                activeTab === "stats"
                  ? "bg-[#0A0C0F] text-[#8FE0AE] border-b-2 border-b-[#8FE0AE]"
                  : "text-[#5C6570] hover:text-[#C9CFD6]"
              }`}
            >
              04 · ANALYTICS
            </button>
          </div>

          {/* Tab Panel Content */}
          <div className="flex-1 min-h-0 bg-[#101317] border border-[#20252C]">
            {activeTab === "brain" && (
              <BrainInspector
                agent={selectedAgent}
                onUpdateAgent={() => setTickCount((t) => t + 1)}
              />
            )}

            {activeTab === "graph" && (
              <GraphInspector
                topology={simulation.topology}
                config={config}
                onToggleSWMSR={handleToggleSWMSR}
                onToggleSleepers={handleToggleSleepers}
                activeSleeperCount={activeSleeperCount}
              />
            )}

            {activeTab === "reflection" && (
              <ReflectionPanel
                agent={selectedAgent}
                onUpdateAgent={() => setTickCount((t) => t + 1)}
              />
            )}

            {activeTab === "stats" && (
              <StatsPanel
                history={simulation.metricsHistory}
                logs={simulation.logs}
                agents={simulation.agents}
              />
            )}
          </div>
        </div>
      </main>

      {/* Bottom Performance & Simulation Speed Telemetry Bar */}
      <footer className="px-3 py-1 bg-[#101317] border-t border-[#20252C] flex items-center justify-between text-[10px] font-mono select-none text-[#5C6570] shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-[#C9CFD6]">
            <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-[#8FE0AE] animate-pulse" : "bg-[#5C6570]"}`} />
            {isRunning ? "SIM ENGINE RUNNING" : "SIM ENGINE PAUSED"}
          </span>

          <span className="border-r border-[#20252C] h-3" />

          <span className="flex items-center gap-1">
            FPS:{" "}
            <strong
              className={
                perfStats.fps >= 50
                  ? "text-[#8FE0AE]"
                  : perfStats.fps >= 30
                  ? "text-[#E2673F]"
                  : "text-[#EF4444]"
              }
            >
              {perfStats.fps}
            </strong>
          </span>

          <span className="flex items-center gap-1">
            FRAME STEP TIME:{" "}
            <strong
              className={
                perfStats.tickTimeMs < 8
                  ? "text-[#8FE0AE]"
                  : perfStats.tickTimeMs < 16
                  ? "text-[#E2673F]"
                  : "text-[#EF4444]"
              }
            >
              {perfStats.tickTimeMs.toFixed(2)} ms
            </strong>
          </span>

          <span className="flex items-center gap-1">
            SIM SPEED:{" "}
            <strong className="text-[#C9CFD6]">
              {config.simSpeed.toFixed(1)}x ({ (1000 / (60 * config.simSpeed)).toFixed(1) }ms target)
            </strong>
          </span>

          <span className="flex items-center gap-1">
            WORKLOAD:{" "}
            <strong className="text-[#C9CFD6]">
              {config.agentCount} AGENTS ({config.resourceCount} RES)
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            LOAD STATUS:{" "}
            <span
              className={`px-1.5 py-0.2 border text-[9px] font-bold uppercase ${
                perfStats.status === "NOMINAL"
                  ? "bg-[#8FE0AE]/10 text-[#8FE0AE] border-[#8FE0AE]/30"
                  : perfStats.status === "HEAVY LOAD"
                  ? "bg-[#E2673F]/10 text-[#E2673F] border-[#E2673F]/30"
                  : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
              }`}
            >
              {perfStats.status}
            </span>
          </span>

          <span className="text-[#8FE0AE] font-bold">
            TICK #{simulation.currentTick}
          </span>
        </div>
      </footer>

      {/* Guide Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#101317] border border-[#20252C] p-5 max-w-lg w-full text-[#C9CFD6] font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#20252C] mb-4">
              <h3 className="text-xs font-bold text-[#8FE0AE] uppercase tracking-wider flex items-center gap-2">
                [SYSTEM GUIDE] LAYERED SOCIETY ARCHITECTURE
              </h3>
            </div>

            <div className="space-y-2.5 text-xs leading-relaxed text-[#C9CFD6]">
              <div className="p-2 bg-[#0A0C0F] border border-[#20252C]">
                <strong className="text-[#8FE0AE]">L0 WORLD BOX:</strong> 2D physical environment with resource harvest points and energy depletion.
              </div>
              <div className="p-2 bg-[#0A0C0F] border border-[#20252C]">
                <strong className="text-[#8FE0AE]">L1 NEURAL BRAIN:</strong> Feedforward neural network controlling steering, speed, and harvest effort.
              </div>
              <div className="p-2 bg-[#0A0C0F] border border-[#20252C]">
                <strong className="text-[#E2673F]">L2 BELIEF ENGINE:</strong> Strategic Partial Misinformation (SPM) with sleeper panic signals and SW-MSR defense.
              </div>
              <div className="p-2 bg-[#0A0C0F] border border-[#20252C]">
                <strong className="text-[#8FE0AE]">L3 NETWORK GRAPH:</strong> Watts-Strogatz small-world network topology and faction clustering.
              </div>
              <div className="p-2 bg-[#0A0C0F] border border-[#20252C]">
                <strong className="text-[#8FE0AE]">L4 GENERATIVE SOUL:</strong> Gemini LLM generative agent reflections and memory logs.
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2 bg-[#0A0C0F] hover:bg-[#151920] text-[#8FE0AE] border border-[#8FE0AE] font-bold text-xs uppercase cursor-pointer tracking-wider transition-colors"
            >
              CLOSE GUIDE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
