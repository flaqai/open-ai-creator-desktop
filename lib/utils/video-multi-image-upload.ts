// Uploaded file URLs are consumed from the end because the upload queue also
// contains start/end frames before the multi-image inputs.
export function takeMultiImageUrls(images: (File | string)[], uploadedUrls: string[]): string[] {
  const imageUrls: string[] = [];
  for (let index = images.length - 1; index >= 0; index--) {
    const image = images[index];
    const url = typeof image === 'string' ? image : uploadedUrls.pop();
    if (url) imageUrls.unshift(url);
  }
  return imageUrls;
}
