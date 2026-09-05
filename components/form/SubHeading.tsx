export default function SubHeading({
  children,
  rightNode,
}: {
  children: React.ReactNode;
  rightNode?: React.ReactNode;
}) {
  return (
    <div className='flex h-3.5 items-center gap-0.5 text-sm text-white capitalize'>
      {children}
      {/* <ArrowDown /> */}
      {rightNode}
    </div>
  );
}
