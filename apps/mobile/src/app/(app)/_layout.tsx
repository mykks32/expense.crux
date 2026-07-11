import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="expenses/new" options={{ title: 'New Expense', presentation: 'modal' }} />
      <Stack.Screen name="expenses/[id]" options={{ title: 'Edit Expense' }} />
    </Stack>
  );
}
