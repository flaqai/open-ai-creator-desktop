import dayjs from 'dayjs';

export function formatTime(time: number, format: string = 'HH:mm') {
  return dayjs(time).format(format);
}

export function formatDate(time: number, format: string = 'YYYY-MM-DD') {
  return dayjs(time).format(format);
}

export function isToday(time: number): boolean {
  if (time === 0) return false;
  return dayjs(time).isSame(dayjs(), 'day');
}

export function generateSimpleId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}
