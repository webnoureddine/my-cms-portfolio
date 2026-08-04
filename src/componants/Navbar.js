import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { C } from '../theme';
import { t, LANGUAGES } from '../i18n';


function Navbar({ darkMode, toggleDarkMode, language, toggleLanguage, settings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { name: t(language, 'Home',     'Accueil',     'الرئيسية'),      href: '#home',     id: 'home'     },
    { name: t(language, 'About',    'À propos',    'نبذة عني'),      href: '#about',    id: 'about'    },
    { name: t(language, 'Skills',   'Compétences', 'المهارات'),      href: '#skills',   id: 'skills'   },
    { name: t(language, 'Projects', 'Projets',     'المشاريع'),      href: '#projects', id: 'projects' },
    { name: t(language, 'Contact',  'Contact',     'تواصل'),         href: '#contact',  id: 'contact'  },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = navItems.map(i => document.querySelector(i.href)).filter(Boolean);
      const scrollY = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollY >= sections[i].offsetTop) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50,
          transition: 'all 0.4s ease',
          background: isScrolled ? `${C.bgPanel}ee` : 'transparent',
          borderBottom: isScrolled ? `1px solid ${C.border}` : '1px solid transparent',
          backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4.5rem' }}>

            {/* Logo */}
            <motion.a
              href="#home"
              onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
              whileHover={{ opacity: 0.85 }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '6px',
                background: C.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14L8 2L14 14" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.5 9.5H11.5" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{
                fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.02em',
                color: C.text, fontFamily: "'DM Serif Display', Georgia, serif",
              }}>
                IbraDev
              </span>
            </motion.a>

            {/* Desktop Nav */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
              {navItems.map((item, i) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                  style={{
                    position: 'relative',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    color: activeSection === item.id ? C.accent : C.textMuted,
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    transition: 'color 0.25s',
                    background: activeSection === item.id ? C.accentSoft : 'transparent',
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ color: C.text, backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  {item.name}
                </motion.a>
              ))}
            </div>

            {/* Right Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              {/* GitHub */}
              <motion.a
                href={settings?.github || 'https://github.com'}
                target="_blank" rel="noopener noreferrer"
                style={{
                  width: 36, height: 36, borderRadius: '8px',
                  border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.textMuted, textDecoration: 'none',
                }}
                whileHover={{ borderColor: C.borderHov, color: C.text, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.77c-2.78.61-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"/>
                </svg>
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                href={settings?.linkedin || 'https://linkedin.com'}
                target="_blank" rel="noopener noreferrer"
                className="hidden md:flex"
                style={{
                  width: 36, height: 36, borderRadius: '8px',
                  border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.textMuted, textDecoration: 'none',
                }}
                whileHover={{ borderColor: C.borderHov, color: C.text, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </motion.a>

              {/* Download CV — uses the admin-uploaded CV if set, otherwise the bundled default resume */}
              <motion.a
                  href={settings?.cvUrl || '/resume.pdf'}
                  download
                  target="_blank" rel="noopener noreferrer"
                  className="hidden md:flex"
                  style={{
                    height: 36, padding: '0 1rem',
                    borderRadius: '8px',
                    border: `1px solid rgba(224,146,90,0.35)`,
                    background: 'rgba(224,146,90,0.1)',
                    color: C.accent,
                    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.07em',
                    cursor: 'pointer', textTransform: 'uppercase',
                    textDecoration: 'none',
                    alignItems: 'center', gap: '0.45rem',
                  }}
                  whileHover={{ background: C.accent, color: C.onAccent, borderColor: C.accent, scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  {t(language, 'CV', 'CV', 'السيرة')}
              </motion.a>

              {/* Language selector — EN / FR / AR segmented control */}
              <div style={{
                display: 'flex', alignItems: 'center', height: 36, padding: 3,
                borderRadius: '8px', border: `1px solid ${C.border}`, gap: 2,
              }}>
                {LANGUAGES.map((l) => (
                  <motion.button
                    key={l.id}
                    onClick={() => toggleLanguage(l.id)}
                    style={{
                      height: '100%', padding: '0 0.55rem',
                      borderRadius: '6px', border: 'none',
                      color: language === l.id ? C.onAccent : C.textMuted,
                      background: language === l.id ? C.accent : 'transparent',
                      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
                      cursor: 'pointer', textTransform: 'uppercase',
                      transition: 'all 0.2s',
                    }}
                    whileHover={language !== l.id ? { color: C.text } : {}}
                    whileTap={{ scale: 0.93 }}
                  >
                    {l.label}
                  </motion.button>
                ))}
              </div>

              {/* Mobile Hamburger - ONLY VISIBLE ON MOBILE */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex"
                style={{
                  width: 36, height: 36, borderRadius: '8px',
                  border: `1px solid ${C.border}`,
                  background: 'transparent', cursor: 'pointer',
                  alignItems: 'center', justifyContent: 'center',
                  color: C.textMuted,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div style={{ width: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <motion.span animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
                    style={{ display: 'block', height: 1.5, background: 'currentColor', borderRadius: 2, transformOrigin: 'center', transition: 'all 0.3s' }} />
                  <motion.span animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                    style={{ display: 'block', height: 1.5, background: 'currentColor', borderRadius: 2, transition: 'all 0.3s' }} />
                  <motion.span animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                    style={{ display: 'block', height: 1.5, background: 'currentColor', borderRadius: 2, transformOrigin: 'center', transition: 'all 0.3s' }} />
                </div>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', borderTop: `1px solid ${C.border}`, background: C.bg }}
              >
                <div style={{ padding: '1rem 0', background: C.bg }}>
                  {navItems.map((item, i) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.85rem 1.5rem',
                        color: activeSection === item.id ? C.accent : C.text,
                        fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.05em',
                        textDecoration: 'none', textTransform: 'uppercase',
                        borderBottom: `1px solid ${C.border}`,
                        background: C.bg,
                        transition: 'all 0.2s',
                      }}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ background: C.bgCard, paddingLeft: '2rem' }}
                    >
                      {item.name}
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </motion.a>
                  ))}

                  {/* Mobile CV download — uses the admin-uploaded CV if set, otherwise the bundled default resume */}
                  <motion.a
                      href={settings?.cvUrl || '/resume.pdf'}
                      download
                      target="_blank" rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navItems.length * 0.06 }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.85rem 1.5rem',
                        color: C.accent,
                        fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em',
                        textDecoration: 'none', textTransform: 'uppercase',
                        marginTop: '0.5rem',
                        background: C.bg,
                        borderBottom: `1px solid ${C.border}`,
                        transition: 'all 0.2s',
                      }}
                      whileHover={{ background: C.bgCard, paddingLeft: '2rem' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        {t(language, 'Download CV', 'Télécharger CV', 'تحميل السيرة الذاتية')}
                      </span>
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </motion.a>

                  {/* Mobile LinkedIn */}
                  <motion.a
                    href={settings?.linkedin || 'https://linkedin.com'}
                    target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.06 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.85rem 1.5rem',
                      color: C.accent,
                      fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em',
                      textDecoration: 'none', textTransform: 'uppercase',
                      marginTop: '0.5rem',
                      background: C.bg,
                      transition: 'all 0.2s',
                    }}
                    whileHover={{ background: C.bgCard, paddingLeft: '2rem' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </>
  );
}

export default Navbar;