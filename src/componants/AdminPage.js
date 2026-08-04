import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '../supabaseClient';
import { C } from '../theme';

/**
 * AdminPage.js — password-protected CMS backed by Supabase.
 *
 * Login uses Supabase Auth (create the admin user once in the Supabase
 * dashboard: Authentication → Users → Add user). Every save writes straight
 * to Postgres, so changes appear on the live site immediately (real-time
 * subscription in usePortfolioData.js) — no redeploy needed.
 */

const inp = {
  width: '100%', padding: '0.7rem 0.9rem', background: C.bg,
  border: `1px solid ${C.border}`, borderRadius: '6px', color: C.text,
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
};

const btn = {
  padding: '0.65rem 1.4rem', borderRadius: '6px', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.04em',
  border: 'none', fontFamily: "'DM Sans', sans-serif",
};

const label = {
  display: 'block', color: C.textMuted, fontSize: '0.7rem', fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem',
};

function Section({ title, children, right }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
      <div style={{ padding: '1.25rem 1.75rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: C.text, fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{title}</h2>
        {right}
      </div>
      <div style={{ padding: '1.75rem' }}>{children}</div>
    </div>
  );
}

function Field({ form, setForm, label: lbl, field, multiline = false, type = 'text' }) {
  const handle = (e) => {
    const v = type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: v }));
  };
  if (type === 'checkbox') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
        <input type="checkbox" checked={!!form[field]} onChange={handle} style={{ accentColor: C.accent, width: 16, height: 16 }} />
        <label style={{ color: C.textSub, fontSize: '0.88rem' }}>{lbl}</label>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={label}>{lbl}</label>
      {multiline
        ? <textarea value={form[field] ?? ''} onChange={handle} rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
        : <input type={type} value={form[field] ?? ''} onChange={handle} style={inp} />}
    </div>
  );
}

