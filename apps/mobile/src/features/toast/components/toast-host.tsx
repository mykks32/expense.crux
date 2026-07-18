import { Portal, Snackbar } from 'react-native-paper';

import useToastStore from '../store';

const DURATION_MS = 3000;

/** Mounted once at the app root — renders whatever `useToastStore` is currently showing. */
export function ToastHost() {
  const visible = useToastStore((state) => state.visible);
  const message = useToastStore((state) => state.message);
  const hide = useToastStore((state) => state.hide);

  return (
    <Portal>
      <Snackbar visible={visible} onDismiss={hide} duration={DURATION_MS}>
        {message}
      </Snackbar>
    </Portal>
  );
}
