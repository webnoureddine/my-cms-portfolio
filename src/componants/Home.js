import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import profilePic from '../me.jpg';
import { C } from '../theme';
import { t } from '../i18n';
import workflowDiagram from '../lifesoft.png';
import { slideInRight } from '../animations';

// Self-contained inline SVG icons — no external package required (no react-icons install needed)
const IconReact = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="2.2" fill="#61DAFB" />
    <g stroke="#61DAFB" strokeWidth="1.4">
      <ellipse cx="12" cy="12" rx="10" ry="4.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
    </g>
  </svg>
);
const IconDjango = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 3h3.4v13.4c0 3-1.6 4.6-4.5 4.6-1 0-2-.15-2.7-.4l.5-2.75c.45.15.95.25 1.5.25 1.15 0 1.8-.6 1.8-2.2V3z" fill="#0C4B33" stroke="#44B78B" strokeWidth="0.4"/>
    <path d="M15.3 7.2c1.2 0 2.1.25 2.85.7v9c-.7.35-1.85.6-3.05.6-2.9 0-4.6-1.7-4.6-4.6 0-3 1.85-5.1 4.8-5.1zm-.05 2.7c-1.25 0-1.95.95-1.95 2.4 0 1.4.7 2.35 1.95 2.35.45 0 .8-.05 1-.15v-4.4c-.2-.1-.55-.2-1-.2z" fill="#0C4B33" stroke="#44B78B" strokeWidth="0.4"/>
  </svg>
);
const IconPython = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2c-4.4 0-4.15 1.9-4.15 1.9v2h4.3v.6H6.1S3 6.15 3 10.7c0 4.55 2.7 4.4 2.7 4.4h1.6v-2.1s-.1-2.7 2.65-2.7h4.15s2.6.05 2.6-2.5V4.6S17.1 2 12 2z" fill="#3776AB"/>
    <path d="M12 22c4.4 0 4.15-1.9 4.15-1.9v-2h-4.3v-.6h6.05S21 17.85 21 13.3c0-4.55-2.7-4.4-2.7-4.4h-1.6v2.1s.1 2.7-2.65 2.7H9.9s-2.6-.05-2.6 2.5v3.2S6.9 22 12 22z" fill="#FFD43B"/>
    <circle cx="9.3" cy="4.6" r="0.75" fill="#fff"/>
    <circle cx="14.7" cy="19.4" r="0.75" fill="#fff"/>
  </svg>
);
const IconPostgres = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17.3 3.2c-2.7-.35-4.9.55-6.2 1.7-1.05-.2-3.35-.4-5 .95C4.3 7.3 3.9 9.7 4 11.3c-.9 1.15-1.35 2.75-.85 4.3.35 1.1 1.15 1.9 2 2.35-.1.5-.05 1.15.35 1.7.65.9 1.95 1.05 3.15.35.5.35 1.4.7 2.5.55 0 0 .05.85.75 1.2.9.45 2.35-.05 3.25-1.6 1.55-.3 2.7-1.15 3.35-2.4.5-.95.6-2.1.3-3.05.6-.55 1.05-1.3 1.15-2.15.15-1.15-.35-2.15-1.15-2.75.35-1.2.35-2.6-.2-3.85-.7-1.65-2.2-2.55-3.3-2.75z" stroke="#336791" strokeWidth="1.3"/>
    <path d="M12.5 9.2c1.5-.3 2.6.1 2.9 1 .3.9-.35 1.95-1.85 2.3-1.15.25-1.55 1-1.4 1.85.15.9 1 1.35 2.1 1.15" stroke="#336791" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);
const IconNeo4j = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="7" r="3" fill="#4DBCC5" />
    <circle cx="18" cy="7" r="3" fill="#4DBCC5" />
    <circle cx="12" cy="18" r="3" fill="#4DBCC5" />
    <path d="M8.5 8.5L15.5 8.5M8 9.5L11 16M16 9.5L13 16" stroke="#4DBCC5" strokeWidth="1.3" />
  </svg>
);
const IconAutomation = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#FF6B6B" />
  </svg>
);

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

// Tech stack with colors + icons
const techStackData = [
  { label: 'React.js', color: '#61DAFB', bg: 'rgba(97, 218, 251, 0.12)', Icon: IconReact },
  { label: 'Django', color: '#e7f0ec', bg: 'rgba(68, 183, 139, 0.12)', Icon: IconDjango },
  { label: 'Python', color: '#FFD43B', bg: 'rgba(55, 118, 171, 0.14)', Icon: IconPython },
  { label: 'PostgreSQL', color: '#6BA3D6', bg: 'rgba(51, 103, 145, 0.14)', Icon: IconPostgres },
  { label: 'Automation', color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.12)', Icon: IconAutomation },
  { label: 'Neo4j', color: '#4DBCC5', bg: 'rgba(77, 188, 197, 0.12)', Icon: IconNeo4j },
];

