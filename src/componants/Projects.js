import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { t, PURPOSES, purposeLabel, purposeDetailLabel } from '../i18n';
import Reveal from './Reveal';
import ProjectReviews from './ProjectReviews';
import {
  Stars, TechLogo, IconGitHub, IconExternal, IconClose, IconChevron, IconPlay, IconEye,
  IconBriefcase, IconCap, IconHeart, IconGlobe, IconSparkle, IconCalendar, IconFolder, IconUser, IconPin,
} from './icons';

const isYouTube = (url) => !!url && /youtube\.com\/embed|youtu\.be|youtube\.com\/watch/.test(url);
function toEmbed(url) {
  if (!url) return url;
  const m = url.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
  return m && !url.includes('/embed/') ? `https://www.youtube.com/embed/${m[1]}` : url;
}

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);
const initialsOf = (title = '') =>
  title.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const PURPOSE_ICONS = { client: IconBriefcase, education: IconCap, personal: IconHeart, open_source: IconGlobe, other: IconSparkle };

function PurposeBadge({ purpose, language }) {
  const label = purposeLabel(language, purpose);
  if (!label) return null;
  const Icon = PURPOSE_ICONS[purpose] || IconSparkle;
  return <span className={`badge badge--${purpose}`}><Icon size={12} />{label}</span>;
}

function RatingInline({ avg, count, language }) {
  if (!count) {
    return <span className="rating-inline muted" style={{ fontWeight: 600 }}>{t(language, 'New', 'Nouveau', 'جديد')}</span>;
  }
  return (
    <span className="rating-inline">
      <Stars value={avg} size={13} />
      {avg.toFixed(1)} <span className="muted">({count})</span>
    </span>
  );
}

function CardMedia({ project, language }) {
  const img = project.thumbnail || project.images?.[0];
  const tags = (
    <div className="media-tags">
      <PurposeBadge purpose={project.purpose} language={language} />
      {project.videoUrl && <span className="media-tag"><IconPlay size={10} /> Video</span>}
    </div>
  );
  const overlay = (
    <div className="media-overlay"><span><IconEye size={16} /> {t(language, 'View project', 'Voir le projet', 'عرض المشروع')}</span></div>
  );
  if (img) {
    return <div className="project-media">{tags}<img src={img} alt="" loading="lazy" />{overlay}</div>;
  }
  if (project.videoUrl && !isYouTube(project.videoUrl)) {
    return <div className="project-media">{tags}<video src={project.videoUrl} muted autoPlay loop playsInline />{overlay}</div>;
  }
  return (
    <div className="project-media project-media--empty">
      {tags}<span className="initials">{initialsOf(project.title)}</span>{overlay}
    </div>
  );
}

