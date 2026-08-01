import React, { useEffect, useRef } from "react";
import { Agent, ResourceNode, SimulationConfig } from "../types";
import { WorldSimulation } from "../core/WorldSimulation";

interface WorldCanvasProps {
  simulation: WorldSimulation;
  config: SimulationConfig;
  selectedAgentId: number | null;
  onSelectAgent: (agentId: number) => void;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  simulation,
  config,
  selectedAgentId,
  onSelectAgent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Flat dark background
      ctx.fillStyle = "#0A0C0F";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid pattern (hairline #151920)
      ctx.strokeStyle = "#151920";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Border frame
      ctx.strokeStyle = "#20252C";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // 2. Render Layer 3 Network Graph Edges
      if (config.showGraphOverlay && simulation.topology.edges.length > 0) {
        ctx.lineWidth = 1;
        simulation.topology.edges.forEach((edge) => {
          const a1 = simulation.agents.find((a) => a.id === edge.source);
          const a2 = simulation.agents.find((a) => a.id === edge.target);
          if (a1 && a2 && a1.status === "active" && a2.status === "active") {
            const alpha = Math.min(0.5, edge.weight * 0.4);
            
            // Phosphor green (#8FE0AE) for match, Amber-red (#E2673F) for mismatch
            if (Math.abs(a1.belief - a2.belief) < 0.2) {
              ctx.strokeStyle = `rgba(143, 224, 174, ${alpha})`;
            } else {
              ctx.strokeStyle = `rgba(226, 103, 63, ${alpha})`;
            }

            ctx.beginPath();
            ctx.moveTo(a1.x, a1.y);
            ctx.lineTo(a2.x, a2.y);
            ctx.stroke();
          }
        });
      }

      // 3. Render Resource Nodes (small flat square, no glow/gradients)
      simulation.resources.forEach((res) => {
        if (!res.active) return;
        const energyRatio = res.currentEnergy / res.maxEnergy;
        ctx.fillStyle = "#5C6570";
        ctx.fillRect(res.x - 3, res.y - 3, 6, 6);

        if (energyRatio > 0) {
          ctx.fillStyle = "#8FE0AE";
          ctx.fillRect(res.x - 2, res.y - 2, 4 * energyRatio, 4 * energyRatio);
        }
      });

      // 4. Render Vision Lines (flat dashed line)
      if (config.showVisionLines) {
        simulation.agents.forEach((agent) => {
          if (agent.status !== "active") return;

          let minDistRes = Infinity;
          let targetRes: ResourceNode | null = null;
          simulation.resources.forEach((res) => {
            if (!res.active) return;
            const dx = res.x - agent.x;
            const dy = res.y - agent.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < minDistRes && d <= config.visionRadius) {
              minDistRes = d;
              targetRes = res;
            }
          });

          if (targetRes) {
            ctx.strokeStyle = "rgba(143, 224, 174, 0.2)";
            ctx.setLineDash([2, 2]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(agent.x, agent.y);
            ctx.lineTo(targetRes.x, targetRes.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      // 5. Render Agents
      simulation.agents.forEach((agent) => {
        const isSelected = selectedAgentId === agent.id;
        const isSleeperActive = agent.isSleeper && agent.isSleeperActivated;
        const isMisinformed = agent.belief > 0.5;
        const dotColor = isSleeperActive || isMisinformed ? "#E2673F" : "#8FE0AE";

        // Selection Box (1px sharp rectangle)
        if (isSelected) {
          ctx.strokeStyle = dotColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(Math.round(agent.x) - 9, Math.round(agent.y) - 9, 18, 18);
        }

        if (agent.status === "depleted" || agent.status === "respawning") {
          ctx.fillStyle = "#20252C";
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 4, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        // Motion Trail rendering (flat thin lines)
        if (config.showMotionTrails && agent.trail && agent.trail.length > 1) {
          const trailLen = agent.trail.length;
          for (let i = 0; i < trailLen; i++) {
            const pt = agent.trail[i];
            const nextPt = i === trailLen - 1 ? { x: agent.x, y: agent.y } : agent.trail[i + 1];
            const ratio = (i + 1) / (trailLen + 1);
            const alpha = ratio * 0.4;

            ctx.strokeStyle = isSleeperActive || isMisinformed
              ? `rgba(226, 103, 63, ${alpha})`
              : `rgba(143, 224, 174, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(nextPt.x, nextPt.y);
            ctx.stroke();
          }
        }

        // Heatmap Aura Mode (flat muted tint)
        if (config.heatmapMode !== "none") {
          let auraColor = "rgba(143, 224, 174, 0.15)";
          if (config.heatmapMode === "belief") {
            auraColor = agent.belief > 0.5 ? "rgba(226, 103, 63, 0.25)" : "rgba(143, 224, 174, 0.15)";
          } else if (config.heatmapMode === "energy") {
            auraColor = agent.energy < 30 ? "rgba(226, 103, 63, 0.25)" : "rgba(143, 224, 174, 0.15)";
          } else if (config.heatmapMode === "sleeper") {
            auraColor = agent.isSleeper ? "rgba(226, 103, 63, 0.3)" : "rgba(143, 224, 174, 0.1)";
          }

          ctx.fillStyle = auraColor;
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 16, 0, Math.PI * 2);
          ctx.fill();
        }

        // Small flat dot (~5px radius)
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Heading direction vector line
        const hx = agent.x + Math.cos(agent.angle) * 9;
        const hy = agent.y + Math.sin(agent.angle) * 9;
        ctx.strokeStyle = dotColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(agent.x, agent.y);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        // Monospace ID label next to dot (e.g. #07)
        ctx.fillStyle = dotColor;
        ctx.font = "10px ui-monospace, SFMono-Regular, Consolas, monospace";
        ctx.textAlign = "left";
        const padId = agent.id < 10 ? `0${agent.id}` : `${agent.id}`;
        ctx.fillText(`#${padId}`, agent.x + 8, agent.y + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [simulation, config, selectedAgentId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    let closestId: number | null = null;
    let minDist = 25;

    simulation.agents.forEach((agent) => {
      const dx = agent.x - clickX;
      const dy = agent.y - clickY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) {
        minDist = d;
        closestId = agent.id;
      }
    });

    if (closestId !== null) {
      onSelectAgent(closestId);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0A0C0F] p-1 font-mono text-xs select-none">
      {/* Canvas Top Bar HUD */}
      <div className="w-full flex items-center justify-between px-2 py-1 bg-[#101317] border-b border-[#20252C] text-[11px] text-[#C9CFD6]">
        <div className="flex items-center gap-3">
          <span className="text-[#8FE0AE] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#8FE0AE]" />
            L0 WORLD BOX
          </span>
          <span className="text-[#5C6570]">|</span>
          <span>TICK <strong className="text-[#8FE0AE]">{String(simulation.currentTick).padStart(4, "0")}</strong></span>
          <span className="text-[#5C6570]">|</span>
          <span>
            LIGHT <strong className="text-[#C9CFD6]">{Math.round(simulation.dayNightLight * 100)}%</strong>
          </span>
        </div>

        <div>
          {selectedAgentId ? (
            <span className="text-[#E2673F] border border-[#E2673F] px-2 py-0.5 font-bold uppercase text-[10px]">
              INSPECTING AGENT #{selectedAgentId < 10 ? `0${selectedAgentId}` : selectedAgentId}
            </span>
          ) : (
            <span className="text-[#5C6570] text-[10px] uppercase tracking-wider">
              CLICK A NODE TO INSPECT
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full flex-1 flex items-center justify-center p-1 bg-[#0A0C0F]">
        <canvas
          ref={canvasRef}
          width={config.worldWidth}
          height={config.worldHeight}
          onClick={handleCanvasClick}
          className="w-full h-auto max-h-[620px] object-contain border border-[#20252C] cursor-pointer"
        />
      </div>
    </div>
  );
};
