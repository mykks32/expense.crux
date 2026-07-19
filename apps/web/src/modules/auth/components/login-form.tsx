import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getApiErrorMessage } from '@/shared/lib/api';
import useAuthStore from '../context';
import { loginSchema, type LoginFormValues } from '../schema';

import * as authApi from '../api';

export function LoginForm() {
  const onAuthSuccess = useAuthStore((state) => state.onAuthSuccess);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: onAuthSuccess,
  });

  const form = useForm({
    defaultValues: { email: '', password: '' } satisfies LoginFormValues,
    validators: { onChange: loginSchema },
    onSubmit: ({ value }) => mutation.mutate(value),
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              type="email"
              autoComplete="email"
              aria-invalid={!field.state.meta.isValid}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]?.message}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Password</Label>
            <Input
              id={field.name}
              type="password"
              autoComplete="current-password"
              aria-invalid={!field.state.meta.isValid}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]?.message}</p>
            )}
          </div>
        )}
      </form.Field>

      {mutation.isError && <p className="text-destructive text-sm">{getApiErrorMessage(mutation.error)}</p>}

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? 'Logging in…' : 'Log in'}
          </Button>
        )}
      </form.Subscribe>

      <Link to="/register" className="text-primary text-center text-sm underline-offset-4 hover:underline">
        Don&apos;t have an account? Sign up
      </Link>
    </form>
  );
}
