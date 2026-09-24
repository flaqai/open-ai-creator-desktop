export function formatInfiniteCanvasProjectTime(value: string | number, locale: string, now = Date.now()): string {
  const timestamp = normalizeProjectTimestamp(value);
  if (!Number.isFinite(timestamp)) return String(value);

  const differenceInSeconds = Math.round((timestamp - now) / 1_000);
  const absoluteDifference = Math.abs(differenceInSeconds);
  const relativeTime = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (absoluteDifference < 60) return relativeTime.format(differenceInSeconds, 'second');
  if (absoluteDifference < 3_600) return relativeTime.format(Math.round(differenceInSeconds / 60), 'minute');
  if (absoluteDifference < 86_400) return relativeTime.format(Math.round(differenceInSeconds / 3_600), 'hour');
  if (absoluteDifference < 604_800) return relativeTime.format(Math.round(differenceInSeconds / 86_400), 'day');

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
}

function normalizeProjectTimestamp(value: string | number): number {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(numericValue)) {
    return Math.abs(numericValue) < 1_000_000_000_000 ? numericValue * 1_000 : numericValue;
  }
  return typeof value === 'string' ? Date.parse(value) : Number.NaN;
}
