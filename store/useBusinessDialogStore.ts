import { create } from 'zustand';

interface BusinessDialogStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const useBusinessDialogStore = create<BusinessDialogStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export default useBusinessDialogStore;
