# Master Insights — "Layered Society": Digital Twin đa tầng cho SPM Research

## 1. Tầm nhìn (Vision)

Mục tiêu: xây một sandbox mô phỏng xã hội đa agent, đủ giàu để vừa là **testbed thực
nghiệm** cho framework SPM (Strategic Partial Misinformation) / SW-MSR đang làm, vừa là
bước đệm khái niệm hướng tới câu hỏi lớn hơn "mô phỏng con người ảo" (kiểu Fluctlight
trong SAO).

**Điểm cần thành thật ngay từ đầu:** mô phỏng ý thức/linh hồn con người như Fluctlight
vẫn là sci-fi — chưa ai biết có khả thi vật lý hay không, và đó không phải target khả thi
cho một project cá nhân/nghiên cứu. Hướng đi thật, đang được publish, là xếp chồng nhiều
tầng mô hình đơn giản để tạo ra hành vi tập thể phức tạp — đây là cách field "generative
agents" / "agent-based social simulation" đang làm.

## 2. Kiến trúc 4 tầng (5 tính cả world box)

### Layer 0 — World Box (nền tảng)
Sandbox 2D, có tài nguyên, ngày/đêm, agent di chuyển, năng lượng/đói. Đây là "đĩa petri" —
không có nó thì không có nơi để mọi layer khác chạy.

### Layer 1 — Neuron-level twin
Mỗi agent có "não" = 1 NN nhỏ (feedforward 2-3 layer) hoặc leaky integrate-and-fire (LIF)
neuron model nếu muốn đúng chất spiking hơn. Input = tín hiệu giác quan (agent lân cận,
tài nguyên, message nhận được), output = hành động. Đây là digital twin thu nhỏ của hệ
thần kinh — không cần đúng sinh học, chỉ cần một substrate tính toán "sống" bên dưới
belief layer.

### Layer 2 — Belief / SPM engine (LÕI cho nghiên cứu)
Mỗi agent mang một belief vector (hoặc scalar), update theo log-likelihood ratio (LLR)
dựa trên tín hiệu từ hàng xóm — đúng công cụ Fisher information / LLR đang dùng trong SPM.

- **Sleeper agent**: bị "cài" từ đầu, giữ hành vi bình thường tới khi một
  threshold/trigger kích hoạt, sau đó bắt đầu rải misinformation có kiểm soát (partial,
  không phải full — đúng tinh thần "Strategic Partial" trong SPM).
- **SW-MSR defense**: bật/tắt được như một flag, để so sánh belief convergence có/không
  có defense — một dạng stress-test trực quan cho thuật toán.

### Layer 3 — Social/graph layer
Agent kết nối nhau qua đồ thị small-world (Watts-Strogatz: n node, k hàng xóm gần, xác
suất rewire p). Track live: algebraic connectivity (Fiedler value), clustering
coefficient, average path length. Faction hiện ra bằng màu cụm.

### Layer 4 — Generative/"soul" layer
Layer gần "SAO" nhất về ý tưởng, nhưng thực tế nhất về mặt khoa học: thỉnh thoảng, một
agent "reflective" đặc biệt được gọi thật qua LLM (Claude/Gemini API) để sinh ra một đoạn
suy nghĩ/quyết định dựa trên belief + memory tích lũy, thay vì chỉ chạy rule cứng. Hướng
này đã được chứng minh khả thi bởi paper **Generative Agents (Park et al., 2023 —
"Stanford Smallville")**: agent có memory stream, reflection, planning dựa trên LLM, tạo
ra hành vi xã hội emergent mà không lập trình cứng.

## 3. Vì sao xếp theo thứ tự 0→1→2→3→4

Mỗi layer là input cho layer sau — build ngược thứ tự sẽ phải giả lập input giả, tốn công
gấp đôi. World box trước vì mọi thứ cần "sống" ở đâu đó. Neuron trước belief vì belief
update cần một cơ chế ra quyết định có sẵn để gắn vào. Social graph sau belief vì graph
chỉ có ý nghĩa khi có gì đó lan truyền qua nó. Generative layer cuối cùng vì nó là lớp
"xa xỉ" — tốn API call, chỉ nên bật cho vài agent đặc biệt sau khi phần còn lại đã ổn định.

## 4. Research framing — field thật để tham khảo thêm

- **Generative Agents** (Park et al., 2023) — agent có LLM-driven memory/reflection/plan,
  hành vi xã hội emergent trong sandbox "Smallville".
- **Cognitive architectures** — ACT-R, Soar, LIDA: mô hình tính toán về "tâm trí" agent,
  dùng làm khung tham khảo cho Layer 1+2.
- **Whole brain emulation** (Sandberg & Bostrom, roadmap report 2008) — khung lý thuyết
  nghiêm túc nhất về khả năng mô phỏng não, hữu ích để hiểu ranh giới giữa "mô phỏng hành
  vi" (cái project này làm) và "mô phỏng ý thức" (chưa ai làm được, kể cả về lý thuyết).
- **Agent-based social simulation** / opinion dynamics (voter model, DeGroot model,
  bounded confidence model) — nền tảng toán cho Layer 2+3.

## 5. Map ngược vào paper SPM/SW-MSR

| Layer chạy được | Data/figure có thể dùng cho paper |
|---|---|
| Layer 2 (belief + sleeper agent) | Belief trajectory theo thời gian, LLR shift plot — minh họa cơ chế tấn công SPM |
| Layer 2 + SW-MSR toggle | So sánh convergence có/không defense — stress-test trực quan cho thuật toán |
| Layer 3 (graph + faction) | Faction formation map, spectral connectivity vs tốc độ lan tin — case cho hướng "large-scale belief formation" đang rank cao nhất |
| Layer 1 (firing pattern) | Optional appendix — minh họa substrate tính toán bên dưới, không bắt buộc cho core paper |
| Layer 4 (generative) | Hướng mở rộng tương lai — "SPM trong xã hội LLM agent", câu hỏi nghiên cứu mới hoàn toàn |

## 6. Tech stack gợi ý

- Layer 0-3: JavaScript thuần + Canvas (nhẹ, dễ port qua AI Studio/Antigravity), hoặc
  Three.js nếu muốn 2.5D/3D.
- Neuron layer: tự viết NN nhỏ bằng tay (dễ hiểu, dễ tune) — TensorFlow.js chỉ cần nếu
  scale lên hàng nghìn agent.
- Graph layer: D3.js cho force-directed layout + tính spectral metrics bằng math.js.
- Generative layer: gọi API Claude hoặc Gemini trực tiếp từ artifact/app, giới hạn tần
  suất gọi (token-constrained, giống Commander agent trong game bullet-heaven đang có sẵn).

## 7. Ghi log để dùng lại cho nghiên cứu

Ngay từ Layer 2, xuất log ra JSON/CSV theo mỗi tick: `{tick, agent_id, belief, llr,
neighbors_influenced}`. Đừng chỉ vẽ đẹp rồi bỏ — số liệu này chính là raw data cho phần
experiments sau này.
