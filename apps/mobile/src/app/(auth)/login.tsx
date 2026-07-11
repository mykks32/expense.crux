import { View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { KeyboardAwareScreen } from '@/components/keyboard-aware-screen';
import { LoginForm } from '@/features/auth/components/login-form';
import useThemeStore from '@/features/theme/store';

export default function LoginScreen() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <KeyboardAwareScreen>
      <View className="flex-row justify-end">
        <IconButton icon={theme === 'light' ? 'weather-night' : 'weather-sunny'} onPress={toggleTheme} />
      </View>
      <LoginForm />
    </KeyboardAwareScreen>
  );
}
