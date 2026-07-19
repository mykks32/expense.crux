import { createFileRoute } from '@tanstack/react-router';

import { RegisterForm } from '@/modules/auth';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterForm,
});
