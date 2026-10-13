import assert from 'node:assert/strict';
import test from 'node:test';

import 'fake-indexeddb/auto';

import {
  readCanvasMedia,
  storeCanvasMedia,
} from '../components/infinite-canvas/runtime/persistence/canvas-media-cache';
import { createCanvasProjectStorage } from '../components/infinite-canvas/runtime/persistence/local-projects';

class TestStorage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

test('development reset removes only canvas data once before subsequent storage access', async () => {
  const previousEnvironment = process.env.NODE_ENV;
  const previousWindow = globalThis.window;
  const storage = new TestStorage();
  const projects = createCanvasProjectStorage();
  const mediaUrl = 'https://example.test/dev-reset.png';

  try {
    Reflect.set(process.env, 'NODE_ENV', 'test');
    const oldProject = await projects.createProject('Before reset');
    await storeCanvasMedia(mediaUrl, new Blob(['old media']));
    storage.setItem('FLAQ-SAAS-TEMPLATE:infinite-canvas:v1:config', 'old config');
    storage.setItem('FLAQ-SAAS-TEMPLATE:ai-creation-history', 'keep history');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: storage, dispatchEvent: () => true },
    });

    Reflect.set(process.env, 'NODE_ENV', 'development');
    assert.deepEqual((await projects.listProjects()).rows, []);
    assert.equal(await readCanvasMedia(mediaUrl), null);
    assert.equal(storage.getItem('FLAQ-SAAS-TEMPLATE:infinite-canvas:v1:config'), null);
    assert.equal(storage.getItem('FLAQ-SAAS-TEMPLATE:ai-creation-history'), 'keep history');

    const newProject = await projects.createProject('After reset');
    assert.notEqual(newProject.id, oldProject.id);
    assert.equal((await projects.listProjects()).rows[0]?.projectId, newProject.id);
    await storeCanvasMedia(mediaUrl, new Blob(['new media']));
    assert.equal(await (await readCanvasMedia(mediaUrl))?.text(), 'new media');
  } finally {
    if (previousEnvironment === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV');
    else Reflect.set(process.env, 'NODE_ENV', previousEnvironment);
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
  }
});
