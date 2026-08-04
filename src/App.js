import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Navbar    from './componants/Navbar';
import Home      from './componants/Home';
import About     from './componants/About';
import Skills    from './componants/Skills';
import Projects  from './componants/Projects';
import Contact   from './componants/Contact';
import AdminPage from './componants/AdminPage';

import { usePortfolioData } from './componants/usePortfolioData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { C } from './theme';
import { isRTL } from './i18n';

/**
 * App.js — root component.
 *
 * Route /admin → AdminPage (login-protected CMS, backed by Supabase Auth)
 * Everything else → public portfolio (data from Supabase via usePortfolioData)
 */

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${C.accentDim}`, borderTopColor: C.accent, animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: C.textMuted, fontSize: '0.85rem', letterSpacing: '0.08em' }}>Loading portfolio…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ConfigErrorScreen({ message }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <p style={{ color: C.danger, fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>Setup needed</p>
        <p style={{ color: C.textSub, fontSize: '0.9rem', lineHeight: 1.7 }}>
          {message || 'Could not connect to the database.'}
        </p>
        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: '1rem' }}>
          See README.md for the 5-minute Supabase setup steps.
        </p>
      </div>
    </div>
  );
}

const LANGUAGE_ORDER = ['en', 'fr', 'ar'];

function PublicSite() {
  const [language, setLanguage] = useState('en');
  // Cycles EN -> FR -> AR -> EN. Also accepts a specific language id directly.
  const toggleLanguage = (next) => {
    if (typeof next === 'string' && LANGUAGE_ORDER.includes(next)) {
      setLanguage(next);
      return;
    }
    setLanguage((l) => LANGUAGE_ORDER[(LANGUAGE_ORDER.indexOf(l) + 1) % LANGUAGE_ORDER.length]);
  };

  // Keep the document direction/lang in sync so Arabic renders right-to-left.
  useEffect(() => {
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const { settings, projects, skills, loading, error } = usePortfolioData();
  const location = useLocation();
  const loggedRef = useRef(false);

  // Log one row per visit for the admin Dashboard tab. Fire-and-forget —
  // never blocks rendering and silently no-ops if it fails.
  useEffect(() => {
    if (!isSupabaseConfigured || loading || error || loggedRef.current) return;
    loggedRef.current = true;
    supabase.from('page_views').insert({ path: location.pathname }).then(() => {});
  }, [loading, error, location.pathname]);

  if (!isSupabaseConfigured) {
    return <ConfigErrorScreen message="Supabase environment variables are missing. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to a .env file." />;
  }

  if (loading) return <LoadingScreen />;

  if (error) {
    return <ConfigErrorScreen message={error} />;
  }

  const rtl = isRTL(language);

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{ fontFamily: rtl ? "'Cairo', 'DM Sans', sans-serif" : "'DM Sans', sans-serif" }}>
      <Navbar language={language} toggleLanguage={toggleLanguage} settings={settings} />
      <Home     language={language} settings={settings} />
      <About    language={language} settings={settings} />
      <Skills   language={language} skills={skills} />
      <Projects language={language} projects={projects} />
      <Contact  language={language} settings={settings} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
