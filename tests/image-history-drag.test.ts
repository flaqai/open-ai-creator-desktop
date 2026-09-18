import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  beginHistoryImageDrag,
  endHistoryImageDrag,
  FLAQ_HISTORY_IMAGE_MIME,
  hasHistoryImageDrag,
  readHistoryImageDrag,
  writeHistoryImageDrag,
} from '../lib/desktop/image-history-drag';

class MemoryDataTransfer {
  private data = new Map<string, string>();
  effectAllowed = 'none';
  dropEffect = 'none';

  get types() {
    return [...this.data.keys()];
  }

  setData(type: string, value: string) {
    this.data.set(type, value);
  }

  getData(type: string) {
    return this.data.get(type) || '';
  }
}

test('image history drag payload keeps the source URL and advertises copy semantics', () => {
  const transfer = new MemoryDataTransfer();
  writeHistoryImageDrag(transfer, {
    url: 'https://storage.flaq.ai/uploads/2026/09/17/example.png',
    name: 'example.png',
  });

  assert.equal(transfer.effectAllowed, 'copy');
  assert.equal(hasHistoryImageDrag(transfer), true);
  assert.deepEqual(readHistoryImageDrag(transfer), {
    version: 1,
    url: 'https://storage.flaq.ai/uploads/2026/09/17/example.png',
    name: 'example.png',
  });
  assert.equal(transfer.getData('text/uri-list'), 'https://storage.flaq.ai/uploads/2026/09/17/example.png');
});

test('image history drag rejects malformed, unsupported and external text payloads', () => {
  const transfer = new MemoryDataTransfer();
  transfer.setData(FLAQ_HISTORY_IMAGE_MIME, '{broken');
  assert.equal(readHistoryImageDrag(transfer), null);

  transfer.setData(FLAQ_HISTORY_IMAGE_MIME, JSON.stringify({ version: 1, url: 'file:///tmp/private.png' }));
  assert.equal(readHistoryImageDrag(transfer), null);

  const external = new MemoryDataTransfer();
  external.setData('text/uri-list', 'https://example.test/untrusted.png');
  assert.equal(hasHistoryImageDrag(external), false);
  assert.equal(readHistoryImageDrag(external), null);
});

test('active in-app drag remains detectable when WebKit hides custom types until drop', () => {
  const source = new MemoryDataTransfer();
  const hiddenDuringDragOver = new MemoryDataTransfer();
  beginHistoryImageDrag(source, {
    url: 'https://storage.flaq.ai/uploads/2026/09/17/webkit.png',
    name: 'webkit.png',
  });

  assert.deepEqual(hiddenDuringDragOver.types, []);
  assert.equal(hasHistoryImageDrag(hiddenDuringDragOver), true);
  assert.equal(
    readHistoryImageDrag(hiddenDuringDragOver)?.url,
    'https://storage.flaq.ai/uploads/2026/09/17/webkit.png',
  );

  endHistoryImageDrag();
  assert.equal(hasHistoryImageDrag(hiddenDuringDragOver), false);
  assert.equal(readHistoryImageDrag(hiddenDuringDragOver), null);
});
