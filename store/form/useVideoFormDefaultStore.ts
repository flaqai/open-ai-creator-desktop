import { create } from 'zustand';

type State = {
  prompt: string;
};

type Actions = {
  setPrompt: (prompt: string) => void;
  resetDefault: () => void;
};

const DEFAULT_DATA: State = {
  prompt: '',
};

const useVideoFormDefaultStore = create<State & Actions>((set) => ({
  ...DEFAULT_DATA,
  setPrompt: (prompt) => set({ prompt }),
  resetDefault: () => set(DEFAULT_DATA),
}));

export default useVideoFormDefaultStore;
