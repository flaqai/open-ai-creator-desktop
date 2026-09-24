'use client';

type CanvasExampleSectionProps = {
  title: string;
  description: string;
  videoSrc: string;
  posterSrc?: string;
};

export default function CanvasExampleSection({
  title,
  description,
  videoSrc,
  posterSrc,
}: CanvasExampleSectionProps) {
  return (
    <section
      aria-labelledby='canvas-example-title'
      className='container-centered container-py grid grid-cols-2 items-center gap-8 max-[920px]:grid-cols-1 max-[920px]:gap-6'
    >
      <header className='flex max-w-[52rem] flex-col gap-3'>
        <div className='flex items-center gap-3'>
          <span aria-hidden='true' className='size-10 flex-none text-white'>
            <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <g clipPath='url(#canvas-example-mark-clip)'>
                <path
                  d='M20.8423 33.204L4.17139 39.75V-0.25H37.503V39.75L20.8423 33.204ZM34.7602 2.61515H6.92438V35.6511L20.8423 30.1859L34.7602 35.6511V2.61515ZM20.8423 22.5183L14.6532 25.8729L15.8359 18.7355L10.8194 13.7495L17.7426 12.7299L20.8015 6.27562L23.8604 12.7299L30.7837 13.7495L25.7671 18.7763L26.9499 25.9137L20.8423 22.5183Z'
                  fill='currentColor'
                />
              </g>
              <defs>
                <clipPath id='canvas-example-mark-clip'>
                  <rect width='40' height='40' fill='white' />
                </clipPath>
              </defs>
            </svg>
          </span>
          <h2
            id='canvas-example-title'
            className='text-[32px] leading-[1.2] font-bold tracking-[-0.02em] text-pretty text-white max-[920px]:text-2xl'
          >
            {title}
          </h2>
        </div>
        <p className='text-base leading-6 text-pretty text-[oklch(78.26%_0_89.9)] max-[920px]:text-sm'>
          {description}
        </p>
      </header>

      <div className='min-w-0 rounded-lg border border-[oklch(32.82%_0.014_285.6)] bg-[oklch(20.2%_0.0079_285.7)] p-2.5 transition-[background-color,border-color] duration-200 hover:border-[oklch(33.4%_0.016_285.6)] hover:bg-[oklch(25.23%_0.015_291)] motion-reduce:transition-none'>
        <video
          aria-labelledby='canvas-example-title'
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          onContextMenu={(event) => event.preventDefault()}
          playsInline
          preload='metadata'
          className='aspect-video w-full rounded-md bg-[oklch(8.47%_0_89.9)] object-contain'
        />
      </div>
    </section>
  );
}
