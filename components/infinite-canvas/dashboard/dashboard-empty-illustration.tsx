export function DashboardEmptyIllustration() {
  return (
    <svg className='size-10 shrink-0' viewBox='0 0 40 40' fill='none' aria-hidden='true'>
      <rect x='1' y='5' width='33' height='34' rx='8' className='fill-background-color stroke-light-gray-2' />
      <rect x='6' y='10' width='23' height='24' rx='3' strokeDasharray='3 3' className='stroke-gray-color' />
      <circle cx='11' cy='17' r='2' className='fill-main-color' />
      <path d='M17 17h7M10 24h14M10 28h8' strokeLinecap='round' className='stroke-gray-color' />
      <circle cx='31' cy='9' r='8' className='fill-light-gray stroke-main-color' />
      <path d='M31 5v8M27 9h8' strokeWidth='1.5' strokeLinecap='round' className='stroke-main-color' />
    </svg>
  );
}
