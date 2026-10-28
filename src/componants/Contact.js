import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { t } from '../i18n';
import Reveal from './Reveal';
import { IconMail, IconPhone, IconPin, IconLinkedIn, IconGitHub, IconChat, IconSend, IconArrowUp, IconCheck } from './icons';

export default function Contact({ language, settings }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  const details = [
    settings?.email && { icon: <IconMail />, label: t(language, 'Email', 'E-mail', 'البريد الإلكتروني'), value: settings.email, href: `mailto:${settings.email}` },
    settings?.phone && { icon: <IconPhone />, label: t(language, 'Phone', 'Téléphone', 'الهاتف'), value: settings.phone, href: `tel:${settings.phone.replace(/[^\d+]/g, '')}` },
    settings?.location && { icon: <IconPin />, label: t(language, 'Location', 'Localisation', 'الموقع'), value: settings.location },
    settings?.linkedin && { icon: <IconLinkedIn />, label: 'LinkedIn', value: settings.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: settings.linkedin, external: true },
    settings?.github && { icon: <IconGitHub />, label: 'GitHub', value: settings.github.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: settings.github, external: true },
  ].filter(Boolean);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setNotice(null);
    const { error } = await supabase.from('messages').insert(form);
    setSending(false);
    if (error) {
      setNotice({ kind: 'err', text: t(language, 'Could not send — please try again.', "Échec de l'envoi — veuillez réessayer.", 'تعذّر الإرسال — يرجى المحاولة مرة أخرى.') });
      return;
    }
    setForm({ name: '', email: '', subject: '', message: '' });
    setNotice({ kind: 'ok', text: t(language, "Thanks — your message has been sent. I'll reply soon.", 'Merci — votre message a bien été envoyé. Je vous réponds rapidement.', 'شكراً — تم إرسال رسالتك وسأرد عليك قريباً.') });
  };

  const year = new Date().getFullYear();

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-grid">
          <Reveal>
            <span className="eyebrow"><IconChat size={14} /> {t(language, 'Contact', 'Contact', 'تواصل')}</span>
            <h2 className="h-section">{t(language, "Let's work", 'Travaillons', 'لنعمل')} <em style={{ color: 'var(--butter)' }}>{t(language, 'together.', 'ensemble.', 'معاً.')}</em></h2>
            <p className="lead">
              {t(language,
                'Have a project, a role or an idea in mind? Send me a message and I will get back to you within a day.',
                'Un projet, un poste ou une idée ? Envoyez-moi un message, je vous réponds sous 24 heures.',
                'لديك مشروع أو فرصة عمل أو فكرة؟ أرسل لي رسالة وسأرد عليك خلال يوم واحد.')}
            </p>

            <div className="contact-list">
              {details.map((d) => {
                const inner = (
                  <>
                    <span className="contact-icon">{d.icon}</span>
                    <span>
                      <span className="contact-label">{d.label}</span>
                      <span className="contact-value" dir={d.href?.startsWith('tel:') || d.href?.startsWith('mailto:') ? 'ltr' : undefined}>{d.value}</span>
                    </span>
                  </>
                );
                return d.href ? (
                  <a key={d.label} className="contact-item" href={d.href}
                    target={d.external ? '_blank' : undefined} rel={d.external ? 'noopener noreferrer' : undefined}>{inner}</a>
                ) : (
                  <div key={d.label} className="contact-item">{inner}</div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="form-wrap">
            <form className="form-card" onSubmit={onSubmit}>
              <h3><IconSend size={20} /> {t(language, 'Send a message', 'Envoyer un message', 'أرسل رسالة')}</h3>
              {notice && <div className={`notice notice--${notice.kind}`}>{notice.kind === 'ok' && <IconCheck size={16} />}{notice.text}</div>}
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="c-name">{t(language, 'Name', 'Nom', 'الاسم')}</label>
                  <input id="c-name" name="name" className="input" required value={form.name} onChange={onChange} />
                </div>
                <div className="field">
                  <label htmlFor="c-email">{t(language, 'Email', 'E-mail', 'البريد الإلكتروني')}</label>
                  <input id="c-email" name="email" type="email" className="input" required value={form.email} onChange={onChange} dir="ltr" />
                </div>
                <div className="field span-2">
                  <label htmlFor="c-subject">{t(language, 'Subject', 'Sujet', 'الموضوع')}</label>
                  <input id="c-subject" name="subject" className="input" required value={form.subject} onChange={onChange} />
                </div>
                <div className="field span-2">
                  <label htmlFor="c-message">{t(language, 'Message', 'Message', 'الرسالة')}</label>
                  <textarea id="c-message" name="message" className="input" rows={6} required value={form.message} onChange={onChange}
                    placeholder={t(language, 'Tell me a little about your project…', 'Parlez-moi un peu de votre projet…', 'أخبرني قليلاً عن مشروعك…')} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending} style={{ marginTop: '1.25rem', width: '100%' }}>
                {sending ? t(language, 'Sending…', 'Envoi…', 'جارٍ الإرسال…') : t(language, 'Send message', 'Envoyer le message', 'إرسال الرسالة')} <IconSend size={16} />
              </button>
            </form>
            </div>
          </Reveal>
        </div>

        <footer className="footer">
          <span>© {year} {settings?.displayName || 'Portfolio'}</span>
          <span className="footer-links">
            {settings?.github && <a className="icon-btn" href={settings.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><IconGitHub /></a>}
            {settings?.linkedin && <a className="icon-btn" href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><IconLinkedIn /></a>}
            {settings?.email && <a className="icon-btn" href={`mailto:${settings.email}`} aria-label="Email"><IconMail size={17} /></a>}
            <a className="icon-btn" href="#home" aria-label={t(language, 'Back to top', 'Haut de page', 'إلى الأعلى')}
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'var(--gold)', color: 'var(--ink)', borderColor: 'var(--gold)' }}><IconArrowUp size={17} /></a>
          </span>
        </footer>
      </div>
    </section>
  );
}
