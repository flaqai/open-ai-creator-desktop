# Flaq SaaS Template (ภาษาไทย)

เทมเพลต SaaS ฟรีและโอเพนซอร์สสำหรับสร้างแพลตฟอร์มสร้างภาพและวิดีโอด้วย AI ผ่าน API แบบรวมของ Flaq.ai

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## เกี่ยวกับเทมเพลต

สร้างด้วย Next.js 16, React 19, TypeScript และ Tailwind CSS พร้อมเวิร์กโฟลว์ใช้งานได้ทันที 5 แบบ: ข้อความเป็นภาพ
ภาพเป็นภาพ ข้อความเป็นวิดีโอ ภาพเป็นวิดีโอ และลองเสื้อผ้าเสมือนจริง

### คุณสมบัติหลัก

- 🎨 หน้าสร้างภาพและวิดีโอพร้อมเลือกโมเดลและพารามิเตอร์
- 🔌 เชื่อมต่อ API ของ Flaq.ai ด้วย Client Key เดียว
- 🧠 รองรับ Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu และโมเดลอื่น ๆ
- 🌐 รองรับ 15 ภาษาทั้ง UI เส้นทาง และลิงก์ SEO ทางเลือก
- ☁️ อัปโหลด Cloudflare R2 และจัดเก็บผลงานที่สร้าง
- 🔒 จัดเก็บ API key ฝั่งไคลเอนต์แบบเข้ารหัส
- 📱 UI ตอบสนองทุกหน้าจอ โหมดมืด และประวัติการสร้าง

## เกี่ยวกับ Flaq.ai

[Flaq.ai](https://flaq.ai/th/) รวมโมเดลสร้างภาพและวิดีโอชั้นนำไว้ภายใต้ API เดียวและรูปแบบการยืนยันตัวตนที่สอดคล้องกัน
เทมเพลตนี้มีการเชื่อมต่อ API การตรวจสอบสถานะ การแสดงผลลัพธ์ และการดาวน์โหลดพร้อมแล้ว

## เริ่มต้นอย่างรวดเร็ว

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

ตั้งค่า `NEXT_PUBLIC_SITE_URL` ใน `.env.local` และเพิ่มค่าของ Cloudflare R2 เมื่อจำเป็น จากนั้นใส่ Client Key ของ
[Flaq.ai](https://flaq.ai/th/) ในการตั้งค่าแอป
ดูตัวแปรและขั้นตอนทั้งหมดได้ใน[เอกสารภาษาอังกฤษฉบับเต็ม](./README.md#getting-started)

## โปรแกรมพันธมิตร Flaq.ai

เมื่อเข้าร่วม[โปรแกรมพันธมิตร Flaq.ai](https://flaq.ai/th/affiliate-program?utm_source=flaq-saas-template)
คุณจะได้รับค่าคอมมิชชัน 20% จากคำสั่งซื้อแบบชำระเงินที่ถูกต้องครั้งแรกของผู้ใช้ที่แนะนำ และ 10%
จากคำสั่งซื้อที่ถูกต้องครั้งถัดไปภายใน 60 วันหลังลงทะเบียน คุณสมบัติและการจ่ายเงินเป็นไปตามข้อกำหนดล่าสุดในหน้าโปรแกรม

## การรองรับหลายภาษา

โค้ดและ README รองรับ locale เดียวกัน 15 รายการ: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`,
`th`, `vi`, `ar` ภาษาอังกฤษใช้ `/` ภาษาอื่นใช้ `/{locale}/` และภาษาอาหรับแสดงผลจากขวาไปซ้าย

## เอกสารและสัญญาอนุญาต

ดูการตั้งค่าแบบเต็ม เทคโนโลยี และการนำขึ้นใช้งานได้ที่ [README.md](./README.md) หรือ [README_zh.md](./README_zh.md)
โครงการนี้เผยแพร่ภายใต้ [MIT License](LICENSE)
