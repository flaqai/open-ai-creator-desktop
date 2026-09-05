import { create } from 'zustand';

export type DialogType = 'default' | 'credits';

type State = {
  open: boolean;
  dialogType: DialogType;
  imageUrl?: string;
  imageName?: string;
};

type Actions = {
  setOpen: (open: boolean, dialogType?: DialogType) => void;
  closeDialog: () => void;
  setCloseAndResetImage: () => void;
  close: () => void;
};

const usePricingDialogStore = create<State & Actions>((set) => ({
  open: false,
  dialogType: 'default',
  imageUrl: undefined,
  imageName: undefined,

  setOpen: (isOpen, dialogType = 'default') => set({ open: isOpen, dialogType }),

  closeDialog: () =>
    set({
      open: false,
      dialogType: 'default',
    }),

  setCloseAndResetImage: () =>
    set({
      open: false,
      dialogType: 'default',
      imageUrl: undefined,
      imageName: undefined,
    }),

  close: () =>
    set({
      open: false,
      dialogType: 'default',
    }),
}));

export default usePricingDialogStore;
