import { useState } from 'react';

const useUpdateUserInfo = (shouldUpdateUserInfoOnMount = true) => {
  void shouldUpdateUserInfoOnMount;
  const [loading, setLoading] = useState(false);

  const updateUserInfo = async () => {
    setLoading(true);
    setLoading(false);
    return null;
  };

  const updateUserInfoWithDelay = (delay = 2000) => {
    setTimeout(async () => {
      await updateUserInfo();
    }, delay);
  };

  return { updateUserInfo, updateUserInfoWithDelay, loading };
};

export default useUpdateUserInfo;
