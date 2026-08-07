import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { ThemeMode } from '../../types';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Light', icon: '☀️' },
    { mode: 'dark', label: 'Dark', icon: '🌙' },
    { mode: 'glass', label: 'Glass', icon: '💎' },
  ];

  return (
    <div className="flex items-center p-1 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-xs font-medium">
      {options.map(opt => {
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            onClick={() => setTheme(opt.mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[var(--accent-primary)] text-white shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
