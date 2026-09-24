import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mediaContextActions } from '../lib/desktop/media-context-actions';

test('generated image menus keep destructive actions separate and expose only applicable reference targets', () => {
  const actions = mediaContextActions(
    { kind: 'image', url: 'https://example.test/image.png', prompt: 'a mountain' },
    true,
    { view: () => {}, remove: () => {} },
  );
  assert.deepEqual(
    actions.map((action) => action.id),
    ['view', 'copy-prompt', 'save', 'reuse', 'remove'],
  );
  assert.deepEqual(
    actions.find((action) => action.id === 'reuse')?.children?.map((action) => action.id),
    ['/image-to-image', '/image-to-video', '/reference-to-video'],
  );
  assert.equal(actions.at(-1)?.destructive, true);
  assert.equal(actions.at(-1)?.separator, true);
});

test('recommended media never exposes record removal or reference reuse', () => {
  const actions = mediaContextActions({ kind: 'image', url: '/recommended/image.webp', prompt: 'sample' }, false, {
    view: () => {},
    reuse: false,
  });
  assert.deepEqual(
    actions.map((action) => action.id),
    ['view', 'copy-prompt', 'save'],
  );
});

test('audio and files omit image and video reference operations', () => {
  for (const kind of ['audio', 'file'] as const) {
    const actions = mediaContextActions({ kind, url: `https://example.test/sample.${kind}` }, true, {
      remove: () => {},
    });
    assert.deepEqual(
      actions.map((action) => action.id),
      ['save', 'remove'],
    );
  }
});
