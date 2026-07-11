import { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

// `dark:` classNames rely on NativeWind's colorScheme.set(), which delegates to
// RN's Appearance.setColorScheme() — that API is a no-op in Expo Go (needs a
// custom native build), so it silently does nothing there. react-native-paper's
// theme isn't affected — PaperProvider is driven directly by our own theme store —
// so background color is read from `useTheme()` instead, which always works.
export function KeyboardAwareScreen({ children }: PropsWithChildren) {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center p-6" keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
