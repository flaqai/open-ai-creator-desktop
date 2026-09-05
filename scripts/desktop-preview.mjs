// Local-only QA fixture: never forwards credentials or requests to Flaq/R2.
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve('out');
const origin = 'http://127.0.0.1:4173';
const tasks = new Map();
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
};
const image = `${origin}/flaqai_saas_asserts/text_to_image/feature/1_1.webp`;
const video = `${origin}/flaqai_saas_asserts/image_to_video/example/1.mp4`;
createServer(async (req, res) => {
  const json = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };
  try {
    const path = decodeURIComponent(new URL(req.url, origin).pathname);
    if (path.startsWith('/api/')) {
      if (req.headers.authorization !== 'Bearer test-only-key')
        return json(401, { error: { code: 'unauthorized', message: 'Invalid test key' } });
      const match = path.match(/^\/api\/v1\/(image|video)\/([^/]+)$/);
      if (!match) return json(404, { error: { message: 'Route not found' } });
      const [, type, id] = match;
      if (req.method === 'POST' && id === 'task') {
        let input = '';
        for await (const chunk of req) {
          input += chunk;
          if (input.length > 1e6) return json(413, {});
        }
        const body = JSON.parse(input);
        if (!body.model_name || !body.prompt) return json(400, { error: { message: 'Missing model or prompt' } });
        const taskId = randomUUID();
        tasks.set(taskId, { type, polls: 0 });
        return json(200, {
          code: 0,
          message: 'Local fixture',
          data: { task_id: taskId, task_status: 'submitted', response_url: '' },
        });
      }
      const task = tasks.get(id);
      if (!task || task.type !== type)
        return json(404, { error: { code: 'task_not_found', message: 'Task not found' } });
      task.polls++;
      return json(200, {
        code: 0,
        data: {
          task_id: id,
          task_status: task.polls < 2 ? 'processing' : 'succeed',
          task_status_msg: null,
          task_result:
            type === 'image'
              ? { images: [{ url: image, thumbnail_url: image, resolution: '1024x1024' }] }
              : { videos: [{ url: video, cover_url: image, duration: 5, ratio: '16:9' }] },
        },
      });
    }
    let file = resolve(root, `.${path}`);
    if (!file.startsWith(root + sep) && file !== root) return json(403, {});
    let info;
    try {
      info = await stat(file);
    } catch {
      file += '.html';
      info = await stat(file);
    }
    if (info.isDirectory()) file = resolve(file, 'index.html');
    info = await stat(file);
    res.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
    });
    createReadStream(file).pipe(res);
  } catch {
    if (!res.headersSent) res.writeHead(404);
    res.end('Not found');
  }
}).listen(4173, '127.0.0.1', () => console.log(`Desktop QA preview: ${origin} (mock API only; key: test-only-key)`));
