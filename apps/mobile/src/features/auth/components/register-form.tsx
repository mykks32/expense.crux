import { useState } from 'react';
import { Link } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';

import { getApiErrorMessage } from '@/lib/api';
import useAuthStore from '@/features/auth/store';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schema';

import * as authApi from '../api';

export function RegisterForm() {
  const onAuthSuccess = useAuthStore((state) => state.onAuthSuccess);
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: onAuthSuccess,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const onSubmit = (values: RegisterFormValues) => mutation.mutate(values);

  return (
    <View className="gap-1">
      <Text variant="headlineMedium" className="mb-4">
        Sign up
      </Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Name (optional)"
            autoComplete="name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.name}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name?.message}
      </HelperText>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.email}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.email}>
        {errors.email?.message}
      </HelperText>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Password"
            secureTextEntry={!showPassword}
            autoComplete="password-new"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.password}
            right={
              <TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword((v) => !v)} />
            }
          />
        )}
      />
      <HelperText type="error" visible={!!errors.password}>
        {errors.password?.message}
      </HelperText>

      <HelperText type="error" visible={mutation.isError}>
        {getApiErrorMessage(mutation.error)}
      </HelperText>

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={mutation.isPending} className="mt-2">
        Sign up
      </Button>

      <Link href="/login" className="mt-4 text-center" style={{ color: theme.colors.primary }}>
        Already have an account? Log in
      </Link>
    </View>
  );
}
