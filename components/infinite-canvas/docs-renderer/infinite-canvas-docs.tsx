import { ArrowLeft, ArrowRight, BookOpen, FolderOpen } from 'lucide-react';

import type {
  InfiniteCanvasDocsNavigationItem,
  InfiniteCanvasDocsNavigationSection,
  InfiniteCanvasDocsProps,
} from './infinite-canvas-docs.types';

function DocsNavigation({
  activeHref,
  navigation,
}: {
  readonly activeHref: string;
  readonly navigation: readonly InfiniteCanvasDocsNavigationSection[];
}) {
  return (
    <nav aria-label='Documentation'>
      <ul className='space-y-6'>
        {navigation.map((section) => (
          <li key={section.title}>
            <p className='mb-2 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-canvas-muted'>
              {section.title}
            </p>
            <ul className='space-y-0.5'>
              {section.items.map((item) => {
                const isActive = item.href === activeHref;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={
                        isActive
                          ? 'block rounded-lg bg-main-color/12 px-3 py-2 text-sm font-medium text-main-color'
                          : 'block rounded-lg px-3 py-2 text-sm text-canvas-muted transition-colors hover:bg-canvas-surface hover:text-canvas-text'
                      }
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AdjacentDocument({
  direction,
  item,
  isPrevious,
}: {
  readonly direction: string;
  readonly item: InfiniteCanvasDocsNavigationItem;
  readonly isPrevious: boolean;
}) {
  return (
    <a
      href={item.href}
      className='group flex min-h-24 flex-1 flex-col justify-center rounded-xl border border-canvas-border bg-canvas-panel p-4 transition-colors hover:border-main-color/60 hover:bg-canvas-surface'
    >
      <span className='text-xs text-canvas-muted'>{direction}</span>
      <span className='mt-2 flex items-center gap-2 font-medium text-canvas-text group-hover:text-main-color'>
        {isPrevious ? <ArrowLeft className='size-4' aria-hidden='true' /> : null}
        {item.title}
        {isPrevious ? null : <ArrowRight className='size-4' aria-hidden='true' />}
      </span>
    </a>
  );
}

export function InfiniteCanvasDocs({
  activeHref,
  backToCanvasHref,
  children,
  dashboardHref,
  description,
  labels,
  navigation,
  next,
  previous,
  tableOfContents,
  title,
}: InfiniteCanvasDocsProps) {
  return (
    <main className='min-h-screen bg-canvas-background text-canvas-text'>
      <div className='mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 lg:px-8 xl:grid-cols-[260px_minmax(0,760px)_220px]'>
        <aside className='hidden lg:block'>
          <div className='sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-3'>
            <a href={backToCanvasHref} className='mb-7 flex items-center gap-2 font-semibold text-canvas-text'>
              <BookOpen className='size-5 text-main-color' aria-hidden='true' />
              Infinite Canvas
            </a>
            <DocsNavigation activeHref={activeHref} navigation={navigation} />
          </div>
        </aside>

        <div className='min-w-0'>
          <details className='mb-6 rounded-xl border border-canvas-border bg-canvas-panel p-4 lg:hidden'>
            <summary className='cursor-pointer font-medium text-canvas-text'>{labels.browse}</summary>
            <div className='mt-5 border-t border-canvas-border pt-5'>
              <DocsNavigation activeHref={activeHref} navigation={navigation} />
            </div>
          </details>

          <header className='border-b border-canvas-border pb-8'>
            <div className='flex flex-wrap items-center gap-3'>
              <a
                href={backToCanvasHref}
                className='inline-flex h-9 items-center gap-2 rounded-full border border-canvas-border bg-canvas-panel px-4 text-sm text-canvas-muted transition-colors hover:border-main-color/60 hover:text-main-color'
              >
                <ArrowLeft className='size-4' aria-hidden='true' />
                {labels.backToCanvas}
              </a>
              <a
                href={dashboardHref}
                className='inline-flex h-9 items-center gap-2 rounded-full bg-main-color px-4 text-sm font-medium text-main-color-foreground transition-opacity hover:opacity-90'
              >
                <FolderOpen className='size-4' aria-hidden='true' />
                {labels.openDashboard}
              </a>
            </div>
            <h1 className='mt-7 text-balance text-4xl font-semibold tracking-tight sm:text-5xl'>{title}</h1>
            <p className='mt-4 max-w-2xl text-pretty text-base leading-7 text-canvas-muted sm:text-lg'>{description}</p>
          </header>

          <article className='min-w-0 py-9'>{children}</article>

          {previous || next ? (
            <nav className='flex flex-col gap-3 border-t border-canvas-border py-8 sm:flex-row' aria-label='Pagination'>
              {previous ? (
                <AdjacentDocument direction={labels.previous} isPrevious item={previous} />
              ) : (
                <span className='flex-1' />
              )}
              {next ? (
                <AdjacentDocument direction={labels.next} isPrevious={false} item={next} />
              ) : (
                <span className='flex-1' />
              )}
            </nav>
          ) : null}
        </div>

        <aside className='hidden xl:block'>
          {tableOfContents.length > 0 ? (
            <nav className='sticky top-6 border-l border-canvas-border pl-5' aria-label={labels.onThisPage}>
              <h2 className='text-sm font-semibold text-canvas-text'>{labels.onThisPage}</h2>
              <ul className='mt-4 space-y-2.5'>
                {tableOfContents.map((item) => (
                  <li key={item.href} className={item.level === 3 ? 'pl-3' : undefined}>
                    <a
                      href={item.href}
                      className='text-sm leading-5 text-canvas-muted transition-colors hover:text-main-color'
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
