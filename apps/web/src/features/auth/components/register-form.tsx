import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/api';
import useAuthStore from '../context';
import { registerSchema, type RegisterFormValues } from '../schema';

import * as authApi from '../api';

export function RegisterForm() {
  const onAuthSuccess = useAuthStore((state) => state.onAuthSuccess);

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: onAuthSuccess,
  });

  const form = useForm({
    defaultValues: { email: '', password: '', name: '' } satisfies RegisterFormValues,
    validators: { onChange: registerSchema },
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
      <h1 className="text-2xl font-semibold">Sign up</h1>

      <form.Field name="name">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Name (optional)</Label>
            <Input
              id={field.name}
              autoComplete="name"
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
              autoComplete="new-password"
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
            {mutation.isPending ? 'Signing up…' : 'Sign up'}
          </Button>
        )}
      </form.Subscribe>

      <Link to="/login" className="text-primary text-center text-sm underline-offset-4 hover:underline">
        Already have an account? Log in
      </Link>
    </form>
  );
}
