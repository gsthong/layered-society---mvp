# 🌍 LAYERED SOCIETY: Adversarial AI & Social Contagion Simulator

Đây là một môi trường giả lập Xã hội Đa tác tử (Multi-Agent Sandbox) kết hợp Trí tuệ Nhân tạo (LLM & Machine Learning) chuyên dụng cho nghiên cứu sự lây lan của **Tin giả chiến lược (Strategic Partial Misinformation)** và cơ chế phòng thủ **SW-MSR Tiến hóa**.

Hệ thống được chia thành 2 phần chính:
1. **React / TypeScript Simulator:** Trình mô phỏng trực quan và hệ thống sinh dữ liệu (Data Generation).
2. **Python AI Pipeline:** Trí tuệ nhân tạo (Học không giám sát) để phân tích dữ liệu và bắt tin giả.

---

## PHẦN 1: CHẠY TRÌNH MÔ PHỎNG (REACT + NODE)

**Yêu cầu hệ thống:** Có cài đặt [Node.js](https://nodejs.org/).

### 1. Cài đặt thư viện
Mở Terminal tại thư mục gốc của dự án (`d:\layered-society---mvp`) và chạy:
```bash
npm install
```

### 2. Cấu hình Gemini API (Tùy chọn)
Nếu bạn muốn các Agent tự động suy nghĩ và đưa ra Reflection (Tự sự nội tâm):
- Copy file `.env.example` thành file `.env`.
- Điền API Key của Google Gemini vào biến `GEMINI_API_KEY`.
*(Lưu ý: Nếu không có API Key, hệ thống vẫn mô phỏng bình thường với thông báo Tự sự nội tâm giả lập, không ảnh hưởng đến các mô hình Vật lý và Niềm tin).*

### 3. Chạy Server Giao diện
```bash
npm run dev
```
- Mở trình duyệt và truy cập: **http://localhost:5173** (Hoặc cổng được báo trong Terminal).
- **Cách dùng:**
  - Kéo thanh trượt **Seed** và **Speed**.
  - Nhấn nút **[BATCH CSV]** (Màu Tím) để giả lập cực nhanh 5000 Ticks và tự động xuất ra file `layered-society-batch-run.csv` (Chứa dữ liệu toàn cục).
  - Nhấn nút **[ML DATA]** (Màu Xanh Dương) để tự động xuất ra file `ml-agent-dataset.csv` (Chứa dữ liệu của từng Agent để AI học).
- **Hãy copy 2 file CSV được tải xuống (thường nằm ở thư mục Downloads) thả vào thư mục gốc của dự án này.**

---

## PHẦN 2: CHẠY TRÍ TUỆ NHÂN TẠO & VẼ BIỂU ĐỒ (PYTHON)

**Yêu cầu hệ thống:** Có cài đặt Python 3.x.

### 1. Cài đặt thư viện Python
Mở một Terminal mới, đi vào thư mục `research/` và cài đặt các gói AI:
```bash
cd research
pip install -r requirements.txt
```

### 2. Vẽ biểu đồ học thuật (Statistical Visualization)
Để vẽ đường cong lây nhiễm tin giả và đường cong suy giảm Gắn kết xã hội:
```bash
python 01_data_visualization.py
```
> Sẽ tự động sinh ra một file ảnh `01_contagion_plot.png` rất sắc nét dùng cho bài báo khoa học.

### 3. Khởi động AI "Bắt" Tin giả (Unsupervised Anomaly Detection)
Để kiểm tra xem AI (Mô hình Rừng Cô Lập - Isolation Forest) có khả năng tự động học hành vi dị thường và phát hiện ra các Sleeper Agents mà không cần cho trước đáp án hay không:
```bash
python 02_ai_sleeper_detection.py
```
> Trình điều khiển sẽ in ra Báo cáo Đánh giá (Classification Report) và Ma trận nhầm lẫn (Confusion Matrix) để bạn đưa vào kết quả nghiên cứu.

---
*Dự án được xây dựng với mục tiêu cung cấp bằng chứng thực nghiệm về sự nguy hiểm của Trí tuệ nhân tạo đối kháng (Adversarial AI) trong Chiến tranh nhận thức.*