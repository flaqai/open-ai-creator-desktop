// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
export function CanvasRefreshShell({ label }: { readonly label?: string }) {
  return (
    <main className='relative h-full min-h-0 overflow-hidden bg-canvas-background text-canvas-text'>
      <div
        className='absolute inset-0 opacity-60'
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--ui-canvas-border, var(--ui-light-gray-2)) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div
        className='absolute bottom-5 left-1/2 z-50 flex h-14 -translate-x-1/2 items-center gap-1 rounded-xl border border-canvas-border bg-canvas-panel px-2 shadow-lg backdrop-blur'
        aria-hidden='true'
      >
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className='size-8 rounded-md bg-current opacity-10' />
        ))}
      </div>

      <div
        className='absolute bottom-24 left-6 z-50 h-40 w-[240px] rounded-lg border border-canvas-border bg-canvas-panel shadow-2xl backdrop-blur-sm'
        aria-hidden='true'
      >
        <div className='absolute left-7 top-7 h-5 w-12 rounded-sm bg-current opacity-10' />
        <div className='absolute left-28 top-16 h-6 w-16 rounded-sm bg-current opacity-10' />
        <div className='absolute bottom-7 left-16 h-8 w-20 rounded-sm bg-current opacity-10' />
        <div className='absolute inset-5 rounded border border-current opacity-15' />
      </div>

      <div
        className='absolute bottom-5 left-5 z-50 flex h-14 w-[260px] items-center gap-2 rounded-xl border border-canvas-border bg-canvas-panel px-2 shadow-lg backdrop-blur'
        aria-hidden='true'
      >
        <div className='size-8 rounded-md bg-current opacity-10' />
        <div className='size-8 rounded-md bg-current opacity-10' />
        <div className='h-1 flex-1 rounded-full bg-current opacity-10' />
        <div className='h-4 w-10 rounded bg-current opacity-10' />
        <div className='size-8 rounded-md bg-current opacity-10' />
      </div>

      {label ? (
        <div className='absolute inset-0 z-[60] grid place-items-center'>
          <div
            role='status'
            aria-live='polite'
            className='flex items-center gap-3 rounded-xl border border-canvas-border bg-canvas-panel px-5 py-3 text-sm font-medium text-canvas-text shadow-lg'
          >
            <span
              className='size-5 animate-spin rounded-full border-2 border-canvas-accent border-r-transparent'
              aria-hidden='true'
            />
            <span>{label}</span>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export function CanvasLeaveLoadingOverlay({ label }: { readonly label: string }) {
  return (
    <div className='fixed inset-0 z-[2000] grid place-items-center bg-canvas-background/80 backdrop-blur-sm'>
      <div
        role='status'
        aria-live='polite'
        className='flex items-center gap-3 rounded-xl border border-canvas-border bg-canvas-panel px-5 py-3 text-sm font-medium text-canvas-text shadow-2xl'
      >
        <span
          className='size-5 animate-spin rounded-full border-2 border-canvas-accent border-r-transparent'
          aria-hidden='true'
        />
        <span>{label}</span>
      </div>
    </div>
  );
}
