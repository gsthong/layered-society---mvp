---
name: worldbox-environment
description: Use this skill when building or modifying the Layer 0 world/environment engine for the Layered Society simulation — the 2D sandbox, resource system, tick loop, and agent lifecycle that all other layers (neuron brain, belief, social graph, generative) attach to.
---

# Worldbox Environment Skill

## Mission
Build a clean, deterministic, modular simulation loop that acts as the "petri dish" for
all agents. This layer owns: the world state, the tick/update loop, resource spawning,
agent lifecycle (spawn/energy/death/respawn), and rendering. It must expose a clear,
stable interface so Layer 1-4 skills can attach agent behavior without touching this
file.

## When to use
- Setting up a new Layered Society project from scratch.
- Refactoring an AI-Studio-generated prototype into a production-structured project.
- Adding new world mechanics (day/night, terrain, new resource types).
- Debugging simulation loop timing/performance issues.

## Instructions

1. **File structure** — create these files, do not merge them:
   - `world.js` — world state, tick loop, resource logic
   - `agent.js` — base agent class/struct (position, energy, id), NOT brain logic
   - `render.js` — canvas/SVG drawing only, no simulation logic
   - `main.js` — wires everything together, owns the animation frame loop

2. **World state shape** — use a flat, serializable object:
   ```js
   {
     tick: 0,
     width: 800,
     height: 600,
     resources: [{ id, x, y, amount }],
     agents: [{ id, x, y, energy, alive, ...layerData }]
   }
   ```
   Every later layer (brain, belief, graph) should add its own namespaced field inside
   each agent object (e.g. `agent.brain`, `agent.belief`, `agent.social`) rather than
   flattening new top-level fields. This keeps merges between layers conflict-free.

3. **Tick loop** — separate `update(state, dt)` (pure logic, no rendering) from
   `render(state, ctx)` (pure drawing, no logic). This makes it possible to run the
   simulation headless later for batch experiments (important for generating paper
   data — see `01_MASTER_INSIGHTS.md` section 7).

4. **Resource regeneration** — resources should regenerate on a timer, not instantly,
   to create scarcity dynamics that later layers (belief/misinformation about resource
   locations) can exploit.

5. **Agent lifecycle** — energy depletes each tick; at 0, agent becomes `alive: false`
   and stops updating; respawn after N ticks at a random position with fresh energy.
   Do NOT delete dead agents from the array — keep their id stable so later layers
   (social graph edges, belief history) don't break.

6. **Determinism** — use a seedable PRNG (not `Math.random()` directly) for resource
   placement and respawn positions, so experiments can be reproduced exactly. This
   matters for research reproducibility.

7. **Logging hook** — expose a `world.onTick(callback)` hook that fires once per tick
   with the full state, so later layers can log data without modifying this file.

## Validation checklist
- [ ] Simulation runs headless (no canvas) without errors
- [ ] Same seed produces identical resource placement across runs
- [ ] Agent count can scale to 200+ without frame drops
- [ ] `update()` and `render()` are fully separated (no drawing code in update)
- [ ] Dead agents keep stable IDs through respawn
