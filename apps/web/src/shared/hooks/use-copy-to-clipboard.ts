import { useCallback, useState } from 'react';

interface UseCopyToClipboardResult {
  copiedText: string | null;
  copy: (text: string) => Promise<boolean>;
}

/** Copies text via the Clipboard API; `copiedText` reflects the last successful copy (until the next call). */
export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch {
      setCopiedText(null);
      return false;
    }
  }, []);

  return { copiedText, copy };
}