function Toast({ text, kind = 'success' }) {
  if (!text) return null;
  const color = kind === 'success' ? C.success : C.danger;
  const bg = kind === 'success' ? C.successDim : C.dangerDim;
  return (
    <div style={{ padding: '0.7rem 1rem', background: bg, border: `1px solid ${color}44`, borderRadius: '6px', color, fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>
      {text}
    </div>
  );
}

// ── Image uploader: pushes a file to Supabase Storage and returns a public URL ──
function ImageUploader({ value, onChange, pathPrefix, label: lbl }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const ext = file.name.split('.').pop();
      const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (error) {
      setErr(error.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={label}>{lbl}</label>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {value && (
          <img src={value} alt="preview" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', border: `1px solid ${C.border}` }} />
        )}
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading}
          style={{ color: C.textSub, fontSize: '0.78rem' }} />
        {uploading && <span style={{ color: C.accent, fontSize: '0.78rem' }}>Uploading…</span>}
        {value && (
          <button type="button" onClick={() => onChange('')} style={{ ...btn, padding: '0.35rem 0.8rem', fontSize: '0.72rem', background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted }}>
            Remove
          </button>
        )}
      </div>
      {err && <p style={{ color: C.danger, fontSize: '0.75rem', marginTop: '0.4rem' }}>{err}</p>}
      <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
        placeholder="or paste an image URL"
        style={{ ...inp, marginTop: '0.5rem', fontSize: '0.78rem' }} />
    </div>
  );
}

// ── PDF uploader (used for the CV/resume) — same storage bucket, different file type ──
function PdfUploader({ value, onChange, pathPrefix, label: lbl }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const path = `${pathPrefix}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false, contentType: 'application/pdf' });
      if (error) throw error;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (error) {
      setErr(error.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={label}>{lbl}</label>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {value && (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, fontSize: '0.78rem', textDecoration: 'underline' }}>
            Current CV ↗
          </a>
        )}
        <input type="file" accept="application/pdf" onChange={handleFile} disabled={uploading}
          style={{ color: C.textSub, fontSize: '0.78rem' }} />
        {uploading && <span style={{ color: C.accent, fontSize: '0.78rem' }}>Uploading…</span>}
        {value && (
          <button type="button" onClick={() => onChange('')} style={{ ...btn, padding: '0.35rem 0.8rem', fontSize: '0.72rem', background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted }}>
            Remove
          </button>
        )}
      </div>
      {err && <p style={{ color: C.danger, fontSize: '0.75rem', marginTop: '0.4rem' }}>{err}</p>}
      <p style={{ color: C.textMuted, fontSize: '0.72rem', marginTop: '0.4rem' }}>
        The "Download CV" button only appears on your site once a PDF is uploaded here.
      </p>
    </div>
  );
}

// ============================================================================
// SETTINGS TAB
// ============================================================================
function SettingsForm() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (error) { setToast('Failed to load settings: ' + error.message); return; }
      setForm(data ?? { id: 1 });
    })();
  }, []);

  if (!form) return <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>Loading…</p>;

  const handleSave = async () => {
    setSaving(true);
    setToast('');
    const payload = { ...form, id: 1, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'id' });
    setSaving(false);
    setToast(error ? `Save failed: ${error.message}` : '✓ Settings saved — live on the site now.');
  };

  return (
    <div>
      <Toast text={toast} kind={toast.startsWith('✓') ? 'success' : 'error'} />

      <ImageUploader value={form.photo_url} onChange={(v) => setForm((f) => ({ ...f, photo_url: v }))} pathPrefix="profile" label="Profile Photo" />
      <PdfUploader value={form.cv_url} onChange={(v) => setForm((f) => ({ ...f, cv_url: v }))} pathPrefix="cv" label="CV / Resume (PDF)" />

      <div style={{ display: 'grid', gap: '0 1.5rem' }} className="grid md:grid-cols-2">
        <Field form={form} setForm={setForm} label="Display Name" field="display_name" />
        <Field form={form} setForm={setForm} label="Location" field="location" />
        <Field form={form} setForm={setForm} label="Email" field="email" type="email" />
        <Field form={form} setForm={setForm} label="LinkedIn URL" field="linkedin" />
        <Field form={form} setForm={setForm} label="GitHub URL" field="github" />
        <Field form={form} setForm={setForm} label="Years Experience" field="years_exp" />
        <Field form={form} setForm={setForm} label="Project Count" field="project_count" />
      </div>

      <Field form={form} setForm={setForm} label="Available for work (shown on homepage badge)" field="available" type="checkbox" />

      <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 1rem' }}>Home Bio</p>
      <Field form={form} setForm={setForm} label="Home Bio (EN)" field="home_desc_en" multiline />
      <Field form={form} setForm={setForm} label="Home Bio (FR)" field="home_desc_fr" multiline />
      <Field form={form} setForm={setForm} label="Home Bio (AR)" field="home_desc_ar" multiline />

      <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '1.5rem 0 1rem' }}>About Section</p>
      <Field form={form} setForm={setForm} label="About Paragraph 1 (EN)" field="about_bio_en" multiline />
      <Field form={form} setForm={setForm} label="About Paragraph 1 (FR)" field="about_bio_fr" multiline />
      <Field form={form} setForm={setForm} label="About Paragraph 1 (AR)" field="about_bio_ar" multiline />
      <Field form={form} setForm={setForm} label="About Paragraph 2 (EN)" field="about_bio2_en" multiline />
      <Field form={form} setForm={setForm} label="About Paragraph 2 (FR)" field="about_bio2_fr" multiline />
      <Field form={form} setForm={setForm} label="About Paragraph 2 (AR)" field="about_bio2_ar" multiline />

      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={handleSave} disabled={saving} style={{ ...btn, background: C.accent, color: C.onAccent, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PROJECTS TAB
// ============================================================================
const blankProject = {
  title: '', title_fr: '', description: '', description_fr: '',
  long_description: '', long_description_fr: '',
  technologies: '', category: 'web', github: '', live_url: '', video_url: '',
  index_label: '', sort_order: 99, thumbnail: '', images: [],
};

function ProjectForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial
    ? { ...initial, technologies: Array.isArray(initial.technologies) ? initial.technologies.join(', ') : (initial.technologies ?? '') }
    : blankProject);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    const payload = {
      ...form,
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      sort_order: Number(form.sort_order) || 99,
    };
    const { error } = await onSave(payload);
    setSaving(false);
    if (error) setErr(error.message);
  };

  const addImage = (url) => {
    if (!url) return;
    setForm((f) => ({ ...f, images: [...(f.images ?? []), url] }));
  };
  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  return (
    <div style={{ background: C.bgCard2, border: `1px solid ${C.borderAcc}`, borderRadius: '8px', padding: '1.75rem', marginBottom: '1.5rem' }}>
      <h3 style={{ color: C.accent, fontSize: '0.85rem', fontWeight: 600, margin: '0 0 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {initial ? 'Edit Project' : 'Add New Project'}
      </h3>
      {err && <Toast text={`Save failed: ${err}`} kind="error" />}

      <div style={{ display: 'grid', gap: '0 1.5rem' }} className="grid md:grid-cols-2">
        <Field form={form} setForm={setForm} label="Title (EN)" field="title" />
        <Field form={form} setForm={setForm} label="Title (FR)" field="title_fr" />
        <Field form={form} setForm={setForm} label="Title (AR)" field="title_ar" />
        <Field form={form} setForm={setForm} label="Short Description (EN)" field="description" multiline />
        <Field form={form} setForm={setForm} label="Short Description (FR)" field="description_fr" multiline />
        <Field form={form} setForm={setForm} label="Short Description (AR)" field="description_ar" multiline />
        <Field form={form} setForm={setForm} label="Long Description (EN)" field="long_description" multiline />
        <Field form={form} setForm={setForm} label="Long Description (FR)" field="long_description_fr" multiline />
        <Field form={form} setForm={setForm} label="Long Description (AR)" field="long_description_ar" multiline />
        <Field form={form} setForm={setForm} label="Technologies (comma-separated)" field="technologies" />
        <Field form={form} setForm={setForm} label="Category (web/backend/automation/desktop)" field="category" />
        <Field form={form} setForm={setForm} label="GitHub URL" field="github" />
        <Field form={form} setForm={setForm} label="Live URL" field="live_url" />
        <Field form={form} setForm={setForm} label="Video URL (mp4 or YouTube embed)" field="video_url" />
        <Field form={form} setForm={setForm} label="Index label (e.g. 01)" field="index_label" />
        <Field form={form} setForm={setForm} label="Sort Order (number)" field="sort_order" />
      </div>

      <ImageUploader value={form.thumbnail} onChange={(v) => setForm((f) => ({ ...f, thumbnail: v }))} pathPrefix="projects" label="Card Thumbnail" />

      <div style={{ marginBottom: '1.1rem' }}>
        <label style={label}>Screenshots (shown in the project modal carousel)</label>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          {(form.images ?? []).map((img, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={img} alt={`shot-${i}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: `1px solid ${C.border}` }} />
              <button type="button" onClick={() => removeImage(i)}
                style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: C.danger, color: '#fff', border: 'none', fontSize: '0.65rem', cursor: 'pointer', lineHeight: '18px' }}>
                ×
              </button>
            </div>
          ))}
        </div>
        <ImageUploader value="" onChange={addImage} pathPrefix="projects" label="Add a screenshot" />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button onClick={handleSave} disabled={saving} style={{ ...btn, background: C.accent, color: C.onAccent, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Project'}
        </button>
        {onCancel && <button onClick={onCancel} style={{ ...btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted }}>Cancel</button>}
      </div>
    </div>
  );
}

