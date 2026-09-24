export class CanvasStorageError extends Error {
  constructor(readonly kind: 'missing') {
    super('Canvas project was not found on this device.');
    this.name = 'CanvasStorageError';
  }
}
