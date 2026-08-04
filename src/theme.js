// Shared design tokens — palette derived from the requested color board:
// deep navy blues, a warm terracotta/orange accent, and a soft sky-blue for variety.
// Change values here once and the whole site (and admin panel) updates together.

export const C = {
  bg:          '#0D1B2E',
  bgCard:      '#132539',
  bgCard2:     '#1A3049',
  bgPanel:     '#132539',

  border:      'rgba(255,255,255,0.07)',
  borderHov:   'rgba(255,255,255,0.15)',
  borderAcc:   'rgba(224,146,90,0.35)',
  borderFocus: 'rgba(224,146,90,0.55)',

  text:        '#F2F4F8',
  textMuted:   '#7C8CA6',
  textSub:     '#B7C2D4',

  // Primary accent — warm terracotta/orange (from the building facade in the palette)
  accent:      '#E0925A',
  accentDim:   'rgba(224,146,90,0.14)',
  accentSoft:  'rgba(224,146,90,0.12)',

  // Dark navy used as text/icon color on top of the orange accent (replaces old C.onAccent)
  onAccent:    '#0D1B2E',

  // Secondary sky-blue accent — used for tech badges / variety accents
  blue:        '#4A99C8',
  blueDim:     'rgba(74,153,200,0.14)',
  blueDeep:    '#1E64A1',

  // Peach / gray from the palette — used sparingly for soft highlights
  peach:       '#E9B166',
  peachDim:    'rgba(233,177,102,0.14)',
  gray:        '#CFCEC5',

  success:     '#6FC79B',
  successDim:  'rgba(111,199,155,0.12)',

  danger:      '#E08A83',
  dangerDim:   'rgba(224,138,131,0.12)',

  track:       'rgba(255,255,255,0.07)',
};

export default C;
