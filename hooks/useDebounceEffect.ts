import { DependencyList, useEffect } from 'react';

const useDebounceEffect = (fn: () => void, waitTime: number, deps?: DependencyList) => {
  useEffect(() => {
    const t = setTimeout(() => {
      if (deps) {
        fn.apply(null, ...(deps as []));
      }
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  }, deps);
};

export default useDebounceEffect;
