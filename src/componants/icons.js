// Small inline SVG icon set — no external icon package needed.
import { useId } from 'react';

const base = (size) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': true,
});

export const IconArrow = ({ size = 16 }) => (
  <svg {...base(size)} className="flip-rtl"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconDownload = ({ size = 16 }) => (
  <svg {...base(size)}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
export const IconMail = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);
export const IconPhone = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>
);
export const IconPin = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const IconExternal = ({ size = 15 }) => (
  <svg {...base(size)}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" /></svg>
);
export const IconClose = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconChevron = ({ size = 18, dir = 'right' }) => (
  <svg {...base(size)} style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}><path d="M9 6l6 6-6 6" /></svg>
);
export const IconPlay = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);
export const IconMenu = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconGitHub = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.77c-2.78.61-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
  </svg>
);
export const IconLinkedIn = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

// Star — filled amount 0..1 lets us draw half stars for averages.
export const Star = ({ size = 16, fill = 1 }) => {
  const gid = `sg${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gid}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gid})`} d="M12 2.8l2.8 5.7 6.3.9-4.55 4.43 1.07 6.27L12 17.13 6.38 20.1l1.07-6.27L2.9 9.4l6.3-.9L12 2.8z" />
    </svg>
  );
};

export function Stars({ value = 0, size = 15, label }) {
  return (
    <span className="stars" role="img" aria-label={label ?? `${value.toFixed(1)} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fill={Math.max(0, Math.min(1, value - i))} />
      ))}
    </span>
  );
}

// ── Extra icons ───────────────────────────────────────────────────────────
const I = (paths) => ({ size = 20 }) => <svg {...base(size)}>{paths}</svg>;
export const IconCode      = I(<><path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" /></>);
export const IconServer    = I(<><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></>);
export const IconDatabase  = I(<><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>);
export const IconBolt      = I(<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />);
export const IconTool      = I(<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z" />);
export const IconLayers    = I(<><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>);
export const IconSparkle   = I(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />);
export const IconBriefcase = I(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" /></>);
export const IconCap       = I(<><path d="M2 9l10-5 10 5-10 5L2 9z" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6" /></>);
export const IconHeart     = I(<path d="M12 20s-7-4.4-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.6-9 9-9 9z" />);
export const IconGlobe     = I(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>);
export const IconCalendar  = I(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>);
export const IconFolder    = I(<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />);
export const IconUser      = I(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>);
export const IconEye       = I(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>);
export const IconSend      = I(<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />);
export const IconChat      = I(<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />);
export const IconTrophy    = I(<><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" /><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3" /></>);
export const IconRocket    = I(<><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><path d="M9 15l-3-3c1-4 4.5-9 13-9 0 8.5-5 12-9 13z" /><circle cx="14.5" cy="9.5" r="1.5" /></>);
export const IconArrowUp   = I(<path d="M12 19V5M5 12l7-7 7 7" />);
export const IconCheck     = I(<path d="M5 12l5 5L20 7" />);

// ── Tech logos (Devicon CDN). Unknown names simply render without a logo. ──
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons';
const TECH_MAP = [
  [/react/i, 'react/react-original'], [/next/i, 'nextjs/nextjs-original'], [/vue/i, 'vuejs/vuejs-original'],
  [/django/i, 'django/django-plain'], [/flask/i, 'flask/flask-original'], [/fastapi/i, 'fastapi/fastapi-original'],
  [/python/i, 'python/python-original'], [/typescript|^ts$/i, 'typescript/typescript-original'],
  [/javascript|^js\b|es6/i, 'javascript/javascript-original'], [/node/i, 'nodejs/nodejs-original'],
  [/tailwind/i, 'tailwindcss/tailwindcss-original'], [/html/i, 'html5/html5-original'], [/css/i, 'css3/css3-original'],
  [/postgres/i, 'postgresql/postgresql-original'], [/mysql/i, 'mysql/mysql-original'], [/mongo/i, 'mongodb/mongodb-original'],
  [/redis/i, 'redis/redis-original'], [/neo4j/i, 'neo4j/neo4j-original'], [/sqlite/i, 'sqlite/sqlite-original'],
  [/github/i, 'github/github-original'], [/\bgit\b/i, 'git/git-original'], [/docker/i, 'docker/docker-original'],
  [/vs ?code/i, 'vscode/vscode-original'], [/postman/i, 'postman/postman-original'], [/vercel/i, 'vercel/vercel-original'],
  [/linux/i, 'linux/linux-original'], [/figma/i, 'figma/figma-original'],
  [/selenium/i, 'selenium/selenium-original'], [/pandas/i, 'pandas/pandas-original'], [/supabase/i, 'supabase/supabase-original'],
  [/firebase/i, 'firebase/firebase-original'], [/php/i, 'php/php-original'], [/laravel/i, 'laravel/laravel-original'],
  [/java\b/i, 'java/java-original'], [/c\+\+/i, 'cplusplus/cplusplus-original'], [/openai/i, null],
];
export function techLogo(name = '') {
  const hit = TECH_MAP.find(([re]) => re.test(name));
  return hit && hit[1] ? `${DEVICON}/${hit[1]}.svg` : null;
}
export function TechLogo({ name }) {
  const src = techLogo(name);
  if (!src) return null;
  return <img src={src} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
}
