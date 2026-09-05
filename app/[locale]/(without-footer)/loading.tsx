import Loading from '@/components/Loading';

export default function HomeLoading() {
  return (
    <div className='bg-opacity-90 -z-10 flex min-h-screen min-w-full items-center justify-center'>
      <Loading className='h-12 w-12' />
    </div>
  );
}
