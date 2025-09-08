import React from 'react';
import { ShieldCheck, Menu, Sun, Moon } from 'lucide-react';
import { Button } from './ui/Button';
import { useTheme } from '../contexts/ThemeProvider';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-card border-b border-border p-4 flex-shrink-0">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <ShieldCheck className="h-8 w-8 text-foreground mr-3" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Vegan Advocacy Trainer
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} variant="ghost" size="icon">
                <Sun className="h-6 w-6 rotate-0 scale-100 motion-safe:transition-all motion-safe:duration-300 dark:-rotate-90 dark:scale-0 text-foreground" />
                <Moon className="absolute h-6 w-6 rotate-90 scale-0 motion-safe:transition-all motion-safe:duration-300 dark:rotate-0 dark:scale-100 text-foreground" />
                <span className="sr-only">Toggle theme</span>
            </Button>
            <Button onClick={onMenuClick} variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 text-foreground"/>
            </Button>
        </div>
      </div>
    </header>
  );
};
