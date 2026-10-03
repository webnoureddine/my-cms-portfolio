import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { C } from '../theme';
import { t } from '../i18n';
import { fadeUp, sideReveal } from '../animations';

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

// Fallback data if Firestore skills collection is empty
const defaultCategories = [
  { num: '01', titleEn: 'Frontend',        titleFr: 'Frontend',          titleAr: 'الواجهة الأمامية', skills: [{ name: 'React.js', level: 95 }, { name: 'Tailwind CSS', level: 92 }, { name: 'JavaScript ES6+', level: 94 }] },
  { num: '02', titleEn: 'Backend & APIs',  titleFr: 'Backend & APIs',    titleAr: 'الواجهة الخلفية وAPIs', skills: [{ name: 'Django', level: 93 }, { name: 'Python', level: 95 }, { name: 'REST APIs', level: 92 }] },
  { num: '03', titleEn: 'Databases',       titleFr: 'Bases de Données',  titleAr: 'قواعد البيانات', skills: [{ name: 'PostgreSQL', level: 88 }, { name: 'Neo4j', level: 85 }] },
  { num: '04', titleEn: 'Automation & AI', titleFr: 'Automatisation & IA', titleAr: 'الأتمتة والذكاء الاصطناعي', skills: [{ name: 'Python Automation', level: 96 }, { name: 'automations', level: 94 }] },
];

const defaultTools = ['Git & GitHub', 'VS Code', 'Postman', 'Docker', 'Vercel', 'Linux', 'Figma'];

// Each skill category gets its own vivid, distinct color + icon (pulled from
// the full brand palette) instead of everything sharing one accent color.
const CATEGORY_STYLES = [
  { match: /front/i,  color: C.blue,     bg: C.blueDim,    icon: 'code'     },
  { match: /back|api/i, color: C.accent, bg: C.accentDim,  icon: 'server'   },
  { match: /data/i,   color: C.blueDeep, bg: 'rgba(30,100,161,0.16)', icon: 'database' },
  { match: /auto|ai/i, color: C.peach,   bg: C.peachDim,   icon: 'bolt'     },
  { match: /tool/i,   color: C.success,  bg: C.successDim, icon: 'wrench'  },
];
const FALLBACK_COLORS = [
  { color: C.blue, bg: C.blueDim },
  { color: C.accent, bg: C.accentDim },
  { color: C.blueDeep, bg: 'rgba(30,100,161,0.16)' },
  { color: C.peach, bg: C.peachDim },
  { color: C.success, bg: C.successDim },
];

function getCategoryStyle(title, index) {
  const found = CATEGORY_STYLES.find((s) => s.match.test(title || ''));
  if (found) return found;
  return { ...FALLBACK_COLORS[index % FALLBACK_COLORS.length], icon: 'star' };
}

const CategoryIcon = ({ type, color }) => {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'code':
      return <svg {...common}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    case 'server':
      return <svg {...common}><rect x="2" y="3" width="20" height="7" rx="1.5" /><rect x="2" y="14" width="20" height="7" rx="1.5" /><line x1="6" y1="6.5" x2="6.01" y2="6.5" /><line x1="6" y1="17.5" x2="6.01" y2="17.5" /></svg>;
    case 'database':
      return <svg {...common}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" /><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" /></svg>;
    case 'bolt':
      return <svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case 'wrench':
      return <svg {...common}><path d="M14.7 6.3a4 4 0 11-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 015.4-5.4l-3 3-2-2 3-3z" /></svg>;
    default:
      return <svg {...common}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
  }
};

