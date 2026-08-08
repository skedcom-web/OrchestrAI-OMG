import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SEARCHABLE_MODULES } from '../../config/navigation';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

/** Enterprise quick-navigation (Ctrl/⌘ + K) across every authorised module. */
export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const authorised = SEARCHABLE_MODULES.filter(entry => hasPermission(entry.module.path));
    if (!q) return authorised.slice(0, 9);

    return authorised
      .map(entry => {
        const { module } = entry;
        const label = module.label.toLowerCase();
        let score = 0;
        if (label.startsWith(q)) score += 100;
        else if (label.includes(q)) score += 60;
        if (module.description.toLowerCase().includes(q)) score += 20;
        if ((module.keywords || []).some(k => k.includes(q))) score += 40;
        if (entry.domainLabel.toLowerCase().includes(q)) score += 15;
        return { entry, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(r => r.entry);
  }, [query, hasPermission]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      // Focus after the dialog paints.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  if (!open) return null;

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(c => (c + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => (c - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault();
      go(results[cursor].module.path);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4 animate-fade-in"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Governance module search"
        onClick={e => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="w-full max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-modal)] shadow-[var(--shadow-lg)] overflow-hidden animate-rise-in"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)]">
          <span className="text-[var(--text-muted)] text-sm" aria-hidden>
            ⌕
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Jump to a governance module…"
            className="flex-1 bg-transparent border-0 outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <kbd
            data-noglass
            className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] bg-[var(--bg-badge)]"
          >
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              No authorised module matches “{query}”.
            </p>
          )}

          {results.map((entry, i) => (
            <button
              key={entry.module.path}
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(entry.module.path)}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer ${
                i === cursor ? 'bg-[var(--accent-light)]' : 'hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <span className="w-7 h-7 grid place-items-center rounded-lg bg-[var(--bg-badge)] text-[13px] shrink-0" aria-hidden>
                {entry.module.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {entry.module.label}
                </span>
                <span className="block text-[11px] text-[var(--text-muted)] truncate">
                  {entry.module.description}
                </span>
              </span>
              <span className="hidden sm:inline shrink-0 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                {entry.domainLabel}
              </span>
            </button>
          ))}
        </div>

        <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
          <span className="hidden sm:inline">↑↓ navigate</span>
          <span className="hidden sm:inline">↵ open</span>
          <span className="sm:ml-auto font-semibold truncate">OrchestrAI OMG · Governance Operating System</span>
        </div>
      </div>
    </div>
  );
};
