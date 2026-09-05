import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const copy = {
  en: {
    free: 'Free & Open Source',
    noSignup: 'No Signup Required',
    description:
      'No signup required to use or self-host this free, open-source {feature} template. Model generation requires a Flaq Client Key and API credit.',
    labels: [
      'AI Image & Video Platform',
      'AI Media Creator',
      'Text to Image AI Generator',
      'Image to Image AI Editor',
      'Text to Video AI Generator',
      'Image to Video AI Generator',
      'Reference to Video AI Generator',
      'Virtual Try-On AI',
    ],
  },
  ja: {
    free: '無料・オープンソース',
    noSignup: '登録不要',
    description:
      '登録不要で、この無料・オープンソースの{feature}テンプレートを使用・変更・セルフホストできます。モデル生成には Flaq Client Key が必要で、API 利用料は別途発生します。',
    labels: [
      'AI画像・動画プラットフォーム',
      'AIメディアクリエイター',
      'テキスト画像AIジェネレーター',
      '画像編集AI',
      'テキスト動画AIジェネレーター',
      '画像動画AIジェネレーター',
      '参照動画AIジェネレーター',
      'AIバーチャル試着',
    ],
  },
  id: {
    free: 'Gratis & Open Source',
    noSignup: 'Tanpa Perlu Daftar',
    description:
      'Tanpa daftar, gunakan dan host sendiri template {feature} gratis dan open source. Generasi memerlukan Flaq Client Key dan kredit API.',
    labels: [
      'Platform Gambar & Video AI',
      'Kreator Media AI',
      'Generator Teks ke Gambar AI',
      'Editor Gambar ke Gambar AI',
      'Generator Teks ke Video AI',
      'Generator Gambar ke Video AI',
      'Generator Referensi ke Video AI',
      'Virtual Try-On AI',
    ],
  },
  it: {
    free: 'Gratuito e Open Source',
    noSignup: 'Nessuna Registrazione',
    description:
      'Usa e ospita senza registrazione il template {feature}, gratuito e open source. Per generare servono Flaq Client Key e credito API.',
    labels: [
      'Piattaforma AI per Immagini e Video',
      'Creatore di Contenuti AI',
      'Generatore AI da Testo a Immagine',
      'Editor AI da Immagine a Immagine',
      'Generatore AI da Testo a Video',
      'Generatore AI da Immagine a Video',
      'Generatore AI da Riferimenti a Video',
      'Prova Virtuale AI',
    ],
  },
  pt: {
    free: 'Grátis e Open Source',
    noSignup: 'Sem Cadastro',
    description:
      'Use e hospede sem cadastro este template {feature} grátis e open source. Para gerar, é preciso uma Flaq Client Key e crédito de API.',
    labels: [
      'Plataforma de Imagens e Vídeos com IA',
      'Criador de Mídia com IA',
      'Gerador de Texto para Imagem com IA',
      'Editor de Imagem para Imagem com IA',
      'Gerador de Texto para Vídeo com IA',
      'Gerador de Imagem para Vídeo com IA',
      'Gerador de Referências para Vídeo com IA',
      'Provador Virtual com IA',
    ],
  },
  es: {
    free: 'Gratis y de Código Abierto',
    noSignup: 'Sin Registro',
    description:
      'Usa y aloja sin registro esta plantilla {feature} gratis y de código abierto. Para generar necesitas Flaq Client Key y crédito API.',
    labels: [
      'Plataforma de Imágenes y Vídeo con IA',
      'Creador de Contenido con IA',
      'Generador de Texto a Imagen con IA',
      'Editor de Imagen a Imagen con IA',
      'Generador de Texto a Vídeo con IA',
      'Generador de Imagen a Vídeo con IA',
      'Generador de Referencias a Vídeo con IA',
      'Probador Virtual con IA',
    ],
  },
  de: {
    free: 'Kostenlos & Open Source',
    noSignup: 'Keine Anmeldung',
    description:
      'Nutze und hoste dieses kostenlose Open-Source-{feature}-Template ohne Anmeldung. Für die Generierung sind Flaq Client Key und API-Guthaben nötig.',
    labels: [
      'KI-Plattform für Bilder und Videos',
      'KI-Medien-Creator',
      'Text-zu-Bild-KI-Generator',
      'Bild-zu-Bild-KI-Editor',
      'Text-zu-Video-KI-Generator',
      'Bild-zu-Video-KI-Generator',
      'Referenz-zu-Video-KI-Generator',
      'Virtuelle KI-Anprobe',
    ],
  },
  ru: {
    free: 'Бесплатно и Open Source',
    noSignup: 'Без регистрации',
    description:
      'Без регистрации используйте и размещайте бесплатный open-source шаблон «{feature}». Для генерации нужны Flaq Client Key и кредит API.',
    labels: [
      'ИИ-платформа для изображений и видео',
      'Создание ИИ-медиа',
      'ИИ-генератор текста в изображение',
      'ИИ-редактор изображения в изображение',
      'ИИ-генератор текста в видео',
      'ИИ-генератор изображения в видео',
      'ИИ-генератор референсов в видео',
      'Виртуальная ИИ-примерка',
    ],
  },
  fr: {
    free: 'Gratuit et Open Source',
    noSignup: 'Sans Inscription',
    description:
      'Utilisez et hébergez sans inscription ce modèle {feature}, gratuit et open source. La génération nécessite une Flaq Client Key et du crédit API.',
    labels: [
      'Plateforme IA d’Images et de Vidéos',
      'Créateur de Médias IA',
      'Générateur IA Texte vers Image',
      'Éditeur IA Image vers Image',
      'Générateur IA Texte vers Vidéo',
      'Générateur IA Image vers Vidéo',
      'Générateur IA Référence vers Vidéo',
      'Essayage Virtuel IA',
    ],
  },
  zh: {
    free: '免费开源',
    noSignup: '无需注册',
    description:
      '无需注册即可使用、修改和自行部署这款免费开源的{feature}模板。生成内容时需配置 Flaq Client Key，并使用相应的 API 额度。',
    labels: [
      'AI 图片与视频生成平台',
      'AI 图片与视频创作工作台',
      '文生图 AI 生成器',
      '图生图 AI 编辑器',
      '文生视频 AI 生成器',
      '图生视频 AI 生成器',
      '参考素材转视频 AI 生成器',
      'AI 虚拟试衣',
    ],
  },
  tw: {
    free: '免費開源',
    noSignup: '無需註冊',
    description:
      '無需註冊即可使用、修改和自行部署這款免費開源的{feature}範本。生成內容時需設定 Flaq Client Key，並使用相應的 API 額度。',
    labels: [
      'AI 圖像與影片生成平台',
      'AI 圖像與影片創作工作台',
      '文字轉圖像 AI 生成器',
      '圖像轉圖像 AI 編輯器',
      '文字轉影片 AI 生成器',
      '圖像轉影片 AI 生成器',
      '參考素材轉影片 AI 生成器',
      'AI 虛擬試衣',
    ],
  },
  ko: {
    free: '무료 오픈 소스',
    noSignup: '가입 불필요',
    description:
      '가입 없이 무료 오픈 소스 {feature} 템플릿을 사용, 수정, 자체 호스팅할 수 있습니다. 모델 생성에는 Flaq Client Key가 필요하며 API 사용료는 별도입니다.',
    labels: [
      'AI 이미지 및 동영상 플랫폼',
      'AI 미디어 크리에이터',
      '텍스트 이미지 AI 생성기',
      '이미지 편집 AI',
      '텍스트 동영상 AI 생성기',
      '이미지 동영상 AI 생성기',
      '참조 동영상 AI 생성기',
      'AI 가상 피팅',
    ],
  },
  th: {
    free: 'ฟรีและโอเพนซอร์ส',
    noSignup: 'ไม่ต้องสมัคร',
    description:
      'ไม่ต้องสมัครเพื่อใช้หรือโฮสต์เทมเพลต {feature} ฟรีและโอเพนซอร์ส การสร้างผลงานต้องมี Flaq Client Key และเครดิต API',
    labels: [
      'แพลตฟอร์มสร้างภาพและวิดีโอ AI',
      'เครื่องมือสร้างสื่อ AI',
      'เครื่องมือสร้างภาพจากข้อความ AI',
      'เครื่องมือแก้ไขภาพด้วย AI',
      'เครื่องมือสร้างวิดีโอจากข้อความ AI',
      'เครื่องมือสร้างวิดีโอจากภาพ AI',
      'เครื่องมือสร้างวิดีโอจากสื่ออ้างอิง AI',
      'ลองเสื้อผ้าเสมือนจริงด้วย AI',
    ],
  },
  vi: {
    free: 'Miễn phí và Mã nguồn mở',
    noSignup: 'Không cần đăng ký',
    description:
      'Dùng và tự lưu trữ mẫu {feature} miễn phí, mã nguồn mở mà không cần đăng ký. Việc tạo nội dung cần Flaq Client Key và tín dụng API.',
    labels: [
      'Nền tảng Tạo Ảnh và Video AI',
      'Trình Tạo Nội dung AI',
      'Trình Tạo Ảnh từ Văn bản AI',
      'Trình Chỉnh sửa Ảnh bằng AI',
      'Trình Tạo Video từ Văn bản AI',
      'Trình Tạo Video từ Ảnh AI',
      'Trình Tạo Video từ Tư liệu Tham chiếu AI',
      'Thử Đồ Ảo bằng AI',
    ],
  },
  ar: {
    free: 'مجاني ومفتوح المصدر',
    noSignup: 'لا يلزم التسجيل',
    description:
      'استخدم واستضف قالب {feature} المجاني ومفتوح المصدر بلا تسجيل. يتطلب التوليد Flaq Client Key ورصيد API.',
    labels: [
      'منصة إنشاء الصور والفيديو بالذكاء الاصطناعي',
      'منشئ وسائط الذكاء الاصطناعي',
      'مولّد الصور من النص بالذكاء الاصطناعي',
      'محرّر الصور بالذكاء الاصطناعي',
      'مولّد الفيديو من النص بالذكاء الاصطناعي',
      'مولّد الفيديو من الصور بالذكاء الاصطناعي',
      'مولّد الفيديو من المراجع بالذكاء الاصطناعي',
      'تجربة الملابس الافتراضية بالذكاء الاصطناعي',
    ],
  },
};

