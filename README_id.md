# Flaq SaaS Template (Bahasa Indonesia)

Template SaaS gratis dan sumber terbuka untuk membangun platform pembuatan gambar dan video AI dengan API terpadu
Flaq.ai.

## Tentang Flaq.ai

[Flaq.ai](https://flaq.ai/id/) adalah platform model AI untuk kreator dan pengembang. Satu API key memberikan akses
terpadu ke pembuatan dan penyuntingan gambar, pembuatan video, serta model bahasa.

- **Jelajahi dan bandingkan model** — Lihat kemampuan, parameter yang didukung, dan harga terkini di
  [Model Market](https://flaq.ai/model-market/).
- **Coba sebelum integrasi** — Uji model yang didukung di Playground Flaq.ai untuk menyempurnakan prompt dan pengaturan
  generasi.
- **Bangun alur kreatif** — Gunakan [dokumentasi API](https://flaq.ai/docs/) untuk mengintegrasikan AI ke produk dan
  alat Anda.

Flaq Creator Desktop menghadirkan alur gambar dan video dalam ruang kerja desktop khusus. Hubungkan Client Key Flaq.ai
di aplikasi untuk membuat dan mengelola aset visual. Tidak semua API platform tersedia di aplikasi desktop; lihat model
dan harga yang berlaku di Flaq.ai.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## Tentang template ini

Dibangun dengan Next.js 16, React 19, TypeScript, dan Tailwind CSS. Template ini menyediakan lima alur siap pakai:
teks-ke-gambar, gambar-ke-gambar, teks-ke-video, gambar-ke-video, dan virtual try-on.

### Fitur utama

- 🎨 Halaman pembuatan gambar dan video dengan pilihan model serta parameter
- 🔌 Integrasi API Flaq.ai menggunakan satu Client Key
- 🧠 Mendukung Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu, dan model lainnya
- 🌐 15 bahasa untuk UI, perutean, dan tautan alternatif SEO
- ☁️ Unggah Cloudflare R2 dan penyimpanan aset hasil generasi
- 🔒 Penyimpanan API key terenkripsi di sisi klien
- 📱 UI responsif, mode gelap, dan riwayat generasi

## Mulai cepat

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

Atur `NEXT_PUBLIC_SITE_URL` di `.env.local`, lalu tambahkan konfigurasi Cloudflare R2 bila diperlukan. Masukkan Client
Key [Flaq.ai](https://flaq.ai/id/) melalui menu pengaturan aplikasi. Lihat
[dokumentasi lengkap berbahasa Inggris](./README.md#getting-started) untuk seluruh variabel lingkungan dan langkah
penyiapan.

## Internasionalisasi

Kode dan README mendukung 15 locale yang sama: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`,
`th`, `vi`, dan `ar`. Bahasa Inggris memakai `/`, bahasa lain memakai `/{locale}/`, dan bahasa Arab dirender dari kanan
ke kiri.

## Program Afiliasi Flaq.ai

Jadilah mitra afiliasi Flaq.ai dan dapatkan komisi dengan memperkenalkan alur gambar dan video AI, API model, serta alat
kreatif. Program ini terbuka bagi kreator, desainer, pengembang, pendidik AI, pengulas model, dan tim yang berbagi alur
AI praktis.

- **Imbalan rujukan** — Dapatkan 20% dari pesanan berbayar valid pertama pengguna rujukan dan 10% dari pesanan berbayar
  valid berikutnya dalam 60 hari setelah pendaftaran, sesuai aturan kelayakan dan atribusi.
- **Promosi fleksibel** — Bagikan tautan rujukan melalui tutorial, ulasan model, karya kreatif, komunitas, atau panduan
  integrasi API.
- **Ruang kerja mitra** — Kelola tautan, tinjau aktivitas rujukan, dan atur pembayaran di Flaq.ai.

Masuk ke Flaq.ai, lengkapi profil afiliasi dan persetujuan perjanjian, lalu buat tautan rujukan Anda. Proyek ini juga
menyediakan promosi afiliasi multibahasa; pendaftaran mitra dan pengelolaan komisi dilakukan di Flaq.ai, bukan di
aplikasi desktop.

**[Bergabung dengan Program Afiliasi Flaq.ai →](https://flaq.ai/id/affiliate-program/)**

> Kelayakan komisi, atribusi, pengembalian dana, peninjauan pembayaran, dan kerja sama khusus yang disetujui mengikuti
> ketentuan terbaru pada halaman resmi program.

## Dokumentasi dan lisensi

Untuk penyiapan lengkap, arsitektur teknologi, dan deployment, lihat [README.md](./README.md) atau
[README_zh.md](./README_zh.md). Proyek ini tersedia di bawah [MIT License](LICENSE).
