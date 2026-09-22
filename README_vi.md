![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (Tiếng Việt)

Không gian làm việc desktop mã nguồn mở để tạo ảnh và video AI, phát triển từ Flaq SaaS Template. Tên ứng dụng sau khi
cài đặt vẫn là Flaq Creator.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

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

## Triển khai hiện tại

Tauri 2 và Rust chạy giao diện tĩnh Next.js 16, React 19, không nhúng máy chủ Node.js/Next.js. Biểu mẫu, hợp đồng mô
hình và thiết kế dùng chung với bản web.

Bảy lối vào: AI Media Creator, văn bản thành ảnh, ảnh thành ảnh, thử đồ ảo, văn bản thành video, ảnh thành video và tư
liệu tham chiếu thành video. Có thư viện prompt, danh mục tư liệu có tìm kiếm, lịch sử trong Cài đặt, bản nháp IndexedDB
và lưu trữ cục bộ theo ngày. Ảnh mẫu được đóng gói; video phát trực tuyến. Tạo thành công và lưu trữ thành công là hai
trạng thái riêng.

## Bắt đầu nhanh

Chạy tại thư mục gốc kho mã này. Cần Node.js 22, pnpm 10.5.2, Rust và các phụ thuộc Tauri theo hệ điều hành. Trong Cài
đặt → Kết nối, nhập Client Key Flaq.ai, kiểm tra rồi lưu. Base URL mặc định: `https://api.flaq.ai`. Tạo nội dung thật
cần mạng và tín dụng API.

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

- `pnpm build:desktop` → `out/`
- `pnpm desktop:build` → Tauri
- `pnpm check` → TypeScript + tests + ESLint
- Web: `pnpm dev`; `pnpm build` + `pnpm start`

[Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) ·
[README: setup / architecture / tests](./README.md#getting-started) ·
[模块扩展 / Adding modules](./docs/ADDING_MODULES.md)

## Tải lên và thông tin xác thực

Tải lên mặc định lấy URL ký tạm thời từ Flaq `/api/v1/files/presignedUrl`. Thông tin R2 dùng chung nằm trên máy chủ;
không cần tài khoản Cloudflare riêng. Có thể dùng R2 riêng với ký tại máy. Cấu hình AES-GCM trong WebView không phải kho
khóa của hệ điều hành. Khi chọn ghi nhớ, Client Key được lưu dạng văn bản thuần trong `auth.json` tại thư mục cấu hình
ứng dụng.

## Nền tảng và ngôn ngữ

Cấu hình phát hành gồm macOS Apple Silicon/Intel (DMG, ZIP) và Windows x64 (NSIS EXE). Linux có thể biên dịch từ nguồn
nhưng chưa thuộc ma trận phát hành. Các gói hiện chưa ký mã. Có 15 ngôn ngữ đăng ký, nhưng một phần bảng cài đặt, tư
liệu và prompt mới chỉ có tiếng Trung/Anh: `zh`/`tw` dùng chung tiếng Trung, các ngôn ngữ khác dùng tiếng Anh. Desktop
luôn có tiền tố ngôn ngữ, kể cả `/en/`; web tiếng Anh dùng `/`, ngôn ngữ khác có tiền tố. Tiếng Ả Rập dùng RTL.

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

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
