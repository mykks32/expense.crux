import { useCallback, useRef, useState } from 'react';

interface ConfirmOptions {
  title?: string;
  description?: string;
}

interface UseConfirmDialogResult {
  isOpen: boolean;
  options: ConfirmOptions;
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

/** Imperative "are you sure?" flow: `await confirm()` resolves once the user answers. Pair with `<ConfirmDialog>`. */
export function useConfirmDialog(): UseConfirmDialogResult {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((nextOptions: ConfirmOptions = {}) => {
    setOptions(nextOptions);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    setIsOpen(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm: () => settle(true),
    handleCancel: () => settle(false),
  };
}
