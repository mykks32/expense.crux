import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/api';
import useAuthStore from '@/features/auth/store';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schema';

import * as authApi from '../api';

export function RegisterForm() {
  const onAuthSuccess = useAuthStore((state) => state.onAuthSuccess);

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: onAuthSuccess,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const onSubmit = (values: RegisterFormValues) => mutation.mutate(values);

  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <h1 className="text-2xl font-semibold">Sign up</h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name (optional)</Label>
        <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

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
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
      </div>

      {mutation.isError && <p className="text-destructive text-sm">{getApiErrorMessage(mutation.error)}</p>}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Signing up…' : 'Sign up'}
      </Button>

      <Link to="/login" className="text-primary text-center text-sm underline-offset-4 hover:underline">
        Already have an account? Log in
      </Link>
    </form>
  );
}
