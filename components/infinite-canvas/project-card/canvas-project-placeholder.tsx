export default function CanvasProjectPlaceholder({ fullHeight = false }: { readonly fullHeight?: boolean }) {
  return (
    <div aria-hidden='true' className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${fullHeight ? 'h-full' : 'h-[124px]'}`}>
      <svg viewBox='0 0 236 124' fill='none' className='relative h-full w-full'>
        <g className='text-color-main' stroke='currentColor' strokeOpacity='.35' strokeWidth='1.25'>
          <path d='M68 64C84 64 83 54 99 54M151 54C168 54 166 39 183 39M151 54C168 54 166 87 183 87' />
        </g>
        <g className='fill-color-c1 stroke-color-b1'>
          <rect x='20' y='43' width='48' height='42' rx='8' />
          <rect x='99' y='25' width='52' height='58' rx='10' />
          <rect x='183' y='24' width='33' height='30' rx='7' />
          <rect x='183' y='72' width='33' height='30' rx='7' />
        </g>
        <g className='text-color-t2' stroke='currentColor' strokeOpacity='.45' strokeWidth='2' strokeLinecap='round'>
          <path d='M32 56H53M32 63H56M32 70H46' />
          <path d='M193 34L204 39L193 44Z' />
          <path d='M192 91L198 83L202 87L207 81' />
        </g>
        <rect x='107' y='33' width='36' height='34' rx='7' className='fill-color-main/10' />
        <g className='text-color-main' stroke='currentColor' strokeOpacity='.85' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
          <rect x='114' y='40' width='22' height='20' rx='3' />
          <circle cx='121' cy='46' r='2' />
          <path d='M115 57L122 50L127 54L132 48L136 52' />
        </g>
        <path d='M114 75H136' className='stroke-color-b1' strokeWidth='2' strokeLinecap='round' />
        <g className='fill-color-c1 stroke-color-main' strokeOpacity='.5'>
          <circle cx='68' cy='64' r='2' /><circle cx='99' cy='54' r='2' />
          <circle cx='151' cy='54' r='2' /><circle cx='183' cy='39' r='2' /><circle cx='183' cy='87' r='2' />
        </g>
      </svg>
    </div>
  );
}
