export function findClosestResolution(resolution: string, list: { value: string }[]): string {
  if (!resolution) {
    return list.length > 0 ? list[0].value : '1:1';
  }

  const [width, height] = resolution.split('x').map(Number);

  if (Number.isNaN(width) || Number.isNaN(height) || width <= 0 || height <= 0) {
    throw new Error('Invalid resolution format');
  }

  const inputRatio = width / height;

  let closestDiff = Infinity;
  let closestValue = '';

  list.forEach((item) => {
    const [w, h] = item.value.split(':').map(Number);
    const ratio = w / h;
    const diff = Math.abs(ratio - inputRatio);

    if (diff < closestDiff) {
      closestDiff = diff;
      closestValue = item.value;
    }
  });

  return closestValue;
}
