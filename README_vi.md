# Flaq SaaS Template (Tiếng Việt)

Mẫu SaaS miễn phí và mã nguồn mở để xây dựng nền tảng tạo ảnh, video AI bằng API hợp nhất của Flaq.ai.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## Giới thiệu mẫu

Được xây dựng bằng Next.js 16, React 19, TypeScript và Tailwind CSS. Mẫu cung cấp năm quy trình sẵn dùng: văn bản thành
ảnh, ảnh thành ảnh, văn bản thành video, ảnh thành video và thử đồ ảo.

### Tính năng chính

- 🎨 Trang tạo ảnh và video với lựa chọn mô hình, tham số
- 🔌 Tích hợp API Flaq.ai bằng một Client Key
- 🧠 Hỗ trợ Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu và nhiều mô hình khác
- 🌐 15 ngôn ngữ cho giao diện, định tuyến và liên kết SEO thay thế
- ☁️ Tải lên Cloudflare R2 và lưu trữ nội dung đã tạo
- 🔒 Lưu khóa API được mã hóa ở phía máy khách
- 📱 Giao diện thích ứng, chế độ tối và lịch sử tạo nội dung

## Giới thiệu Flaq.ai

[Flaq.ai](https://flaq.ai/vi/) tập hợp các mô hình tạo ảnh và video hàng đầu trong một API với cơ chế xác thực thống
nhất. Mẫu đã triển khai sẵn kết nối API, kiểm tra trạng thái, hiển thị kết quả và tải xuống.

## Bắt đầu nhanh

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

Đặt `NEXT_PUBLIC_SITE_URL` trong `.env.local` và thêm cấu hình Cloudflare R2 khi cần. Sau đó nhập Client Key
[Flaq.ai](https://flaq.ai/vi/) trong phần cài đặt ứng dụng. Xem [tài liệu tiếng Anh đầy đủ](./README.md#getting-started)
để biết toàn bộ biến môi trường và các bước thiết lập.

## Chương trình tiếp thị liên kết Flaq.ai

Với [Chương trình tiếp thị liên kết Flaq.ai](https://flaq.ai/vi/affiliate-program?utm_source=flaq-saas-template), bạn có
thể nhận hoa hồng 20% từ đơn trả phí hợp lệ đầu tiên của người được giới thiệu và 10% từ các đơn hợp lệ tiếp theo trong
vòng 60 ngày sau khi họ đăng ký. Điều kiện và thanh toán tuân theo quy định mới nhất trên trang chương trình.

## Quốc tế hóa

Mã nguồn và README hỗ trợ cùng 15 locale: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`,
`vi`, `ar`. Tiếng Anh dùng `/`, các ngôn ngữ khác dùng `/{locale}/`, còn tiếng Ả Rập được hiển thị từ phải sang trái.

## Tài liệu và giấy phép

Để xem thiết lập đầy đủ, công nghệ và triển khai, hãy đọc [README.md](./README.md) hoặc [README_zh.md](./README_zh.md).
Dự án được phát hành theo [MIT License](LICENSE).
