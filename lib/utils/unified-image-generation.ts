export function getUnifiedImageDimensions(ratio?: string) {
  const [widthRatio, heightRatio] = (ratio || '1:1').split(':').map(Number);
  if (!widthRatio || !heightRatio) return { width: 1, height: 1 };
  return { width: widthRatio, height: heightRatio };
}
