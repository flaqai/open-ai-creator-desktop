![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

**Aplikasi desktop sumber terbuka untuk membuat gambar dan video AI** bagi kreator, desainer, dan tim merek. Satukan
inspirasi prompt, media referensi, dan kanvas tak terbatas untuk menghasilkan, meninjau, menyempurnakan, serta mengelola
karya secara lokal.

Diadaptasi dari [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template), aplikasi terhubung ke layanan model
Flaq AI melalui Tauri 2 + Rust dan antarmuka React modern. Nama aplikasi yang terpasang adalah **Flaq Creator**.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Tangkapan Layar Aplikasi Desktop: Ruang Kerja, Kreasi AI, dan Kanvas Tanpa Batas

Diambil dari aplikasi desktop macOS yang berjalan dalam bahasa Inggris. Panel kreasi menampilkan draf demo lokal; gambar pustaka prompt adalah contoh bawaan.

### Ruang kerja kreatif — alat, inspirasi prompt, dan pintasan media

![Ruang kerja kreatif — alat, inspirasi prompt, dan pintasan media](./docs/assets/screenshots/desktop-workspace.jpg)

### Kreasi gambar AI — prompt, model, dan pengaturan generasi

![Kreasi gambar AI — prompt, model, dan pengaturan generasi](./docs/assets/screenshots/desktop-ai-creator.jpg)

### Kanvas tanpa batas — susun brief kreatif dan node generasi

![Kanvas tanpa batas — susun brief kreatif dan node generasi](./docs/assets/screenshots/desktop-canvas.jpg)

### Inspirasi prompt — jelajahi contoh visual dan prompt yang dapat digunakan kembali

![Inspirasi prompt — jelajahi contoh visual dan prompt yang dapat digunakan kembali](./docs/assets/screenshots/desktop-prompt-library.jpg)

## Platform Model Flaq AI dan Alat Kreatif Online

[Flaq AI](https://flaq.ai/id/) menyatukan model AI terkemuka untuk pembuatan dan penyuntingan gambar, pembuatan video,
serta tugas bahasa bagi kreator, pengembang, dan bisnis.

- **API stabil dengan konkurensi tinggi** — Integrasikan pembuatan konten AI ke produk dan alur produksi melalui API
  terpadu.
- **Berkreasi langsung secara online** — Coba model dan alat di browser melalui [Flaq AI](https://flaq.ai/id/), tanpa
  menulis kode atau memasang aplikasi.
- **Jelajahi dan integrasikan** — Bandingkan model di [katalog model](https://flaq.ai/id/model-market/) dan mulai dengan
  [dokumentasi API](https://flaq.ai/id/docs/).

Kontak bisnis: [contact@flaq.ai](mailto:contact@flaq.ai)

## Fitur Desktop AI: dari Ide ke Gambar dan Video

### Pembuatan Gambar, Video, dan Coba Pakaian Virtual

Delapan pintu masuk mendukung kreasi sehari-hari. Jelajahi ide di ruang terpadu atau gunakan alat khusus untuk visual
produk, konten sosial, konsep kampanye, dan video pendek.

| Alat                   | Yang dapat dibuat kreator                                                | Rute                  |
| ---------------------- | ------------------------------------------------------------------------ | --------------------- |
| AI Media Creator       | Membuat gambar dan video bersama, meninjau hasil, dan menyempurnakan ide | `/ai-media-creator`   |
| Kanvas AI Tak Terbatas | Menata teks, media, dan pengaturan generasi dalam proyek lokal tersimpan | `/ai-canvas`          |
| Teks ke Gambar         | Mengeksplorasi gaya sampul, poster, dan adegan produk dari prompt        | `/text-to-image`      |
| Gambar ke Gambar       | Mengembangkan gaya dan arah visual baru dari gambar referensi            | `/image-to-image`     |
| Coba Pakaian Virtual   | Menggabungkan referensi pakaian dan model untuk konsep fesyen dan niaga  | `/virtual-try-on`     |
| Teks ke Video          | Mengubah ide tertulis menjadi adegan bergerak dan konsep kampanye        | `/text-to-video`      |
| Gambar ke Video        | Membuat visual produk animasi dan klip dari gambar diam                  | `/image-to-video`     |
| Referensi ke Video     | Mengarahkan pembuatan video dengan media referensi                       | `/reference-to-video` |

Rute tidak menyertakan awalan bahasa. Alat berbagi [registri fitur](./lib/features/catalog.ts). Input, batas, dan
parameter bergantung pada model serta [kontrak model](./lib/constants/template-models/).

### Inspirasi Prompt dan Kanvas Tak Terbatas

- **Mulai dari contoh**: telusuri pustaka prompt, salin prompt lengkap, dan periksa pratinjau gambar/video dengan zoom
  dan geser. Gambar contoh disertakan; video diputar online. Label model pada koleksi tidak menjamin model tersebut
  tersedia di formulir generasi.
- **Tata proyek secara visual**: tempatkan teks, media, dan pengaturan di kanvas. Geser, perbesar, dan kelola simpul,
  lalu simpan proyek lokal untuk dilanjutkan nanti.
- **Pilih model sesuai tugas**: atur parameter yang didukung dengan bantuan kontekstual. Panduan awal dan tes koneksi
  membantu penyiapan; tampilan dan bahasa dapat disesuaikan untuk penggunaan harian.

### Pustaka Media Lokal, Pemulihan Draf, dan Ekspor Karya

- **Temukan referensi dan karya**: cari referensi yang diunggah dan hasil generasi menurut jenis dan asal, tinjau,
  unduh, serta periksa status arsip lokal. Buka `/media-library` atau Pengaturan → Riwayat.
- **Simpan kemajuan**: draf menyimpan prompt, parameter, dan media secara lokal. Riwayat tugas dan indeks referensi
  tetap di perangkat. Pemulihan tugas tertunda memeriksa tugas asli tanpa mengirim generasi berbayar baru.
- **Arsipkan hasil**: gambar dan video disimpan di `YYYY/MM/DD` dalam folder yang dapat dipilih untuk penyuntingan dan
  penyerahan. Pemulihan arsip hanya mencoba menyimpan hasil yang sudah ada.
- **Siapkan tahap berikutnya**: gunakan dialog simpan native, ekspor PNG/JPEG/WebP, dan pemotongan FFmpeg WASM yang
  dimuat saat diperlukan.

### Alur Praktis bagi Kreator

1. Jelajahi contoh prompt atau tata teks dan referensi di kanvas.
2. Pilih alat dan model, lalu tentukan prompt, referensi, dan parameter yang tersedia.
3. Kirim, tinjau hasil, dan perbaiki generasi berikutnya.
4. Temukan hasil di pustaka dan gunakan arsip atau ekspor dalam produksi selanjutnya.

Generasi memerlukan internet, Client Key Flaq AI yang valid, dan kredit cukup. Model berjalan di cloud; draf, proyek,
dan indeks lokal tidak menyediakan sinkronisasi cloud antarperangkat.

## Memulai: Jalankan Aplikasi Desktop dan Hubungkan Flaq AI

### Prasyarat

- Node.js **22**, sesuai [.nvmrc](./.nvmrc).
- pnpm **10.5.2**, sesuai `packageManager` di [package.json](./package.json).
- Rust dan [prasyarat Tauri](https://v2.tauri.app/start/prerequisites/) sistem tujuan untuk pengembangan dan paket
  native. Build frontend saja tidak memerlukan Rust.
- Akun Flaq AI dan Client Key untuk generasi nyata. Jalur unggah bawaan **tidak** memerlukan akun Cloudflare sendiri.

Dari akar repositori:

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

Pengembangan memakai `ai.flaq.creator.dev`; aplikasi terpasang memakai `ai.flaq.creator`. Konfigurasi, data WebView, dan
folder media bawaan dipisahkan.

### Menghubungkan Flaq AI

1. Masuk ke [Flaq AI](https://flaq.ai/id/) dan dapatkan Client Key.
2. Ikuti panduan awal atau buka Pengaturan → Koneksi.
3. Gunakan Base URL `https://api.flaq.ai` atau gateway kompatibel yang tepercaya.
4. Masukkan kunci, uji koneksi, lalu simpan.
5. Pertahankan penyedia unggah bawaan atau konfigurasikan preset R2 sendiri secara eksplisit.
6. Pilih alat dan model, isi prompt/referensi, lalu kirim. Kelola hasil di Pengaturan → Riwayat; ubah folder arsip di
   Pengaturan → Umum.

> **Penyimpanan kredensial:** “Ingat saya” menyimpan JSON yang dapat dibaca di `auth.json` pada direktori konfigurasi
> pengguna saat ini. Ini **bukan keychain sistem atau enkripsi tingkat aplikasi**. Izin Unix dibatasi untuk pengguna
> tersebut; kredensial sesi tidak disimpan ke berkas native itu. Hindari menyimpan kunci pada perangkat bersama dan
> jangan pernah memasukkan kunci, log berisi rahasia, atau konfigurasi lokal ke commit.

### Unggah Media dan Penyimpanan Data Lokal

| Bagian              | Implementasi saat ini                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unggah bawaan       | Client Key meminta URL bertanda tangan berumur pendek dari `/api/v1/files/presignedUrl`, lalu media diunggah langsung. Kredensial R2 bersama tetap di server dan tidak dibundel. |
| R2 khusus           | ID akun, bucket, kunci akses, kunci rahasia, dan domain publik opsional. Penandatanganan lokal; preset memakai AES-GCM di WebView, bukan brankas kredensial sistem.              |
| Draf input          | IndexedDB menyimpan byte dan metadata; memilih berkas tidak mengunggahnya. Unggah dilakukan saat pengiriman.                                                                     |
| Riwayat dan katalog | Web Storage lokal mengindeks tugas dan referensi unggahan. Entri tidak memberikan kepemilikan atau hak penghapusan cloud.                                                        |
| Berkas hasil        | Penyimpanan native secara streaming ke akar media terpilih, secara bawaan ke direktori data aplikasi. Kegagalan arsip tidak membatalkan generasi yang selesai.                   |

R2 khusus memerlukan domain media yang dapat diakses publik, bukan hanya endpoint S3. Retensi mengikuti kebijakan Flaq
atau siklus hidup bucket; arsip lokal bersifat independen. Enkripsi preset di browser tidak melindungi dari WebView yang
disusupi atau penyerang dengan akses ke profil dan kode aplikasi. Gunakan gateway serta tujuan unggah tepercaya.

### Mode Web Opsional

Mode Next.js asli dengan server tetap tersedia:

```bash
pnpm dev
pnpm build
pnpm start
```

Buka `http://localhost:3000`. Untuk konfigurasi Web, salin [.env.example](./.env.example) ke `.env.local` melalui editor
dan isi hanya nilai yang diperlukan.

| Variabel                                                                      | Kegunaan                                                  |
| ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_US_EMAIL`                        | URL publik dan informasi kontak situs                     |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Kredensial khusus server untuk penandatanganan unggah Web |

Unggah Web memakai `app/api/upload/presigned-url/route.ts` dan domain publik pada pengaturan hosting gambar. Desktop
menggunakan tanda tangan Flaq, tanpa variabel R2 lokal atau server API Next.js lokal. Jangan beri awalan `NEXT_PUBLIC_`
pada rahasia atau memasukkannya ke installer.

## Arsitektur Desktop: Tauri 2, Rust, dan Next.js

**Tauri 2 + Rust menjalankan UI Next.js hasil ekspor statis, tanpa server Node.js/Next.js yang dibundel.** Desktop dan
Web berbagi halaman React, formulir, kontrak model, terjemahan, dan aset desain.

### Teknologi Modern untuk Kreasi Sehari-hari

- **Lapisan native dan UI statis**: Tauri 2 memakai WebView sistem; Rust menangani jendela, konfigurasi, dan
  penyimpanan. Tidak memerlukan server Node.js lokal.
- **Tipe dan validasi input**: TypeScript, kontrak bersama, dan Zod menyelaraskan formulir dengan API, mengurangi
  ketidakcocokan parameter serta memudahkan integrasi.
- **Tugas asinkron dan modul sesuai kebutuhan**: polling terpusat dan konkurensi unggah terbatas mengatur pekerjaan.
  FFmpeg serta penandatanganan R2 khusus dimuat saat diperlukan agar startup tidak melakukan pekerjaan yang tidak perlu.
- **Penyimpanan andal**: Rust mengalirkan unduhan ke berkas sementara sebelum menerbitkan berkas lengkap, mengurangi
  hasil parsial setelah gangguan. Status generasi dan arsip yang terpisah mendukung pemulihan.

### Privasi dan Keamanan Berkas: Data Lokal dan Unggah Terkendali

Alur data yang jelas dan pemeriksaan akses melindungi materi kreatif:

- **Draf lokal terlebih dahulu**: IndexedDB menyimpan media dan metadata. Pemilihan berkas tidak mengunggahnya; unggah
  dimulai saat generasi dikirim.
- **Otorisasi sementara**: penyedia bawaan memperoleh URL bertanda tangan dengan Client Key. Kredensial R2 bersama tetap
  di layanan, tidak di aplikasi.
- **Akses kanvas per berkas**: kode native menyelesaikan jalur nyata dan memeriksa apakah berkas merupakan media arsip
  dalam direktori yang diizinkan sebelum memberikan akses pratinjau.
- **Konfigurasi terpisah**: pengembangan dan aplikasi terpasang memiliki ID dan data WebView berbeda. Di Unix, hanya
  pengguna saat ini yang dapat membaca dan menulis koneksi tersimpan.

**Batas privasi:** penyimpanan lokal tidak berarti pemrosesan sepenuhnya offline atau berkas terenkripsi. Prompt dan
referensi terkait dikirim ke layanan yang dikonfigurasi; retensi jarak jauh mengikuti layanan atau bucket. Client Key
tersimpan memakai JSON terbaca, bukan keychain sistem. Lihat “Unggah Media dan Penyimpanan Data Lokal”.

### Teknologi dan Struktur Kode

| Lapisan             | Implementasi dan tanggung jawab                                                          |
| ------------------- | ---------------------------------------------------------------------------------------- |
| UI                  | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion                |
| Formulir dan status | React Hook Form + Zod; Zustand; SWR bila digunakan                                       |
| Kontrak fitur/model | Satu registri delapan alat; input, batas, dan nilai bawaan bersama                       |
| Layanan             | Adaptor Flaq, kebijakan unggah, polling serta siklus generasi/arsip terpusat             |
| Batas platform      | HTTP native/Web, ekspor/simpan, tautan luar; UI tidak memanggil perintah native langsung |
| Lapisan native      | Tauri 2 / Rust: konfigurasi, izin, jendela, log, streaming, dan simpan atomik            |
| Lokalisasi          | next-intl, 15 lokal terdaftar, bahasa Arab RTL                                           |
| Verifikasi          | Regresi Node/tsx, tes Rust, tata letak Playwright, ESLint, dan TypeScript                |

```text
app/[locale]/       Halaman lokal alat, pustaka, beranda, dan kebijakan
app/api/            Penandatanganan unggah dan proksi gambar khusus Web
components/         UI bersama, lapisan desktop, formulir, dialog, penampil media/prompt
hooks/              Integrasi UI dan hook yang dapat digunakan ulang
lib/features/       Registri fitur
lib/constants/template-models/  Kontrak model
lib/desktop/        Koneksi, draf, katalog, dan preferensi media
lib/platform/       Adaptor native/Web
lib/recommended-prompts*        Definisi dan snapshot prompt pilihan
network/            Klien API, unggah, polling, riwayat, dan siklus hidup
store/              Status Zustand bersama
i18n/ + messages/   Registri lokal, rute, dan terjemahan
src-tauri/          Lapisan Rust, kapabilitas, dan konfigurasi paket
scripts/            Build terisolasi, persiapan media, sinkronisasi, dan rilis
tests/              Kontrak, penyimpanan, pemulihan, build/rilis, dan regresi UI
public/             Aset aplikasi dan gambar prompt bawaan
docs/               Arsitektur, modul, catatan tinjauan, dan banner README
```

Build desktop bekerja di direktori sementara terisolasi, mengecualikan rute Web di sana, dan mengganti `out/` hanya jika
berhasil; rute sumber tidak dipindah atau dihapus. HTTP native menangani API/unggah/unduh tanpa batasan CORS browser.
Penandatanganan AWS untuk R2 khusus dan FFmpeg lokal dimuat saat perlu. Konkurensi unggah dibatasi, pemrosesan media
bersama diserialkan, dan polling dipusatkan.

Untuk modul baru, perluas registri dan kontrak, letakkan API di `network/`, gunakan ulang `lib/platform/`, serta
tambahkan terjemahan dan regresi. Lihat:

- [Arsitektur dan batas penyimpanan](./docs/DESKTOP_ARCHITECTURE.md)
- [Menambah modul dan QA lokal](./docs/ADDING_MODULES.md)
- [Kosakata domain](./CONTEXT.md)
- [Inventaris produk](./docs/PRODUCT_INVENTORY.md) dan [laporan tinjauan](./docs/REVIEW_REPORT.md): catatan pada suatu
  waktu, bukan jaminan verifikasi rilis terkini.

## Build, Pengujian, dan Paket Aplikasi Desktop

| Perintah                                          | Tujuan                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm desktop:dev`                                | Menyiapkan media dan memulai UI pengembangan serta aplikasi native   |
| `pnpm build:desktop`                              | Frontend statis ke `out/` untuk semua lokal terdaftar                |
| `pnpm desktop:build`                              | Membangun frontend dan paket native untuk OS saat ini                |
| `pnpm check`                                      | TypeScript + regresi Node + ESLint                                   |
| `pnpm test:ui-layout`                             | Tes tata letak Playwright; memerlukan Google Chrome dan port 3000    |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Tes Rust native; memerlukan dependensi build platform tujuan         |
| `pnpm prompts:sync`                               | Pemeliharaan: memperbarui snapshot prompt/aset pilihan dari jaringan |

Untuk simulasi lokal, jalankan `pnpm build:desktop`, lalu `node scripts/desktop-preview.mjs`. Buka
`http://127.0.0.1:4173/zh/`, set Base URL ke `http://127.0.0.1:4173`, gunakan `test-only-key` tanpa mengingatnya. API
simulasi tidak memverifikasi generasi Flaq nyata, unggah R2, atau perilaku native. Jangan gunakan kunci asli.

### Status Paket

[Alur rilis](./.github/workflows/desktop-build.yml) menetapkan:

| Target              | Artefak                                               |
| ------------------- | ----------------------------------------------------- |
| macOS Apple Silicon | `.dmg` dan `.app` dalam ZIP                           |
| macOS Intel         | `.dmg` dan `.app` dalam ZIP                           |
| Windows x64         | Installer NSIS `.exe`; tanpa MSI                      |
| Linux               | Build dari sumber; belum masuk matriks rilis saat ini |

Eksekusi manual menghasilkan kandidat; tag `desktop-v<version>` yang sesuai memicu publikasi. Artefak menyertakan
`SHA256SUMS` dan `release-manifest.json`. Paket saat ini belum ditandatangani; distribusi publik masih memerlukan tanda
tangan/notarisasi platform dan pemeriksaan awal native. Alur yang terdefinisi bukan bukti semua platform telah berhasil
dibangun dan diuji.

## Dukungan Bahasa dan Lokalisasi Antarmuka (i18n)

Registri lokal dan README mencakup: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`,
`ar`.

- Rute desktop selalu memuat lokal, termasuk `/en/`. Prioritas awal: bahasa tersimpan, bahasa sistem, lalu Inggris.
  Varian Mandarin tradisional dipetakan ke `tw`.
- Web memakai `/` untuk Inggris dan awalan untuk yang lain. Bahasa Arab memakai arah RTL.
- **Batas saat ini:** sebagian teks baru pengaturan dan pustaka media/prompt ditulis langsung dalam Mandarin dan
  Inggris. `zh`/`tw` berbagi Mandarin; lokal lain memakai Inggris pada panel tersebut. Lima belas lokal terdaftar tidak
  berarti setiap teks baru diterjemahkan.
- Tambah bahasa melalui [i18n/languages.ts](./i18n/languages.ts), `messages/`, penanganan rute/build, README, dan tes
  kesetaraan.

## Tim Flaq AI: Rekayasa AI dan Alur Kreatif

[Flaq AI](https://flaq.ai/id/) dioperasikan oleh **FLAQ AI PTE. LTD.**, terdaftar di Singapura. Tim menggabungkan desain
produk, rekayasa model dan API, serta pengalaman alur kreatif untuk membantu kreator, pengembang, dan bisnis memahami,
membandingkan, dan memakai AI.

Pekerjaannya mencakup pengalaman model dan alat, integrasi API, serta penerapan model gambar, video, audio, dan bahasa
agar ide menjadi alur produksi yang dapat digunakan.

Selengkapnya: [tim dan perusahaan Flaq AI](https://flaq.ai/about/). Kontak: [contact@flaq.ai](mailto:contact@flaq.ai).

## Afiliasi Flaq AI: Bagikan Alat Kreatif dan Dapatkan Komisi

Jadilah mitra dengan memperkenalkan alur gambar/video AI, API model, dan alat kreatif kepada audiens. Kreator, desainer,
pengembang, pendidik AI, pengulas model, dan tim yang membagikan penggunaan praktis dipersilakan.

- **Imbalan rujukan** — 20% dari pesanan berbayar valid pertama dan 10% dari pesanan valid berikutnya dalam 60 hari
  setelah pendaftaran, sesuai aturan kelayakan dan atribusi.
- **Promosi fleksibel** — Bagikan tautan melalui tutorial, ulasan, contoh karya, komunitas, atau panduan integrasi API.
- **Ruang mitra** — Kelola tautan, aktivitas rujukan, dan pengaturan pembayaran di Flaq AI.

Masuk, lengkapi profil dan perjanjian afiliasi, lalu buat tautan sendiri. Proyek ini menyediakan pintu promosi
terlokalisasi; pendaftaran dan komisi dikelola di Flaq AI, bukan aplikasi desktop.

**[Gabung Program Afiliasi Flaq AI →](https://flaq.ai/id/affiliate-program/)**

> Kelayakan, atribusi, pengembalian dana, peninjauan pembayaran, dan perjanjian khusus yang disetujui mengikuti
> ketentuan terbaru di halaman resmi.

## Lisensi

Proyek sumber terbuka di bawah [Lisensi MIT](LICENSE).
