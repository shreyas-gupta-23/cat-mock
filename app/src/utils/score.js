/** CAT marking: MCQ +3 / −1, TITA +3 / 0. Blank scores 0. */

export function answersMatch(question, given) {
  if (given === null || given === undefined || given === '') return false;
  const key = String(question.answer ?? '').trim();
  if (!key) return false;
  if (question.type === 'TITA') return titaMatch(String(given), key);
  return String(given).trim().charAt(0).toUpperCase() === key.charAt(0).toUpperCase();
}

function titaMatch(given, key) {
  const norm = (s) => s.replace(/,/g, '').replace(/\s+/g, '').toLowerCase();
  const g = norm(given);
  const k = norm(key);
  if (g === k) return true;
  const gn = Number(g);
  const kn = Number(k);
  if (g !== '' && k !== '' && Number.isFinite(gn) && Number.isFinite(kn)) {
    return Math.abs(gn - kn) < 1e-6;
  }
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
