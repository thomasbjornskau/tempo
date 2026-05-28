// =====================================================================
//  loperdata.js
//  Datagrunnlag for løpefart-visualisering.
//
//  KILDE OG METODE
//  ---------------
//  Modellen bygger på prinsippet bak World Masters Athletics (WMA)
//  age-grading. Tanken: for hver distanse og hvert kjønn finnes en
//  "verdensrekord-ekvivalent" tid ved fysiologisk toppalder. For alle
//  andre aldre justeres denne med en aldersfaktor som beskriver hvor
//  mye en topputøver typisk taper med årene. Det gir p99-kurven
//  (verdenseliten). Lavere percentiler skaleres som en prosentandel av
//  rekordtiden (age-graded performance %), i tråd med de internasjonale
//  age-grading-kategoriene (world-class / national / regional / local).
//
//  ALT datagrunnlag er samlet her. UI-en inneholder ingen tall.
// =====================================================================

// Toppalder (år) der rekord-ekvivalenten settes. Felles for alle distanser.
export const PEAK_AGE = 26;

export const ALDER_MIN = 18;
export const ALDER_MAX = 80;

// ---------------------------------------------------------------------
// 1) STANDARDTIDER (sekunder) ved PEAK_AGE = age-graded 100 %
//    Tilnærmet verdensrekordnivå. Kilde: gjeldende verdensrekorder.
//    distanse i meter -> { M: sekunder, K: sekunder }
// ---------------------------------------------------------------------
export const DISTANSER = [
  { id: 5000,  km: 5,     navn: '5 km' },
  { id: 10000, km: 10,    navn: '10 km' },
  { id: 21097, km: 21.097, navn: 'Halvmaraton' },
  { id: 42195, km: 42.195, navn: 'Maraton' },
];

export const STANDARDTIDER = {
  5000:  { M: 12 * 60 + 35, K: 14 * 60 + 0 },     // 12:35 / 14:00
  10000: { M: 26 * 60 + 11, K: 29 * 60 + 1 },     // 26:11 / 29:01
  21097: { M: 57 * 60 + 31, K: 62 * 60 + 52 },    // 57:31 / 1:02:52
  42195: { M: 2 * 3600 + 35, K: 2 * 3600 + 9 * 60 + 56 }, // 2:00:35 / 2:09:56
};

// ---------------------------------------------------------------------
// 2) ALDERSFAKTOR
//    Multiplikator på rekord-ekvivalenten for en gitt alder.
//    1.0 ved PEAK_AGE, >1.0 ellers (tregere tid).
//
//    Modellen er stykkevis:
//      - 18 til PEAK_AGE: svak forbedring inn mot toppen (ungdom)
//      - PEAK_AGE til ~35: tilnærmet platå, svak nedgang
//      - 35+: akselererende nedgang, slik WMA-faktorene viser
//    Koeffisientene er kalibrert mot formen på WMA-faktortabellene.
// ---------------------------------------------------------------------
export function aldersfaktor(alder, kjonn) {
  const a = alder;
  // Liten kjønnsforskjell i aldringskurven; kvinner taper marginalt
  // mer på de lengste distansene ved høy alder. Holdt enkelt her.
  if (a <= PEAK_AGE) {
    // Ungdom: lineær opphenting mot toppen. Ved 18 ~3 % tregere.
    const ungdomTap = 0.03;
    const t = (PEAK_AGE - a) / (PEAK_AGE - ALDER_MIN);
    return 1 + ungdomTap * t;
  }
  // Voksen: kvadratisk nedgang fra toppalder.
  // Tap ~0.4 %/år rundt 40, akselererende mot 0.9 %/år ved 70+.
  const dy = a - PEAK_AGE;
  const lineaer = 0.0028;     // grunntap per år
  const kvadratisk = 0.000095; // akselerasjon
  const kjonnJust = kjonn === 'K' ? 1.04 : 1.0; // litt brattere for K høy alder
  return 1 + (lineaer * dy + kvadratisk * dy * dy) * kjonnJust;
}

// ---------------------------------------------------------------------
// 3) PERCENTILNIVÅER
//    age-grade = andel av rekord-ekvivalenten man oppnår.
//    Høy age-grade = nær rekord = rask. Tid skaleres med 1/age-grade.
//    Navnene er beskrivende fremfor rene tall.
// ---------------------------------------------------------------------
export const NIVAER = [
  { id: 'p99', navn: 'Verdenselite',      ageGrade: 1.00, beskrivelse: 'Verdensrekord-nivå for alderen.' },
  { id: 'p95', navn: 'Elite',             ageGrade: 0.80, beskrivelse: 'Internasjonalt konkurransenivå.' },
  { id: 'p90', navn: 'Svært sterk',       ageGrade: 0.75, beskrivelse: 'Nasjonalt sterkt nivå.' },
  { id: 'p75', navn: 'Sterk mosjonist',   ageGrade: 0.65, beskrivelse: 'Godt over snittet blant aktive løpere.' },
  { id: 'p50', navn: 'Habil mosjonist',   ageGrade: 0.55, beskrivelse: 'Midt på treet blant folk som stiller til start.' },
  { id: 'p25', navn: 'Turløper',          ageGrade: 0.50, beskrivelse: 'Fullfører i rolig tempo.' },
];

// ---------------------------------------------------------------------
// 4) BEREGNINGER
// ---------------------------------------------------------------------

// Rekord-ekvivalent tid (sek) for distanse/kjønn ved gitt alder.
export function rekordtid(distanseId, kjonn, alder) {
  const base = STANDARDTIDER[distanseId][kjonn];
  return base * aldersfaktor(alder, kjonn);
}

// Tid (sek) for et gitt nivå (age-grade) ved en alder.
export function nivatid(distanseId, kjonn, alder, ageGrade) {
  return rekordtid(distanseId, kjonn, alder) / ageGrade;
}

// Hvilken age-grade tilsvarer en faktisk tid? (din prestasjon)
export function ageGradeForTid(distanseId, kjonn, alder, tidSek) {
  return rekordtid(distanseId, kjonn, alder) / tidSek;
}

// Omregning: din tid på én distanse -> ekvivalent tid på en annen,
// ved å bevare age-grade (samme relative prestasjonsnivå).
export function ekvivalentTid(fraDistanseId, tilDistanseId, kjonn, alder, tidSek) {
  const ag = ageGradeForTid(fraDistanseId, kjonn, alder, tidSek);
  return nivatid(tilDistanseId, kjonn, alder, ag);
}

// Hjelpere: tempo (min/km) og hastighet (km/t)
export function tempoSekPerKm(tidSek, km) {
  return tidSek / km;
}
export function hastighetKmt(tidSek, km) {
  return km / (tidSek / 3600);
}

// Formatering
export function formatTid(sek) {
  const s = Math.round(sek);
  const t = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return t > 0 ? `${t}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
}
export function formatTempo(sekPerKm) {
  const m = Math.floor(sekPerKm / 60);
  const s = Math.round(sekPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
export function parseTid(str) {
  // Godtar MM:SS eller H:MM:SS
  const deler = String(str).split(':').map((x) => parseInt(x, 10));
  if (deler.some(isNaN)) return null;
  if (deler.length === 2) return deler[0] * 60 + deler[1];
  if (deler.length === 3) return deler[0] * 3600 + deler[1] * 60 + deler[2];
  return null;
}