const SkillChip = ({ skill, index, hasLevel, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.03 }}
    whileHover={{ borderColor: color, y: -1 }}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
      padding: '0.45rem 0.8rem', borderRadius: '999px',
      background: C.bg, border: `1px solid ${C.border}`,
      transition: 'border-color 0.2s',
    }}
  >
    <span style={{ color: C.textSub, fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{skill.name}</span>
    {hasLevel && (
      <span style={{ width: 26, height: 4, borderRadius: 2, background: C.track, overflow: 'hidden', display: 'inline-block', flexShrink: 0 }}>
        <motion.span
          style={{ display: 'block', height: '100%', borderRadius: 2, background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: index * 0.03 + 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    )}
  </motion.div>
);

/**
 * Skills — receives `skills` array from Supabase (via App.js).
 * Each row has: num, titleEn, titleFr, skills (array of {name, level}).
 * Optionally one row has isTools: true and skills: [{name: 'Git'}] (no level).
 */
function Skills({ language, skills: dbSkills }) {
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  // Separate tools from skill categories
  const toolsDoc    = (dbSkills ?? []).find((s) => s.isTools);
  const categories  = (dbSkills ?? []).filter((s) => !s.isTools);
  const displayCats = categories.length > 0 ? categories : defaultCategories;
  const tools       = toolsDoc ? toolsDoc.skills.map((s) => s.name) : defaultTools;

  const allGroups = [
    ...displayCats.map((cat, i) => ({ ...cat, num: cat.num ?? String(i + 1).padStart(2, '0'), isTools: false })),
    { num: String(displayCats.length + 1).padStart(2, '0'), titleEn: 'Tools', titleFr: 'Outils', titleAr: 'أدوات', isTools: true, skills: tools.map((tool) => ({ name: tool })) },
  ];

  return (
    <motion.section
      id="skills" ref={ref} initial="hidden" animate={controls} variants={stagger}
      style={{ padding: '7rem 2rem', background: C.bg, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: C.border }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />

      <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative' }}>

        <motion.div variants={fadeUp} style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Expertise</span>
              <div style={{ height: 1, width: 48, background: C.border }} />
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 400, color: C.text, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {t(language, 'Skills & Technologies', 'Compétences', 'المهارات والتقنيات')}
            </h2>
          </div>
          <p style={{ color: C.textMuted, fontSize: '0.95rem', maxWidth: '22rem', lineHeight: 1.8, margin: 0 }}>
            {t(language, 'Modern web, scalable backends, and intelligent automation — full ownership of the stack.', "Web moderne, backends évolutifs et automatisation intelligente — maîtrise totale de la stack.", 'ويب حديث، وواجهات خلفية قابلة للتوسع، وأتمتة ذكية — إتقان كامل للمنظومة التقنية.')}
          </p>
        </motion.div>

        {/* Compact cards that flow side by side and wrap naturally */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {allGroups.map((cat, ci) => {
            const catTitle = t(language, cat.titleEn, cat.titleFr ?? cat.titleEn, cat.titleAr ?? cat.titleEn);
            const style = getCategoryStyle(cat.titleEn, ci);
            return (
              <motion.div key={ci} variants={sideReveal(ci)} whileHover={{ borderColor: style.color, y: -2 }}
                style={{
                  flex: '1 1 260px', maxWidth: '360px', padding: '1.4rem 1.5rem',
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px',
                  borderTop: `2.5px solid ${style.color}`,
                  transition: 'border-color 0.25s, transform 0.25s',
                  position: 'relative',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
                    background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CategoryIcon type={style.icon} color={style.color} />
                  </div>
                  <div>
                    <span style={{ color: style.color, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', display: 'block' }}>{cat.num}</span>
                    <h3 style={{ color: C.text, fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                      {catTitle}
                    </h3>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(cat.skills ?? []).map((skill, si) => (
                    <SkillChip key={si} skill={skill} index={si} hasLevel={!cat.isTools && skill.level != null} color={style.color} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>


        {/* CTA banner */}
        <motion.div variants={fadeUp} style={{ marginTop: '5rem' }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '3rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', background: C.bgCard, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.accent }} />
            <div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: C.text, fontWeight: 400, margin: '0 0 0.5rem' }}>
                {t(language, 'Ready to build something great?', 'Prêt à construire quelque chose ?', 'مستعد لبناء شيء رائع؟')}
              </h3>
              <p style={{ color: C.textMuted, margin: 0, fontSize: '0.95rem' }}>
                {t(language, "Web app, automation, or backend — let's make it happen.", "Application web, automatisation ou backend — faisons-le.", 'تطبيق ويب، أتمتة، أو واجهة خلفية — لنحقق ذلك معًا.')}
              </p>
            </div>
            <motion.a href="#contact" onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ padding: '0.9rem 2rem', background: C.accent, color: C.onAccent, fontWeight: 700, fontSize: '0.88rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
              whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}>
              {t(language, 'Start a project', 'Démarrer un projet', 'ابدأ مشروعًا')}
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Skills;
