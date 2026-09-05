export default function BorderLightB(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      // width={197}
      // height={62}
      preserveAspectRatio='xMidYMid slice'
      viewBox='0 0 197 62'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g clipPath='url(#clip0_1354_38684)'>
        <g filter='url(#filter0_f_1354_38684)'>
          <ellipse cx={98.5} cy={83} rx={98.5} ry={40} fill='currentColor' />
        </g>
        <g filter='url(#filter1_b_1354_38684)'>
          <rect width={197} height={62} fill='black' fillOpacity={0.4} />
        </g>
      </g>
      <defs>
        <filter
          id='filter0_f_1354_38684'
          x={-40}
          y={3}
          width={277}
          height={160}
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity={0} result='BackgroundImageFix' />
          <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
          <feGaussianBlur stdDeviation={20} result='effect1_foregroundBlur_1354_38684' />
        </filter>
        <filter
          id='filter1_b_1354_38684'
          x={-12}
          y={-12}
          width={221}
          height={86}
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity={0} result='BackgroundImageFix' />
          <feGaussianBlur in='BackgroundImageFix' stdDeviation={6} />
          <feComposite in2='SourceAlpha' operator='in' result='effect1_backgroundBlur_1354_38684' />
          <feBlend mode='normal' in='SourceGraphic' in2='effect1_backgroundBlur_1354_38684' result='shape' />
        </filter>
        <clipPath id='clip0_1354_38684'>
          <rect width={197} height={62} fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
}
