# Flaq SaaS Template (Bahasa Indonesia)

Template SaaS gratis dan sumber terbuka untuk membangun platform pembuatan gambar dan video AI dengan API terpadu
Flaq.ai.

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

## Tentang Flaq.ai

[Flaq.ai](https://flaq.ai/id/) menyatukan model pembuatan gambar dan video terkemuka melalui satu API dan mekanisme
autentikasi yang konsisten. Template ini sudah mencakup koneksi API, polling status, tampilan hasil, dan unduhan.

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

## Program Afiliasi Flaq.ai

Melalui [Program Afiliasi Flaq.ai](https://flaq.ai/id/affiliate-program?utm_source=flaq-saas-template), Anda dapat
memperoleh komisi 20% dari pesanan berbayar valid pertama pengguna rujukan dan 10% dari pesanan berbayar valid
berikutnya dalam 60 hari setelah pendaftaran. Kelayakan dan pembayaran mengikuti ketentuan terbaru pada halaman program.

## Internasionalisasi

Kode dan README mendukung 15 locale yang sama: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`,
`th`, `vi`, dan `ar`. Bahasa Inggris memakai `/`, bahasa lain memakai `/{locale}/`, dan bahasa Arab dirender dari kanan
ke kiri.

## Dokumentasi dan lisensi

Untuk penyiapan lengkap, arsitektur teknologi, dan deployment, lihat [README.md](./README.md) atau
[README_zh.md](./README_zh.md). Proyek ini tersedia di bawah [MIT License](LICENSE).
