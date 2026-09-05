import { fetchMedia, saveBlob } from './media';

export type ImageType = 'webp' | 'png' | 'jpg';

/** Convert bytes as well as the extension, releasing every temporary image URL. */
export async function exportImage(imageUrl: string, type: ImageType, imageName: string) {
  const source = await (await fetchMedia(imageUrl)).blob();
  const mime = `image/${type === 'jpg' ? 'jpeg' : type}`;
  const filename = `${imageName.replace(/\.[^/.]+$/, '')}.${type}`;
  if (source.type === mime) return saveBlob(source, filename);

  const url = URL.createObjectURL(source);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Could not decode image.'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create image canvas.');
    if (type === 'jpg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0);
    const output = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Image conversion failed.'))), mime, 1);
    });
    if (output.type !== mime) throw new Error(`This system cannot export ${type.toUpperCase()} images.`);
    return saveBlob(output, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}
