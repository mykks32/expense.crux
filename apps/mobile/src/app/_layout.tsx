import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import '../global.css';

import { navigationThemes } from '@/features/theme/theme';
import { PaperProvider } from '@/features/theme/components/paper-provider';
import { ThemeProvider } from '@/features/theme/components/theme-provider';
import { QueryProvider } from '@/lib/query-provider';
import useAuthInitialization from '@/features/auth/hooks/use-auth-initialization';
import useAuthStore from '@/features/auth/store';
import useThemeStore from '@/features/theme/store';
import { ToastHost } from '@/features/toast/components/toast-host';

SplashScreen.preventAutoHideAsync().catch((err) => {
  console.error('Failed to prevent splash screen auto-hide:', err);
});

export default function RootLayout() {
  useAuthInitialization();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync().catch((err) => {
        console.error('Failed to hide splash screen:', err);
      });
    }
  }, [initialized]);

  if (!initialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <PaperProvider>
          <QueryProvider>
            <NavigationThemeProvider value={navigationThemes[theme]}>
              <Stack>
                <Stack.Protected guard={!!user}>
                  <Stack.Screen name="(app)" options={{ headerShown: false }} />
                </Stack.Protected>
                <Stack.Protected guard={!user}>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                </Stack.Protected>
              </Stack>
              <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            </NavigationThemeProvider>
            <ToastHost />
          </QueryProvider>
        </PaperProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
