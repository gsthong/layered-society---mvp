import React from "react";
import { Agent } from "../types";
import { mutateNeuralNetwork } from "../core/NeuralNetwork";
import { Brain, Zap, RefreshCw, Layers } from "lucide-react";

interface BrainInspectorProps {
  agent: Agent | null;
  onUpdateAgent: () => void;
}

export const BrainInspector: React.FC<BrainInspectorProps> = ({
  agent,
  onUpdateAgent,
}) => {
  if (!agent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#5C6570] bg-[#101317] border border-[#20252C] font-mono text-xs">
        <p className="text-[#C9CFD6] font-bold uppercase tracking-wider mb-2">
          [NO AGENT SELECTED]
        </p>
        <p className="text-[11px] text-[#5C6570] max-w-xs">
          CLICK ANY AGENT NODE ON THE CANVAS TO INSPECT L1 NEURAL BRAIN ACTIVATIONS
        </p>
      </div>
    );
  }

  const { brain } = agent;

  const handleMutateWeights = () => {
    agent.brain = mutateNeuralNetwork(agent.brain, 0.25, 0.4);
    onUpdateAgent();
  };

  const handleStimulateNeuralImpulse = () => {
    agent.brain.hiddenLayer.activations = agent.brain.hiddenLayer.activations.map(
      (v) => Math.min(2.0, v + 0.8)
    );
    onUpdateAgent();
  };

  return (
    <div className="h-full flex flex-col bg-[#101317] border border-[#20252C] p-3 overflow-hidden text-[#C9CFD6] font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#20252C] mb-2">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#C9CFD6] flex items-center gap-2 uppercase tracking-wider">
              L1 BRAIN — AGENT #{agent.id < 10 ? `0${agent.id}` : agent.id}
              {agent.isSleeper && (
                <span className="text-[10px] bg-[#0A0C0F] border border-[#E2673F] text-[#E2673F] px-1.5 py-0.5 font-mono uppercase font-bold">
                  SLEEPER
                </span>
              )}
            </h3>
            <p className="text-[10px] text-[#5C6570] font-mono">
              6 SENSORY → 6 HIDDEN RELU → 3 OUTPUTS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleStimulateNeuralImpulse}
            className="flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 bg-[#0A0C0F] hover:bg-[#151920] text-[#E2673F] border border-[#E2673F] transition-colors cursor-pointer"
            title="Inject test pulse into hidden layer"
          >
            <Zap className="w-3 h-3" /> IMPULSE
          </button>
          <button
            onClick={handleMutateWeights}
            className="flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 bg-[#0A0C0F] hover:bg-[#151920] text-[#8FE0AE] border border-[#8FE0AE] transition-colors cursor-pointer"
            title="Mutate weights randomly"
          >
            <RefreshCw className="w-3 h-3" /> MUTATE
          </button>
        </div>
      </div>

      {/* Neural Network Diagram */}
      <div className="flex-1 grid grid-cols-3 gap-2 my-1 overflow-y-auto font-mono text-xs pr-1">
        {/* Layer 0: Sensory Inputs */}
        <div className="flex flex-col gap-1.5 bg-[#0A0C0F] p-2 border border-[#20252C]">
          <div className="text-[10px] font-bold text-[#8FE0AE] uppercase tracking-wider mb-1">
            01 · INPUTS
          </div>
          {brain.inputLabels.map((label, idx) => {
            const val = brain.inputActivations[idx] || 0;
            const pct = Math.min(100, Math.max(0, val * 100));

            return (
              <div key={idx} className="bg-[#101317] p-1.5 border border-[#20252C]">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#5C6570] truncate uppercase">{label}</span>
                  <span className="text-[#C9CFD6] font-bold">{val.toFixed(2)}</span>
                </div>
                <div className="w-full h-1 bg-[#0A0C0F] border border-[#20252C]">
                  <div
                    className="h-full bg-[#8FE0AE]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Layer 1: Hidden Neurons (ReLU) */}
        <div className="flex flex-col gap-1.5 bg-[#0A0C0F] p-2 border border-[#20252C]">
          <div className="text-[10px] font-bold text-[#8FE0AE] uppercase tracking-wider mb-1">
            02 · HIDDEN ACTIVATIONS
          </div>
          {brain.hiddenLayer.activations.map((val, idx) => {
            const intensity = Math.min(1.0, val);
            const intensityPct = Math.round(intensity * 100);

            return (
              <div
                key={idx}
                className="bg-[#101317] p-1.5 border border-[#20252C] flex items-center justify-between"
              >
                <div>
                  <div className="text-[9px] text-[#5C6570] uppercase">N#{idx + 1}</div>
                  <div className="text-[11px] font-bold text-[#8FE0AE]">{val.toFixed(3)}</div>
                </div>

                <div className="px-1.5 py-0.5 bg-[#0A0C0F] border border-[#20252C] text-[10px] text-[#8FE0AE] font-bold">
                  {intensityPct}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Layer 2: Output Actions */}
        <div className="flex flex-col gap-1.5 bg-[#0A0C0F] p-2 border border-[#20252C]">
          <div className="text-[10px] font-bold text-[#8FE0AE] uppercase tracking-wider mb-1">
            03 · OUTPUTS
          </div>
          {brain.outputLabels.map((label, idx) => {
            const val = brain.outputLayer.activations[idx] || 0;

            let displayVal = val.toFixed(2);
            let pct = Math.min(100, Math.max(0, val * 100));

            if (idx === 0) {
              displayVal = `${val > 0 ? "+" : ""}${val.toFixed(2)}`;
              pct = ((val + 1) / 2) * 100;
            }

            return (
              <div key={idx} className="bg-[#101317] p-1.5 border border-[#20252C]">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#5C6570] truncate uppercase">{label}</span>
                  <span className="text-[#C9CFD6] font-bold">{displayVal}</span>
                </div>
                <div className="w-full h-1 bg-[#0A0C0F] border border-[#20252C]">
                  <div
                    className="h-full bg-[#8FE0AE]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Neural Stats */}
      <div className="mt-1 pt-1.5 border-t border-[#20252C] flex items-center justify-between text-[10px] text-[#5C6570] font-mono uppercase">
        <div>
          SYNAPSES: <strong className="text-[#C9CFD6]">54 WEIGHTS + BIASES</strong>
        </div>
        <div>
          STATUS:{" "}
          <strong className={agent.status === "active" ? "text-[#8FE0AE]" : "text-[#E2673F]"}>
            {agent.status.toUpperCase()}
          </strong>
        </div>
      </div>
    </div>
  );
};
