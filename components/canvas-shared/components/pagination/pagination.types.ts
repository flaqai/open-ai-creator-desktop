export interface PaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly ariaLabel: string;
  readonly previousLabel: string;
  readonly nextLabel: string;
  readonly className?: string;
  readonly onPageChange: (page: number) => void;
}