function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
    if (error) setToast('Load failed: ' + error.message);
    setProjects(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload) => {
    let result;
    if (editing) {
      result = await supabase.from('projects').update(payload).eq('id', editing.id);
    } else {
      result = await supabase.from('projects').insert(payload);
    }
    if (!result.error) {
      setEditing(null);
      setShowForm(false);
      setToast('✓ Project saved.');
      load();
    }
    return result;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) setToast('Delete failed: ' + error.message);
    else { setToast('✓ Project deleted.'); load(); }
  };

  return (
    <div>
      <Toast text={toast} kind={toast.startsWith('✓') ? 'success' : 'error'} />

      {(showForm && !editing) && <ProjectForm onSave={handleSave} onCancel={() => setShowForm(false)} />}
      {editing && <ProjectForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}

      {loading ? (
        <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {projects.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem', background: C.bg, borderRadius: '6px', border: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {p.thumbnail && <img src={p.thumbnail} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />}
                <div>
                  <p style={{ color: C.text, fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{p.title}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{p.category} · order: {p.sort_order}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { setEditing(p); setShowForm(false); }} style={{ ...btn, background: C.accentDim, border: `1px solid ${C.borderAcc}`, color: C.accent, padding: '0.5rem 1rem' }}>Edit</button>
                <button onClick={() => handleDelete(p.id)} style={{ ...btn, background: C.dangerDim, border: `1px solid rgba(239,68,68,0.3)`, color: C.danger, padding: '0.5rem 1rem' }}>Delete</button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>No projects yet.</p>}
        </div>
      )}

      {!showForm && !editing && (
        <button onClick={() => setShowForm(true)} style={{ ...btn, background: C.accent, color: C.onAccent, marginTop: '1.25rem' }}>+ Add Project</button>
      )}
    </div>
  );
}

