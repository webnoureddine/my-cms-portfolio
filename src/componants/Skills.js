import { t } from '../i18n';
import Reveal, { Stagger, Item } from './Reveal';
import { TechLogo, IconCode, IconServer, IconDatabase, IconBolt, IconTool, IconLayers, IconArrow } from './icons';

const defaultCategories = [
  { titleEn: 'Frontend', titleFr: 'Frontend', titleAr: 'الواجهة الأمامية', skills: [{ name: 'React.js' }, { name: 'Tailwind CSS' }, { name: 'JavaScript' }, { name: 'HTML5' }, { name: 'CSS3' }] },
  { titleEn: 'Backend & APIs', titleFr: 'Backend & APIs', titleAr: 'الواجهة الخلفية', skills: [{ name: 'Django' }, { name: 'Django REST Framework' }, { name: 'Python' }] },
  { titleEn: 'Databases', titleFr: 'Bases de données', titleAr: 'قواعد البيانات', skills: [{ name: 'PostgreSQL' }, { name: 'MySQL' }, { name: 'Neo4j' }] },
  { titleEn: 'Automation & AI', titleFr: 'Automatisation & IA', titleAr: 'الأتمتة والذكاء الاصطناعي', skills: [{ name: 'Python automation' }, { name: 'Web scraping' }, { name: 'AI integrations' }] },
];
const defaultTools = ['Git', 'GitHub', 'VS Code', 'Postman', 'Docker', 'Vercel', 'Linux', 'Figma'];

const STYLES = [
  { match: /front|ui|web/i, Icon: IconCode, tone: 'tone-green' },
  { match: /back|api|server/i, Icon: IconServer, tone: 'tone-gold' },
  { match: /data|base|sql/i, Icon: IconDatabase, tone: 'tone-orange' },
  { match: /auto|ai|ml|work ?flow/i, Icon: IconBolt, tone: 'tone-green' },
  { match: /tool|outil|أدوات/i, Icon: IconTool, tone: 'tone-cream' },
];
const pick = (title, i) => STYLES.find((s) => s.match.test(title || '')) || { Icon: IconLayers, tone: ['tone-green', 'tone-gold', 'tone-orange'][i % 3] };

export default function Skills({ language, skills: dbSkills }) {
  const toolsRow = (dbSkills ?? []).find((s) => s.isTools);
  const categories = (dbSkills ?? []).filter((s) => !s.isTools);
  const groups = [
    ...(categories.length ? categories : defaultCategories),
    {
      titleEn: toolsRow?.titleEn || 'Tools', titleFr: toolsRow?.titleFr || 'Outils', titleAr: toolsRow?.titleAr || 'الأدوات',
      skills: toolsRow ? toolsRow.skills : defaultTools.map((name) => ({ name })),
    },
  ];

  return (
    <section id="skills" className="section section--alt">
      <div className="container">
        <Reveal className="section-head section-head--split">
          <div>
            <span className="eyebrow"><IconCode size={14} /> {t(language, 'Expertise', 'Expertise', 'الخبرات')}</span>
            <h2 className="h-section">{t(language, 'Skills &', 'Compétences &', 'المهارات')} <em>{t(language, 'tools', 'outils', 'والأدوات')}</em></h2>
          </div>
          <p className="muted" style={{ maxWidth: '24rem' }}>
            {t(language,
              'The stack I use day to day — from interface to database to deployment.',
              "La stack que j'utilise au quotidien — de l'interface à la base de données jusqu'au déploiement.",
              'التقنيات التي أستخدمها يومياً — من الواجهة إلى قاعدة البيانات وحتى النشر.')}
          </p>
        </Reveal>

        <Stagger className="skill-grid">
          {groups.map((g, i) => {
            const { Icon, tone } = pick(g.titleEn, i);
            const list = (g.skills ?? []).filter((s) => s?.name);
            return (
              <Item key={i}>
                <div className="skill-card">
                  <div className="skill-card-head">
                    <span className={`cap-icon ${tone}`}><Icon size={20} /></span>
                    <div>
                      <h3>{t(language, g.titleEn, g.titleFr || undefined, g.titleAr || undefined)}</h3>
                      <small>{list.length} {t(language, 'technologies', 'technologies', 'تقنيات')}</small>
                    </div>
                  </div>
                  <div className="chips">
                    {list.map((s, j) => <span className="chip" key={j}><TechLogo name={s.name} />{s.name}</span>)}
                  </div>
                </div>
              </Item>
            );
          })}
        </Stagger>

        <Reveal className="cta-band">
          <div>
            <h3>{t(language, 'Have an idea?', 'Une idée ?', 'لديك فكرة؟')} <em>{t(language, "Let's build it.", 'Construisons-la.', 'لنبنِها معاً.')}</em></h3>
            <p>{t(language, 'Web app, automation or backend — from concept to launch.', 'Application web, automatisation ou backend — de l’idée au lancement.', 'تطبيق ويب أو أتمتة أو واجهة خلفية — من الفكرة إلى الإطلاق.')}</p>
          </div>
          <a href="#contact" className="btn btn-gold" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
            {t(language, 'Start a project', 'Démarrer un projet', 'ابدأ مشروعاً')} <IconArrow />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
