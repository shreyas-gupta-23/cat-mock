/** CAT marking: MCQ +3 / −1, TITA +3 / 0. Blank scores 0. */

export function answersMatch(question, given) {
  if (given === null || given === undefined || given === '') return false;
  const key = String(question.answer ?? '').trim();
  if (!key) return false;
  if (question.type === 'TITA') return titaMatch(String(given), key);
  return String(given).trim().charAt(0).toUpperCase() === key.charAt(0).toUpperCase();
}

/** 3142, 3-1-4-2, and 3 1 4 2. A single decimal such as 3.5 is not an order. */
function orderDigits(s) {
  const t = String(s).trim();
  if (!t) return null;
  if (/^\d+\.\d+$/.test(t)) return null;
  if (/[\s,.\-–—]/.test(t)) {
    const parts = t.split(/[\s,.\-–—]+/).filter(Boolean);
    if (parts.length < 2 || parts.some((p) => !/^\d$/.test(p))) return null;
    return parts.join('');
  }
  return /^\d{2,}$/.test(t) ? t : null;
}

const UNIT_WORD = /^(rs|inr|crore|crores|lakh|lakhs|rupee|rupees|paise|km|kms|metre|meter|metres|meters|cm|mm|kg|percent|percentage|year|years|hour|hours|hr|hrs|min|mins|minute|minutes|sec|secs)$/i;

/** "19" and "Rs. 19 crores" are the same figure. A sentence that merely contains a number is not. */
export function titaFigure(text) {
  const raw = String(text ?? '').trim();
  const tokens = raw.match(/-?\d+(?:\.\d+)?/g) || [];
  if (tokens.length !== 1) return null;
  const words = raw.replace(tokens[0], ' ').replace(/[₹$.,%]/g, ' ').split(/\s+/).filter(Boolean);
  if (!words.every((word) => UNIT_WORD.test(word))) return null;
  return tokens[0];
}

/** "3", "sentence 3", or "3 — the odd sentence". */
function oddOneToken(s) {
  const t = String(s).trim();
  const bare = t.match(/^(?:sentence|option|choice)?\s*(\d+)\s*$/i);
  if (bare) return bare[1];
  const lead = t.match(/^(\d+)\s*[—–\-:.)]\s+\S/);
  return lead ? lead[1] : null;
}

function titaMatch(given, key) {
  const norm = (s) => s.replace(/,/g, '').replace(/\s+/g, '').toLowerCase();
  const g = norm(given);
  const k = norm(key);
  if (g && g === k) return true;
  const go = orderDigits(given);
  const ko = orderDigits(key);
  if (go && ko && go === ko) return true;
  const gn = Number(g);
  const kn = Number(k);
  if (g !== '' && k !== '' && Number.isFinite(gn) && Number.isFinite(kn)) {
    return Math.abs(gn - kn) < 1e-6;
  }
  const gOdd = oddOneToken(given);
  const kOdd = oddOneToken(key);
  if (gOdd && kOdd && gOdd === kOdd) {
    const prose = /[—–]|[A-Za-z]{3,}/;
    if (prose.test(given) || prose.test(key)) return true;
  }
  const gf = titaFigure(given);
  const kf = titaFigure(key);
  if (gf && kf) return Math.abs(Number(gf) - Number(kf)) < 1e-6;
  return false;
}

export function scoreQuestion(question, given) {
  const has = given !== null && given !== undefined && String(given).trim() !== '';
  if (!has) return { has: false, correct: false, delta: 0 };
  const correct = answersMatch(question, given);
  if (correct) return { has: true, correct: true, delta: 3 };
  if (question.type === 'MCQ') return { has: true, correct: false, delta: -1 };
  return { has: true, correct: false, delta: 0 };
}