// ============================================================================
// SKILLS TAB
// ============================================================================
const blankSkillGroup = { num: '', title_en: '', title_fr: '', is_tools: false, skills: [], sort_order: 99 };

function SkillGroupForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...initial } : blankSkillGroup);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const updateSkill = (i, field, value) => {
    setForm((f) => {
      const skills = [...f.skills];
      skills[i] = { ...skills[i], [field]: field === 'level' ? Number(value) : value };
      return { ...f, skills };
    });
  };
  const addSkill = () => setForm((f) => ({ ...f, skills: [...f.skills, f.is_tools ? { name: '' } : { name: '', level: 80 }] }));
  const removeSkill = (i) => setForm((f) => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    const payload = { ...form, sort_order: Number(form.sort_order) || 99 };
    const { error } = await onSave(payload);
    setSaving(false);
    if (error) setErr(error.message);
  };

  return (
    <div style={{ background: C.bgCard2, border: `1px solid ${C.borderAcc}`, borderRadius: '8px', padding: '1.75rem', marginBottom: '1.5rem' }}>
      <h3 style={{ color: C.accent, fontSize: '0.85rem', fontWeight: 600, margin: '0 0 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {initial ? 'Edit Category' : 'Add New Category'}
      </h3>
      {err && <Toast text={`Save failed: ${err}`} kind="error" />}

      <div style={{ display: 'grid', gap: '0 1.5rem' }} className="grid md:grid-cols-2">
        <Field form={form} setForm={setForm} label="Number (e.g. 01)" field="num" />
        <Field form={form} setForm={setForm} label="Sort Order" field="sort_order" />
        <Field form={form} setForm={setForm} label="Title (EN)" field="title_en" />
        <Field form={form} setForm={setForm} label="Title (FR)" field="title_fr" />
        <Field form={form} setForm={setForm} label="Title (AR)" field="title_ar" />
      </div>
      <Field form={form} setForm={setForm} label="This is the Tools row (no skill levels, just a list of names)" field="is_tools" type="checkbox" />

      <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '1.25rem 0 0.75rem' }}>Skills</p>
      {form.skills.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.6rem' }}>
          <input value={s.name} onChange={(e) => updateSkill(i, 'name', e.target.value)} placeholder="Skill name" style={{ ...inp, flex: 2 }} />
          {!form.is_tools && (
            <input type="number" min={0} max={100} value={s.level ?? 80} onChange={(e) => updateSkill(i, 'level', e.target.value)} placeholder="Level %" style={{ ...inp, flex: 1 }} />
          )}
          <button type="button" onClick={() => removeSkill(i)} style={{ ...btn, background: C.dangerDim, color: C.danger, padding: '0.5rem 0.75rem' }}>×</button>
        </div>
      ))}
      <button type="button" onClick={addSkill} style={{ ...btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, marginTop: '0.4rem' }}>+ Add Skill</button>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button onClick={handleSave} disabled={saving} style={{ ...btn, background: C.accent, color: C.onAccent, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Category'}
        </button>
        {onCancel && <button onClick={onCancel} style={{ ...btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted }}>Cancel</button>}
      </div>
    </div>
  );
}

