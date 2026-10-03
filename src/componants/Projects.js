import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState, useMemo } from 'react';
import { FaGithub, FaTimes, FaPlay, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { C } from '../theme';
import { t } from '../i18n';


const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ── Detect whether a videoUrl is a YouTube embed or a raw mp4 ──
function isYouTube(url) {
  return url && (url.includes('youtube.com/embed') || url.includes('youtu.be'));
}

// ── Image carousel used inside the modal ──
function ImageCarousel({ images }) {
  const [active, setActive] = useState(0);
  if (!images || images.length === 0) return null;

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div style={{ position: 'relative', background: '#000', flexShrink: 0 }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={active}
          src={images[active]}
          alt={`screenshot-${active}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block', background: '#000' }}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          {/* Prev */}
          <button onClick={prev} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(12,12,10,0.75)', border: `1px solid ${C.border}`,
            color: C.textSub, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = C.onAccent; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(12,12,10,0.75)'; e.currentTarget.style.color = C.textSub; }}>
            <FaChevronLeft size={12} />
          </button>
          {/* Next */}
          <button onClick={next} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(12,12,10,0.75)', border: `1px solid ${C.border}`,
            color: C.textSub, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = C.onAccent; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(12,12,10,0.75)'; e.currentTarget.style.color = C.textSub; }}>
            <FaChevronRight size={12} />
          </button>
          {/* Dots */}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                width: i === active ? 20 : 6, height: 6, borderRadius: 3,
                background: i === active ? C.accent : 'rgba(255,255,255,0.3)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Thumbnail strip shown below the video in the modal ──
function ThumbnailStrip({ images, videoUrl, onSelectImage, onSelectVideo, activeType }) {
  if (!images?.length && !videoUrl) return null;
  return (
    <div style={{ display: 'flex', gap: 8, padding: '10px 16px', background: C.bg, overflowX: 'auto', flexShrink: 0 }}>
      {videoUrl && (
        <button onClick={onSelectVideo} style={{
          width: 72, height: 48, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
          border: `2px solid ${activeType === 'video' ? C.accent : C.border}`,
          background: '#000', cursor: 'pointer', position: 'relative', padding: 0,
          transition: 'border-color 0.2s',
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaPlay size={14} color={C.accent} />
          </div>
        </button>
      )}
      {(images ?? []).map((img, i) => (
        <button key={i} onClick={() => onSelectImage(i)} style={{
          width: 72, height: 48, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
          border: `2px solid ${activeType === 'image' && onSelectImage._activeIdx === i ? C.accent : C.border}`,
          cursor: 'pointer', padding: 0, transition: 'border-color 0.2s',
        }}>
          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      ))}
    </div>
  );
}

// ── Modal media section: shows video OR image carousel depending on selection ──
function ModalMedia({ project }) {
  const hasVideo  = !!project.videoUrl;
  const hasImages = project.images && project.images.length > 0;
  const [mode, setMode] = useState(hasVideo ? 'video' : 'image');
  const [imgIdx, setImgIdx] = useState(0);

  if (!hasVideo && !hasImages) return null;

  const handleSelectImage = (i) => { setMode('image'); setImgIdx(i); };
  // Attach active index so ThumbnailStrip can highlight the right thumb
  handleSelectImage._activeIdx = imgIdx;

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Main media display */}
      <div style={{ background: '#000', maxHeight: 360, overflow: 'hidden', position: 'relative' }}>
        {mode === 'video' && hasVideo ? (
          isYouTube(project.videoUrl) ? (
            <iframe
              src={project.videoUrl}
              title="project-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: 360, border: 'none', display: 'block' }}
            />
          ) : (
            <video
              src={project.videoUrl}
              controls
              autoPlay
              muted
              loop
              style={{ width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block' }}
            />
          )
        ) : hasImages ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={project.images[imgIdx]}
              alt={`screenshot-${imgIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block' }}
            />
          </AnimatePresence>
        ) : null}

        {/* Image prev/next arrows when in image mode */}
        {mode === 'image' && hasImages && project.images.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx((i) => (i - 1 + project.images.length) % project.images.length)}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(12,12,10,0.8)', border: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = C.onAccent; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(12,12,10,0.8)'; e.currentTarget.style.color = C.textSub; }}>
              <FaChevronLeft size={11} />
            </button>
            <button
              onClick={() => setImgIdx((i) => (i + 1) % project.images.length)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(12,12,10,0.8)', border: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = C.onAccent; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(12,12,10,0.8)'; e.currentTarget.style.color = C.textSub; }}>
              <FaChevronRight size={11} />
            </button>
            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
              {project.images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 18 : 6, height: 6, borderRadius: 3, background: i === imgIdx ? C.accent : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip — only show if there's more than one media item */}
      {(hasVideo && hasImages) || (hasImages && project.images.length > 1) ? (
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: 'rgba(0,0,0,0.5)', overflowX: 'auto', borderTop: `1px solid ${C.border}` }}>
          {hasVideo && (
            <button onClick={() => setMode('video')} style={{
              width: 68, height: 44, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
              border: `2px solid ${mode === 'video' ? C.accent : C.border}`,
              background: '#111', cursor: 'pointer', position: 'relative', padding: 0, transition: 'border-color 0.2s',
            }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaPlay size={12} color={mode === 'video' ? C.accent : C.textMuted} />
              </div>
            </button>
          )}
          {hasImages && project.images.map((img, i) => (
            <button key={i} onClick={() => { setMode('image'); setImgIdx(i); }} style={{
              width: 68, height: 44, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
              border: `2px solid ${mode === 'image' && imgIdx === i ? C.accent : C.border}`,
              cursor: 'pointer', padding: 0, transition: 'border-color 0.2s',
            }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Projects({ language, projects: rawProjects }) {
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => { if (inView) controls.start('visible'); }, [controls, inView]);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedProject]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelectedProject(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const projects = useMemo(() => (rawProjects ?? []).map((p, idx) => ({
    ...p,
    // A guaranteed-stable, unique key regardless of whether the DB row has an id.
    _key: p.id ?? `project-${idx}`,
    title:           t(language, p.title,           p.titleFr           ?? p.title,           p.titleAr           ?? p.title),
    description:     t(language, p.description,     p.descriptionFr     ?? p.description,     p.descriptionAr     ?? p.description),
    longDescription: t(language, p.longDescription, p.longDescriptionFr ?? p.longDescription, p.longDescriptionAr ?? p.longDescription),
    // Normalized category used only for matching against the filter — keeps
    // "Web", "web", " web " etc. all grouped under the same filter button.
    _categoryKey: (p.category ?? '').trim().toLowerCase(),
  })), [rawProjects, language]);

  // Category buttons are always derived from the FULL project list (not the
  // currently-filtered one), so they never disappear once a filter is active,
  // and "All" always resets back to showing every project.
  const categories = useMemo(() => {
    const seen = new Map(); // normalized key -> display label
    projects.forEach((p) => {
      if (p._categoryKey && !seen.has(p._categoryKey)) {
        const raw = (p.category ?? '').trim();
        seen.set(p._categoryKey, raw.charAt(0).toUpperCase() + raw.slice(1));
      }
    });
    return [
      { id: 'all', label: t(language, 'All', 'Tous', 'الكل') },
      ...Array.from(seen.entries()).map(([id, label]) => ({ id, label })),
    ];
  }, [projects, language]);

  // Reset back to "all" if the currently-active filter no longer exists
  // (e.g. the last project in that category was deleted from the CMS) —
  // this is what previously could leave the grid looking empty.
  useEffect(() => {
    if (filter !== 'all' && !categories.some((c) => c.id === filter)) {
      setFilter('all');
    }
  }, [categories, filter]);

  const filtered = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p._categoryKey === filter)),
    [projects, filter]
  );

  return (
    <>
      <motion.section
        id="projects"
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={stagger}
        style={{ padding: '7rem 2rem', background: C.bgCard, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: C.border }} />

        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

          {/* Header */}
          <motion.div variants={fadeUp} style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {t(language, 'Work', 'Travaux', 'أعمالي')}
                </span>
                <div style={{ height: 1, width: 48, background: C.border }} />
              </div>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 400, color: C.text, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {t(language, 'Selected Projects', 'Projets Sélectionnés', 'مشاريع مختارة')}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                  padding: '0.45rem 1rem', borderRadius: '5px', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.04em',
                  border: `1px solid ${filter === cat.id ? C.borderAcc : C.border}`,
                  background: filter === cat.id ? C.accentDim : 'transparent',
                  color: filter === cat.id ? C.accent : C.textMuted,
                  transition: 'all 0.2s',
                }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Project grid — real gaps + individually-styled cards so each
              project reads as its own distinct box instead of a shared table */}
          <div style={{ display: 'grid', gap: '1.75rem' }}
            className="grid md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => {
                const cardMedia = project.videoUrl && !isYouTube(project.videoUrl)
                  ? 'video'
                  : project.thumbnail
                  ? 'image'
                  : null;

                // Alternate entrance direction by column (3-col grid on desktop):
                // left column slides from the left, right column from the right,
                // middle column simply rises — gives the grid a bit of life
                // both on first scroll-in and when the filter changes.
                const col = i % 3;
                const fromX = col === 0 ? -40 : col === 2 ? 40 : 0;

                return (
                  <motion.div
                    key={project._key}
                    initial={{ opacity: 0, y: 16, x: fromX }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{
                      y: -8,
                      borderColor: C.borderAcc,
                      boxShadow: `0 24px 48px -12px rgba(0,0,0,0.55), 0 0 0 1px ${C.borderAcc}, 0 0 42px 6px ${C.accentDim}`,
                    }}
                    style={{
                      background: C.bgCard2,
                      border: `1px solid ${C.border}`,
                      borderRadius: '14px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 8px 24px -8px rgba(0,0,0,0.4)',
                      transition: 'border-color 0.3s, box-shadow 0.3s',
                      position: 'relative',
                    }}
                  >
                    {/* Thin accent line along the top — echoes the Skills/About cards */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`, opacity: 0.7 }} />

                    {/* Card media — thumbnail or muted autoplay video */}
                  {cardMedia === 'video' && (
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                      <video src={project.videoUrl} muted autoPlay loop playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                    </div>
                  )}
                  {cardMedia === 'image' && (
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#000', flexShrink: 0, position: 'relative' }}>
                      <img src={project.thumbnail} alt={project.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, transition: 'opacity 0.3s, transform 0.5s' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                      {/* Play badge if there's also a video */}
                      {project.videoUrl && (
                        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(12,12,10,0.75)', border: `1px solid ${C.borderAcc}`, borderRadius: 4, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(4px)' }}>
                          <FaPlay size={8} color={C.accent} />
                          <span style={{ color: C.accent, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em' }}>VIDEO</span>
                        </div>
                      )}
                      {/* Image count badge */}
                      {project.images && project.images.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(12,12,10,0.75)', border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
                          <span style={{ color: C.textSub, fontSize: '0.65rem', fontWeight: 600 }}>
                            {project.images.length} photos
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card body */}
                  <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.65rem' }}>
                        <span style={{ color: C.accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>{project.index ?? String(i + 1).padStart(2, '0')}</span>
                        <span style={{ color: C.textMuted, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{project.category}</span>
                      </div>
                      <h3 style={{ color: C.text, fontWeight: 600, fontSize: '1rem', margin: '0 0 0.6rem', lineHeight: 1.35 }}>{project.title}</h3>
                      <p style={{ color: C.textMuted, fontSize: '0.85rem', lineHeight: 1.8, margin: '0 0 1rem' }}>{project.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {(project.technologies ?? []).map((tech, ti) => (
                          <span key={ti} style={{ padding: '0.25rem 0.7rem', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '4px', color: C.textMuted, fontSize: '0.75rem' }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer"
                          style={{ width: 34, height: 34, borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, textDecoration: 'none', transition: 'all 0.2s', title: 'View on GitHub' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderAcc; e.currentTarget.style.color = C.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}>
                          <FaGithub size={15} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                          style={{ width: 34, height: 34, borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, textDecoration: 'none', transition: 'all 0.2s', title: 'Live Preview' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderAcc; e.currentTarget.style.color = C.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                        </a>
                      )}
                      <button onClick={() => setSelectedProject(project)}
                        style={{ padding: '0.5rem 1.1rem', borderRadius: '5px', border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderAcc; e.currentTarget.style.color = C.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        {t(language, 'View details', 'Voir détails', 'عرض التفاصيل')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <motion.div variants={fadeUp} style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", color: C.text, fontWeight: 400, fontSize: '1.6rem', margin: '0 0 0.4rem' }}>
                {t(language, 'Have a project in mind?', 'Vous avez un projet ?', 'لديك مشروع في ذهنك؟')}
              </h3>
              <p style={{ color: C.textMuted, margin: 0, fontSize: '0.9rem' }}>
                {t(language, "Let's collaborate — concept to deployment.", 'Collaborons — de la conception au déploiement.', 'لنتعاون معًا — من الفكرة إلى الإطلاق.')}
              </p>
            </div>
            <motion.a href="#contact" onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ padding: '0.9rem 2rem', background: C.accent, color: C.onAccent, fontWeight: 700, fontSize: '0.88rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.04em' }}
              whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}>
              {t(language, "Let's talk", 'Discutons', 'لنتحدث')}
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', width: '100%', maxWidth: '56rem', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ padding: '1.25rem 1.75rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <p style={{ color: C.accent, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.25rem', fontWeight: 600 }}>
                    {selectedProject.index} — {selectedProject.category}
                  </p>
                  <h2 style={{ color: C.text, fontWeight: 600, fontSize: '1.05rem', margin: 0 }}>{selectedProject.title}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)}
                  style={{ width: 34, height: 34, borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Media section */}
              <ModalMedia project={selectedProject} />

              {/* Body */}
              <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
                <p style={{ color: C.textSub, lineHeight: 1.9, fontSize: '0.92rem', margin: '0 0 1.5rem' }}>
                  {selectedProject.longDescription}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(selectedProject.technologies ?? []).map((tech, i) => (
                    <span key={i} style={{ padding: '0.3rem 0.85rem', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '4px', color: C.textMuted, fontSize: '0.78rem' }}>{tech}</span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              {selectedProject.github && (
                <div style={{ padding: '1.1rem 1.75rem', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <a href={selectedProject.github} target="_blank" rel="noopener noreferrer"
                    style={{ padding: '0.65rem 1.4rem', background: C.accent, color: C.onAccent, fontWeight: 700, fontSize: '0.82rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaGithub size={13} /> View on GitHub
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Projects;