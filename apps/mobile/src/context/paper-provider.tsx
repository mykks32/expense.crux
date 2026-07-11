import { type PropsWithChildren } from 'react';
import { PaperProvider as RNPaperProvider } from 'react-native-paper';

import { paperThemes } from '@/constants/theme';
import useThemeStore from '@/features/theme/store';

export function PaperProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);
  return <RNPaperProvider theme={paperThemes[theme]}>{children}</RNPaperProvider>;
}