function ModalMedia({ project }) {
  const images = project.images?.length ? project.images : (project.thumbnail ? [project.thumbnail] : []);
  const hasVideo = !!project.videoUrl;
  const [mode, setMode] = useState(hasVideo ? 'video' : 'image');
  const [idx, setIdx] = useState(0);
  if (!hasVideo && images.length === 0) return null;

  const showThumbs = (hasVideo && images.length > 0) || images.length > 1;

  return (
    <>
      <div className="modal-media">
        {mode === 'video' && hasVideo ? (
          isYouTube(project.videoUrl) ? (
            <iframe src={toEmbed(project.videoUrl)} title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <video src={project.videoUrl} controls playsInline />
          )
        ) : (
          <img src={images[idx]} alt={`${project.title} — ${idx + 1}`} />
        )}
        {mode === 'image' && images.length > 1 && (
          <>
            <button type="button" className="media-nav media-nav--prev" aria-label="Previous"
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}><IconChevron dir="left" /></button>
            <button type="button" className="media-nav media-nav--next" aria-label="Next"
              onClick={() => setIdx((i) => (i + 1) % images.length)}><IconChevron /></button>
          </>
        )}
      </div>
      {showThumbs && (
        <div className="thumbs">
          {hasVideo && (
            <button type="button" aria-pressed={mode === 'video'} onClick={() => setMode('video')} aria-label="Video">
              <IconPlay />
            </button>
          )}
          {images.map((src, i) => (
            <button type="button" key={i} aria-pressed={mode === 'image' && idx === i}
              onClick={() => { setMode('image'); setIdx(i); }}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function ProjectModal({ project, language, onClose, reviewsAutoApprove, onReviewSubmitted }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const facts = [
    project.purpose && { k: t(language, 'Built for', 'Réalisé pour', 'نوع المشروع'), v: purposeLabel(language, project.purpose), Icon: PURPOSE_ICONS[project.purpose] || IconSparkle },
    project.purposeDetail && { k: purposeDetailLabel(language, project.purpose), v: project.purposeDetail, Icon: project.purpose === 'client' ? IconUser : IconPin },
    project.year && { k: t(language, 'Year', 'Année', 'السنة'), v: project.year, Icon: IconCalendar },
    project.category && { k: t(language, 'Category', 'Catégorie', 'الفئة'), v: capitalize(project.category), Icon: IconFolder },
  ].filter(Boolean);

  return (
    <motion.div className="modal-overlay" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
        <div className="modal-head">
          <div>
            <div className="project-meta">
              <PurposeBadge purpose={project.purpose} language={language} />
              {project.category && <span className="meta-text">{capitalize(project.category)}</span>}
            </div>
            <h2 id="project-modal-title">{project.title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <div className="modal-scroll">
          <ModalMedia project={project} />
          <div className="modal-body">
            {facts.length > 0 && (
              <dl className="facts">
                {facts.map(({ k, v, Icon }) => (
                  <div key={k}><span className="f-icon"><Icon size={16} /></span><span><dt>{k}</dt><dd>{v}</dd></span></div>
                ))}
              </dl>
            )}

            <p className="modal-desc">{project.longDescription || project.description}</p>

            {project.technologies?.length > 0 && (
              <div className="chips" style={{ marginTop: '1.5rem' }}>
                {project.technologies.map((tech) => <span className="chip" key={tech}><TechLogo name={tech} />{tech}</span>)}
              </div>
            )}

            {(project.liveUrl || project.github) && (
              <div className="modal-links">
                {project.liveUrl && (
                  <a className="btn btn-primary btn-sm" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <IconExternal /> {t(language, 'Live demo', 'Démo en ligne', 'عرض مباشر')}
                  </a>
                )}
                {project.github && (
                  <a className="btn btn-ghost btn-sm" href={project.github} target="_blank" rel="noopener noreferrer">
                    <IconGitHub size={15} /> {t(language, 'Source code', 'Code source', 'الشيفرة المصدرية')}
                  </a>
                )}
              </div>
            )}

            <ProjectReviews project={project} language={language}
              autoApprove={reviewsAutoApprove} onSubmitted={onReviewSubmitted} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects({ language, projects: raw, reviewStats, reviewsAutoApprove, onReviewSubmitted }) {
  const [category, setCategory] = useState('all');
  const [purpose, setPurpose] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const projects = useMemo(() => (raw ?? []).map((p, i) => {
    const stats = reviewStats?.[p.id];
    return {
      ...p,
      _key: p.id ?? `p-${i}`,
      title: t(language, p.title, p.titleFr || undefined, p.titleAr || undefined),
      description: t(language, p.description, p.descriptionFr || undefined, p.descriptionAr || undefined),
      longDescription: t(language, p.longDescription, p.longDescriptionFr || undefined, p.longDescriptionAr || undefined),
      _cat: (p.category ?? '').trim().toLowerCase(),
      ratingAvg: stats?.avg ?? 0,
      ratingCount: stats?.count ?? 0,
    };
  }), [raw, language, reviewStats]);

  const categories = useMemo(() => {
    const seen = new Map();
    projects.forEach((p) => { if (p._cat && !seen.has(p._cat)) seen.set(p._cat, capitalize(p.category.trim())); });
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }, [projects]);

  const purposesPresent = useMemo(
    () => PURPOSES.filter((pp) => projects.some((p) => p.purpose === pp.id)),
    [projects],
  );

  useEffect(() => { if (category !== 'all' && !categories.some((c) => c.id === category)) setCategory('all'); }, [categories, category]);
  useEffect(() => { if (purpose !== 'all' && !purposesPresent.some((p) => p.id === purpose)) setPurpose('all'); }, [purposesPresent, purpose]);

  const filtered = projects.filter((p) =>
    (category === 'all' || p._cat === category) && (purpose === 'all' || p.purpose === purpose));

  const selected = projects.find((p) => p._key === selectedId) || null;

  const open = (p) => setSelectedId(p._key);
  const close = useCallback(() => setSelectedId(null), []);
  const onCardKey = (e, p) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); } };

  return (
    <section id="projects" className="section">
      <div className="container">
        <Reveal className="section-head section-head--split">
          <div>
            <span className="eyebrow"><IconFolder size={14} /> {t(language, 'Portfolio', 'Réalisations', 'أعمالي')}</span>
            <h2 className="h-section">{t(language, 'Selected', 'Projets', 'مشاريع')} <em>{t(language, 'projects', 'sélectionnés', 'مختارة')}</em></h2>
          </div>

          <div className="filters">
            {categories.length > 1 && (
              <div className="seg" role="group" aria-label={t(language, 'Category', 'Catégorie', 'الفئة')}>
                {[{ id: 'all', label: t(language, 'All', 'Tous', 'الكل') }, ...categories].map((c) => (
                  <button type="button" key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
                    {category === c.id && <motion.span layoutId="seg-pill" className="seg-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
            {purposesPresent.length > 1 && (
              <select className="select" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                aria-label={t(language, 'Built for', 'Réalisé pour', 'نوع المشروع')}>
                <option value="all">{t(language, 'Any purpose', 'Tous les contextes', 'كل الأنواع')}</option>
                {purposesPresent.map((p) => (
                  <option key={p.id} value={p.id}>{purposeLabel(language, p.id)}</option>
                ))}
              </select>
            )}
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          <div className="empty-state">{t(language, 'No projects match these filters.', 'Aucun projet ne correspond à ces filtres.', 'لا توجد مشاريع مطابقة.')}</div>
        ) : (
          <motion.div layout className="project-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div layout key={p._key}
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                  <div className="project-card" role="button" tabIndex={0}
                    onClick={() => open(p)} onKeyDown={(e) => onCardKey(e, p)}
                    aria-label={`${p.title} — ${t(language, 'view details', 'voir les détails', 'عرض التفاصيل')}`}>
                    <CardMedia project={p} language={language} />
                    <div className="project-body">
                      <div className="project-meta">
                        {p.category && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><IconFolder size={13} />{capitalize(p.category)}</span>}
                        {p.year && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><IconCalendar size={13} />{p.year}</span>}
                        {p.purpose === 'client' && p.purposeDetail && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><IconUser size={13} />{p.purposeDetail}</span>}
                      </div>
                      <h3 className="project-title">{p.title}</h3>
                      {p.description && <p className="project-desc">{p.description}</p>}
                      {p.technologies?.length > 0 && (
                        <div className="chips">
                          {p.technologies.slice(0, 3).map((tech) => <span className="chip chip-sm" key={tech}><TechLogo name={tech} />{tech}</span>)}
                          {p.technologies.length > 3 && <span className="chip chip-sm">+{p.technologies.length - 3}</span>}
                        </div>
                      )}
                      <div className="project-foot">
                        <RatingInline avg={p.ratingAvg} count={p.ratingCount} language={language} />
                        <div className="foot-links" onClick={(e) => e.stopPropagation()}>
                          {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" aria-label="Live demo"><IconExternal size={14} /></a>}
                          {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><IconGitHub size={14} /></a>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <ProjectModal key={selected._key} project={selected} language={language}
            onClose={close}
            reviewsAutoApprove={reviewsAutoApprove}
            onReviewSubmitted={onReviewSubmitted} />
        )}
      </AnimatePresence>
    </section>
  );
}
