import { useState } from 'react';

interface UseDisclosureResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  onOpenChange: (open: boolean) => void;
}

/** Open/close boolean state for dialogs, sheets, and popovers. */
export function useDisclosure(initialOpen = false): UseDisclosureResult {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    onOpenChange: setIsOpen,
  };
}
