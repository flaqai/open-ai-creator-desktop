import { create } from 'zustand';

type ProcessingTask = {
  traceId: string;
  type: 'image' | 'video';
  submitTime: number;
  imageType?: string;
  videoType?: string;
};

type GenerationPollingStore = {
  processingTasks: Map<string, ProcessingTask>;
  add: (traceId: string, type: 'image' | 'video', subType?: string) => void;
  remove: (traceId: string) => void;
  has: () => boolean;
  hasProcessing: (type: 'image' | 'video') => boolean;
  getAll: () => ProcessingTask[];
};

export default create<GenerationPollingStore>((set, get) => ({
  processingTasks: new Map(),

  add: (traceId, type, subType) => {
    set((state) => {
      const next = new Map(state.processingTasks);
      const task: ProcessingTask = {
        traceId,
        type,
        submitTime: Date.now(),
      };
      if (subType) {
        if (type === 'image') {
          task.imageType = subType;
        } else if (type === 'video') {
          task.videoType = subType;
        }
      }
      next.set(traceId, task);
      return { processingTasks: next };
    });
  },

  remove: (traceId) => {
    set((state) => {
      const next = new Map(state.processingTasks);
      next.delete(traceId);
      return { processingTasks: next };
    });
  },

  has: () => {
    return get().processingTasks.size > 0;
  },

  hasProcessing: (type) => {
    return Array.from(get().processingTasks.values()).some((task) => task.type === type);
  },

  getAll: () => {
    return Array.from(get().processingTasks.values());
  },
}));
