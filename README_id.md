![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (Bahasa Indonesia)

Ruang kerja desktop sumber terbuka untuk kreasi gambar dan video AI, diadaptasi dari Flaq SaaS Template. Nama aplikasi
terpasang tetap Flaq Creator.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Tentang Flaq AI

[Flaq AI](https://flaq.ai/id/) adalah platform AI untuk kreator, pengembang, dan bisnis yang menyatukan model AI
terkemuka dan populer untuk pembuatan serta penyuntingan gambar, pembuatan video, dan pemrosesan bahasa.

- **API dengan konkurensi tinggi dan stabilitas tinggi** — Integrasikan generasi AI ke produk dan alur produksi melalui
  API terpadu.
- **Langsung digunakan secara daring** — Gunakan model dan alat kreatif di [Flaq AI](https://flaq.ai/id/) melalui
  browser, tanpa menulis kode atau memasang aplikasi desktop.
- **Jelajahi dan integrasikan model** — Bandingkan kemampuan di [pasar model](https://flaq.ai/id/model-market/) dan
  mulai melalui [dokumentasi API](https://flaq.ai/id/docs/).

Kontak bisnis: [contact@flaq.ai](mailto:contact@flaq.ai)

## Implementasi saat ini

Tauri 2 dan Rust menjalankan UI statis Next.js 16 dan React 19, tanpa server Node.js/Next.js di dalam aplikasi.
Formulir, kontrak model, dan desain dibagikan dengan versi web.

Tujuh pintu kreasi: AI Media Creator, teks ke gambar, gambar ke gambar, coba pakaian virtual, teks ke video, gambar ke
video, dan referensi ke video. Tersedia pustaka prompt, katalog media yang dapat dicari, riwayat di Pengaturan, draf
IndexedDB, dan arsip lokal berdasarkan tanggal. Contoh gambar disertakan; video diputar daring. Keberhasilan generasi
dan pengarsipan merupakan status terpisah.

## Mulai cepat

Jalankan dari akar repositori ini. Memerlukan Node.js 22, pnpm 10.5.2, Rust, dan dependensi Tauri sesuai OS. Masukkan
Client Key Flaq AI di Pengaturan → Koneksi, uji, lalu simpan. Base URL bawaan: `https://api.flaq.ai`. Generasi nyata
memerlukan internet dan kredit API.

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

## Unggahan dan kredensial

Unggahan bawaan meminta URL bertanda tangan sementara dari Flaq `/api/v1/files/presignedUrl`. Kredensial R2 bersama
tetap di server; akun Cloudflare sendiri tidak diperlukan. R2 pribadi bersifat opsional dengan penandatanganan lokal.
Preset AES-GCM di WebView bukan brankas kredensial OS. Jika diingat, Client Key disimpan sebagai teks biasa di
`auth.json` dalam direktori konfigurasi aplikasi.

## Platform dan bahasa

Konfigurasi rilis mencakup macOS Apple Silicon/Intel (DMG, ZIP) dan Windows x64 (NSIS EXE). Linux dapat dibangun dari
sumber tetapi belum masuk matriks rilis. Paket saat ini belum ditandatangani. Ada 15 lokal terdaftar, tetapi sebagian
panel pengaturan, media, dan prompt baru hanya berbahasa Mandarin/Inggris: `zh`/`tw` memakai teks Mandarin bersama,
lainnya memakai Inggris. Rute desktop selalu berprefiks bahasa termasuk `/en/`; web memakai `/` untuk Inggris dan
prefiks untuk lainnya. Bahasa Arab menggunakan RTL.

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

## Program Afiliasi Flaq AI

Jadilah mitra afiliasi Flaq AI dan dapatkan komisi dengan memperkenalkan alur gambar dan video AI, API model, serta alat
kreatif. Program ini terbuka bagi kreator, desainer, pengembang, pendidik AI, pengulas model, dan tim yang berbagi alur
AI praktis.

- **Imbalan rujukan** — Dapatkan 20% dari pesanan berbayar valid pertama pengguna rujukan dan 10% dari pesanan berbayar
  valid berikutnya dalam 60 hari setelah pendaftaran, sesuai aturan kelayakan dan atribusi.
- **Promosi fleksibel** — Bagikan tautan rujukan melalui tutorial, ulasan model, karya kreatif, komunitas, atau panduan
  integrasi API.
- **Ruang kerja mitra** — Kelola tautan, tinjau aktivitas rujukan, dan atur pembayaran di Flaq AI.

Masuk ke Flaq AI, lengkapi profil afiliasi dan persetujuan perjanjian, lalu buat tautan rujukan Anda. Proyek ini juga
menyediakan promosi afiliasi multibahasa; pendaftaran mitra dan pengelolaan komisi dilakukan di Flaq AI, bukan di
aplikasi desktop.

**[Bergabung dengan Program Afiliasi Flaq AI →](https://flaq.ai/id/affiliate-program/)**

> Kelayakan komisi, atribusi, pengembalian dana, peninjauan pembayaran, dan kerja sama khusus yang disetujui mengikuti
> ketentuan terbaru pada halaman resmi program.

## Dokumentasi dan lisensi

Untuk penyiapan lengkap, arsitektur teknologi, dan deployment, lihat [README.md](./README.md) atau
[README_zh.md](./README_zh.md). Proyek ini tersedia di bawah [MIT License](LICENSE).
