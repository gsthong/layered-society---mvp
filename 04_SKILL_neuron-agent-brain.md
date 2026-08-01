---
name: neuron-agent-brain
description: Use this skill when implementing or modifying Layer 1 of the Layered Society simulation — the per-agent neural "brain" that turns sensory input into actions, plus the live activation/firing visualization. Depends on the worldbox-environment skill already being in place.
---

# Neuron Agent Brain Skill

## Mission
Give each agent a small, inspectable decision-making substrate — a tiny neural network
(or spiking neuron model) that consumes sensory input from the world and outputs an
action. This is a "digital twin" of a nervous system in miniature: not biologically
accurate, but a real computational substrate that Layer 2 (belief) will sit on top of.

## When to use
- Adding brain/decision logic to agents after the world loop (Layer 0) already runs.
- Building the brain-inspector visualization (click an agent, see its neurons fire).
- Switching between the simple feedforward model and a spiking (LIF) model.
- Tuning sensory input normalization or network size.

## Instructions

1. **Namespace** — all brain state lives under `agent.brain`, never at the top level
   of the agent object (see worldbox-environment skill for why).

2. **Two model options, pick one to start (feedforward is faster to ship):**

   **Option A — Feedforward NN (recommended first pass)**
   - Inputs (normalize all to [0,1]): distance to nearest resource, angle to nearest
     resource, distance to nearest other agent, own energy level. Add more inputs
     later (e.g. incoming belief signal) without changing this skill's structure.
   - 1 hidden layer, 4-8 neurons, ReLU activation.
   - Output layer: 2-3 neurons (turn direction, move speed, optionally an "assert
     belief" action used by Layer 2).
   - Weights: random per agent at spawn (no training loop needed — variety, not
     optimization, is the goal at this stage).

   **Option B — Leaky integrate-and-fire (LIF) spiking model**
   - Each neuron has membrane potential `v`, threshold `v_th`, leak rate, refractory
     period. On spike: reset `v`, emit output pulse, enter refractory.
   - Use this only if the visual "firing pattern" is important to the deliverable —
     it's more expensive to simulate at scale (200+ agents).

3. **Brain inspector panel**
   - On agent click, render a small diagram: circles for each neuron, brightness/color
     mapped to current activation (or membrane potential for LIF), updating every tick
     the agent is selected.
   - Keep this panel decoupled — it should read `agent.brain.activations` (an array you
     populate each tick), not recompute anything itself.

4. **Performance** — cap the number of agents with an *active* brain-inspector render
   to 1 at a time (the selected agent); other agents still compute their brain step but
   don't need per-tick visualization.

5. **Interface for Layer 2** — expose `agent.brain.lastOutput` (the action vector) so
   the belief layer can read what the agent "decided" without recomputing the network.

## Validation checklist
- [ ] Brain state is fully namespaced under `agent.brain`
- [ ] Agents show visibly different behavior from random initial weights
- [ ] Clicking an agent shows live-updating neuron activations
- [ ] Brain computation doesn't block the render loop at 100+ agents
- [ ] `agent.brain.lastOutput` is readable by other modules without recomputation
