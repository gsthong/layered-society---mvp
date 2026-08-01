---
name: belief-spm-engine
description: Use this skill when implementing or modifying Layer 2 of the Layered Society simulation — per-agent belief state, LLR-based belief updates, sleeper/misinformation agents, and the SW-MSR defense toggle. This is the core research layer that ties the simulation to the SPM (Strategic Partial Misinformation) framework. Depends on worldbox-environment and neuron-agent-brain skills.
---

# Belief / SPM Engine Skill

## Mission
Implement the core research mechanic: agents hold a belief state that updates based on
signals from neighbors, using log-likelihood ratio (LLR) style updates. A subset of
agents can be "sleeper" agents that inject partial, strategic misinformation once a
trigger condition is met. An optional SW-MSR-style defense can be toggled on to observe
its effect on belief convergence. This layer produces the actual experimental data for
the SPM/SW-MSR paper — prioritize correctness and loggability over visual polish.

## When to use
- Adding belief state and propagation to agents.
- Implementing sleeper agent trigger logic.
- Implementing or toggling the SW-MSR defense mechanism.
- Generating experiment data (belief trajectories, LLR shift, convergence comparisons).

## Instructions

1. **Namespace** — belief state lives under `agent.belief`, e.g.:
   ```js
   agent.belief = {
     value: 0.5,        // scalar belief in [0,1], or use a vector if multi-hypothesis
     llr: 0,             // running log-likelihood ratio
     isSleeper: false,
     triggered: false,   // has this sleeper "activated" yet
     history: []          // optional per-tick log, or log externally (see step 6)
   }
   ```

2. **Belief update rule (LLR-based)** — on each tick, an agent updates its belief from
   signals received from connected neighbors (see social-graph-factions skill for the
   edge list; if that layer isn't built yet, use simple proximity as a stand-in):
   ```
   llr_new = llr_old + Σ (signal_weight_i * log(P(signal_i | H1) / P(signal_i | H0)))
   belief_new = sigmoid(llr_new)
   ```
   Keep the likelihood model simple and documented in code comments — the exact
   distributional assumptions should match what's already used in the SPM paper's
   theory section, so confirm before inventing a different formulation from scratch.

3. **Sleeper agent logic**
   - Mark a configurable fraction of agents as `isSleeper: true` at spawn (a slider,
     e.g. 0-20%).
   - Sleeper agents behave identically to normal agents until a trigger condition is
     met (e.g. tick count threshold, or a fraction of the population reached, or an
     external command from Layer 4). This is what "strategic" and "partial" mean in
     SPM — the attack is not full-broadcast misinformation from tick 0.
   - Once triggered, sleeper agents inject a biased signal (not maximally false —
     partial/plausible bias, per the SPM framing) to their graph neighbors instead of
     their true observation.

4. **SW-MSR defense toggle**
   - Implement as a togglable flag, not a separate code path duplicated elsewhere —
     the update rule in step 2 should branch on `config.defenseEnabled`.
   - When enabled, agents should trim/weight incoming signals per the SW-MSR resilient
     aggregation rule (discard extreme values beyond a threshold before averaging) —
     confirm the exact trim parameters against the algorithm already defined in the
     paper rather than reinventing them.

5. **Visualization**
   - Color agents by belief value on a gradient (e.g. blue = belief 0, red = belief 1).
   - A live histogram of belief values across the population, updating each tick.
   - A line chart of average LLR (or belief) over time, ideally with two overlaid runs
     (defense on vs off) for direct comparison.

6. **Logging (critical — this is paper data, not just a demo)**
   - Every tick, emit `{ tick, agentId, belief, llr, isSleeper, triggered }` via the
     `world.onTick` hook from the worldbox-environment skill.
   - Provide a "Run headless batch" mode: run N ticks with no rendering, export the full
     log as JSON/CSV. This is what makes the sim reusable for the actual paper, not just
     a visual toy.

## Validation checklist
- [ ] Belief update uses LLR, not an ad-hoc averaging rule
- [ ] Sleeper agents are indistinguishable from normal agents before trigger
- [ ] SW-MSR toggle produces a visibly different convergence pattern in the belief chart
- [ ] Full per-tick belief log can be exported for offline analysis
- [ ] Defense parameters match the paper's SW-MSR definition (confirm, don't assume)
