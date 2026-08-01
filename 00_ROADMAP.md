# Lộ trình xây "Layered Society" — Digital Twin đa tầng cho nghiên cứu SPM

Bộ file này dùng để build một world-box đa tầng: từ neuron-agent đơn giản đến hệ
faction/belief propagation, dùng làm sandbox thực nghiệm cho SPM/SW-MSR — đồng thời là
bước đệm *thật* (không phải sci-fi) hướng tới ý tưởng "generative agent xã hội" kiểu SAO.

## Danh sách file

| # | File | Dùng ở đâu | Vai trò |
|---|------|-----------|---------|
| 1 | `01_MASTER_INSIGHTS.md` | Đọc trước, mọi nơi | Toàn bộ context, vision, research framing |
| 2 | `02_AI_STUDIO_BUILD_PROMPT.md` | Google AI Studio (Build mode) | Prototype nhanh Layer 0+1 trong 1 buổi |
| 3 | `03_SKILL_worldbox-environment.md` | Antigravity (`skills/`) | Layer 0 — world/environment engine |
| 4 | `04_SKILL_neuron-agent-brain.md` | Antigravity (`skills/`) | Layer 1 — "não" agent |
| 5 | `05_SKILL_belief-spm-engine.md` | Antigravity (`skills/`) | Layer 2 — belief/LLR/misinformation (lõi SPM) |
| 6 | `06_SKILL_social-graph-factions.md` | Antigravity (`skills/`) | Layer 3 — small-world graph, faction |
| 7 | `07_SKILL_generative-reflective-agent.md` | Antigravity (`skills/`) | Layer 4 — LLM reflective agent |

## Chuỗi hành trình (theo đúng thứ tự này)

### Bước 0 — Nạp context (10 phút)
Đọc `01_MASTER_INSIGHTS.md`. Không cần thuộc lòng, chỉ cần nắm 4 layer + lý do xếp theo
đúng thứ tự này (mỗi layer là input cho layer sau, build ngược sẽ phải giả lập input giả).

### Bước 1 — Prototype nhanh trên Google AI Studio (1 buổi)
Copy toàn bộ nội dung trong `02_AI_STUDIO_BUILD_PROMPT.md` → dán vào Build mode
(aistudio.google.com → Build). Mục tiêu: có ngay world box + agent "não" nhỏ chạy được
để cảm nhận cơ chế, KHÔNG cần đúng kiến trúc chuẩn ngay. AI Studio mạnh ở chỗ iterate
nhanh qua chat ("làm world to hơn", "thêm slider tốc độ") — cứ đẩy tới khi thấy đã rồi dừng.

### Bước 2 — Chuyển qua Antigravity, build "cho thật" theo layer
Khi đã có cảm giác về cơ chế, mở Antigravity, tạo project mới, bỏ 5 file skill (mục 3→7)
vào thư mục `skills/` của workspace (Antigravity đọc chuẩn SKILL.md, tương thích với
format Claude Code/Codex nên không cần chỉnh gì thêm). Build tuần tự — đừng nhảy cóc,
mỗi layer phụ thuộc layer trước:

1. **`03_SKILL_worldbox-environment.md`** — dựng environment/render loop sạch, tách khỏi
   bản prototype AI Studio (copy phần logic hay, viết lại structure cho chuẩn).
2. **`04_SKILL_neuron-agent-brain.md`** — gắn "não" NN nhỏ cho từng agent, thêm
   visualize firing khi click chọn agent.
3. **`05_SKILL_belief-spm-engine.md`** — layer quan trọng nhất với paper: gắn belief
   vector + LLR update + sleeper/misinformation agent + toggle SW-MSR.
4. **`06_SKILL_social-graph-factions.md`** — thêm small-world graph nối agent, tính
   spectral metrics, tô màu faction.
5. **`07_SKILL_generative-reflective-agent.md`** — layer cuối, gọi LLM cho 1 agent
   "reflective" đặc biệt, sinh suy nghĩ dựa trên belief + memory tích lũy.

### Bước 3 — Map ngược lại vào paper SPM/SW-MSR
Sau khi Layer 2+3 chạy ổn, đây chính là nguồn data thực nghiệm: belief trajectory theo
thời gian, LLR shift, tốc độ hội tụ faction, so sánh có/không SW-MSR. Chi tiết mapping ở
mục 5 của `01_MASTER_INSIGHTS.md`.

## Nguyên tắc chung khi build
- Đừng cố làm cả 4 layer cùng lúc — mỗi layer phải chạy độc lập & bật/tắt được (feature
  flag) trước khi ghép layer sau.
- Log dữ liệu ra JSON/CSV ngay từ Layer 2, vì mục tiêu cuối là dùng số liệu cho paper,
  không chỉ demo cho vui.
- Giữ code tách file theo layer (`world.js`, `brain.js`, `belief.js`, `graph.js`,
  `generative.js`) để sau này dễ viết riêng từng phần vào Methods section.