function SkillsManager() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('skills').select('*').order('sort_order', { ascending: true });
    if (error) setToast('Load failed: ' + error.message);
    setGroups(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload) => {
    let result;
    if (editing) result = await supabase.from('skills').update(payload).eq('id', editing.id);
    else result = await supabase.from('skills').insert(payload);
    if (!result.error) { setEditing(null); setShowForm(false); setToast('✓ Category saved.'); load(); }
    return result;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill category?')) return;
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) setToast('Delete failed: ' + error.message);
    else { setToast('✓ Category deleted.'); load(); }
  };

  return (
    <div>
      <Toast text={toast} kind={toast.startsWith('✓') ? 'success' : 'error'} />

      {(showForm && !editing) && <SkillGroupForm onSave={handleSave} onCancel={() => setShowForm(false)} />}
      {editing && <SkillGroupForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}

      {loading ? (
        <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {groups.map((g) => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem', background: C.bg, borderRadius: '6px', border: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: C.text, fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{g.title_en} {g.is_tools && '(Tools)'}</p>
                <p style={{ color: C.textMuted, fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{(g.skills ?? []).length} skills · order: {g.sort_order}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { setEditing(g); setShowForm(false); }} style={{ ...btn, background: C.accentDim, border: `1px solid ${C.borderAcc}`, color: C.accent, padding: '0.5rem 1rem' }}>Edit</button>
                <button onClick={() => handleDelete(g.id)} style={{ ...btn, background: C.dangerDim, border: `1px solid rgba(239,68,68,0.3)`, color: C.danger, padding: '0.5rem 1rem' }}>Delete</button>
              </div>
            </div>
          ))}
          {groups.length === 0 && <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>No skill categories yet.</p>}
        </div>
      )}

      {!showForm && !editing && (
        <button onClick={() => setShowForm(true)} style={{ ...btn, background: C.accent, color: C.onAccent, marginTop: '1.25rem' }}>+ Add Category</button>
      )}
    </div>
  );
}

