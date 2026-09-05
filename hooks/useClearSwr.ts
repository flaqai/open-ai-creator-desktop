import { useSWRConfig } from 'swr';

const useClearSwr = () => {
  const { mutate } = useSWRConfig();

  return () => mutate(() => true, undefined, { revalidate: false });
};

export default useClearSwr;
