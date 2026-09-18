export const FLAQ_HISTORY_IMAGE_MIME = 'application/x-flaq-history-image+json';

export type HistoryImageDragPayload = {
  version: 1;
  url: string;
  name?: string;
};

type DragDataTransfer = {
  readonly types: ArrayLike<string>;
  effectAllowed?: string;
  dropEffect?: string;
  getData: (type: string) => string;
  setData: (type: string, value: string) => void;
};

let activeHistoryImageDrag: HistoryImageDragPayload | null = null;

function validImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function hasHistoryImageDrag(transfer: Pick<DragDataTransfer, 'types'>): boolean {
  return activeHistoryImageDrag !== null || Array.from(transfer.types).includes(FLAQ_HISTORY_IMAGE_MIME);
}

export function writeHistoryImageDrag(
  transfer: Pick<DragDataTransfer, 'setData' | 'effectAllowed'>,
  payload: Omit<HistoryImageDragPayload, 'version'>,
): void {
  const value: HistoryImageDragPayload = {
    version: 1,
    url: payload.url,
    ...(payload.name ? { name: payload.name } : {}),
  };
  transfer.effectAllowed = 'copy';
  transfer.setData(FLAQ_HISTORY_IMAGE_MIME, JSON.stringify(value));
  transfer.setData('text/uri-list', payload.url);
  transfer.setData('text/plain', payload.url);
}

export function beginHistoryImageDrag(
  transfer: Pick<DragDataTransfer, 'setData' | 'effectAllowed'>,
  payload: Omit<HistoryImageDragPayload, 'version'>,
): void {
  activeHistoryImageDrag = {
    version: 1,
    url: payload.url,
    ...(payload.name ? { name: payload.name } : {}),
  };
  writeHistoryImageDrag(transfer, payload);
}

export function endHistoryImageDrag(): void {
  activeHistoryImageDrag = null;
}

export function readHistoryImageDrag(
  transfer: Pick<DragDataTransfer, 'types' | 'getData'>,
): HistoryImageDragPayload | null {
  if (!hasHistoryImageDrag(transfer)) return null;
  const serialized = transfer.getData(FLAQ_HISTORY_IMAGE_MIME);
  if (!serialized) return activeHistoryImageDrag;
  try {
    const value = JSON.parse(serialized) as Partial<HistoryImageDragPayload>;
    if (value.version !== 1 || !validImageUrl(value.url)) return null;
    return {
      version: 1,
      url: value.url,
      ...(typeof value.name === 'string' && value.name.trim() ? { name: value.name.trim() } : {}),
    };
  } catch {
    return null;
  }
}
