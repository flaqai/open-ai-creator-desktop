export default function SectionHeader({ title, content }: { title: string; content: string }) {
  return (
    <div className='flex flex-col items-center gap-2 text-center text-balance'>
      <h2 className='text-[32px] font-semibold'>{title}</h2>
      <p>{content}</p>
    </div>
  );
}
