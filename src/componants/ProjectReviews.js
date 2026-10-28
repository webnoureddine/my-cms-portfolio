import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { t } from '../i18n';
import { Star, Stars, IconChat, IconSend, IconCheck } from './icons';

const AVATAR_TONES = [['#1F4A38', '#E9B949'], ['#E9B949', '#1D1B14'], ['#D9692B', '#F6EBCF'], ['#275C46', '#F6EBCF']];
function Avatar({ name = '?' }) {
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [bg, fg] = AVATAR_TONES[code % AVATAR_TONES.length];
  const ini = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return <span className="avatar" style={{ background: bg, color: fg }}>{ini}</span>;
}

const NAME_MAX = 80;
const COMMENT_MAX = 1000;

function storageGet(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* private mode etc. */ }
}

function StarInput({ value, onChange, language }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="star-input" role="radiogroup" aria-label={t(language, 'Rating', 'Note', 'التقييم')}
      onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n}
          aria-label={`${n} / 5`} className={n <= shown ? 'on' : ''}
          onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>
          <Star size={26} fill={1} />
        </button>
      ))}
    </div>
  );
}

/**
 * Comments + star ratings for one project.
 * Visitors can post; only approved reviews are readable (enforced by RLS).
 * Whether new reviews go live immediately is controlled from the admin panel
 * (settings.reviews_auto_approve) and enforced by a DB trigger.
 */
export default function ProjectReviews({ project, language, autoApprove, onSubmitted }) {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | unavailable
  const [form, setForm] = useState({ name: '', comment: '', website: '' });
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);
  const storageKey = `reviewed:${project.id}`;
  const [alreadyReviewed, setAlreadyReviewed] = useState(() => !!storageGet(storageKey));

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('project_reviews')
      .select('id, name, rating, comment, created_at')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) { setStatus('unavailable'); return; }
    setReviews(data ?? []);
    setStatus('ready');
  }, [project.id]);

  useEffect(() => { load(); }, [load]);

  if (status === 'unavailable') return null;

  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  const submit = async (e) => {
    e.preventDefault();
    setNotice(null);
    if (form.website) return; // honeypot filled → bot
    if (!rating) {
      setNotice({ kind: 'err', text: t(language, 'Please choose a star rating.', 'Veuillez choisir une note.', 'يرجى اختيار عدد النجوم.') });
      return;
    }
    setSending(true);
    const { error } = await supabase.from('project_reviews').insert({
      project_id: project.id,
      name: form.name.trim().slice(0, NAME_MAX),
      rating,
      comment: form.comment.trim().slice(0, COMMENT_MAX) || null,
    });
    setSending(false);
    if (error) {
      setNotice({ kind: 'err', text: t(language, 'Could not send your review — please try again.', "Impossible d'envoyer votre avis — réessayez.", 'تعذّر إرسال تقييمك — حاول مرة أخرى.') });
      return;
    }
    storageSet(storageKey, '1');
    setAlreadyReviewed(true);
    setForm({ name: '', comment: '', website: '' });
    setRating(0);
    setNotice({
      kind: 'ok',
      text: autoApprove
        ? t(language, 'Thank you — your review is live.', 'Merci — votre avis est publié.', 'شكراً — تم نشر تقييمك.')
        : t(language, 'Thank you — your review will appear once approved.', 'Merci — votre avis apparaîtra après validation.', 'شكراً — سيظهر تقييمك بعد الموافقة عليه.'),
    });
    if (autoApprove) load();
    onSubmitted?.();
  };

  const dateFmt = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(language === 'ar' ? 'ar' : language, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <section className="reviews" aria-labelledby={`reviews-${project.id}`}>
      <div className="reviews-head">
        <h3 id={`reviews-${project.id}`}><IconChat size={20} /> {t(language, 'Reviews', 'Avis', 'التقييمات')}</h3>
        {count > 0 && (
          <div className="reviews-summary">
            <span className="reviews-avg">{avg.toFixed(1)}</span>
            <Stars value={avg} size={17} />
            <span className="muted" style={{ fontSize: '0.88rem' }}>
              ({count} {count === 1 ? t(language, 'review', 'avis', 'تقييم') : t(language, 'reviews', 'avis', 'تقييمات')})
            </span>
          </div>
        )}
      </div>

      {status === 'loading' && <p className="muted" style={{ marginBottom: '1.25rem' }}>…</p>}

      {status === 'ready' && count === 0 && (
        <p className="muted" style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          {t(language, 'No reviews yet — be the first to share your thoughts.', 'Pas encore d’avis — soyez le premier à donner le vôtre.', 'لا توجد تقييمات بعد — كن أول من يشارك رأيه.')}
        </p>
      )}

      {count > 0 && (
        <div className="review-list">
          {reviews.map((r) => (
            <article className="review" key={r.id}>
              <Avatar name={r.name} />
              <div className="review-main">
              <div className="review-top">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="review-name">{r.name}</span>
                  <Stars value={r.rating} size={13} />
                </span>
                <span className="review-date">{dateFmt(r.created_at)}</span>
              </div>
              {r.comment && <p>{r.comment}</p>}
              </div>
            </article>
          ))}
        </div>
      )}

      {notice && <div className={`notice notice--${notice.kind}`}>{notice.kind === 'ok' && <IconCheck size={16} />}{notice.text}</div>}

      {!alreadyReviewed ? (
        <form className="review-form" onSubmit={submit}>
          <h4><Star size={18} fill={1} /> {t(language, 'Leave a review', 'Laisser un avis', 'اترك تقييماً')}</h4>
          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="field">
              <label htmlFor={`rv-name-${project.id}`}>{t(language, 'Your name', 'Votre nom', 'اسمك')}</label>
              <input id={`rv-name-${project.id}`} className="input" required maxLength={NAME_MAX}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>{t(language, 'Rating', 'Note', 'التقييم')}</label>
              <StarInput value={rating} onChange={setRating} language={language} />
            </div>
          </div>
          <div className="field" style={{ marginBottom: '1rem' }}>
            <label htmlFor={`rv-comment-${project.id}`}>
              {t(language, 'Comment', 'Commentaire', 'التعليق')} <span className="muted" style={{ fontWeight: 400 }}>({t(language, 'optional', 'facultatif', 'اختياري')})</span>
            </label>
            <textarea id={`rv-comment-${project.id}`} className="input" maxLength={COMMENT_MAX} rows={4}
              value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder={t(language, 'What did you think of this project?', 'Qu’avez-vous pensé de ce projet ?', 'ما رأيك في هذا المشروع؟')} />
          </div>
          {/* Honeypot — hidden from people, bots tend to fill it */}
          <div className="hp" aria-hidden="true">
            <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>
          </div>
          <button type="submit" className="btn btn-gold" disabled={sending}>
            {sending ? t(language, 'Sending…', 'Envoi…', 'جارٍ الإرسال…') : t(language, 'Post review', 'Publier l’avis', 'نشر التقييم')} <IconSend size={15} />
          </button>
        </form>
      ) : !notice && (
        <p className="muted" style={{ fontSize: '0.9rem' }}>
          {t(language, 'Thanks — you have already reviewed this project.', 'Merci — vous avez déjà donné votre avis sur ce projet.', 'شكراً — لقد قيّمت هذا المشروع من قبل.')}
        </p>
      )}
    </section>
  );
}
