import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

/**
 * usePortfolioData — live data from Supabase.
 *
 * Reads the `settings` (single row), `projects`, and `skills` tables and
 * keeps them in sync in real time: any edit made from /admin (or directly
 * in the Supabase table editor) shows up on the public site automatically,
 * without a redeploy.
 */

function mapSettings(row) {
  if (!row) return null;
  return {
    displayName: row.display_name,
    location: row.location,
    email: row.email,
    phone: row.phone,
    reviewsAutoApprove: row.reviews_auto_approve ?? false,
    linkedin: row.linkedin,
    github: row.github,
    available: row.available,
    yearsExp: row.years_exp,
    projectCount: row.project_count,
    photoUrl: row.photo_url,
    cvUrl: row.cv_url,
    homeDescEn: row.home_desc_en,
    homeDescFr: row.home_desc_fr,
    homeDescAr: row.home_desc_ar,
    aboutBioEn: row.about_bio_en,
    aboutBioFr: row.about_bio_fr,
    aboutBioAr: row.about_bio_ar,
    aboutBio2En: row.about_bio2_en,
    aboutBio2Fr: row.about_bio2_fr,
    aboutBio2Ar: row.about_bio2_ar,
    techStack: row.tech_stack ?? [],
    stats: row.stats ?? [],
    capabilities: row.capabilities ?? [],
  };
}

function mapProject(row) {
  return {
    id: row.id,
    order: row.sort_order,
    index: row.index_label,
    category: row.category,
    title: row.title,
    titleFr: row.title_fr,
    titleAr: row.title_ar,
    description: row.description,
    descriptionFr: row.description_fr,
    descriptionAr: row.description_ar,
    longDescription: row.long_description,
    longDescriptionFr: row.long_description_fr,
    longDescriptionAr: row.long_description_ar,
    technologies: row.technologies ?? [],
    github: row.github,
    liveUrl: row.live_url,
    videoUrl: row.video_url,
    thumbnail: row.thumbnail,
    images: row.images ?? [],
    purpose: row.purpose ?? null,
    purposeDetail: row.purpose_detail ?? '',
    year: row.project_year ?? '',
  };
}

function mapSkillGroup(row) {
  return {
    id: row.id,
    order: row.sort_order,
    num: row.num,
    titleEn: row.title_en,
    titleFr: row.title_fr,
    titleAr: row.title_ar,
    isTools: row.is_tools,
    skills: row.skills ?? [],
  };
}

export function usePortfolioData() {
  const [settings, setSettings] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewStats, setReviewStats] = useState({});

  // Average rating + count per project, from APPROVED reviews only (RLS).
  // Fails silently if migration_4 hasn't been run yet, so the site still loads.
  const fetchReviewStats = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data, error: err } = await supabase.from('project_reviews').select('project_id, rating');
    if (err) return;
    const acc = {};
    (data ?? []).forEach(({ project_id, rating }) => {
      acc[project_id] = acc[project_id] || { sum: 0, count: 0 };
      acc[project_id].sum += rating;
      acc[project_id].count += 1;
    });
    const out = {};
    Object.entries(acc).forEach(([id, v]) => { out[id] = { avg: v.sum / v.count, count: v.count }; });
    setReviewStats(out);
  }, []);

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file.');
      setLoading(false);
      return;
    }

    try {
      const [settingsRes, projectsRes, skillsRes] = await Promise.all([
        supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('projects').select('*').order('sort_order', { ascending: true }),
        supabase.from('skills').select('*').order('sort_order', { ascending: true }),
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (skillsRes.error) throw skillsRes.error;

      setSettings(mapSettings(settingsRes.data));
      setProjects((projectsRes.data ?? []).map(mapProject));
      setSkills((skillsRes.data ?? []).map(mapSkillGroup));
      setError(null);
    } catch (err) {
      console.error('[usePortfolioData] fetch error:', err);
      setError(err.message ?? 'Failed to load portfolio data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchReviewStats();

    if (!isSupabaseConfigured) return;

    // Live-update the site whenever data changes in Supabase (e.g. from /admin).
    const channel = supabase
      .channel('portfolio-public-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_reviews' }, fetchReviewStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll, fetchReviewStats]);

  return { settings, projects, skills, reviewStats, loading, error, refetch: fetchAll, refetchReviewStats: fetchReviewStats };
}
