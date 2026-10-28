import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t, LANGUAGES } from '../i18n';
import {
  IconGitHub, IconLinkedIn, IconDownload, IconMenu, IconClose,
  IconUser, IconCode, IconFolder, IconChat, IconSparkle,
} from './icons';

const SECTIONS = ['home', 'about', 'skills', 'projects', 'contact'];
const SECTION_ICONS = { home: IconSparkle, about: IconUser, skills: IconCode, projects: IconFolder, contact: IconChat };

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function Navbar({ language, toggleLanguage, settings }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [progress, setProgress] = useState(0);

  const labels = {
    home:     t(language, 'Home', 'Accueil', 'الرئيسية'),
    about:    t(language, 'About', 'À propos', 'نبذة عني'),
    skills:   t(language, 'Skills', 'Compétences', 'المهارات'),
    projects: t(language, 'Projects', 'Projets', 'المشاريع'),
    contact:  t(language, 'Contact', 'Contact', 'تواصل'),
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const hero = document.getElementById('home');
      setScrolled(y > (hero ? hero.offsetHeight - 90 : 40));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? y / max : 0);
      let current = 'home';
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y + 140) current = id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const go = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  const name = settings?.displayName || 'Portfolio';
  const cvUrl = settings?.cvUrl || '/resume.pdf';

  return (
    <>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} />
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
        <div className="container">
          <div className="nav-inner">
            <a href="#home" className="brand" onClick={(e) => go(e, 'home')}>
              <span className="brand-mark">{initials(name)}</span>
              <span className="brand-name">{name}</span>
            </a>

            <nav className="nav-links" aria-label="Main">
              {SECTIONS.map((id) => (
                <a key={id} href={`#${id}`} onClick={(e) => go(e, id)}
                  className={`nav-link ${active === id ? 'nav-link--active' : ''}`}>
                  {active === id && (
                    <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                  <span>{labels[id]}</span>
                </a>
              ))}
            </nav>

            <div className="nav-actions">
              {settings?.github && (
                <a className="icon-btn nav-hide-sm" href={settings.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><IconGitHub /></a>
              )}
              {settings?.linkedin && (
                <a className="icon-btn nav-hide-sm" href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><IconLinkedIn /></a>
              )}
              <div className="lang-switch" role="group" aria-label="Language">
                {LANGUAGES.map((l) => (
                  <button key={l.id} type="button" aria-pressed={language === l.id} onClick={() => toggleLanguage(l.id)}>{l.label}</button>
                ))}
              </div>
              <a className="btn btn-gold btn-sm nav-hide-sm" href={cvUrl} target="_blank" rel="noopener noreferrer" download style={{ boxShadow: 'none' }}>
                <IconDownload size={14} /> {t(language, 'CV', 'CV', 'السيرة')}
              </a>
              <button type="button" className="icon-btn nav-burger" onClick={() => setOpen((o) => !o)}
                aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
                {open ? <IconClose /> : <IconMenu />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div className="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div className="container">
                {SECTIONS.map((id) => {
                  const Icon = SECTION_ICONS[id];
                  return <a key={id} href={`#${id}`} onClick={(e) => go(e, id)}><Icon size={18} /> {labels[id]}</a>;
                })}
                <a className="mobile-cv" href={cvUrl} target="_blank" rel="noopener noreferrer" download>
                  <IconDownload size={18} /> {t(language, 'Download CV', 'Télécharger le CV', 'تحميل السيرة الذاتية')}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
