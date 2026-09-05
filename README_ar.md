# Flaq SaaS Template (العربية)

قالب SaaS مجاني ومفتوح المصدر لبناء منصات إنشاء الصور والفيديو بالذكاء الاصطناعي عبر واجهة Flaq.ai الموحّدة.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## نبذة عن القالب

مبني باستخدام Next.js 16 وReact 19 وTypeScript وTailwind CSS، ويتضمن خمس تجارب جاهزة: تحويل النص إلى صورة، والصورة إلى
صورة، والنص إلى فيديو، والصورة إلى فيديو، وتجربة الملابس الافتراضية.

### الميزات الرئيسية

- 🎨 صفحات لإنشاء الصور والفيديو مع اختيار النموذج والمعلمات
- 🔌 تكامل مع واجهة Flaq.ai باستخدام Client Key واحد
- 🧠 دعم Nano Banana Pro وSeedream وGPT Image وGrok Imagine وVeo وWan وKling وSeedance وVidu ونماذج أخرى
- 🌐 دعم 15 لغة في الواجهة والمسارات وروابط SEO البديلة
- ☁️ رفع الملفات إلى Cloudflare R2 وحفظ النتائج المُنشأة
- 🔒 تخزين مشفّر لمفتاح API في جهة العميل
- 📱 واجهة متجاوبة ووضع داكن وسجل لعمليات الإنشاء

## نبذة عن Flaq.ai

تجمع [Flaq.ai](https://flaq.ai/ar/) أبرز نماذج إنشاء الصور والفيديو خلف واجهة API واحدة وآلية مصادقة موحّدة. يتضمن
القالب مسبقًا الاتصال بالواجهة ومتابعة الحالة وعرض النتائج وتنزيلها.

## البدء السريع

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

اضبط `NEXT_PUBLIC_SITE_URL` في `.env.local`، وأضف قيم Cloudflare R2 عند الحاجة. بعد ذلك أدخل Client Key الخاص بـ
[Flaq.ai](https://flaq.ai/ar/) من إعدادات التطبيق. راجع [التوثيق الإنجليزي الكامل](./README.md#getting-started) لجميع
المتغيرات وخطوات الإعداد.

## برنامج Flaq.ai للتسويق بالعمولة

عبر [برنامج Flaq.ai للتسويق بالعمولة](https://flaq.ai/ar/affiliate-program?utm_source=flaq-saas-template)، يمكنك الحصول
على عمولة 20% من أول طلب مدفوع صالح للمستخدم المُحال، و10% من الطلبات المدفوعة الصالحة اللاحقة خلال 60 يومًا من تسجيله.
تخضع الأهلية والدفع لأحدث الشروط المنشورة في صفحة البرنامج.

## التدويل

يدعم الكود وملفات README اللغات الخمس عشرة نفسها: `en` و`ja` و`id` و`it` و`pt` و`es` و`de` و`ru` و`fr` و`zh` و`tw` و`ko`
و`th` و`vi` و`ar`. تستخدم الإنجليزية `/`، وتستخدم بقية اللغات `/{locale}/`، ويُعرض المحتوى العربي من اليمين إلى اليسار.

## التوثيق والترخيص

للتعرف على الإعداد الكامل والتقنيات والنشر، راجع [README.md](./README.md) أو [README_zh.md](./README_zh.md). المشروع
متاح بموجب [MIT License](LICENSE).
