import * as React from 'react';

interface SVGComponentProps {
  width?: number;
  height?: number;
  viewBox?: string;
  fill?: string;
  fillOpacity?: number;
  className?: string;
}

export default function ArrowDown({
  width = 21,
  height = 21,
  viewBox = '0 0 21 21',
  fill = 'none',
  fillOpacity = 0.6,
  className,
  ...props
}: SVGComponentProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      className={className}
      {...props}
    >
      <path
        d='M12.5978 12.7836C12.7184 12.6555 12.9139 12.6555 13.0345 12.7836C13.1552 12.9117 13.1552 13.1195 13.0345 13.2476L9.94631 16.5289C9.82571 16.657 9.63017 16.657 9.50957 16.5289L6.42133 13.2476C6.30073 13.1195 6.30073 12.9117 6.42133 12.7836C6.54194 12.6555 6.73747 12.6555 6.85808 12.7836L9.41912 15.5047V11.7031C9.41912 11.094 9.19136 10.5097 8.78595 10.079C8.38054 9.64824 7.83069 9.40625 7.25735 9.40625H2.93382C2.76327 9.40625 2.625 9.25934 2.625 9.07812C2.625 8.89691 2.76327 8.75 2.93382 8.75H7.25735C7.9945 8.75 8.70145 9.06113 9.22269 9.61495C9.74393 10.1688 10.0368 10.9199 10.0368 11.7031V15.5047L12.5978 12.7836Z'
        fill='currentColor'
        fillOpacity={fillOpacity}
      />
    </svg>
  );
}
