'use client';

import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { ArrowBigRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Pagination from 'rc-pagination';

import { cn } from '@/lib/utils';
import { objToQueryStr } from '@/lib/utils/stringUtils';

type BasePaginationProps = {
  route: string;
  subRoute?: string;
  currentPage: number;
  pageSize: number;
  firstPageRoute?: string;
  total: number;
  searchParamsKeys?: string[];
  className?: string;
};

function LinkTag({
  className,
  title,
  href,
  children,
}: {
  className?: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      className={cn(
        'flex-center text-foreground/40 hover:bg-card size-8 rounded-[4px] border border-transparent bg-transparent hover:cursor-pointer',
        className,
      )}
    >
      {children}
    </Link>
  );
}

function itemRender({
  page,
  type,
  element,
  route,
  currentPage,
}: {
  page: number;
  type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next';
  element: React.ReactNode;
  route: string;
  currentPage: number;
}) {
  if (type === 'page') {
    return (
      <LinkTag
        href={route}
        title={page.toString()}
        className={page === currentPage ? 'border-foreground bg-card text-foreground' : ''}
      >
        {page}
      </LinkTag>
    );
  }
  if (type === 'prev') {
    return (
      <LinkTag href={route} title={type}>
        <ChevronLeft className='h-4 w-4' />
      </LinkTag>
    );
  }
  if (type === 'next') {
    return (
      <LinkTag href={route} title={type}>
        <ChevronRight className='h-4 w-4' />
      </LinkTag>
    );
  }
  if (type === 'jump-prev' || type === 'jump-next') {
    return <div>...</div>;
  }
  return element;
}

export default function BasePagination({
  route,
  subRoute = '',
  firstPageRoute,
  currentPage,
  pageSize,
  total,
  searchParamsKeys,
  className,
}: BasePaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getRoute = (nextNum: number): string => {
    let routeStr = `${route}${subRoute}/${nextNum}`;

    if (nextNum === 1 || nextNum === 0) {
      routeStr = firstPageRoute || route;
    }

    const searchParamsObj: Record<string, string | null> = {};
    searchParamsKeys?.forEach((key) => {
      searchParamsObj[key] = searchParams.get(key);
    });

    return objToQueryStr(routeStr, searchParamsObj);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const page = formData.get('page');
    router.push(getRoute(Number(page)));
  };

  return (
    <div className={cn('mx-auto flex items-center justify-center gap-3', className)}>
      <Pagination
        className='text-foreground flex gap-3 text-xs [&>li]:flex [&>li]:items-center [&>li]:justify-center'
        pageSize={pageSize}
        defaultCurrent={currentPage}
        total={total}
        showLessItems
        itemRender={(page, type, element) => itemRender({ page, type, element, route: getRoute(page), currentPage })}
        locale={{
          next_page: 'next',
          prev_page: 'prev',
        }}
        prevIcon={<ChevronLeft className='h-4 w-4' />}
        nextIcon={<ChevronRight className='h-4 w-4' />}
      />
      <form onSubmit={handleSubmit} className='flex items-center gap-3'>
        <input
          type='number'
          min={1}
          max={Math.ceil(total / pageSize)}
          name='page'
          defaultValue={currentPage}
          className='hide-number-input border-foreground/40 flex h-8 max-w-[50px] items-center justify-center rounded border bg-transparent px-2 text-xs'
        />
        <button
          type='submit'
          className='text-foreground/40 hover:bg-card flex size-8 items-center justify-center rounded border border-transparent bg-transparent hover:cursor-pointer'
        >
          <ArrowBigRight className='size-6' />
        </button>
      </form>
    </div>
  );
}
