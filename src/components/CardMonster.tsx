import React from 'react';

interface Props {
  cardId: string;
  className?: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function face(
  eyeColor: string,
  body: React.ReactNode,
  extras?: React.ReactNode,
  mood: 'happy' | 'fierce' | 'smart' = 'happy',
) {
  const smilePath =
    mood === 'fierce'
      ? 'M 40 67 L 44 70 L 48 64 L 52 70 L 56 64 L 60 70 L 60 67'
      : mood === 'smart'
        ? 'M 41 67 Q 50 71 59 67'
        : 'M 41 67 Q 50 74 59 67';
  return (
    <>
      {body}
      {/* eyes */}
      <circle cx="41" cy="55" r="5" fill="white" />
      <circle cx="59" cy="55" r="5" fill="white" />
      <circle cx="42" cy="56" r="2.5" fill={eyeColor} />
      <circle cx="60" cy="56" r="2.5" fill={eyeColor} />
      {/* smile */}
      <path d={smilePath} stroke={eyeColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {extras}
    </>
  );
}

// ── MATHS ────────────────────────────────────────────────────────────────────
function Sixton() {
  // math-01 · Table de 6 · blue blob with 6 arms
  const arm = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
  );
  return face(
    '#1e40af',
    <>
      {arm(23, 50, 12, 42)} {arm(21, 62, 10, 62)} {arm(23, 74, 12, 82)}
      {arm(77, 50, 88, 42)} {arm(79, 62, 90, 62)} {arm(77, 74, 88, 82)}
      <ellipse cx="50" cy="62" rx="27" ry="22" fill="#60a5fa" stroke="#2563eb" strokeWidth="2.5" />
      <text x="50" y="68" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e40af">×6</text>
    </>,
    // stars as pupils decoration
    <text x="50" y="26" textAnchor="middle" fontSize="12">✦</text>,
  );
}

function Fractou() {
  // math-02 · Fractions · body split in two halves
  return face(
    '#92400e',
    <>
      {/* left half */}
      <path d="M 23 62 a 27 22 0 0 1 27 -22 L 50 84 a 27 22 0 0 1 -27 -22 Z" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
      {/* right half */}
      <path d="M 50 40 a 27 22 0 0 1 27 22 L 77 62 a 27 22 0 0 1 -27 22 Z" fill="#fb923c" stroke="#d97706" strokeWidth="2.5" />
      {/* dividing line */}
      <line x1="50" y1="38" x2="50" y2="86" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
      {/* ½ label */}
      <text x="37" y="68" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">½</text>
      <text x="63" y="68" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">½</text>
    </>,
  );
}

function Geomix() {
  // math-03 · Formes · geometric purple monster
  return face(
    '#581c87',
    <>
      {/* triangle ears */}
      <polygon points="33,45 26,28 40,28" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
      <polygon points="67,45 60,28 74,28" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
      {/* hexagon body */}
      <polygon points="50,40 72,52 72,72 50,84 28,72 28,52" fill="#c084fc" stroke="#7e22ce" strokeWidth="2.5" />
      {/* square patch */}
      <rect x="42" y="68" width="16" height="10" rx="2" fill="#7e22ce" opacity="0.4" />
    </>,
    <text x="50" y="76" textAnchor="middle" fontSize="7" fill="#581c87" fontWeight="bold">▲■●</text>,
  );
}

function Soustrax() {
  // math-04 · Soustraction · red monster, minus-sign arms
  const minus = (x: number, y: number) => (
    <rect x={x - 8} y={y - 2} width="16" height="5" rx="2.5" fill="#dc2626" />
  );
  return face(
    '#7f1d1d',
    <>
      {minus(16, 52)} {minus(16, 72)} {minus(84, 52)} {minus(84, 72)}
      <ellipse cx="50" cy="62" rx="27" ry="22" fill="#f87171" stroke="#dc2626" strokeWidth="2.5" />
      {/* big minus on belly */}
      <rect x="36" y="68" width="28" height="6" rx="3" fill="#7f1d1d" opacity="0.6" />
    </>,
    undefined,
    'fierce',
  );
}

function Divix() {
  // math-05 · Division · legendary dark purple, body appears split
  return face(
    '#3b0764',
    <>
      {/* glow */}
      <ellipse cx="50" cy="62" rx="30" ry="25" fill="#7c3aed" opacity="0.25" />
      {/* top half */}
      <ellipse cx="50" cy="53" rx="25" ry="14" fill="#7e22ce" stroke="#4c1d95" strokeWidth="2" />
      {/* gap */}
      <rect x="25" y="60" width="50" height="5" fill="#1e1b4b" />
      {/* bottom half */}
      <ellipse cx="50" cy="71" rx="25" ry="14" fill="#6d28d9" stroke="#4c1d95" strokeWidth="2" />
      {/* ÷ symbol */}
      <text x="50" y="57" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#e9d5ff">÷</text>
      <text x="50" y="75" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#e9d5ff">÷</text>
    </>,
    <text x="50" y="22" textAnchor="middle" fontSize="14">👑</text>,
    'smart',
  );
}

// ── SCIENCES ─────────────────────────────────────────────────────────────────
function Chlorox() {
  // sci-01 · Photosynthèse · green leaf monster with sun rays
  return face(
    '#14532d',
    <>
      {/* sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 50 + Math.cos(rad) * 36;
        const cy = 42 + Math.sin(rad) * 36;
        return <line key={i} x1={50 + Math.cos(rad) * 24} y1={42 + Math.sin(rad) * 24} x2={cx} y2={cy} stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />;
      })}
      {/* sun center */}
      <circle cx="50" cy="42" r="10" fill="#facc15" stroke="#eab308" strokeWidth="2" />
      {/* leaf body */}
      <ellipse cx="50" cy="67" rx="26" ry="20" fill="#4ade80" stroke="#16a34a" strokeWidth="2.5" />
      {/* leaf vein */}
      <line x1="50" y1="50" x2="50" y2="85" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="62" x2="38" y2="57" stroke="#15803d" strokeWidth="1" strokeLinecap="round" />
      <line x1="50" y1="62" x2="62" y2="57" stroke="#15803d" strokeWidth="1" strokeLinecap="round" />
    </>,
    undefined,
    'happy',
  );
}

function Goutti() {
  // sci-02 · Cycle de l'eau · water drop with cloud hat and rain drops
  return face(
    '#1e3a8a',
    <>
      {/* cloud hat */}
      <ellipse cx="40" cy="35" rx="12" ry="8" fill="white" stroke="#bfdbfe" strokeWidth="1.5" />
      <ellipse cx="55" cy="33" rx="14" ry="9" fill="white" stroke="#bfdbfe" strokeWidth="1.5" />
      <ellipse cx="68" cy="36" rx="10" ry="7" fill="white" stroke="#bfdbfe" strokeWidth="1.5" />
      <rect x="27" y="38" width="46" height="8" fill="white" stroke="none" />
      {/* raindrop body */}
      <path d="M 50 42 C 28 52 23 76 50 82 C 77 76 72 52 50 42 Z" fill="#7dd3fc" stroke="#2563eb" strokeWidth="2.5" />
      {/* little rain drops falling */}
      <ellipse cx="22" cy="75" rx="2" ry="4" fill="#93c5fd" opacity="0.8" />
      <ellipse cx="78" cy="68" rx="2" ry="4" fill="#93c5fd" opacity="0.8" />
      <ellipse cx="16" cy="65" rx="1.5" ry="3" fill="#93c5fd" opacity="0.6" />
    </>,
  );
}

function Orbitron() {
  // sci-03 · Planètes · monster with Saturn ring
  return face(
    '#1e1b4b',
    <>
      {/* ring behind */}
      <ellipse cx="50" cy="62" rx="40" ry="12" fill="none" stroke="#c084fc" strokeWidth="5" opacity="0.5" />
      {/* planet body */}
      <ellipse cx="50" cy="62" rx="24" ry="24" fill="#818cf8" stroke="#4338ca" strokeWidth="2.5" />
      {/* ring front (clip over body) */}
      <ellipse cx="50" cy="62" rx="40" ry="12" fill="none" stroke="#c084fc" strokeWidth="3" strokeDasharray="37 43" strokeDashoffset="0" />
      {/* crater spots */}
      <circle cx="38" cy="70" r="3" fill="#4338ca" opacity="0.4" />
      <circle cx="62" cy="73" r="2" fill="#4338ca" opacity="0.4" />
      {/* star pupils */}
      <circle cx="41" cy="55" r="5" fill="white" />
      <circle cx="59" cy="55" r="5" fill="white" />
      <text x="41" y="58" textAnchor="middle" fontSize="7">✦</text>
      <text x="59" y="58" textAnchor="middle" fontSize="7">✦</text>
    </>,
    <text x="50" y="18" textAnchor="middle" fontSize="10">👑</text>,
    'smart',
  );
}

function Sensix() {
  // sci-04 · Les 5 Sens · yellow monster, 5 sensory features
  return face(
    '#713f12',
    <>
      <ellipse cx="50" cy="62" rx="27" ry="22" fill="#fde047" stroke="#ca8a04" strokeWidth="2.5" />
      {/* big ear (ouïe) */}
      <ellipse cx="23" cy="60" rx="5" ry="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
      <ellipse cx="77" cy="60" rx="5" ry="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
      {/* nose */}
      <ellipse cx="50" cy="64" rx="5" ry="3" fill="#ca8a04" opacity="0.5" />
      {/* tongue (goût) */}
      <path d="M 44 70 Q 50 78 56 70" stroke="#ef4444" strokeWidth="3" fill="#ef4444" opacity="0.8" strokeLinecap="round" />
      {/* one big eye (vue) */}
      <circle cx="41" cy="53" r="7" fill="white" />
      <circle cx="42" cy="54" r="3.5" fill="#713f12" />
      <circle cx="59" cy="55" r="4" fill="white" />
      <circle cx="60" cy="56" r="2" fill="#713f12" />
      {/* hand (toucher) top */}
      <text x="50" y="24" textAnchor="middle" fontSize="13">🖐️</text>
    </>,
  );
}

function Predatron() {
  // sci-05 · Chaîne alimentaire · orange fierce monster with teeth, prey in mouth
  return face(
    '#7c2d12',
    <>
      <ellipse cx="50" cy="62" rx="27" ry="22" fill="#fb923c" stroke="#ea580c" strokeWidth="2.5" />
      {/* big ears */}
      <ellipse cx="30" cy="43" rx="7" ry="11" fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
      <ellipse cx="70" cy="43" rx="7" ry="11" fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
    </>,
    <>
      {/* fierce mouth with teeth */}
      <path d="M 36 68 Q 50 80 64 68" stroke="#7c2d12" strokeWidth="2.5" fill="#fecdd3" />
      <line x1="42" y1="69" x2="42" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="71" x2="50" y2="78" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="69" x2="58" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round" />
      {/* little prey icon */}
      <text x="50" y="22" textAnchor="middle" fontSize="11">🐭</text>
      <text x="16" y="62" textAnchor="middle" fontSize="8">→</text>
      <text x="84" y="62" textAnchor="middle" fontSize="8">→</text>
    </>,
    'fierce',
  );
}

// ── HISTOIRE ─────────────────────────────────────────────────────────────────
function Liberon() {
  // hist-01 · Révolution · tricolor monster with Phrygian cap
  return face(
    '#1e3a8a',
    <>
      {/* tricolor body: blue | white | red */}
      <ellipse cx="50" cy="62" rx="27" ry="22" fill="white" stroke="#6b7280" strokeWidth="2.5" />
      <path d="M 23 62 a 27 22 0 0 1 27 -22 L 50 84 a 27 22 0 0 1 -27 -22 Z" fill="#2563eb" />
      <path d="M 50 40 a 27 22 0 0 1 27 22 L 77 62 a 27 22 0 0 1 -27 22 Z" fill="#dc2626" />
      {/* Phrygian cap */}
      <path d="M 30 42 Q 38 20 50 18 Q 62 20 65 40 Q 55 35 50 38 Q 40 35 30 42 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
      {/* cap curl */}
      <circle cx="50" cy="20" r="4" fill="#991b1b" />
    </>,
  );
}

function Grottok() {
  // hist-02 · Préhistoire · brown hairy caveman monster with bone
  return face(
    '#431407',
    <>
      {/* fur patches */}
      <ellipse cx="50" cy="62" rx="27" ry="22" fill="#92400e" stroke="#78350f" strokeWidth="2.5" />
      {/* fur texture (bumps on top) */}
      {[32, 38, 44, 50, 56, 62, 68].map((x) => (
        <ellipse key={x} cx={x} cy="41" rx="3" ry="4" fill="#78350f" />
      ))}
      {/* bone club */}
      <line x1="74" y1="50" x2="88" y2="30" stroke="#d6d3d1" strokeWidth="4" strokeLinecap="round" />
      <circle cx="86" cy="28" r="5" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="1.5" />
      <circle cx="90" cy="33" r="4" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="1.5" />
      {/* cave drawing on belly */}
      <text x="47" y="71" textAnchor="middle" fontSize="10">🦣</text>
    </>,
  );
}

function Pharabot() {
  // hist-03 · Égyptiens · gold monster with Egyptian headdress
  return face(
    '#451a03',
    <>
      {/* nemes headdress stripes */}
      <rect x="28" y="30" width="44" height="35" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      {[33, 39, 45, 51, 57, 63].map((y) => (
        <line key={y} x1="29" y1={y} x2="71" y2={y} stroke="#d97706" strokeWidth="0.8" opacity="0.6" />
      ))}
      {/* body */}
      <ellipse cx="50" cy="70" rx="22" ry="16" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
      {/* uraeus (cobra crown) */}
      <path d="M 46 30 Q 50 22 54 30" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="20" r="3" fill="#22c55e" />
      {/* Eye of Horus on belly */}
      <text x="50" y="76" textAnchor="middle" fontSize="10">𓂀</text>
    </>,
  );
}

function Gallix() {
  // hist-04 · Gaulois · monster with winged helmet and moustache
  return face(
    '#14532d',
    <>
      <ellipse cx="50" cy="67" rx="26" ry="20" fill="#86efac" stroke="#16a34a" strokeWidth="2.5" />
      {/* winged helmet */}
      <ellipse cx="50" cy="42" rx="22" ry="14" fill="#d1d5db" stroke="#6b7280" strokeWidth="2" />
      {/* left wing */}
      <path d="M 28 40 Q 15 30 18 50 Q 25 48 28 44" fill="#f9a8d4" stroke="#ec4899" strokeWidth="1.5" />
      {/* right wing */}
      <path d="M 72 40 Q 85 30 82 50 Q 75 48 72 44" fill="#f9a8d4" stroke="#ec4899" strokeWidth="1.5" />
      {/* helmet nose guard */}
      <rect x="47" y="48" width="6" height="12" rx="3" fill="#9ca3af" />
    </>,
    <>
      {/* moustache */}
      <path d="M 38 64 Q 42 68 50 65 Q 58 68 62 64" stroke="#78350f" strokeWidth="3" fill="#78350f" strokeLinecap="round" />
      {/* shield */}
      <text x="50" y="22" textAnchor="middle" fontSize="11">🛡️</text>
    </>,
    'fierce',
  );
}

function Chevalorn() {
  // hist-05 · Moyen Âge · knight monster in armor
  return face(
    '#1c1917',
    <>
      {/* armor body */}
      <ellipse cx="50" cy="62" rx="26" ry="21" fill="#9ca3af" stroke="#4b5563" strokeWidth="2.5" />
      {/* armor plates */}
      <line x1="50" y1="42" x2="50" y2="83" stroke="#6b7280" strokeWidth="2" />
      <line x1="26" y1="62" x2="74" y2="62" stroke="#6b7280" strokeWidth="2" />
      {/* helmet visor */}
      <ellipse cx="50" cy="43" rx="18" ry="12" fill="#6b7280" stroke="#374151" strokeWidth="2.5" />
      <rect x="34" y="46" width="32" height="5" rx="2" fill="#374151" />
      {/* visor slits */}
      <rect x="37" y="48" width="10" height="2" rx="1" fill="#9ca3af" />
      <rect x="53" y="48" width="10" height="2" rx="1" fill="#9ca3af" />
      {/* heraldic shield on body */}
      <text x="50" y="75" textAnchor="middle" fontSize="9">⚜️</text>
    </>,
    undefined,
    'fierce',
  );
}

// ── LANGUES ──────────────────────────────────────────────────────────────────
function Wooflex() {
  // lang-01 · Animaux en Anglais · half dog monster
  return face(
    '#431407',
    <>
      <ellipse cx="50" cy="62" rx="26" ry="21" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
      {/* floppy dog ears */}
      <ellipse cx="29" cy="52" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" transform="rotate(-15 29 52)" />
      <ellipse cx="71" cy="52" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" transform="rotate(15 71 52)" />
      {/* snout */}
      <ellipse cx="50" cy="68" rx="10" ry="7" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
      <ellipse cx="50" cy="65" rx="4" ry="2.5" fill="#f97316" />
    </>,
    <>
      {/* tongue out */}
      <ellipse cx="50" cy="76" rx="5" ry="6" fill="#ef4444" />
      {/* paw prints */}
      <text x="18" y="80" textAnchor="middle" fontSize="9">🐾</text>
      <text x="82" y="80" textAnchor="middle" fontSize="9">🐾</text>
      {/* "WOOF" */}
      <text x="50" y="22" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400e">WOOF!</text>
    </>,
  );
}

function Colorix() {
  // lang-02 · Couleurs · rainbow-striped monster
  const stripes = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  return face(
    '#3b0764',
    <>
      {/* rainbow body as layered stripes clipped to ellipse */}
      <defs>
        <clipPath id="bodyClip">
          <ellipse cx="50" cy="62" rx="27" ry="22" />
        </clipPath>
      </defs>
      {stripes.map((color, i) => (
        <rect key={i} x="23" y={40 + i * 6.5} width="54" height="7" fill={color} clipPath="url(#bodyClip)" />
      ))}
      <ellipse cx="50" cy="62" rx="27" ry="22" fill="none" stroke="#1e1b4b" strokeWidth="2.5" />
      {/* prism on top */}
      <polygon points="50,18 42,30 58,30" fill="white" stroke="#6b7280" strokeWidth="1.5" />
      <line x1="50" y1="30" x2="50" y2="40" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="2 2" />
    </>,
  );
}

function Verbix() {
  // lang-03 · Conjugaison · purple monster holding a conjugation scroll
  return face(
    '#4c1d95',
    <>
      <ellipse cx="50" cy="62" rx="26" ry="21" fill="#c084fc" stroke="#7e22ce" strokeWidth="2.5" />
      {/* scroll */}
      <rect x="62" y="48" width="22" height="28" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
      <line x1="65" y1="55" x2="81" y2="55" stroke="#78350f" strokeWidth="1" />
      <line x1="65" y1="60" x2="81" y2="60" stroke="#78350f" strokeWidth="1" />
      <line x1="65" y1="65" x2="81" y2="65" stroke="#78350f" strokeWidth="1" />
      {/* verb labels */}
      <text x="66" y="53" fontSize="4" fill="#7c3aed" fontWeight="bold">je</text>
      <text x="66" y="58" fontSize="4" fill="#7c3aed" fontWeight="bold">tu</text>
      <text x="66" y="63" fontSize="4" fill="#7c3aed" fontWeight="bold">il</text>
    </>,
    <>
      {/* letters floating */}
      <text x="18" y="52" fontSize="11" fill="#7e22ce" fontWeight="bold">V</text>
      <text x="14" y="68" fontSize="9" fill="#a855f7">b</text>
      <text x="22" y="78" fontSize="8" fill="#7e22ce">e</text>
      {/* pencil */}
      <text x="50" y="22" textAnchor="middle" fontSize="12">✏️</text>
    </>,
    'smart',
  );
}

function Numbrix() {
  // lang-04 · Nombres en Anglais · orange monster with numbers and UK flag hint
  return face(
    '#7c2d12',
    <>
      <ellipse cx="50" cy="62" rx="27" ry="22" fill="#fb923c" stroke="#ea580c" strokeWidth="2.5" />
      {/* numbers on body */}
      <text x="35" y="62" fontSize="8" fontWeight="bold" fill="#7c2d12">1</text>
      <text x="44" y="72" fontSize="8" fontWeight="bold" fill="#7c2d12">2</text>
      <text x="53" y="62" fontSize="8" fontWeight="bold" fill="#7c2d12">3</text>
      <text x="62" y="72" fontSize="8" fontWeight="bold" fill="#7c2d12">4</text>
      {/* union jack simplified */}
      <rect x="36" y="28" width="28" height="16" rx="3" fill="#1d4ed8" />
      <line x1="36" y1="28" x2="64" y2="44" stroke="white" strokeWidth="2.5" />
      <line x1="64" y1="28" x2="36" y2="44" stroke="white" strokeWidth="2.5" />
      <rect x="48" y="28" width="4" height="16" fill="white" />
      <rect x="36" y="34" width="28" height="4" fill="white" />
      <line x1="36" y1="28" x2="64" y2="44" stroke="#dc2626" strokeWidth="1.5" />
      <line x1="64" y1="28" x2="36" y2="44" stroke="#dc2626" strokeWidth="1.5" />
      <rect x="49" y="28" width="2" height="16" fill="#dc2626" />
      <rect x="36" y="35" width="28" height="2" fill="#dc2626" />
    </>,
  );
}

function Grammix() {
  // lang-05 · Grammaire Légendaire · dark monster in graduation cap with book
  return face(
    '#1e1b4b',
    <>
      <ellipse cx="50" cy="67" rx="26" ry="20" fill="#818cf8" stroke="#4338ca" strokeWidth="2.5" />
      {/* graduation cap */}
      <rect x="33" y="38" width="34" height="7" rx="2" fill="#1e1b4b" />
      <polygon points="50,30 30,40 70,40" fill="#1e1b4b" />
      {/* tassel */}
      <line x1="68" y1="38" x2="76" y2="48" stroke="#fbbf24" strokeWidth="2" />
      <circle cx="76" cy="50" r="2.5" fill="#fbbf24" />
      {/* book */}
      <rect x="13" y="52" width="16" height="20" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
      <line x1="21" y1="52" x2="21" y2="72" stroke="#991b1b" strokeWidth="1" />
      <line x1="15" y1="58" x2="20" y2="58" stroke="#fca5a5" strokeWidth="1" />
      <line x1="15" y1="62" x2="20" y2="62" stroke="#fca5a5" strokeWidth="1" />
    </>,
    <>
      {/* "S V C" grammar badge */}
      <text x="50" y="75" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1e1b4b">S·V·C</text>
      <text x="50" y="22" textAnchor="middle" fontSize="11">👑</text>
    </>,
    'smart',
  );
}

function DefaultMonster() {
  return face('#374151', <ellipse cx="50" cy="62" rx="27" ry="22" fill="#9ca3af" stroke="#374151" strokeWidth="2.5" />);
}

// ── registry ──────────────────────────────────────────────────────────────────
const MONSTER_MAP: Record<string, () => React.ReactElement> = {
  'math-01': Sixton,
  'math-02': Fractou,
  'math-03': Geomix,
  'math-04': Soustrax,
  'math-05': Divix,
  'sci-01': Chlorox,
  'sci-02': Goutti,
  'sci-03': Orbitron,
  'sci-04': Sensix,
  'sci-05': Predatron,
  'hist-01': Liberon,
  'hist-02': Grottok,
  'hist-03': Pharabot,
  'hist-04': Gallix,
  'hist-05': Chevalorn,
  'lang-01': Wooflex,
  'lang-02': Colorix,
  'lang-03': Verbix,
  'lang-04': Numbrix,
  'lang-05': Grammix,
};

export function CardMonster({ cardId, className = 'w-full h-full' }: Props) {
  const Monster = MONSTER_MAP[cardId] ?? DefaultMonster;
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <Monster />
    </svg>
  );
}
