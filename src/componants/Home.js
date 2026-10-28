import { motion } from 'framer-motion';
import profilePic from '../me.jpg';
import { t } from '../i18n';
import { Stagger, Item } from './Reveal';
import Typewriter from './Typewriter';
import {
  IconArrow, IconDownload, IconPin, IconGitHub, IconLinkedIn, IconMail,
  IconTrophy, IconRocket, IconSparkle,
} from './icons';

function SpinBadge({ language }) {
  const text = t(language,
    'AVAILABLE FOR WORK • LET’S TALK • ',
    'DISPONIBLE • PARLONS PROJET • ',
    'متاح للعمل • لنتحدث • ');
  return (
    <div className="spin-badge" aria-hidden="true">
      <svg className="spin-ring" viewBox="0 0 120 120">
        <defs><path id="badge-circle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs>
        <circle cx="60" cy="60" r="58" style={{ fill: 'var(--green)', stroke: 'var(--gold)' }} strokeWidth="1.5" />
        <text style={{ fill: 'var(--gold)' }} fontSize="10" fontWeight="700" letterSpacing="1.5">
          <textPath href="#badge-circle" textLength="280" lengthAdjust="spacing">{text}</textPath>
        </text>
      </svg>
      <div className="core"><IconSparkle size={24} /></div>
    </div>
  );
}

export default function Home({ language, settings }) {
  const displayName = settings?.displayName || 'IbraDev';
  const [first, ...rest] = displayName.split(' ');
  const location = settings?.location || '';
  const available = settings?.available ?? true;
  const cvUrl = settings?.cvUrl || '/resume.pdf';

  const bio = t(
    language,
    settings?.homeDescEn || 'I build modern web applications with React and Django, and automate repetitive work with Python.',
    settings?.homeDescFr || undefined,
    settings?.homeDescAr || undefined,
  );

  const roles = language === 'ar'
    ? ['مطوّر ويب متكامل', 'متخصص React.js', 'خبير Django', 'مهندس أتمتة']
    : language === 'fr'
      ? ['Développeur Full-Stack', 'Spécialiste React.js', 'Expert Django', 'Ingénieur automatisation']
      : ['Full-Stack Developer', 'React.js Specialist', 'Django Backend Expert', 'Automation Engineer'];

  const scrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-grid">
          <Stagger onLoad gap={0.1} delay={0.15}>
            <Item>
              <span className={`status ${available ? '' : 'status--busy'}`}>
                <span className="status-dot" />
                {available
                  ? t(language, 'Available for new projects', 'Disponible pour de nouveaux projets', 'متاح لمشاريع جديدة')
                  : t(language, 'Currently booked', 'Actuellement indisponible', 'مشغول حالياً')}
              </span>
            </Item>

            <Item>
              <p className="hero-hello">
                <span className="wave" role="img" aria-label="wave">👋</span>
                {t(language, "Hello, I'm", 'Bonjour, je suis', 'مرحباً، أنا')}
              </p>
              <h1 className="hero-name">
                {first}{rest.length > 0 && <> <span className="accent">{rest.join(' ')}</span></>}
              </h1>
            </Item>

            <Item>
              <p className="hero-role">
                <span>{t(language, 'I am a', 'Je suis', 'أنا')}</span>
                <Typewriter words={roles} />
              </p>
            </Item>

            <Item><p className="hero-bio">{bio}</p></Item>

            <Item className="hero-actions">
              <a href="#projects" className="btn btn-gold" onClick={(e) => scrollTo(e, 'projects')}>
                {t(language, 'View my work', 'Voir mes projets', 'شاهد أعمالي')} <IconArrow />
              </a>
              <a href={cvUrl} className="btn btn-ghost-light" target="_blank" rel="noopener noreferrer" download>
                <IconDownload size={16} /> {t(language, 'Download CV', 'Télécharger le CV', 'تحميل السيرة الذاتية')}
              </a>
            </Item>

            <Item className="hero-social">
              <span className="label">{t(language, 'Follow', 'Suivre', 'تابعني')}</span>
              {settings?.github && <a className="icon-btn" href={settings.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><IconGitHub /></a>}
              {settings?.linkedin && <a className="icon-btn" href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><IconLinkedIn /></a>}
              {settings?.email && <a className="icon-btn" href={`mailto:${settings.email}`} aria-label="Email"><IconMail size={17} /></a>}
            </Item>
          </Stagger>

          <motion.div className="portrait"
            initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <div className="portrait-ring" />
            <div className="portrait-frame">
              <img className="portrait-img" src={settings?.photoUrl || profilePic} alt={displayName} />
            </div>
            {available && <SpinBadge language={language} />}

            {settings?.yearsExp && (
              <motion.div className="float-card float-card--a"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                transition={{ opacity: { delay: 0.9 }, x: { delay: 0.9 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}>
                <span className="fc-icon tone-gold"><IconTrophy size={20} /></span>
                <span><strong>{settings.yearsExp}</strong><small>{t(language, 'Years experience', "Ans d'expérience", 'سنوات خبرة')}</small></span>
              </motion.div>
            )}
            {settings?.projectCount && (
              <motion.div className="float-card float-card--b"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
                transition={{ opacity: { delay: 1.1 }, x: { delay: 1.1 }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}>
                <span className="fc-icon tone-orange"><IconRocket size={20} /></span>
                <span><strong>{settings.projectCount}</strong><small>{t(language, 'Projects shipped', 'Projets livrés', 'مشاريع منجزة')}</small></span>
              </motion.div>
            )}
            {location && (
              <motion.div className="float-card" style={{ bottom: '-1.4rem', left: 0, right: 0, margin: '0 auto', width: 'max-content' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                <span className="fc-icon tone-green" style={{ width: 30, height: 30 }}><IconPin size={15} /></span>
                <small style={{ margin: 0, fontSize: '.82rem', color: 'var(--ink)' }}>{location}</small>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true" />
    </section>
  );
}
