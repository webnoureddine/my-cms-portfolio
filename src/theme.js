// Design tokens — "motel film" palette — warm butter light, deep motel green, thermos orange.
// Taken from a 70s motel film still. The same values are mirrored as CSS variables in
// index.css (used by the public site); this JS object is used by the admin
// panel and anywhere inline styles still need a color.

export const C = {
  // Surfaces
  bg:          '#F6EBCF',   // butter cream — page background
  bgAlt:       '#EBDCB2',   // afternoon yellow — alternating sections
  bgCard:      '#FBF5E4',
  bgCard2:     '#F1E5C4',
  bgPanel:     '#FBF5E4',

  // Lines
  border:      '#DCCBA0',
  borderHov:   '#C7B184',
  borderAcc:   'rgba(47,90,69,0.35)',
  borderFocus: '#2F5A45',

  // Text
  text:        '#2A281F',   // espresso ink
  textSub:     '#4B4636',
  textMuted:   '#7D7258',

  // Accent — motel wall green
  accent:      '#1F4A38',
  accentHover: '#244736',
  accentDim:   'rgba(47,90,69,0.10)',
  accentSoft:  '#DCE3C6',
  onAccent:    '#F4E9CC',

  // Supporting warm tones (butter, curtain tan, thermos orange)
  ice:         '#E9CF8B',
  frost:       '#C9A675',
  blue:        '#C8662E',
  blueDim:     'rgba(200,102,46,0.12)',

  // Deep band (contact / footer)
  deep:        '#1F3D30',
  deepCard:    '#28493A',
  deepBorder:  'rgba(244,233,204,0.16)',
  deepText:    '#F4E9CC',
  deepMuted:   '#C2B993',

  // Status
  star:        '#D9692B',
  success:     '#4F7A3A',
  successDim:  'rgba(79,122,58,0.12)',
  danger:      '#A63D2A',
  dangerDim:   'rgba(178,69,60,0.08)',

  track:       '#E3D4AA',
};

export default C;
