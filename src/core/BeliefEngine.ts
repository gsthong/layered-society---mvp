import { Agent } from "../types";

/**
 * Calculates Log-Likelihood Ratio (LLR) score for an agent
 * Positive = confident in Truth/Safe, Negative = confident in Misinformation/Panic
 */
export function calculateLLR(belief: number): number {
  // Clamp belief away from exact 0 or 1 to avoid division by zero
  const clamped = Math.max(0.001, Math.min(0.999, belief));
  // LLR = log(P(Truth) / P(Misinformation)) = log((1 - belief) / belief)
  return Math.log((1 - clamped) / clamped);
}

/**
 * Executes a single tick of Layer 2 Belief Propagation across all agents
 * Implements SPM (Strategic Partial Misinformation) & SW-MSR Defense
 */
export function updateBeliefs(
  agents: Agent[],
  swMsrEnabled: boolean,
  visionRadius: number,
  beliefDecay: number = 0.001
): { beliefSpikes: number; defenseTriggers: number } {
  let beliefSpikes = 0;
  let defenseTriggers = 0;

  const visionRadiusSq = visionRadius * visionRadius;
  const newBeliefs = new Array(agents.length).fill(0);

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];

    if (agent.status !== "active") {
      newBeliefs[i] = agent.belief;
      continue;
    }

    // Sleeper agents maintain high misinformation signal when activated
    if (agent.isSleeper && agent.isSleeperActivated) {
      newBeliefs[i] = 0.95 + (Math.random() - 0.5) * 0.08;
      agent.llr = calculateLLR(newBeliefs[i]);
      continue;
    }

    // Collect belief signals from active neighbors within vision range
    const neighborBeliefs: number[] = [];

    for (let j = 0; j < agents.length; j++) {
      if (i === j || agents[j].status !== "active") continue;

      const dx = agents[j].x - agent.x;
      const dy = agents[j].y - agent.y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= visionRadiusSq) {
        if (agents[j].isSleeper && agents[j].isSleeperActivated) {
          // Sleeper broadcasts SPM panic signal
          neighborBeliefs.push(0.92);
        } else {
          neighborBeliefs.push(agents[j].belief);
        }
      }
    }

    if (neighborBeliefs.length === 0) {
      // Natural decay towards ground truth (0.0) when isolated
      newBeliefs[i] = Math.max(0, agent.belief - beliefDecay);
      agent.llr = calculateLLR(newBeliefs[i]);
      continue;
    }

    let targetBelief = agent.belief;

    if (swMsrEnabled) {
      defenseTriggers++;
      const sorted = [...neighborBeliefs].sort((a, b) => a - b);

      if (sorted.length >= 2) {
        // SW-MSR: Trim the highest outlier(s) (malicious/sleeper panic signals)
        const trimCount = Math.max(1, Math.floor(sorted.length * 0.25));
        const trustedNeighbors = sorted.slice(0, sorted.length - trimCount);
        const sumTrusted = trustedNeighbors.reduce((acc, val) => acc + val, 0);
        const avgTrusted = sumTrusted / trustedNeighbors.length;

        targetBelief = agent.belief * 0.85 + avgTrusted * 0.15;
      } else {
        // Single neighbor under SW-MSR: Guard against suspicious extreme panic signal (>0.7)
        const neighborVal = sorted[0];
        if (neighborVal > 0.7 && agent.belief < 0.4) {
          // Filter suspicious single-source panic
          targetBelief = agent.belief * 0.95 + neighborVal * 0.05;
        } else {
          targetBelief = agent.belief * 0.85 + neighborVal * 0.15;
        }
      }
    } else {
      // Standard DeGroot consensus update (Vulnerable to SPM attack)
      const sumNeighbor = neighborBeliefs.reduce((acc, val) => acc + val, 0);
      const avgNeighbor = sumNeighbor / neighborBeliefs.length;

      targetBelief = agent.belief * 0.65 + avgNeighbor * 0.35;
    }

    // Small cognitive noise
    targetBelief += (Math.random() - 0.5) * 0.008;
    targetBelief = Math.max(0, Math.min(1, targetBelief));

    if (targetBelief > 0.7 && agent.belief <= 0.7) {
      beliefSpikes++;
    }

    newBeliefs[i] = targetBelief;
  }

  // Apply new beliefs and update LLR + Faction IDs
  for (let i = 0; i < agents.length; i++) {
    agents[i].belief = newBeliefs[i];
    agents[i].llr = calculateLLR(newBeliefs[i]);

    if (agents[i].belief < 0.35) {
      agents[i].factionId = 0; // Alpha Faction (Safe/Truth - Green)
    } else if (agents[i].belief < 0.7) {
      agents[i].factionId = 1; // Beta Faction (Uncertain - Neutral)
    } else {
      agents[i].factionId = 2; // Gamma Faction (Panic - Orange/Red)
    }
  }

  return { beliefSpikes, defenseTriggers };
}
