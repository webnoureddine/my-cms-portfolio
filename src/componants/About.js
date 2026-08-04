import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import profilePic from '../me.jpg';
import { C } from '../theme';
import { t } from '../i18n';


const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

// Default capabilities if none exist in Firestore yet
const defaultCapabilities = [
  { num: '01', titleEn: 'Modern Web Development', titleFr: 'Développement Web Moderne', titleAr: 'تطوير ويب حديث', descEn: 'Fast, responsive applications built with React.js and Tailwind CSS — pixel-perfect, performant, and production-ready.', descFr: "Applications rapides et responsives avec React.js et Tailwind CSS — pixel-perfect, performantes et prêtes à déployer.", descAr: 'تطبيقات سريعة ومتجاوبة مبنية بـ React.js و Tailwind CSS — دقيقة، عالية الأداء، وجاهزة للإنتاج.' },
  { num: '02', titleEn: 'Django Backends & APIs', titleFr: 'Backends Django & APIs', titleAr: 'واجهات خلفية وAPIs بلغة Django', descEn: 'Secure, scalable REST APIs with Django REST Framework, JWT auth, Redis caching, and Celery async tasks.', descFr: "APIs REST sécurisées avec Django REST Framework, authentification JWT, cache Redis et tâches Celery.", descAr: 'واجهات REST آمنة وقابلة للتوسع باستخدام Django REST Framework ومصادقة JWT وتخزين مؤقت بـ Redis ومهام Celery.' },
  { num: '03', titleEn: 'Advanced Database Design', titleFr: 'Conception de BDD Avancée', titleAr: 'تصميم قواعد بيانات متقدم', descEn: 'Relational (PostgreSQL/MySQL) and graph databases (Neo4j) for complex data models and rich relationships.', descFr: 'Bases relationnelles (PostgreSQL/MySQL) et graphes (Neo4j) pour modèles de données complexes.', descAr: 'قواعد بيانات علائقية (PostgreSQL/MySQL) وقواعد بيانات رسومية (Neo4j) لنماذج بيانات معقدة وعلاقات غنية.' },
  { num: '04', titleEn: 'AI & Automation Systems', titleFr: "IA & Systèmes d'Automatisation", titleAr: 'أنظمة الذكاء الاصطناعي والأتمتة', descEn: "Python scripts, AI-powered tools, and automations workflow orchestration that turn repetitive tasks into intelligent pipelines.", descFr: "Scripts Python, outils IA et orchestration automations qui transforment les tâches répétitives en pipelines intelligents.", descAr: 'سكربتات بايثون وأدوات مدعومة بالذكاء الاصطناعي وتنسيق سير عمل يحوّل المهام المتكررة إلى مسارات عمل ذكية.' },
];

/**
 * About — receives `settings` from Firestore (via App.js).
 * Editable fields: name, location, aboutBioEn, aboutBioFr, aboutBio2En, aboutBio2Fr,
 *   yearsExp, projectCount, automations, stats (array), capabilities (array)
 */
