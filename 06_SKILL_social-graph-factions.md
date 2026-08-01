---
name: social-graph-factions
description: Use this skill when implementing or modifying Layer 3 of the Layered Society simulation — the small-world social graph connecting agents, spectral graph metrics, and faction/echo-chamber visualization. Depends on worldbox-environment and belief-spm-engine skills (this layer needs beliefs to visualize factions and needs agents to exist to connect them).
---

# Social Graph / Factions Skill

## Mission
Give agents a persistent social network (not just proximity) so belief signals in Layer
2 propagate over a realistic topology instead of "whoever is nearby right now." Track
spectral properties of this graph live, and visually cluster agents into factions based
on belief similarity — this is the payoff layer for the "large-scale belief/faction
formation" research direction.

## When to use
- Replacing proximity-based signal propagation with a real graph structure.
- Adding small-world (Watts-Strogatz) topology generation.
- Computing/displaying spectral metrics (algebraic connectivity, clustering coefficient).
- Building the faction/cluster visualization overlay.

## Instructions

1. **Namespace** — graph data can live at the world level (it's shared structure, not
   per-agent), e.g. `world.graph = { edges: [[agentIdA, agentIdB], ...] }`. Each agent
   can also cache `agent.social.neighborIds` for fast lookup during belief updates.

2. **Watts-Strogatz generation**
   - Parameters: `n` (agent count, matches world agent count), `k` (initial ring
     lattice neighbors per node, even number), `p` (rewire probability, slider 0-1).
   - Standard algorithm: start with a ring lattice (each node connected to k nearest
     neighbors), then for each edge, with probability `p` rewire one endpoint to a
     random node (avoiding self-loops and duplicate edges).
   - Regenerating the graph should be a one-click action, separate from restarting the
     whole simulation, so users can explore topology effects on a fixed belief scenario.

3. **Spectral metrics (compute and display live)**
   - Build the graph Laplacian `L = D - A` (D = degree matrix, A = adjacency matrix).
   - Algebraic connectivity = second-smallest eigenvalue of L (Fiedler value) — lower
     means the graph is closer to disconnected/clustered.
   - Clustering coefficient (standard local + global average).
   - Average shortest path length (fine to approximate via BFS sampling for large n
     rather than full all-pairs for performance).
   - Display these as a small live-updating stats panel, and re-show whenever `p` or
     `k` changes.

4. **Feed into belief-spm-engine**
   - Update the belief-spm-engine skill's neighbor lookup to use `agent.social.
     neighborIds` from this graph instead of spatial proximity, once this layer exists.
   - This is a one-line swap if belief-spm-engine was built with a clean neighbor
     interface (see that skill's step 2) — if it wasn't, fix that interface first
     rather than hacking around it here.

5. **Faction visualization**
   - Simplest approach (no full community detection needed): threshold agents into
     2-4 buckets by belief value, color each bucket, draw edges dimmer/thinner between
     different-belief agents and brighter/thicker within same-belief clusters.
   - Optional upgrade: run a lightweight community detection (e.g. label propagation)
     on the graph and color by detected community instead of raw belief threshold, to
     see whether social clusters and belief clusters actually align or diverge — this
     divergence/alignment is itself an interesting research signal.

## Validation checklist
- [ ] Watts-Strogatz graph generation matches expected properties at p=0 (ring lattice)
      and p=1 (near-random graph) as sanity checks
- [ ] Algebraic connectivity visibly drops as clustering/faction formation increases
- [ ] Belief propagation in Layer 2 uses graph neighbors, not raw proximity, once this
      layer is active
- [ ] Faction coloring updates live as beliefs shift
- [ ] Metrics panel doesn't recompute full eigendecomposition every single tick if n is
      large (throttle to every N ticks for performance)