const formLabels = {
  en: {
    home: 'AI Image & Video',
    'ai-media-creator': 'AI Media',
    'text-to-image': 'Text to Image',
    'image-to-image': 'Image to Image',
    'text-to-video': 'Text to Video',
    'image-to-video': 'Image to Video',
    'reference-to-video': 'Reference to Video',
    'virtual-try-on': 'Virtual Try-On',
  },
  ja: {
    home: 'AI画像・動画',
    'ai-media-creator': 'AIメディア',
    'text-to-image': 'テキストから画像',
    'image-to-image': '画像から画像',
    'text-to-video': 'テキストから動画',
    'image-to-video': '画像から動画',
    'reference-to-video': '参照動画',
    'virtual-try-on': 'バーチャル試着',
  },
  id: {
    home: 'Platform AI',
    'ai-media-creator': 'Media AI',
    'text-to-image': 'Teks ke Gambar',
    'image-to-image': 'Gambar ke Gambar',
    'text-to-video': 'Teks ke Video',
    'image-to-video': 'Gambar ke Video',
    'reference-to-video': 'Referensi ke Video',
    'virtual-try-on': 'Virtual Try-On',
  },
  it: {
    home: 'Immagini e Video AI',
    'ai-media-creator': 'Contenuti AI',
    'text-to-image': 'Testo in Immagine',
    'image-to-image': 'Immagine in Immagine',
    'text-to-video': 'Testo in Video',
    'image-to-video': 'Immagine in Video',
    'reference-to-video': 'Riferimenti in Video',
    'virtual-try-on': 'Prova Virtuale',
  },
  pt: {
    home: 'Imagens e Vídeos com IA',
    'ai-media-creator': 'Mídia com IA',
    'text-to-image': 'Texto para Imagem',
    'image-to-image': 'Imagem para Imagem',
    'text-to-video': 'Texto para Vídeo',
    'image-to-video': 'Imagem para Vídeo',
    'reference-to-video': 'Referências para Vídeo',
    'virtual-try-on': 'Provador Virtual',
  },
  es: {
    home: 'Imágenes y Vídeo con IA',
    'ai-media-creator': 'Contenido con IA',
    'text-to-image': 'Texto a Imagen',
    'image-to-image': 'Imagen a Imagen',
    'text-to-video': 'Texto a Vídeo',
    'image-to-video': 'Imagen a Vídeo',
    'reference-to-video': 'Referencias a Vídeo',
    'virtual-try-on': 'Probador Virtual',
  },
  de: {
    home: 'KI-Bilder und -Videos',
    'ai-media-creator': 'KI-Medien',
    'text-to-image': 'Text zu Bild',
    'image-to-image': 'Bild zu Bild',
    'text-to-video': 'Text zu Video',
    'image-to-video': 'Bild zu Video',
    'reference-to-video': 'Referenz zu Video',
    'virtual-try-on': 'Virtuelle Anprobe',
  },
  ru: {
    home: 'ИИ-изображения и видео',
    'ai-media-creator': 'ИИ-медиа',
    'text-to-image': 'Текст в изображение',
    'image-to-image': 'Изображение в изображение',
    'text-to-video': 'Текст в видео',
    'image-to-video': 'Изображение в видео',
    'reference-to-video': 'Референсы в видео',
    'virtual-try-on': 'Виртуальная примерка',
  },
  fr: {
    home: 'Images et Vidéos IA',
    'ai-media-creator': 'Médias IA',
    'text-to-image': 'Texte vers Image',
    'image-to-image': 'Image vers Image',
    'text-to-video': 'Texte vers Vidéo',
    'image-to-video': 'Image vers Vidéo',
    'reference-to-video': 'Référence vers Vidéo',
    'virtual-try-on': 'Essayage Virtuel',
  },
  zh: {
    home: 'AI 图片与视频',
    'ai-media-creator': 'AI 创作',
    'text-to-image': '文生图',
    'image-to-image': '图生图',
    'text-to-video': '文生视频',
    'image-to-video': '图生视频',
    'reference-to-video': '参考素材转视频',
    'virtual-try-on': '虚拟试衣',
  },
  tw: {
    home: 'AI 圖像與影片',
    'ai-media-creator': 'AI 創作',
    'text-to-image': '文字轉圖像',
    'image-to-image': '圖像轉圖像',
    'text-to-video': '文字轉影片',
    'image-to-video': '圖像轉影片',
    'reference-to-video': '參考素材轉影片',
    'virtual-try-on': '虛擬試衣',
  },
  ko: {
    home: 'AI 이미지와 동영상',
    'ai-media-creator': 'AI 미디어',
    'text-to-image': '텍스트로 이미지',
    'image-to-image': '이미지로 이미지',
    'text-to-video': '텍스트로 동영상',
    'image-to-video': '이미지로 동영상',
    'reference-to-video': '참조로 동영상',
    'virtual-try-on': '가상 피팅',
  },
  th: {
    home: 'ภาพและวิดีโอ AI',
    'ai-media-creator': 'สื่อ AI',
    'text-to-image': 'ข้อความเป็นภาพ',
    'image-to-image': 'ภาพเป็นภาพ',
    'text-to-video': 'ข้อความเป็นวิดีโอ',
    'image-to-video': 'ภาพเป็นวิดีโอ',
    'reference-to-video': 'สื่ออ้างอิงเป็นวิดีโอ',
    'virtual-try-on': 'ลองเสื้อผ้าเสมือนจริง',
  },
  vi: {
    home: 'Ảnh và Video AI',
    'ai-media-creator': 'Nội dung AI',
    'text-to-image': 'Văn bản thành Ảnh',
    'image-to-image': 'Ảnh thành Ảnh',
    'text-to-video': 'Văn bản thành Video',
    'image-to-video': 'Ảnh thành Video',
    'reference-to-video': 'Tư liệu thành Video',
    'virtual-try-on': 'Thử Đồ Ảo',
  },
  ar: {
    home: 'صور وفيديو AI',
    'ai-media-creator': 'وسائط AI',
    'text-to-image': 'نص إلى صورة',
    'image-to-image': 'صورة إلى صورة',
    'text-to-video': 'نص إلى فيديو',
    'image-to-video': 'صورة إلى فيديو',
    'reference-to-video': 'مراجع إلى فيديو',
    'virtual-try-on': 'تجربة ملابس افتراضية',
  },
};

