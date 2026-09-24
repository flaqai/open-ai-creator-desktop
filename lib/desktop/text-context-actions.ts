import { ClipboardPaste, Copy, Redo2, Scissors, TextSelect, Undo2 } from 'lucide-react';

import { readClipboardText, writeClipboardText } from '@/lib/platform/clipboard';

import type { ContextAction } from './context-actions';

export function textContextActions(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLElement,
  zh: boolean,
): ContextAction[] {
  const field = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element : null;
  const selection = window.getSelection();
  const range = !field && selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
  const start = field?.selectionStart ?? 0;
  const end = field?.selectionEnd ?? 0;
  const selected = field ? field.value.slice(start, end) : selection?.toString() || '';
  const sensitive =
    field instanceof HTMLInputElement &&
    (field.type === 'password' || /key|secret|token|password/i.test(`${field.name} ${field.id} ${field.autocomplete}`));
  const editable = field ? !field.readOnly && !field.disabled : element.isContentEditable;
  const restore = () => {
    element.focus({ preventScroll: true });
    if (field) {
      try {
        field.setSelectionRange(start, end);
      } catch {
        /* Non-text input types do not expose a selection. */
      }
    } else if (range) {
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };
  const edit = (command: string, value?: string) => {
    restore();
    if (!document.execCommand?.(command, false, value))
      throw new Error(zh ? '无法完成编辑操作' : 'The edit could not be completed');
  };
  const result: ContextAction[] = [];
  if (editable && !sensitive) {
    result.push(
      {
        id: 'undo',
        label: zh ? '撤销' : 'Undo',
        icon: Undo2,
        disabled: !document.queryCommandEnabled?.('undo'),
        run: () => edit('undo'),
      },
      {
        id: 'redo',
        label: zh ? '重做' : 'Redo',
        icon: Redo2,
        disabled: !document.queryCommandEnabled?.('redo'),
        run: () => edit('redo'),
      },
      {
        id: 'cut',
        label: zh ? '剪切' : 'Cut',
        icon: Scissors,
        separator: true,
        disabled: !selected,
        run: async () => {
          await writeClipboardText(selected);
          edit('delete');
        },
      },
    );
  }
  if (!sensitive)
    result.push({
      id: 'copy',
      label: zh ? '复制' : 'Copy',
      icon: Copy,
      disabled: !selected,
      run: () => writeClipboardText(selected),
    });
  if (editable)
    result.push({
      id: 'paste',
      label: zh ? '粘贴' : 'Paste',
      icon: ClipboardPaste,
      run: async () => {
        const text = await readClipboardText();
        if (text) edit('insertText', text);
      },
    });
  result.push({
    id: 'select-all',
    label: zh ? '全选' : 'Select all',
    icon: TextSelect,
    separator: true,
    run: () => {
      element.focus({ preventScroll: true });
      if (field) field.select();
      else {
        const all = document.createRange();
        all.selectNodeContents(element);
        selection?.removeAllRanges();
        selection?.addRange(all);
      }
    },
  });
  if (!sensitive)
    result.push({
      id: 'copy-all',
      label: zh ? '复制全部内容' : 'Copy all text',
      icon: Copy,
      disabled: !(field?.value || element.textContent),
      run: () => writeClipboardText(field ? field.value : element.textContent || ''),
    });
  return result;
}
