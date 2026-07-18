import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/api';
import useAuthStore from '@/features/auth/store';
import { loginSchema, type LoginFormValues } from '@/features/auth/schema';

import * as authApi from '../api';

export function LoginForm() {
  const onAuthSuccess = useAuthStore((state) => state.onAuthSuccess);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: onAuthSuccess,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => mutation.mutate(values);

  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <h1 className="text-2xl font-semibold">Log in</h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
      </div>

      {mutation.isError && <p className="text-destructive text-sm">{getApiErrorMessage(mutation.error)}</p>}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Logging in…' : 'Log in'}
      </Button>

      <Link to="/register" className="text-primary text-center text-sm underline-offset-4 hover:underline">
        Don&apos;t have an account? Sign up
      </Link>
    </form>
  );
}
