import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = process.cwd();
const snapshotDate = '2026-09-20';
const outputFile = join(root, 'lib', 'recommended-prompts.snapshot.json');
const imageRoot = join(root, 'public', 'images', 'recommended-prompts');

const collections = [
  {
    id: 'qwen-image-3-0',
    model: 'Qwen Image 3.0',
    type: 'image',
    sourceUrl: 'https://flaq.ai/awesome-prompt/qwen-image-3-0-prompts/',
    toolHref: '/text-to-image',
    description: {
      zh: '图像生成与视觉设计提示词合集',
      en: 'Image generation and visual design prompt collection',
    },
  },
  {
    id: 'wan-3-0',
    model: 'Wan 3.0',
    type: 'video',
    sourceUrl: 'https://flaq.ai/awesome-prompt/wan-3-0-prompts/',
    toolHref: '/text-to-video',
    description: {
      zh: '视频叙事与电影镜头提示词合集',
      en: 'Video storytelling and cinematic prompt collection',
    },
  },
  {
    id: 'minimax-h3',
    model: 'MiniMax H3',
    type: 'video',
    sourceUrl: 'https://flaq.ai/awesome-prompt/minimax-h3-prompts/',
    toolHref: '/text-to-video',
    description: {
      zh: '人物表演与商业视频提示词合集',
      en: 'Character performance and commercial video prompt collection',
    },
  },
  {
    id: 'seedance-2-5',
    model: 'Seedance 2.5',
    type: 'video',
    sourceUrl: 'https://flaq.ai/awesome-prompt/seedance-2-5-prompts/',
    toolHref: '/text-to-video',
    description: {
      zh: '镜头语言与动态创意提示词合集',
      en: 'Camera language and motion design prompt collection',
    },
  },
];

async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'Flaq-Creator-Prompt-Snapshot/1.0' },
        signal: AbortSignal.timeout(60_000),
      });
      if (response.ok || response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
  }
  throw lastError;
}

function decodeHtml(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    hellip: '…',
    lt: '<',
    nbsp: ' ',
    quot: '"',
    rsquo: '’',
  };
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(code.toLowerCase().startsWith('x') ? Number.parseInt(code.slice(1), 16) : Number(code)),
    )
    .replace(/&([a-z]+);/gi, (entity, name) => named[name] ?? entity)
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function getMainCollectionHtml(html, id) {
  const start = html.indexOf('id="awesome-prompt-collection-title"');
  const end = html.indexOf('Open-Source Awesome', start);
  if (start < 0 || end < 0) throw new Error(`Could not locate the main prompt collection for ${id}`);
  return html.slice(start, end);
}

function parseArticles(html, collection) {
  return [...html.matchAll(/<article aria-label="([^"]+)"[\s\S]*?<\/article>/g)].map((match, index) => {
    const article = match[0];
    const video = article.match(/<video src="([^"]+)" poster="([^"]+)"/);
    const image = article.match(/<img src="([^"]+)"/);
    const prompt = article.match(/<p class="text-color-t2 line-clamp-4 whitespace-pre-line">([\s\S]*?)<\/p>/);
    if (!prompt || (!video && !image)) throw new Error(`Incomplete prompt card ${index + 1} in ${collection.id}`);
    return {
      id: `${collection.id}-${String(index + 1).padStart(2, '0')}`,
      title: decodeHtml(match[1]),
      prompt: decodeHtml(prompt[1]),
      media: video
        ? { type: 'video', remoteUrl: decodeHtml(video[1]), remoteImageUrl: decodeHtml(video[2]) }
        : { type: 'image', remoteImageUrl: decodeHtml(image[1]) },
    };
  });
}

async function downloadImage(url, collectionId, index) {
  const response = await fetchWithRetry(url);
  if (!response.ok) throw new Error(`Image download failed (${response.status}): ${url}`);
  const urlExtension = extname(new URL(url).pathname).toLowerCase();
  const extension = ['.avif', '.jpeg', '.jpg', '.png', '.webp'].includes(urlExtension) ? urlExtension : '.webp';
  const directory = join(imageRoot, collectionId);
  const fileName = `${String(index + 1).padStart(2, '0')}${extension}`;
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, fileName), Buffer.from(await response.arrayBuffer()));
  return `/images/recommended-prompts/${collectionId}/${fileName}`;
}

const snapshotCollections = [];
for (const collection of collections) {
  const response = await fetchWithRetry(collection.sourceUrl);
  if (!response.ok) throw new Error(`Page fetch failed (${response.status}): ${collection.sourceUrl}`);
  const articles = parseArticles(getMainCollectionHtml(await response.text(), collection.id), collection);
  if (!articles.length) throw new Error(`No prompt cards found for ${collection.id}`);

  const prompts = [];
  for (const [index, article] of articles.entries()) {
    const image = await downloadImage(article.media.remoteImageUrl, collection.id, index);
    prompts.push({
      id: article.id,
      title: article.title,
      prompt: article.prompt,
      media: {
        type: article.media.type,
        image,
        ...(article.media.remoteUrl ? { url: article.media.remoteUrl } : {}),
      },
    });
  }

  snapshotCollections.push({ ...collection, prompts });
  console.log(`${collection.model}: ${prompts.length} prompts`);
}

await writeFile(
  outputFile,
  `${JSON.stringify({ version: 1, snapshotDate, collections: snapshotCollections }, null, 2)}\n`,
);
console.log(`Wrote ${outputFile}`);