// ============================================================================
// MESSAGES TAB (contact form submissions)
// ============================================================================
function MessagesInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id, is_read) => {
    await supabase.from('messages').update({ is_read }).eq('id', id);
    load();
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await supabase.from('messages').delete().eq('id', id);
    load();
  };

  if (loading) return <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>Loading…</p>;
  if (messages.length === 0) return <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>No messages yet — they'll show up here when someone submits your contact form.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {messages.map((m) => (
        <div key={m.id} style={{ padding: '1rem 1.25rem', background: C.bg, borderRadius: '6px', border: `1px solid ${m.is_read ? C.border : C.borderAcc}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <p style={{ color: C.text, fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>{m.name} <span style={{ color: C.textMuted, fontWeight: 400 }}>· {m.email}</span></p>
              <p style={{ color: C.textMuted, fontSize: '0.72rem', margin: '0.2rem 0 0' }}>{new Date(m.created_at).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => markRead(m.id, !m.is_read)} style={{ ...btn, background: C.accentDim, border: `1px solid ${C.borderAcc}`, color: C.accent, padding: '0.4rem 0.8rem', fontSize: '0.72rem' }}>
                {m.is_read ? 'Mark unread' : 'Mark read'}
              </button>
              <button onClick={() => remove(m.id)} style={{ ...btn, background: C.dangerDim, border: `1px solid rgba(239,68,68,0.3)`, color: C.danger, padding: '0.4rem 0.8rem', fontSize: '0.72rem' }}>Delete</button>
            </div>
          </div>
          {m.subject && <p style={{ color: C.accent, fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.35rem' }}>{m.subject}</p>}
          <p style={{ color: C.textSub, fontSize: '0.85rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{m.message}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// DASHBOARD TAB — visits, messages, and content stats
// ============================================================================
function StatCard({ label, value, sub }) {
  return (
    <div style={{ padding: '1.25rem 1.4rem', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', flex: '1 1 150px' }}>
      <p style={{ color: C.textMuted, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>{label}</p>
      <p style={{ color: C.text, fontSize: '1.8rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: C.textMuted, fontSize: '0.72rem', margin: '0.4rem 0 0' }}>{sub}</p>}
    </div>
  );
}

function VisitsChart({ days }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: 110, marginTop: '0.5rem' }}>
      {days.map((d) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <div title={`${d.label}: ${d.count} visit${d.count === 1 ? '' : 's'}`}
            style={{ width: '100%', maxWidth: 22, height: Math.max(3, (d.count / max) * 84), background: d.count > 0 ? C.accent : C.track, borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
          <span style={{ color: C.textMuted, fontSize: '0.6rem' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalViews, todayViews, recentViews,
      totalMessages, unreadMessages,
      totalProjects, totalSkills,
    ] = await Promise.all([
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', startOfToday.toISOString()),
      supabase.from('page_views').select('created_at').gte('created_at', fourteenDaysAgo.toISOString()),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
    ]);

    // Bucket the last 14 days of visits by calendar day for the mini chart
    const buckets = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push({ key: d.toDateString(), label: d.toLocaleDateString(undefined, { day: 'numeric' }), count: 0 });
    }
    (recentViews.data ?? []).forEach((row) => {
      const key = new Date(row.created_at).toDateString();
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.count += 1;
    });
    setDays(buckets);

    setStats({
      totalViews: totalViews.count ?? 0,
      todayViews: todayViews.count ?? 0,
      totalMessages: totalMessages.count ?? 0,
      unreadMessages: unreadMessages.count ?? 0,
      totalProjects: totalProjects.count ?? 0,
      totalSkills: totalSkills.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !stats) return <p style={{ color: C.textMuted, fontSize: '0.85rem' }}>Loading…</p>;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Visits" value={stats.totalViews} />
        <StatCard label="Visits Today" value={stats.todayViews} />
        <StatCard label="Messages" value={stats.totalMessages} sub={stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'all read'} />
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Skill Categories" value={stats.totalSkills} />
      </div>

      <div style={{ padding: '1.4rem 1.5rem', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
        <p style={{ color: C.textMuted, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
          Visits — last 14 days
        </p>
        <VisitsChart days={days} />
      </div>

      <button onClick={load} style={{ ...btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, marginTop: '1.25rem' }}>
        Refresh
      </button>
    </div>
  );
}

// ============================================================================
// LOGIN
// ============================================================================
function LoginForm({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
    else onLoggedIn();
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '7px', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14L8 2L14 14" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 9.5H11.5" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p style={{ color: C.text, fontWeight: 700, margin: 0 }}>Portfolio CMS</p>
            <p style={{ color: C.textMuted, fontSize: '0.72rem', margin: 0 }}>Sign in to manage content</p>
          </div>
        </div>

        {err && <Toast text={err} kind="error" />}
        {!isSupabaseConfigured && <Toast text="Supabase is not configured — check your .env file." kind="error" />}

        <div style={{ marginBottom: '1.1rem' }}>
          <label style={label}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inp} autoFocus />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={label}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inp} />
        </div>
        <button type="submit" disabled={loading} style={{ ...btn, width: '100%', background: C.accent, color: C.onAccent, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p style={{ color: C.textMuted, fontSize: '0.72rem', marginTop: '1.25rem', lineHeight: 1.6 }}>
          No account yet? Create one in your Supabase dashboard → Authentication → Users → Add user. See README.md.
        </p>
      </form>
    </div>
  );
}

// ============================================================================
// ROOT ADMIN PAGE
// ============================================================================
function AdminPage() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    if (!isSupabaseConfigured) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div style={{ minHeight: '100vh', background: C.bg }} />;
  }

  if (!session) {
    return <LoginForm onLoggedIn={() => {}} />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'settings', label: 'Settings' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '7px', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14L8 2L14 14" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 9.5H11.5" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round"/></svg>
            </div>
            <div>
              <p style={{ color: C.text, fontWeight: 700, margin: 0 }}>Portfolio CMS</p>
              <p style={{ color: C.textMuted, fontSize: '0.72rem', margin: 0 }}>{session.user?.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="/" style={{ ...btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, textDecoration: 'none', display: 'inline-block' }}>View Site</a>
            <button onClick={() => supabase.auth.signOut()} style={{ ...btn, background: C.dangerDim, border: `1px solid rgba(239,68,68,0.3)`, color: C.danger }}>Sign Out</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: `1px solid ${C.border}`, paddingBottom: '1rem', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...btn, background: tab === t.id ? C.accentDim : 'transparent', border: `1px solid ${tab === t.id ? C.borderAcc : C.border}`, color: tab === t.id ? C.accent : C.textMuted }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <Section title="Dashboard — Visits & Activity">
            <Dashboard />
          </Section>
        )}
        {tab === 'settings' && (
          <Section title="Global Settings — Name, Bio, Contact, Photo">
            <SettingsForm />
          </Section>
        )}
        {tab === 'projects' && (
          <Section title="Projects — Add, Edit, Delete">
            <ProjectsManager />
          </Section>
        )}
        {tab === 'skills' && (
          <Section title="Skills — Categories & Tools">
            <SkillsManager />
          </Section>
        )}
        {tab === 'messages' && (
          <Section title="Contact Form Messages">
            <MessagesInbox />
          </Section>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
