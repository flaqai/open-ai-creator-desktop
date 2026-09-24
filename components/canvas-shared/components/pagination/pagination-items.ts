export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

const ALL_PAGES_THRESHOLD = 7;
const MIDDLE_PAGE_COUNT = 3;

export function getPaginationItems(page: number, totalPages: number): readonly PaginationItem[] {
  const normalizedTotalPages = Math.max(1, Math.trunc(totalPages));
  const currentPage = Math.min(Math.max(1, Math.trunc(page)), normalizedTotalPages);

  if (normalizedTotalPages <= ALL_PAGES_THRESHOLD) {
    return Array.from({ length: normalizedTotalPages }, (_, index) => index + 1);
  }

  const firstMiddlePage = Math.min(Math.max(currentPage - 1, 2), normalizedTotalPages - MIDDLE_PAGE_COUNT);
  const middlePages = Array.from({ length: MIDDLE_PAGE_COUNT }, (_, index) => firstMiddlePage + index);
  const items: PaginationItem[] = [1];

  if (firstMiddlePage > 2) items.push('ellipsis-start');
  items.push(...middlePages);
  if (middlePages.at(-1)! < normalizedTotalPages - 1) items.push('ellipsis-end');
  items.push(normalizedTotalPages);

  return items;
}
