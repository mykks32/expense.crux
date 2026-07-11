import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  show: (message: string) => void;
  hide: () => void;
}

/** Backs the app-wide toast (see `ToastHost`) — call `show()` from anywhere to surface a message. */
const useToastStore = create<ToastState>()((set) => ({
  visible: false,
  message: '',
  show: (message) => set({ visible: true, message }),
  hide: () => set({ visible: false }),
}));

export default useToastStore;