function About({ language, settings }) {
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const displayName  = settings?.displayName ?? 'IbraDev';
  const location     = settings?.location    ?? 'Algiers, Algeria';
  const photoUrl     = settings?.photoUrl;

  const stats = settings?.stats ?? [
    { num: '4+',  labelEn: 'Years experience',   labelFr: "Ans d'expérience", labelAr: 'سنوات خبرة' },
    { num: '10+', labelEn: 'Projects shipped',    labelFr: 'Projets livrés',   labelAr: 'مشروع منجز' },
    { num: '2+',  labelEn: 'Automations live',    labelFr: 'Automatisations en prod', labelAr: 'أتمتة قيد التشغيل' },
    { num: '∞',   labelEn: 'Scalable solutions',  labelFr: 'Solutions évolutives',   labelAr: 'حلول قابلة للتوسع' },
  ];

  const capabilities = settings?.capabilities ?? defaultCapabilities;

  const bio1En = settings?.aboutBioEn  ?? `I'm ${displayName}, a full-stack developer based in ${location}. I specialize in building modern, performant web applications with React and Tailwind, while creating robust backends with Django and Python.`;
  const bio1Fr = settings?.aboutBioFr  ?? `Je suis ${displayName}, développeur full-stack basé à Alger. Je me spécialise dans les applications web modernes et performantes avec React et Tailwind, et les backends robustes avec Django et Python.`;
  const bio1Ar = settings?.aboutBioAr  ?? `أنا ${displayName}، مطوّر ويب متكامل (full-stack) مقيم في ${location}. أتخصص في بناء تطبيقات ويب حديثة وعالية الأداء باستخدام React و Tailwind، إلى جانب بناء واجهات خلفية قوية بـ Django و Python.`;
  const bio2En = settings?.aboutBio2En ?? "My passion extends into automation — from AI-powered Python scripts to complex workflow orchestration with automations. I love turning repetitive tasks into efficient, automated systems that scale.";
  const bio2Fr = settings?.aboutBio2Fr ?? "Ma passion s'étend à l'automatisation — des scripts Python boostés à l'IA aux orchestrations complexes avec automations. J'adore transformer les tâches répétitives en systèmes automatisés efficaces.";
  const bio2Ar = settings?.aboutBio2Ar ?? "شغفي يمتد إلى الأتمتة — من سكربتات بايثون المدعومة بالذكاء الاصطناعي إلى تنسيق مسارات عمل معقدة. أحب تحويل المهام المتكررة إلى أنظمة آلية فعّالة وقابلة للتوسع.";

  return (
    <motion.section id="about" ref={ref} initial="hidden" animate={controls} variants={stagger}
      style={{ padding: '7rem 2rem', background: C.bgCard, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: C.border }} />

      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

        {/* Section label */}
        <motion.div variants={fadeUp} style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {t(language, 'About', 'À propos', 'نبذة عني')}
            </span>
            <div style={{ height: 1, flex: 1, maxWidth: 60, background: C.border }} />
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 400, lineHeight: 1.1, color: C.text, margin: '0.75rem 0 0', letterSpacing: '-0.02em' }}>
            {t(language, 'Building with purpose,', 'Construire avec intention,', 'أبني بهدف واضح،')}
            <br /><em style={{ color: C.accent }}>{t(language, 'shipping with precision', 'livrer avec précision', 'وأُسلّم بدقة')}</em>
          </h2>
        </motion.div>

        {/* 2-col layout */}
        <div className="grid lg:grid-cols-2 gap-16" style={{ marginBottom: '5rem' }}>

          {/* Photo + stats */}
          <motion.div variants={fadeUp}>
            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
              <div style={{ width: '100%', maxWidth: 380, height: 460, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}`, position: 'relative', background: C.bg }}>
                <img src={photoUrl ?? profilePic} alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(12,12,10,0.85) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, padding: '1.5rem' }}>
                  <p style={{ color: C.text, fontWeight: 600, margin: 0 }}>{displayName}</p>
                  <p style={{ color: C.accent, fontSize: '0.78rem', margin: '0.25rem 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {location} — Full-Stack Dev
                  </p>
                </div>
                <div style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, borderTop: `2px solid ${C.accent}`, borderRight: `2px solid ${C.accent}` }} />
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: C.border, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
              {stats.map((s, i) => (
                <motion.div key={i} whileHover={{ background: C.bgCard2 }}
                  style={{ padding: '1.5rem', background: C.bg, transition: 'background 0.2s' }}>
                  <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', fontWeight: 400, color: C.text, margin: 0, lineHeight: 1 }}>{s.num}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.75rem', margin: '0.4rem 0 0', letterSpacing: '0.04em' }}>
                    {t(language, s.labelEn, s.labelFr, s.labelAr)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2rem' }}>
            <p style={{ color: C.textSub, fontSize: '1.05rem', lineHeight: 2.0, margin: 0 }}>
              {t(language, bio1En, bio1Fr, bio1Ar)}
            </p>
            <p style={{ color: C.textMuted, fontSize: '1.05rem', lineHeight: 2.0, margin: 0 }}>
              {t(language, bio2En, bio2Fr, bio2Ar)}
            </p>
            <motion.a href="#projects"
              onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.75rem', background: C.accentDim, border: `1px solid ${C.borderAcc}`, borderRadius: '6px', color: C.accent, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', letterSpacing: '0.04em', alignSelf: 'flex-start', transition: 'all 0.25s' }}
              whileHover={{ background: C.accent, color: C.onAccent }} whileTap={{ scale: 0.97 }}>
              {t(language, 'Explore my projects', 'Voir mes projets', 'استكشف مشاريعي')}
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </motion.a>
          </motion.div>
        </div>

        {/* Capabilities */}
        <motion.div variants={fadeUp}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ height: 1, flex: 1, background: C.border }} />
            <span style={{ color: C.textMuted, fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {t(language, 'Capabilities', 'Compétences', 'القدرات')}
            </span>
            <div style={{ height: 1, flex: 1, background: C.border }} />
          </div>

          <div style={{ display: 'grid', gap: '1px', background: C.border, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` }}
            className="grid md:grid-cols-2">
            {capabilities.map((cap, i) => (
              <motion.div key={i} whileHover={{ background: C.bgCard2 }}
                style={{ padding: '2rem', background: C.bg, display: 'flex', gap: '1.25rem', transition: 'background 0.2s' }}>
                <span style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', flexShrink: 0, marginTop: '0.2rem' }}>{cap.num}</span>
                <div>
                  <h4 style={{ color: C.text, fontWeight: 600, fontSize: '0.95rem', margin: '0 0 0.6rem', letterSpacing: '0.01em' }}>
                    {t(language, cap.titleEn, cap.titleFr, cap.titleAr)}
                  </h4>
                  <p style={{ color: C.textMuted, fontSize: '0.88rem', lineHeight: 1.8, margin: 0 }}>
                    {t(language, cap.descEn, cap.descFr, cap.descAr)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default About;
