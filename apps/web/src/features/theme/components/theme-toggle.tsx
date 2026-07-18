import { MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import useThemeStore from '../context';

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
