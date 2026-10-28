import { TechLogo, IconSparkle } from './icons';

const FALLBACK = ['React.js', 'Django', 'Python', 'PostgreSQL', 'Tailwind CSS', 'Neo4j', 'Docker', 'Automation'];

// Endless scrolling strip of the technologies from the Skills table.
export default function Marquee({ skills }) {
  const names = [];
  (skills ?? []).forEach((g) => (g.skills ?? []).forEach((s) => {
    if (s?.name && !names.includes(s.name)) names.push(s.name);
  }));
  const items = (names.length ? names : FALLBACK).slice(0, 16);

  const group = (hidden) => (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {items.map((name) => (
        <span key={name} style={{ display: 'contents' }}>
          <span className="marquee-item"><TechLogo name={name} />{name}</span>
          <span className="marquee-sep"><IconSparkle size={18} /></span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee-wrap">
      <div className="marquee">
        <div className="marquee-track">
          {group(false)}
          {group(true)}
        </div>
      </div>
    </div>
  );
}
