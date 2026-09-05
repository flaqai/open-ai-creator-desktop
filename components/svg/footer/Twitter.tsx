/* eslint-disable react/jsx-props-no-spreading */
export default function Twitter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={32} height={32} viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect x={0.5} y={0.5} width={31} height={31} rx={15.5} fill='black' />
      <rect x={0.5} y={0.5} width={31} height={31} rx={15.5} stroke='white' />
      <path
        d='M8.03902 9L14.2171 17.2744L8 24H9.4L14.8415 18.1099L19.239 24H24L17.4756 15.2614L23.261 9H21.8634L16.8512 14.4235L12.8024 9H8.03902ZM10.0976 10.0309H12.2854L21.9439 22.9666H19.7561L10.0976 10.0309Z'
        fill='white'
      />
    </svg>
  );
}