const namespaces = [
  'home',
  'ai-media-creator',
  'text-to-image',
  'image-to-image',
  'text-to-video',
  'image-to-video',
  'reference-to-video',
  'virtual-try-on',
];

for (const [locale, localeCopy] of Object.entries(copy)) {
  const file = path.join(root, 'messages', locale + '.json');
  const messages = JSON.parse(fs.readFileSync(file, 'utf8'));

  for (const [index, namespace] of namespaces.entries()) {
    const label = localeCopy.labels[index];
    const titleLabel = formLabels[locale]?.[namespace] ?? label;
    const title = titleLabel + ' — ' + localeCopy.free + ' · ' + localeCopy.noSignup;
    const description = localeCopy.description.replace('{feature}', titleLabel);
    const metadata = messages.Metadata[namespace];

    metadata.title = title;
    metadata.description = description;

    if (namespace === 'home') {
      metadata.keywords =
        label +
        ', ' +
        localeCopy.free +
        ', ' +
        localeCopy.noSignup +
        ', no signup required, free AI generator, open source AI, free to use, Flaq API, AIGC';
      metadata.openGraph.title = title;
      metadata.openGraph.description = description;
      metadata.twitter.title = title;
      metadata.twitter.description = description;
      messages.Home.heading.title = title;
      messages.Home.heading.description = description;
      messages.Footer.title = title;
      messages.Footer.subTitle = description;
      continue;
    }

    const page = messages[namespace];
    if (page && page.heading) {
      page.heading.title = title;
      page.heading.description = description;
    }
    if (page && page.form && page.form.title) {
      page.form.title = formLabels[locale]?.[namespace] ?? label;
    }
  }

  fs.writeFileSync(file, JSON.stringify(messages, null, 2) + '\n');
}

console.log('Updated SEO and visible page copy for ' + Object.keys(copy).length + ' locales.');
