import type {
  AnchorHTMLAttributes,
  BlockquoteHTMLAttributes,
  ComponentPropsWithoutRef,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type ResolveHref = (href: string) => string;

export type InfiniteCanvasDocsMdxComponents = Readonly<Record<string, ElementType>>;

export interface CreateInfiniteCanvasDocsMdxComponentsOptions {
  readonly resolveHref?: ResolveHref;
}

function MdxHeadingOne({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn('mb-6 mt-2 scroll-mt-24 text-3xl font-semibold tracking-tight text-canvas-text', className)}
      {...props}
    >
      {children}
    </h1>
  );
}

function MdxHeadingTwo({ children, className, id, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      id={id}
      className={cn('mb-4 mt-10 scroll-mt-24 text-2xl font-semibold tracking-tight text-canvas-text', className)}
      {...props}
    >
      {id ? (
        <a href={'#' + id} className='group inline-flex items-baseline gap-2 no-underline'>
          {children}
          <span aria-hidden='true' className='text-main-color opacity-0 transition-opacity group-hover:opacity-100'>
            #
          </span>
        </a>
      ) : (
        children
      )}
    </h2>
  );
}

function MdxHeadingThree({ children, className, id, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 id={id} className={cn('mb-3 mt-8 scroll-mt-24 text-xl font-semibold text-canvas-text', className)} {...props}>
      {id ? (
        <a href={'#' + id} className='group inline-flex items-baseline gap-2 no-underline'>
          {children}
          <span aria-hidden='true' className='text-main-color opacity-0 transition-opacity group-hover:opacity-100'>
            #
          </span>
        </a>
      ) : (
        children
      )}
    </h3>
  );
}

function MdxParagraph(props: HTMLAttributes<HTMLParagraphElement>) {
  return <p className='my-5 text-base leading-8 text-canvas-muted' {...props} />;
}

function MdxUnorderedList(props: ComponentPropsWithoutRef<'ul'>) {
  return <ul className='my-5 list-disc space-y-2 pl-6 text-canvas-muted marker:text-main-color' {...props} />;
}

function MdxOrderedList(props: ComponentPropsWithoutRef<'ol'>) {
  return <ol className='my-5 list-decimal space-y-2 pl-6 text-canvas-muted marker:text-main-color' {...props} />;
}

function MdxListItem(props: ComponentPropsWithoutRef<'li'>) {
  return <li className='pl-1 leading-7' {...props} />;
}

function MdxInlineCode(props: ComponentPropsWithoutRef<'code'>) {
  return (
    <code
      className='rounded-md border border-canvas-border bg-canvas-surface px-1.5 py-0.5 font-mono text-[0.9em] text-canvas-text'
      {...props}
    />
  );
}

function MdxPre(props: ComponentPropsWithoutRef<'pre'>) {
  return (
    <pre
      className='my-6 overflow-x-auto rounded-xl border border-canvas-border bg-canvas-panel p-4 text-sm leading-6 text-canvas-text [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0'
      {...props}
    />
  );
}

function MdxBlockquote(props: BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return <blockquote className='my-6 border-l-2 border-main-color pl-5 italic text-canvas-muted' {...props} />;
}

function MdxTable(props: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className='my-6 overflow-x-auto rounded-xl border border-canvas-border'>
      <table className='w-full border-collapse text-left text-sm' {...props} />
    </div>
  );
}

function MdxTableHead(props: ComponentPropsWithoutRef<'thead'>) {
  return <thead className='bg-canvas-surface text-canvas-text' {...props} />;
}

function MdxTableHeader(props: ComponentPropsWithoutRef<'th'>) {
  return <th className='border-b border-canvas-border px-4 py-3 font-semibold' {...props} />;
}

function MdxTableCell(props: ComponentPropsWithoutRef<'td'>) {
  return <td className='border-b border-canvas-border px-4 py-3 leading-6 text-canvas-muted' {...props} />;
}

function MdxHorizontalRule(props: ComponentPropsWithoutRef<'hr'>) {
  return <hr className='my-10 border-canvas-border' {...props} />;
}

export function InfiniteCanvasDocsCallout({
  children,
  type = 'info',
}: {
  readonly children: ReactNode;
  readonly type?: 'info' | 'warn' | 'error' | 'success';
}) {
  const tone =
    type === 'warn'
      ? 'border-yellow-color/50 bg-yellow-color/10'
      : type === 'error'
        ? 'border-destructive-color/50 bg-destructive-color/10'
        : type === 'success'
          ? 'border-green-color/50 bg-green-color/10'
          : 'border-main-color/50 bg-main-color/10';
  return <aside className={cn('my-6 rounded-xl border px-5 py-1', tone)}>{children}</aside>;
}

const STATIC_MDX_COMPONENTS: InfiniteCanvasDocsMdxComponents = {
  Callout: InfiniteCanvasDocsCallout,
  blockquote: MdxBlockquote,
  code: MdxInlineCode,
  h1: MdxHeadingOne,
  h2: MdxHeadingTwo,
  h3: MdxHeadingThree,
  hr: MdxHorizontalRule,
  li: MdxListItem,
  ol: MdxOrderedList,
  p: MdxParagraph,
  pre: MdxPre,
  table: MdxTable,
  td: MdxTableCell,
  th: MdxTableHeader,
  thead: MdxTableHead,
  ul: MdxUnorderedList,
};

export function createInfiniteCanvasDocsMdxComponents({
  resolveHref = (href) => href,
}: CreateInfiniteCanvasDocsMdxComponentsOptions = {}): InfiniteCanvasDocsMdxComponents {
  function MdxAnchor({ children, href = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const isExternal = /^https?:\/\//.test(href);
    return (
      <a
        href={resolveHref(href)}
        className='font-medium text-main-color underline decoration-main-color/40 underline-offset-4 transition-opacity hover:opacity-75'
        rel={isExternal ? 'noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  return { ...STATIC_MDX_COMPONENTS, a: MdxAnchor };
}
