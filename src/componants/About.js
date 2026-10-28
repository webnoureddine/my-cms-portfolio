import { t } from '../i18n';
import Reveal, { Stagger, Item } from './Reveal';
import useCountUp from './useCountUp';
import { IconCode, IconServer, IconDatabase, IconBolt, IconUser, IconTrophy, IconRocket, IconSparkle, IconLayers } from './icons';

const defaultCapabilities = [
  { titleEn: 'Web applications', titleFr: 'Applications web', titleAr: 'تطبيقات الويب',
    descEn: 'Fast, responsive front-ends in React and Tailwind CSS, built to be maintained.',
    descFr: 'Interfaces rapides et responsives en React et Tailwind CSS, pensées pour durer.',
    descAr: 'واجهات سريعة ومتجاوبة باستخدام React و Tailwind CSS، مبنية لتكون سهلة الصيانة.' },
  { titleEn: 'Backends & APIs', titleFr: 'Backends & APIs', titleAr: 'الواجهات الخلفية و API',
    descEn: 'Secure REST APIs with Django REST Framework, authentication, caching and background jobs.',
    descFr: 'APIs REST sécurisées avec Django REST Framework, authentification, cache et tâches de fond.',
    descAr: 'واجهات REST آمنة باستخدام Django REST Framework مع المصادقة والتخزين المؤقت والمهام الخلفية.' },
  { titleEn: 'Data modelling', titleFr: 'Modélisation de données', titleAr: 'نمذجة البيانات',
    descEn: 'Relational (PostgreSQL, MySQL) and graph (Neo4j) databases designed around real queries.',
    descFr: 'Bases relationnelles (PostgreSQL, MySQL) et graphes (Neo4j) conçues autour des vraies requêtes.',
    descAr: 'قواعد بيانات علائقية (PostgreSQL و MySQL) ورسومية (Neo4j) مصممة حول الاستعلامات الفعلية.' },
  { titleEn: 'Automation & AI', titleFr: 'Automatisation & IA', titleAr: 'الأتمتة والذكاء الاصطناعي',
    descEn: 'Python pipelines and AI-assisted tools that remove repetitive, manual work.',
    descFr: 'Pipelines Python et outils assistés par IA qui suppriment le travail manuel répétitif.',
    descAr: 'مسارات عمل بلغة Python وأدوات مدعومة بالذكاء الاصطناعي تُلغي العمل اليدوي المتكرر.' },
];
const CAP_ICONS = [IconCode, IconServer, IconDatabase, IconBolt];
const CAP_TONES = ['tone-green', 'tone-gold', 'tone-orange', 'tone-cream'];
const STAT_ICONS = [IconTrophy, IconRocket, IconBolt, IconSparkle];

function Stat({ s, i, language }) {
  const [ref, value] = useCountUp(s.num);
  const Icon = STAT_ICONS[i % STAT_ICONS.length];
  return (
    <Item className="stat">
      <span className="stat-icon"><Icon size={26} /></span>
      <div className="stat-num" ref={ref}>{value}</div>
      <div className="stat-label">{t(language, s.labelEn, s.labelFr || undefined, s.labelAr || undefined)}</div>
    </Item>
  );
}

export default function About({ language, settings }) {
  const displayName = settings?.displayName || 'IbraDev';
  const stats = settings?.stats?.length ? settings.stats : [
    settings?.yearsExp && { num: settings.yearsExp, labelEn: 'Years of experience', labelFr: "Années d'expérience", labelAr: 'سنوات الخبرة' },
    settings?.projectCount && { num: settings.projectCount, labelEn: 'Projects delivered', labelFr: 'Projets livrés', labelAr: 'مشاريع منجزة' },
  ].filter(Boolean);
  const capabilities = settings?.capabilities?.length ? settings.capabilities : defaultCapabilities;

  const bio1 = t(language,
    settings?.aboutBioEn || `I'm ${displayName}, a full-stack developer. I build web applications with React and Django, and I care about clean architecture and details users notice.`,
    settings?.aboutBioFr || undefined, settings?.aboutBioAr || undefined);
  const bio2 = t(language, settings?.aboutBio2En || '', settings?.aboutBio2Fr || undefined, settings?.aboutBio2Ar || undefined);

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about-grid">
          <Reveal className="about-text">
            <span className="eyebrow"><IconUser size={14} /> {t(language, 'About me', 'À propos', 'نبذة عني')}</span>
            <h2 className="h-section" style={{ marginBottom: '1.4rem' }}>
              {t(language, 'Thoughtful software,', 'Des logiciels réfléchis,', 'برمجيات مدروسة،')}{' '}
              <em>{t(language, 'delivered with care.', 'livrés avec soin.', 'تُسلَّم بعناية.')}</em>
            </h2>
            <p>{bio1}</p>
            {bio2 && <p>{bio2}</p>}
          </Reveal>

          {stats.length > 0 && (
            <Stagger className="stats">
              {stats.map((s, i) => <Stat key={i} s={s} i={i} language={language} />)}
            </Stagger>
          )}
        </div>

        <Reveal style={{ marginTop: '4.5rem' }}>
          <span className="eyebrow"><IconLayers size={14} /> {t(language, 'What I do', 'Ce que je fais', 'ماذا أقدّم')}</span>
        </Reveal>
        <Stagger className="capabilities" style={{ marginTop: '0.5rem' }}>
          {capabilities.map((c, i) => {
            const Icon = CAP_ICONS[i % CAP_ICONS.length];
            return (
              <Item key={i}>
                <div className="capability">
                  <div className={`cap-icon ${CAP_TONES[i % CAP_TONES.length]}`}><Icon size={22} /></div>
                  <h3>{t(language, c.titleEn, c.titleFr || undefined, c.titleAr || undefined)}</h3>
                  <p>{t(language, c.descEn, c.descFr || undefined, c.descAr || undefined)}</p>
                </div>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
