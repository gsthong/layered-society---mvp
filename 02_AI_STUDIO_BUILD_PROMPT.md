# AI Studio Build Prompt — Layer 0 + Layer 1 Prototype

**Cách dùng:** Mở https://aistudio.google.com → chọn **Build** → dán toàn bộ nội dung
trong khối code bên dưới vào ô prompt → Run. Sau khi có bản đầu, cứ chat tiếp để iterate
("thêm slider tốc độ", "cho agent màu theo năng lượng"...).

---

```
Build a single-page interactive web app called "Layered Society — MVP" using React
and Canvas (or SVG). No backend needed, everything runs client-side.

CONCEPT:
A 2D "world box" sandbox where small agents move around, gather energy, and make
decisions using a tiny neural network "brain". This is a research prototype for an
agent-based social simulation project, not a game — prioritize clarity and
inspectability over polish.

CORE FEATURES:

1. World (Layer 0):
   - A bounded 2D canvas (e.g. 800x600), agents move continuously within bounds.
   - Scatter 15-30 "resource" dots randomly on the map that regenerate slowly over time.
   - Each agent has an energy value (0-100) that depletes over time and increases when
     near/touching a resource.
   - Agents that hit 0 energy stop moving (visually greyed out) and respawn after a few
     seconds with random position and full energy.

2. Agent brain (Layer 1):
   - Each agent has a tiny feedforward neural network: inputs = [distance to nearest
     resource, angle to nearest resource, distance to nearest other agent, own energy
     level] (normalize all to 0-1), one hidden layer (4-6 neurons, ReLU), output =
     [turn left/right, move speed] via a small output layer.
   - Weights start random per agent (so behavior varies) — no training required, this
     is just for visual/behavioral variety, not optimization.
   - Add a "brain inspector" panel: when the user clicks an agent, show a simple
     visualization of its neurons as circles with brightness/color representing
     current activation value, updating in real time (a small heatmap-style diagram
     is fine).

3. Controls (top or side panel):
   - Number of agents slider (5-100)
   - Simulation speed slider
   - Pause/Play/Reset buttons
   - Toggle to show/hide agent "vision lines" (line from agent to what it's sensing)

4. Stats panel:
   - Live count of active vs depleted agents
   - Average energy across all agents
   - Simple line chart (last ~100 ticks) of average energy over time

VISUAL STYLE:
Clean, dark background, agents as small glowing circles with a subtle trail, resources
as small green dots. This is a science/research tool aesthetic, not cute or cartoonish —
think "particle simulation" or "flocking demo" visual style, minimal UI chrome.

TECHNICAL NOTES:
- Keep the neural network code in a clearly separate module/function so it's easy to
  extend later.
- Keep agent state as a flat array of objects (not deeply nested) so it's easy to log
  or export later.
- Add an "Export state as JSON" button that downloads the current tick's full agent
  state array.

This is step 1 of a larger multi-layer project — keep the code modular and readable
since more layers (belief propagation, social graph, LLM-driven agents) will be added
on top later in a different tool.
```
