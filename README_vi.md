# Flaq SaaS Template (Tiếng Việt)

Mẫu SaaS miễn phí và mã nguồn mở để xây dựng nền tảng tạo ảnh, video AI bằng API hợp nhất của Flaq.ai.

## Giới thiệu Flaq.ai

[Flaq.ai](https://flaq.ai/vi/) là nền tảng mô hình AI dành cho nhà sáng tạo và lập trình viên. Một khóa API cung cấp
quyền truy cập thống nhất vào khả năng tạo và chỉnh sửa ảnh, tạo video và các mô hình ngôn ngữ.

- **Khám phá và so sánh mô hình** — Xem khả năng, tham số được hỗ trợ và giá hiện tại tại
  [Model Market](https://flaq.ai/model-market/).
- **Thử trước khi tích hợp** — Dùng Playground của Flaq.ai để thử các mô hình được hỗ trợ, tinh chỉnh prompt và cài đặt
  tạo nội dung.
- **Xây dựng quy trình sáng tạo** — Tham khảo [tài liệu API](https://flaq.ai/docs/) để tích hợp AI vào sản phẩm và công
  cụ của bạn.

Flaq Creator Desktop đưa các quy trình ảnh và video vào không gian làm việc riêng trên máy tính. Kết nối Client Key
Flaq.ai trong ứng dụng để tạo và quản lý nội dung trực quan. Không phải mọi API của nền tảng đều có trong ứng dụng máy
tính; xem mô hình và giá hiện hành tại Flaq.ai.

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

## Quốc tế hóa

Mã nguồn và README hỗ trợ cùng 15 locale: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`,
`vi`, `ar`. Tiếng Anh dùng `/`, các ngôn ngữ khác dùng `/{locale}/`, còn tiếng Ả Rập được hiển thị từ phải sang trái.

## Chương trình tiếp thị liên kết Flaq.ai

Trở thành đối tác liên kết Flaq.ai và nhận hoa hồng khi giới thiệu quy trình ảnh và video AI, API mô hình và công cụ
sáng tạo. Chương trình chào đón nhà sáng tạo, nhà thiết kế, lập trình viên, giảng viên AI, người đánh giá mô hình và các
nhóm chia sẻ quy trình AI thực tiễn.

- **Thưởng giới thiệu** — Nhận 20% từ đơn trả phí hợp lệ đầu tiên của người được giới thiệu và 10% từ các đơn trả phí
  hợp lệ tiếp theo trong vòng 60 ngày sau khi họ đăng ký, theo quy định về điều kiện và ghi nhận giới thiệu.
- **Quảng bá linh hoạt** — Chia sẻ liên kết qua hướng dẫn, đánh giá mô hình, sản phẩm sáng tạo, cộng đồng hoặc tài liệu
  tích hợp API.
- **Không gian đối tác** — Quản lý liên kết, xem hoạt động giới thiệu và thiết lập nhận tiền trên Flaq.ai.

Đăng nhập Flaq.ai, hoàn thành hồ sơ và chấp nhận thỏa thuận liên kết, sau đó tạo liên kết riêng. Dự án cũng có các mục
giới thiệu chương trình theo ngôn ngữ; việc đăng ký đối tác và quản lý hoa hồng diễn ra trên Flaq.ai, không phải trong
ứng dụng máy tính.

**[Tham gia chương trình tiếp thị liên kết Flaq.ai →](https://flaq.ai/vi/affiliate-program/)**

> Điều kiện nhận hoa hồng, ghi nhận giới thiệu, hoàn tiền, xét duyệt chi trả và thỏa thuận riêng đã được phê duyệt tuân
> theo các điều khoản mới nhất trên trang chính thức.

## Tài liệu và giấy phép

Để xem thiết lập đầy đủ, công nghệ và triển khai, hãy đọc [README.md](./README.md) hoặc [README_zh.md](./README_zh.md).
Dự án được phát hành theo [MIT License](LICENSE).
