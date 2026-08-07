import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const OrchestraiLogo: React.FC<LogoProps> = ({ size = 'md', showTagline = true }) => {
  const dimensions = {
    sm: { icon: 28, text: 'text-lg', tagline: 'text-[9px]' },
    md: { icon: 36, text: 'text-xl', tagline: 'text-[10px]' },
    lg: { icon: 48, text: 'text-3xl', tagline: 'text-xs' },
  }[size];

  return (
    <div className="flex items-center gap-3 select-none">
      {/* SVG Icon matching OrchestrAI orbital nodes design */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="omg-grad-outer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="omg-grad-inner" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Outer Orbital Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#omg-grad-outer)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="210 50"
          />

          {/* Inner Orbital Ring */}
          <circle
            cx="50"
            cy="50"
            r="32"
            stroke="url(#omg-grad-inner)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="140 40"
          />

          {/* Core Network Node Diagram */}
          <line x1="38" y1="38" x2="62" y2="38" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
          <line x1="38" y1="38" x2="50" y2="64" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
          <line x1="62" y1="38" x2="50" y2="64" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
          <line x1="50" y1="38" x2="50" y2="64" stroke="currentColor" strokeWidth="2" opacity="0.4" />

          {/* Network Nodes */}
          <circle cx="38" cy="38" r="5" fill="#06B6D4" />
          <circle cx="62" cy="38" r="5" fill="#8B5CF6" />
          <circle cx="50" cy="64" r="5.5" fill="#EC4899" />
          <circle cx="50" cy="38" r="3.5" fill="#3B82F6" />

          {/* Sparkle Star */}
          <path
            d="M68 26 L70 30 L74 32 L70 34 L68 38 L66 34 L62 32 L66 30 Z"
            fill="#F97316"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight ${dimensions.text}`} style={{ color: 'var(--text-primary)' }}>
            Orchestr<span className="bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500 bg-clip-text text-transparent">AI</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/30 tracking-wider">
            OMG
          </span>
        </div>
        {showTagline && (
          <span className={`font-semibold tracking-widest uppercase opacity-75 ${dimensions.tagline}`} style={{ color: 'var(--text-muted)' }}>
            Model Governance Command Center
          </span>
        )}
      </div>
    </div>
  );
};