/**
 * Home — receives `settings` from Firestore (via App.js) and `language` toggle.
 * Falls back gracefully if settings haven't loaded yet.
 */
export default function Home({ language, settings }) {
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  // ── Firebase-driven values with safe fallbacks ──
  const displayName  = settings?.displayName  ?? 'IbraDev';
  const location     = settings?.location     ?? 'Algiers, Algeria';
  const available    = settings?.available    ?? true;
  const yearsExp     = settings?.yearsExp     ?? '4+';
  const projectCount = settings?.projectCount ?? '10+';

  const bioEn = settings?.homeDescEn ?? 'Crafting modern web experiences with React & Django, building intelligent automations with Python and automation programmes — from Algiers to anywhere.';
  const bioFr = settings?.homeDescFr ?? "Création d'expériences web avec React & Django, automatisations intelligentes avec Python et automation programmes — depuis Alger.";
  const bioAr = settings?.homeDescAr ?? 'صناعة تجارب ويب حديثة باستخدام React و Django، وبناء أتمتة ذكية بلغة Python — من الجزائر إلى أي مكان.';

  return (
    <section
      id="home"
      ref={ref}
      style={{ minHeight: '100vh', background: C.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}
    >
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,146,90,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,146,90,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '7rem 2rem 5rem', width: '100%' }}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={stagger}
          style={{ display: 'grid', gap: '5rem', alignItems: 'center' }}
          className="lg:grid-cols-2"
        >

          {/* LEFT */}
          <div>
            {/* Status badge with green color */}
            <motion.div variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 1rem', background: available ? C.successDim : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${available ? 'rgba(74,222,128,0.3)' : 'rgba(239, 68, 68, 0.3)'}`, borderRadius: '4px',
                color: available ? C.success : C.danger, fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: available ? C.success : C.danger, display: 'inline-block', animation: 'pulse 2s infinite' }} />
                {available
                  ? t(language, 'Available for work', 'Disponible pour travailler', 'متاح للعمل')
                  : t(language, 'Currently busy', 'Actuellement occupé', 'مشغول حالياً')}
              </span>
            </motion.div>

            {/* Name — dynamic from Firebase */}
            <motion.div variants={fadeUp}>
              <p style={{ color: C.textMuted, fontSize: '0.95rem', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                {t(language, 'Full-Stack Developer', 'Développeur Full-Stack', 'مطوّر ويب متكامل')}
              </p>
              {/* Split name on first space for the two-line gradient effect */}
              <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', fontWeight: 400, lineHeight: 1.0, color: C.text, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>
                {displayName.split(' ')[0]}
              </h1>
            </motion.div>

            {/* Typing role */}
            <motion.div variants={fadeUp} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 2, height: '1.4em', background: C.accent, borderRadius: 2, flexShrink: 0 }} />
                <h2 style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: C.textSub, fontWeight: 400, margin: 0, letterSpacing: '0.02em' }}>
                  <TypeAnimation
                    sequence={
                      language === 'ar'
                        ? ['مطوّر ويب متكامل', 2200, 'متخصص React.js', 2200, 'مهندس أتمتة', 2200, 'خبير Django', 2200]
                        : language === 'fr'
                        ? ['Développeur Full-Stack', 2200, 'Spécialiste React.js', 2200, 'Ingénieur Automatisation', 2200, 'Expert Backend Django', 2200]
                        : ['Full-Stack Developer', 2200, 'React.js Specialist', 2200, 'Automation Engineer', 2200, 'Django Backend Expert', 2200]
                    }
                    wrapper="span" speed={55} repeat={Infinity} cursor={false}
                  />
                </h2>
              </div>
            </motion.div>

            {/* Bio — dynamic */}
            <motion.p variants={fadeUp} style={{ color: C.textMuted, fontSize: '1rem', lineHeight: 1.9, maxWidth: '30rem', marginBottom: '3rem' }}>
              {t(language, bioEn, bioFr, bioAr)}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3.5rem' }}>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                style={{ padding: '0.9rem 2rem', background: C.accent, color: C.onAccent, fontWeight: 700, fontSize: '0.88rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.04em', transition: 'all 0.25s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {t(language, "Let's talk", 'Discutons', 'لنتحدث')}
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
              <a href="#projects" onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); }}
                style={{ padding: '0.9rem 2rem', background: 'transparent', color: C.textSub, fontWeight: 500, fontSize: '0.88rem', borderRadius: '6px', textDecoration: 'none', border: `1px solid ${C.border}`, display: 'inline-flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.04em', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(224,146,90,0.28)'; e.currentTarget.style.color = C.text; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; }}>
                {t(language, 'View work', 'Voir projets', 'شاهد أعمالي')}
              </a>
              <a href={settings?.cvUrl || '/resume.pdf'} download target="_blank" rel="noopener noreferrer"
                  style={{ padding: '0.9rem 2rem', background: 'transparent', color: C.accent, fontWeight: 600, fontSize: '0.88rem', borderRadius: '6px', textDecoration: 'none', border: `1px solid rgba(224,146,90,0.28)`, display: 'inline-flex', alignItems: 'center', gap: '0.55rem', letterSpacing: '0.04em', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = C.onAccent; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.accent; }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  {t(language, 'Download CV', 'Télécharger CV', 'تحميل السيرة الذاتية')}
                </a>
            </motion.div>

            {/* Tech stack with icons and colors */}
            <motion.div variants={fadeUp}>
              <p style={{ color: C.textMuted, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                {t(language, 'Tech stack', 'Technologies', 'التقنيات المستخدمة')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {(settings?.techStack ?? techStackData).map((tech0, i) => {
                  const tech = typeof tech0 === 'string' ? { label: tech0, color: C.accent, bg: C.accentDim } : tech0;
                  const Icon = tech.Icon;
                  return (
                    <motion.div key={i} whileHover={{ y: -3, borderColor: tech.color, boxShadow: `0 6px 16px ${tech.bg || C.accentDim}` }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.55rem 1.1rem',
                        background: tech.bg || C.accentDim,
                        border: `1.5px solid ${tech.color || C.accent}`,
                        borderRadius: '6px',
                        color: tech.color || C.accent,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        cursor: 'default',
                        letterSpacing: '0.02em'
                      }}>
                      {Icon && <Icon size={15} style={{ flexShrink: 0 }} />}
                      {tech.label}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — photo (slides in from the right as it scrolls into view) */}
          <motion.div variants={slideInRight} style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: -12, width: 32, height: 32, borderTop: `2px solid ${C.accent}`, borderLeft: `2px solid ${C.accent}`, borderRadius: '2px 0 0 0' }} />
              <div style={{ position: 'absolute', bottom: -12, right: -12, width: 32, height: 32, borderBottom: `2px solid ${C.accent}`, borderRight: `2px solid ${C.accent}`, borderRadius: '0 0 2px 0' }} />
              <div style={{ position: 'absolute', top: -12, right: -12, width: 32, height: 32, borderTop: `2px solid ${C.border}`, borderRight: `2px solid ${C.border}`, borderRadius: '0 2px 0 0' }} />
              <div style={{ position: 'absolute', bottom: -12, left: -12, width: 32, height: 32, borderBottom: `2px solid ${C.border}`, borderLeft: `2px solid ${C.border}`, borderRadius: '0 0 0 2px' }} />

              <motion.div animate={{ y: [-8, 0, -8] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <div style={{ width: 320, height: 400, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}`, position: 'relative' }}>
                  <img src={settings?.photoUrl ?? profilePic} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(12,12,10,0.7) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1.25rem' }}>
                    <p style={{ color: C.text, fontWeight: 600, fontSize: '1rem', margin: 0 }}>{displayName}</p>
                    <p style={{ color: C.accent, fontSize: '0.78rem', margin: '0.2rem 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{location}</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating stat cards */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                style={{ position: 'absolute', right: -70, top: '15%', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '1rem 1.25rem', minWidth: 110 }} className="hidden lg:block">
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: C.text, margin: 0, lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>{yearsExp}</p>
                <p style={{ color: C.textMuted, fontSize: '0.7rem', margin: '0.3rem 0 0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t(language, 'Years exp.', 'Ans exp.', 'سنوات خبرة')}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}
                style={{ position: 'absolute', right: -70, top: '50%', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '1rem 1.25rem', minWidth: 110 }} className="hidden lg:block">
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: C.text, margin: 0, lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>{projectCount}</p>
                <p style={{ color: C.textMuted, fontSize: '0.7rem', margin: '0.3rem 0 0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t(language, 'Projects', 'Projets', 'مشروع')}</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

      
      </div>

      <motion.div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
        <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, transparent, ${C.textMuted})`, borderRadius: 1 }} />
      </motion.div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </section>
  );
}