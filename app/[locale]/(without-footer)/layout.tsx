export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className='mx-auto flex w-full flex-1 flex-col'>{children}</main>
    </>
  );
}
