import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
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

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: '6px',
  color: C.text,
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
};

const labelStyle = {
  display: 'block',
  color: C.textMuted,
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.5rem',
};

const EmailIcon = (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);
const LocationIcon = (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);
const LinkedInIcon = (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const GitHubIcon = (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.5 11.5 0 0112 5.803c1.02.005 2.045.138 3.003.404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

function Contact({ language, settings }) {
  const contactDetails = [
    {
      icon: EmailIcon,
      labelEn: 'Email',
      labelFr: 'Email',
      labelAr: 'البريد الإلكتروني',
      value: settings?.email || 'contact@example.com',
      link: settings?.email ? `mailto:${settings.email}` : '#',
    },
    {
      icon: LocationIcon,
      labelEn: 'Location',
      labelFr: 'Localisation',
      labelAr: 'الموقع',
      value: settings?.location || '—',
      link: '#',
    },
    ...(settings?.linkedin ? [{
      icon: LinkedInIcon,
      labelEn: 'LinkedIn',
      labelFr: 'LinkedIn',
      labelAr: 'LinkedIn',
      value: 'LinkedIn',
      link: settings.linkedin,
    }] : []),
    ...(settings?.github ? [{
      icon: GitHubIcon,
      labelEn: 'GitHub',
      labelFr: 'GitHub',
      labelAr: 'GitHub',
      value: 'GitHub',
      link: settings.github,
    }] : []),
  ];

  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const [sendError, setSendError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSendError('');
    const { error } = await supabase.from('messages').insert({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });
    setIsSubmitting(false);
    if (error) {
      setSendError(t(language, 'Could not send — please try again.', "Échec de l'envoi — veuillez réessayer.", 'تعذّر الإرسال — يرجى المحاولة مرة أخرى.'));
      return;
    }
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const fieldStyle = (name) => ({
    ...inputStyle,
    borderColor: focusedField === name ? C.borderFocus : C.border,
  });

  return (
    <motion.section
      id="contact"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={stagger}
      style={{
        padding: '7rem 2rem 5rem',
        background: C.bg,
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: C.border }} />

      <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <motion.div variants={fadeUp} style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <span style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {t(language, 'Contact', 'Contact', 'تواصل')}
            </span>
            <div style={{ height: 1, width: 48, background: C.border }} />
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 400, color: C.text, margin: '0 0 1.5rem',
            lineHeight: 1.05, letterSpacing: '-0.02em',
          }}>
            {language === 'ar' ? (
              <><em style={{ color: C.accent }}>لنبنِ</em><br />شيئًا عظيمًا معًا</>
            ) : language === 'fr' ? (
              <>Construisons<br /><em style={{ color: C.accent }}>quelque chose</em></>
            ) : (
              <>Let's build<br /><em style={{ color: C.accent }}>something great</em></>
            )}
          </h2>
          <p style={{ color: C.textMuted, fontSize: '1rem', maxWidth: '36rem', lineHeight: 1.9, margin: 0 }}>
            {t(language,
              "Have a project in mind? A collaboration idea? Or just want to say hello? Drop me a message.",
              "Vous avez un projet ? Une idée de collaboration ? Ou juste envie de discuter ? Écrivez-moi.",
              "لديك مشروع في ذهنك؟ فكرة تعاون؟ أو فقط تريد إلقاء التحية؟ أرسل لي رسالة.")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">

          {/* Left: Info */}
          <motion.div variants={fadeUp}>

            {/* Contact details */}
            <div style={{ marginBottom: '3rem' }}>
              {contactDetails.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target={item.link.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem 0',
                    borderBottom: `1px solid ${C.border}`,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.paddingLeft = '8px'}
                  onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '6px',
                    border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: C.textMuted, flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ color: C.textMuted, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 0.2rem', fontWeight: 600 }}>
                      {t(language, item.labelEn, item.labelFr, item.labelAr)}
                    </p>
                    <p style={{ color: C.textSub, fontSize: '0.9rem', margin: 0 }}>{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Availability card */}
            <div style={{
              padding: '1.75rem',
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              background: C.bgCard,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.accent }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ color: C.success, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {t(language, 'Available now', 'Disponible maintenant', 'متاح الآن')}
                </span>
              </div>
              <p style={{ color: C.textMuted, fontSize: '0.88rem', lineHeight: 1.75, margin: 0 }}>
                {t(language,
                  'Open to new projects, freelance work, and full-time opportunities. I typically respond within 24 hours.',
                  "Ouvert aux nouveaux projets, travail freelance et opportunités temps plein. Je réponds généralement sous 24h.",
                  'منفتح على مشاريع جديدة وأعمال حرة وفرص عمل بدوام كامل. أستجيب عادة خلال 24 ساعة.')}
              </p>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div variants={fadeUp}>
            <div style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              padding: '2.5rem',
            }}>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(74,222,128,0.08)',
                    border: '1px solid rgba(74,222,128,0.2)',
                    borderRadius: '6px',
                    color: C.success,
                    marginBottom: '1.75rem',
                    fontSize: '0.88rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  {t(language, "Message sent — I'll be in touch!", 'Message envoyé — je vous contacte bientôt !', 'تم إرسال الرسالة — سأتواصل معك قريبًا!')}
                </motion.div>
              )}

              {sendError && (
                <div style={{ padding: '0.85rem 1.1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: C.danger, marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  {sendError}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                <div style={{ display: 'grid', gap: '1.4rem' }} className="grid md:grid-cols-2">
                  <div>
                    <label style={labelStyle}>{t(language, 'Name', 'Nom', 'الاسم')}</label>
                    <input
                      type="text" name="name" value={formData.name}
                      onChange={handleChange} required
                      placeholder={t(language, 'Your name', 'Votre nom', 'اسمك')}
                      style={fieldStyle('name')}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleChange} required
                      placeholder="your@email.com"
                      style={fieldStyle('email')}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t(language, 'Subject', 'Sujet', 'الموضوع')}</label>
                  <input
                    type="text" name="subject" value={formData.subject}
                    onChange={handleChange} required
                    placeholder={t(language, 'Project inquiry', 'Demande de projet', 'استفسار عن مشروع')}
                    style={fieldStyle('subject')}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    name="message" value={formData.message}
                    onChange={handleChange} required rows={6}
                    placeholder={t(language, 'Tell me about your project...', 'Parlez-moi de votre projet...', 'أخبرني عن مشروعك...')}
                    style={{ ...fieldStyle('message'), resize: 'vertical', lineHeight: 1.7 }}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '1rem',
                    background: isSubmitting ? C.accentDim : C.accent,
                    color: isSubmitting ? C.accent : C.onAccent,
                    border: `1px solid ${isSubmitting ? C.borderAcc : 'transparent'}`,
                    fontWeight: 700, fontSize: '0.88rem',
                    borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.04em', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.25s',
                  }}
                  whileHover={{ opacity: isSubmitting ? 1 : 0.9 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      {t(language, 'Sending...', 'Envoi...', 'جارٍ الإرسال...')}
                    </>
                  ) : (
                    <>
                      {t(language, 'Send message', 'Envoyer le message', 'إرسال الرسالة')}
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Footer strip */}
        <motion.div variants={fadeUp} style={{
          marginTop: '6rem', paddingTop: '2rem', borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        }}>
          <p style={{ color: C.textMuted, fontSize: '0.82rem', margin: 0 }}>
            © {new Date().getFullYear()} {settings?.displayName || 'Portfolio'}. {t(language, 'All rights reserved.', 'Tous droits réservés.', 'جميع الحقوق محفوظة.')}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              settings?.github && { label: 'GitHub', href: settings.github },
              settings?.linkedin && { label: 'LinkedIn', href: settings.linkedin },
            ].filter(Boolean).map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: C.textMuted, fontSize: '0.82rem', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.accent}
                onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>
                {s.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::placeholder { color: ${C.textMuted}; opacity: 0.7; }
      `}</style>
    </motion.section>
  );
}

export default Contact;
