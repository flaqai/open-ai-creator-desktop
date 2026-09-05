export default function Heading({
  title,
  description,
  showComingSoon = false,
  align = 'center',
}: {
  title: string;
  description: string;
  showComingSoon?: boolean;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={`mx-auto flex max-w-5xl flex-col gap-2 ${align === 'left' ? 'items-start text-left' : 'items-center text-center'}`}
    >
      <div className='flex items-center gap-3'>
        <h1 className='text-color-main text-4xl font-semibold text-balance lg:text-5xl'>{title}</h1>
        {showComingSoon && (
          <span className='rounded-full bg-gradient-to-r from-[#6e51ff] to-[#e75df1] px-4 py-1 text-sm font-medium text-white'>
            Coming Soon
          </span>
        )}
      </div>
      <p className='max-w-5xl text-sm text-balance lg:text-lg'>{description}</p>
    </div>
  );
}
