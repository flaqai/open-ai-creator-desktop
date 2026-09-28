![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

**Ứng dụng máy tính mã nguồn mở để tạo ảnh và video bằng AI**, dành cho nhà sáng tạo, nhà thiết kế và đội ngũ thương
hiệu. Kết hợp ý tưởng prompt, tư liệu tham chiếu và bảng vẽ vô hạn để tạo, xem trước, tinh chỉnh và sắp xếp tác phẩm
ngay trên máy.

Được điều chỉnh từ [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template), ứng dụng kết nối dịch vụ mô hình
Flaq AI qua Tauri 2 + Rust và giao diện React hiện đại. Tên ứng dụng sau khi cài đặt là **Flaq Creator**.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Nền tảng mô hình Flaq AI và công cụ sáng tạo trực tuyến

[Flaq AI](https://flaq.ai/vi/) tập hợp các mô hình hàng đầu về tạo và chỉnh sửa ảnh, tạo video và xử lý ngôn ngữ cho nhà
sáng tạo, lập trình viên và doanh nghiệp.

- **API ổn định, hỗ trợ nhiều yêu cầu đồng thời** — Tích hợp tạo nội dung AI vào sản phẩm và quy trình sản xuất qua API
  thống nhất.
- **Sáng tạo trực tiếp trên mạng** — Dùng thử mô hình và công cụ trong trình duyệt tại [Flaq AI](https://flaq.ai/vi/),
  không cần viết mã hay cài ứng dụng.
- **Khám phá và tích hợp** — So sánh tại [chợ mô hình](https://flaq.ai/vi/model-market/) và bắt đầu với
  [tài liệu API](https://flaq.ai/vi/docs/).

Liên hệ kinh doanh: [contact@flaq.ai](mailto:contact@flaq.ai)

## Tính năng sáng tạo AI trên máy tính: từ ý tưởng đến ảnh và video

### Tạo ảnh, video và thử trang phục ảo

Tám lối vào hỗ trợ sáng tạo hằng ngày. Khám phá ý tưởng trong không gian chung hoặc dùng công cụ chuyên biệt cho hình
ảnh sản phẩm, mạng xã hội, ý tưởng quảng cáo và video ngắn.

| Công cụ                | Khả năng sáng tạo                                                            | Đường dẫn             |
| ---------------------- | ---------------------------------------------------------------------------- | --------------------- |
| AI Media Creator       | Tạo ảnh và video cùng một nơi, xem kết quả và hoàn thiện ý tưởng             | `/ai-media-creator`   |
| Bảng vẽ AI vô hạn      | Sắp xếp văn bản, tư liệu và thiết lập tạo nội dung trong dự án cục bộ đã lưu | `/ai-canvas`          |
| Văn bản thành ảnh      | Khám phá phong cách bìa, áp phích và bối cảnh sản phẩm từ prompt             | `/text-to-image`      |
| Ảnh thành ảnh          | Phát triển phong cách và hướng hình ảnh mới từ ảnh tham chiếu                | `/image-to-image`     |
| Thử trang phục ảo      | Kết hợp ảnh quần áo và người mẫu cho ý tưởng thời trang, thương mại          | `/virtual-try-on`     |
| Văn bản thành video    | Biến ý tưởng viết thành cảnh chuyển động và ý tưởng chiến dịch               | `/text-to-video`      |
| Ảnh thành video        | Tạo hình ảnh sản phẩm chuyển động và đoạn phim từ ảnh tĩnh                   | `/image-to-video`     |
| Tham chiếu thành video | Định hướng video bằng tư liệu tham chiếu                                     | `/reference-to-video` |

Đường dẫn bỏ qua tiền tố ngôn ngữ. Công cụ dùng chung [danh mục tính năng](./lib/features/catalog.ts). Đầu vào, giới hạn
và tham số phụ thuộc mô hình đã chọn và [hợp đồng mô hình](./lib/constants/template-models/).

### Thư viện prompt và bảng vẽ vô hạn để khám phá ý tưởng

- **Bắt đầu từ ví dụ**: duyệt thư viện, sao chép đầy đủ prompt, phóng to và di chuyển bản xem trước ảnh/video. Ảnh mẫu
  đi kèm ứng dụng; video phát trực tuyến. Tên mô hình trong bộ sưu tập không bảo đảm mô hình đó có trong biểu mẫu tạo
  nội dung.
- **Sắp xếp dự án trực quan**: đặt văn bản, tư liệu và thiết lập trên bảng vẽ, di chuyển, thu phóng và thao tác với nút.
  Lưu dự án cục bộ để tiếp tục sau.
- **Chọn mô hình theo công việc**: chỉnh tham số được hỗ trợ với trợ giúp theo ngữ cảnh. Hướng dẫn lần đầu và kiểm tra
  kết nối giúp thiết lập; giao diện và ngôn ngữ thích ứng với việc dùng hằng ngày.

### Thư viện cục bộ, khôi phục bản nháp và xuất tác phẩm

- **Tìm tham chiếu và tác phẩm**: tìm tư liệu đã tải lên và kết quả theo loại, nguồn; xem trước, tải xuống và kiểm tra
  lưu trữ cục bộ. Mở `/media-library` hoặc Cài đặt → Lịch sử.
- **Giữ tiến độ**: bản nháp lưu prompt, tham số và tư liệu trên máy; lịch sử tác vụ và chỉ mục tham chiếu cũng ở lại
  thiết bị. Khôi phục tác vụ chờ chỉ truy vấn tác vụ gốc, không gửi thêm lần tạo có phí.
- **Lưu trữ kết quả**: ảnh và video được lưu dưới `YYYY/MM/DD` trong thư mục tùy chọn để chỉnh sửa và bàn giao. Khôi
  phục lưu trữ chỉ thử lưu lại kết quả có sẵn, không tạo lại.
- **Chuẩn bị bước tiếp theo**: dùng hộp thoại lưu gốc của hệ điều hành, xuất PNG/JPEG/WebP và cắt bằng FFmpeg WASM tải
  theo nhu cầu.

### Quy trình thực tế cho nhà sáng tạo

1. Khám phá prompt mẫu hoặc sắp xếp văn bản và tham chiếu trên bảng vẽ.
2. Chọn công cụ, mô hình rồi đặt prompt, tham chiếu và tham số được hỗ trợ.
3. Gửi, xem kết quả và cải thiện lần tạo tiếp theo.
4. Tìm kết quả trong thư viện, dùng tệp đã lưu hoặc xuất cho các bước sản xuất sau.

Tạo nội dung cần mạng, Client Key Flaq AI hợp lệ và đủ tín dụng. Mô hình chạy trên đám mây; bản nháp, dự án và chỉ mục
cục bộ không có đồng bộ đám mây giữa thiết bị.

## Bắt đầu: chạy ứng dụng và kết nối Flaq AI

### Yêu cầu

- Node.js **22**, theo [.nvmrc](./.nvmrc).
- pnpm **10.5.2**, theo `packageManager` trong [package.json](./package.json).
- Rust và [điều kiện Tauri](https://v2.tauri.app/start/prerequisites/) của hệ điều hành đích cho phát triển và đóng gói
  native. Chỉ biên dịch frontend không cần Rust.
- Tài khoản Flaq AI và Client Key để tạo thật. Cách tải lên mặc định **không** cần tài khoản Cloudflare riêng.

Tại thư mục gốc kho mã:

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

Bản phát triển dùng `ai.flaq.creator.dev`; bản cài đặt dùng `ai.flaq.creator`. Cấu hình, dữ liệu WebView và thư mục tư
liệu mặc định được tách biệt.

### Kết nối Flaq AI

1. Đăng nhập [Flaq AI](https://flaq.ai/vi/) và lấy Client Key.
2. Làm theo hướng dẫn đầu tiên hoặc mở Cài đặt → Kết nối.
3. Dùng Base URL `https://api.flaq.ai` hoặc cổng kết nối tương thích, đáng tin cậy.
4. Nhập khóa, thử kết nối rồi lưu.
5. Giữ nhà cung cấp tải lên tích hợp hoặc chủ động cấu hình hồ sơ R2 riêng.
6. Chọn công cụ, mô hình, nhập prompt/tham chiếu rồi gửi. Quản lý kết quả ở Cài đặt → Lịch sử; đổi thư mục lưu tại Cài
   đặt → Chung.

> **Lưu thông tin xác thực:** “Ghi nhớ tôi” ghi JSON đọc được vào `auth.json` trong thư mục cấu hình của người dùng hiện
> tại. Đây **không phải kho khóa hệ điều hành hay mã hóa ở cấp ứng dụng**. Quyền Unix giới hạn cho người dùng hiện tại;
> khóa chỉ dùng trong phiên không được ghi vào tệp native đó. Tránh ghi nhớ trên máy dùng chung và không commit khóa,
> nhật ký chứa bí mật hay cấu hình cục bộ.

### Tải tư liệu lên và lưu dữ liệu cục bộ

| Nội dung            | Triển khai hiện tại                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tải lên tích hợp    | Client Key yêu cầu URL ký ngắn hạn từ `/api/v1/files/presignedUrl`, rồi tải trực tiếp tư liệu. Thông tin R2 dùng chung ở trên máy chủ, không đóng gói trong ứng dụng. |
| R2 tùy chỉnh        | ID tài khoản, bucket, khóa truy cập, khóa bí mật và tên miền công khai là tùy chọn. Ký cục bộ; hồ sơ dùng AES-GCM trong WebView, không phải kho xác thực hệ thống.    |
| Bản nháp đầu vào    | IndexedDB giữ byte và siêu dữ liệu. Chọn tệp không tải lên; chỉ tải khi gửi tạo nội dung.                                                                             |
| Lịch sử và danh mục | Web Storage cục bộ lập chỉ mục tác vụ và tham chiếu đã tải. Mục trong danh mục không cấp quyền sở hữu hay xóa trên đám mây.                                           |
| Tệp kết quả         | Ghi luồng native vào thư mục gốc đã đặt, mặc định là dữ liệu ứng dụng. Lỗi lưu trữ không biến lần tạo thành công thành thất bại.                                      |

R2 tùy chỉnh cần tên miền tư liệu truy cập công khai, không chỉ endpoint S3. Thời gian giữ phụ thuộc chính sách Flaq
hoặc vòng đời bucket; lưu cục bộ độc lập với lưu đám mây. Mã hóa hồ sơ trong trình duyệt không chống được WebView bị xâm
nhập hoặc người có quyền đọc hồ sơ và mã ứng dụng. Chỉ dùng cổng và đích tải lên đáng tin cậy.

### Chế độ Web tùy chọn

Chế độ Next.js gốc có máy chủ vẫn được giữ:

```bash
pnpm dev
pnpm build
pnpm start
```

Mở `http://localhost:3000`. Khi cấu hình Web, sao chép [.env.example](./.env.example) sang `.env.local` bằng trình soạn
thảo và chỉ điền giá trị cần thiết.

| Biến                                                                          | Công dụng                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_US_EMAIL`                        | URL công khai và thông tin liên hệ           |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Thông tin chỉ phía máy chủ để ký tải lên Web |

Web dùng `app/api/upload/presigned-url/route.ts` và tên miền công khai trong thiết lập lưu trữ ảnh. Desktop dùng chữ ký
Flaq, không cần biến R2 cục bộ hay máy chủ API Next.js cục bộ. Không thêm `NEXT_PUBLIC_` vào bí mật hoặc đưa chúng vào
bộ cài.

## Kiến trúc desktop: Tauri 2, Rust và Next.js

**Tauri 2 + Rust chạy giao diện Next.js xuất tĩnh, không kèm máy chủ Node.js/Next.js.** Desktop và Web dùng chung trang
React, biểu mẫu, hợp đồng mô hình, bản dịch và tài nguyên thiết kế.

### Công nghệ hiện đại phục vụ sáng tạo hằng ngày

- **Lớp native và giao diện tĩnh**: Tauri 2 dùng WebView hệ thống; Rust quản lý cửa sổ, cấu hình và tệp. Không cần máy
  chủ Node.js cục bộ.
- **Kiểu dữ liệu và kiểm tra đầu vào**: TypeScript, hợp đồng chung và Zod thống nhất biểu mẫu với API, giảm sai lệch
  tham số và đơn giản hóa tích hợp.
- **Tác vụ bất đồng bộ và mô-đun theo nhu cầu**: truy vấn trạng thái tập trung, giới hạn tải đồng thời để điều phối.
  FFmpeg và ký R2 riêng chỉ tải khi cần, giảm việc không cần thiết lúc khởi động.
- **Lưu đáng tin cậy**: Rust tải vào tệp tạm rồi mới công bố tệp hoàn tất, giảm nguy cơ kết quả dở dang khi gián đoạn.
  Trạng thái tạo và lưu riêng hỗ trợ khôi phục.

### Quyền riêng tư của tệp: lưu cục bộ và kiểm soát tải lên

Luồng dữ liệu rõ ràng và kiểm tra truy cập bảo vệ tư liệu:

- **Bản nháp ở máy trước**: IndexedDB giữ tư liệu và siêu dữ liệu. Chọn tệp không tải lên; tải bắt đầu khi gửi yêu cầu
  tạo.
- **Ủy quyền ngắn hạn**: nhà cung cấp tích hợp lấy URL ký bằng Client Key. Thông tin R2 dùng chung ở dịch vụ, không đi
  kèm ứng dụng.
- **Cấp quyền từng tệp cho bảng vẽ**: mã native phân giải đường dẫn thật và kiểm tra đó là tư liệu đã lưu trong thư mục
  cho phép trước khi cấp quyền xem.
- **Tách cấu hình**: bản phát triển và bản cài đặt có ID, dữ liệu WebView riêng. Trên Unix, chỉ người dùng hiện tại đọc
  và ghi tệp kết nối đã nhớ.

**Giới hạn riêng tư:** lưu cục bộ không có nghĩa xử lý hoàn toàn ngoại tuyến hay mã hóa tệp. Prompt và tham chiếu liên
quan được gửi đến dịch vụ đã cấu hình; thời gian giữ từ xa tùy chính sách dịch vụ/bucket. Client Key đã nhớ là JSON đọc
được, không ở kho khóa hệ điều hành. Xem “Tải tư liệu lên và lưu dữ liệu cục bộ”.

### Công nghệ và cấu trúc mã nguồn

| Lớp                        | Triển khai và trách nhiệm                                                      |
| -------------------------- | ------------------------------------------------------------------------------ |
| Giao diện                  | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion      |
| Biểu mẫu và trạng thái     | React Hook Form + Zod; Zustand; SWR ở nơi sử dụng                              |
| Hợp đồng tính năng/mô hình | Một danh mục tám công cụ; đầu vào, giới hạn, mặc định dùng chung               |
| Dịch vụ                    | Bộ chuyển đổi Flaq, chính sách tải lên, truy vấn và vòng đời tạo/lưu tập trung |
| Ranh giới nền tảng         | HTTP native/Web, xuất/lưu, liên kết ngoài; UI không gọi lệnh native trực tiếp  |
| Lớp native                 | Tauri 2 / Rust: cấu hình, quyền, cửa sổ, log, truyền luồng và lưu nguyên tử    |
| Bản địa hóa                | next-intl, 15 ngôn ngữ đăng ký, tiếng Ả Rập RTL                                |
| Kiểm chứng                 | Hồi quy Node/tsx, kiểm thử Rust, bố cục Playwright, ESLint và TypeScript       |

```text
app/[locale]/       Trang bản địa hóa: công cụ, thư viện, trang chủ, chính sách
app/api/            Ký tải lên và proxy ảnh chỉ cho Web
components/         UI chung, desktop, biểu mẫu, hộp thoại, trình xem tư liệu/prompt
hooks/              Tích hợp UI và hook tái sử dụng
lib/features/       Danh mục tính năng
lib/constants/template-models/  Hợp đồng mô hình
lib/desktop/        Kết nối, bản nháp, danh mục và tùy chọn tư liệu
lib/platform/       Bộ chuyển đổi native/Web
lib/recommended-prompts*        Định nghĩa và bản chụp nội dung prompt chọn lọc
network/            API client, tải lên, truy vấn, lịch sử, vòng đời
store/              Trạng thái Zustand chung
i18n/ + messages/   Đăng ký ngôn ngữ, định tuyến và bản dịch
src-tauri/          Lớp Rust, quyền và cấu hình đóng gói
scripts/            Build tách biệt, chuẩn bị tư liệu, đồng bộ và phát hành
tests/              Hợp đồng, lưu trữ, khôi phục, build/phát hành và hồi quy UI
public/             Tài nguyên ứng dụng và ảnh prompt kèm theo
docs/               Kiến trúc, mô-đun, ghi chú rà soát và banner README
```

Build desktop chạy trong thư mục tách biệt, loại bỏ tuyến chỉ dành cho Web ở đó và chỉ thay `out/` khi thành công; không
di chuyển hay xóa tuyến nguồn. HTTP native xử lý API/tải lên/tải xuống mà không phụ thuộc CORS trình duyệt. Ký AWS cho
R2 riêng và FFmpeg cục bộ tải khi cần. Giới hạn tải đồng thời, xử lý tư liệu chung tuần tự và truy vấn trạng thái tập
trung.

Với mô-đun mới, mở rộng danh mục và hợp đồng, đặt API ở `network/`, dùng lại `lib/platform/`, bổ sung bản dịch và hồi
quy. Xem:

- [Kiến trúc và ranh giới lưu trữ](./docs/DESKTOP_ARCHITECTURE.md)
- [Thêm mô-đun và QA cục bộ](./docs/ADDING_MODULES.md)
- [Thuật ngữ miền](./CONTEXT.md)
- [Danh mục sản phẩm](./docs/PRODUCT_INVENTORY.md) và [báo cáo rà soát](./docs/REVIEW_REPORT.md): ghi nhận theo thời
  điểm, không bảo đảm đã kiểm chứng bản phát hành hiện tại.

## Build, kiểm thử và đóng gói ứng dụng desktop

| Lệnh                                              | Mục đích                                                   |
| ------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm desktop:dev`                                | Chuẩn bị tư liệu, chạy UI phát triển và ứng dụng native    |
| `pnpm build:desktop`                              | Frontend tĩnh vào `out/` cho mọi ngôn ngữ đăng ký          |
| `pnpm desktop:build`                              | Build frontend và gói native cho hệ điều hành hiện tại     |
| `pnpm check`                                      | TypeScript + hồi quy Node + ESLint                         |
| `pnpm test:ui-layout`                             | Kiểm thử bố cục Playwright; cần Google Chrome và cổng 3000 |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Kiểm thử Rust native; cần phụ thuộc build nền tảng đích    |
| `pnpm prompts:sync`                               | Bảo trì: cập nhật prompt/tài nguyên chọn lọc từ mạng       |

Để mô phỏng cục bộ, chạy `pnpm build:desktop`, rồi `node scripts/desktop-preview.mjs`. Mở `http://127.0.0.1:4173/zh/`,
đặt Base URL `http://127.0.0.1:4173`, dùng `test-only-key` và không ghi nhớ. API mô phỏng không kiểm chứng tạo Flaq
thật, tải R2 hay hành vi native. Không dùng khóa thật.

### Tình trạng đóng gói

[Quy trình phát hành](./.github/workflows/desktop-build.yml) quy định:

| Đích                | Sản phẩm                                                 |
| ------------------- | -------------------------------------------------------- |
| macOS Apple Silicon | `.dmg` và `.app` trong ZIP                               |
| macOS Intel         | `.dmg` và `.app` trong ZIP                               |
| Windows x64         | Bộ cài NSIS `.exe`; không có MSI                         |
| Linux               | Build từ nguồn; chưa có trong ma trận phát hành hiện tại |

Chạy thủ công tạo bản ứng viên; tag `desktop-v<version>` phù hợp kích hoạt phát hành. Bao gồm `SHA256SUMS` và
`release-manifest.json`. Gói hiện tại chưa ký; phân phối công khai vẫn cần ký/công chứng theo nền tảng và kiểm tra khởi
chạy native. Có quy trình không chứng minh mọi nền tảng đã build và kiểm thử thành công.

## Ngôn ngữ và bản địa hóa giao diện (i18n)

Danh mục và README hỗ trợ: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`.

- Tuyến desktop luôn có ngôn ngữ, kể cả `/en/`. Ưu tiên khi khởi động: ngôn ngữ đã lưu, hệ thống, rồi tiếng Anh. Biến
  thể Hoa phồn thể ánh xạ sang `tw`.
- Web dùng `/` cho tiếng Anh và tiền tố cho các ngôn ngữ khác. Tiếng Ả Rập dùng RTL.
- **Giới hạn hiện tại:** một số nội dung mới trong cài đặt, thư viện tư liệu/prompt viết trực tiếp bằng tiếng Trung và
  Anh. `zh`/`tw` dùng chung tiếng Trung; các ngôn ngữ khác dùng tiếng Anh trong các bảng này. Đăng ký 15 ngôn ngữ không
  có nghĩa mọi chuỗi mới đều đã dịch.
- Thêm ngôn ngữ qua [i18n/languages.ts](./i18n/languages.ts), `messages/`, định tuyến/build, README và kiểm thử tương
  đồng.

## Đội ngũ Flaq AI: kỹ thuật AI và quy trình sáng tạo

[Flaq AI](https://flaq.ai/vi/) do **FLAQ AI PTE. LTD.**, đăng ký tại Singapore, vận hành. Đội ngũ kết hợp thiết kế sản
phẩm, kỹ thuật mô hình/API và kinh nghiệm sáng tạo để giúp nhà sáng tạo, lập trình viên và doanh nghiệp hiểu, so sánh và
sử dụng AI.

Công việc bao gồm trải nghiệm mô hình, công cụ, tích hợp API và ứng dụng mô hình ảnh, video, âm thanh, ngôn ngữ để biến
ý tưởng thành quy trình sản xuất thực tế.

Tìm hiểu thêm: [đội ngũ và công ty Flaq AI](https://flaq.ai/about/). Liên hệ: [contact@flaq.ai](mailto:contact@flaq.ai).

## Tiếp thị liên kết Flaq AI: chia sẻ công cụ và nhận hoa hồng

Trở thành đối tác, giới thiệu quy trình ảnh/video AI, API và công cụ sáng tạo để nhận hoa hồng. Chương trình chào đón
nhà sáng tạo, thiết kế, lập trình viên, giảng viên AI, người đánh giá mô hình và đội ngũ chia sẻ ứng dụng thực tế.

- **Thưởng giới thiệu** — 20% cho đơn trả phí hợp lệ đầu tiên và 10% cho đơn tiếp theo trong 60 ngày sau đăng ký, theo
  quy tắc đủ điều kiện và ghi nhận giới thiệu.
- **Quảng bá linh hoạt** — Chia sẻ liên kết trong hướng dẫn, đánh giá, tác phẩm mẫu, cộng đồng hoặc tài liệu tích hợp
  API.
- **Không gian đối tác** — Quản lý liên kết, hoạt động giới thiệu và thiết lập nhận tiền trên Flaq AI.

Đăng nhập, hoàn tất hồ sơ và thỏa thuận liên kết rồi tạo liên kết riêng. Dự án có lối vào quảng bá theo ngôn ngữ; đăng
ký đối tác và quản lý hoa hồng thực hiện trên Flaq AI, không trong ứng dụng desktop.

**[Tham gia chương trình liên kết Flaq AI →](https://flaq.ai/vi/affiliate-program/)**

> Điều kiện hoa hồng, ghi nhận giới thiệu, hoàn tiền, xét duyệt chi trả và thỏa thuận riêng được duyệt tuân theo điều
> khoản mới nhất trên trang chính thức.

## Giấy phép

Dự án mã nguồn mở theo [giấy phép MIT](LICENSE).
