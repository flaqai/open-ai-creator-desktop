import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORE_PREFIX } from '@/lib/constants';

type State = {
  open: boolean;
  locale: string | null;
};

type Actions = {
  setOpen: (open: boolean) => void;
  setLocale: (locale: string) => void;
};

export const USER_INFO_KEY = `${STORE_PREFIX}-cookie-dialog`;

const useCookieDialogStore = create(
  persist<State & Actions>(
    (set, get) => ({
      open: get()?.open ?? true,
      locale: get()?.locale ?? null,
      setOpen: (open) => set({ open }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: USER_INFO_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useCookieDialogStore;
