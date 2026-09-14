export default function SubHeading({
  children,
  rightNode,
}: {
  children: React.ReactNode;
  rightNode?: React.ReactNode;
}) {
  return (
    <div className='text-foreground flex h-3.5 items-center gap-0.5 text-sm capitalize'>
      {children}
      {/* <ArrowDown /> */}
      {rightNode}
    </div>
  );
}
