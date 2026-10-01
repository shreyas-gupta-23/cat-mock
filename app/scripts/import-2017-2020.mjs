import fs from 'fs';

const srcPath = 'd:/Code/study/CAT/inbox/pyq-json/cat_2017_2020.json';
const bankPath = 'd:/Code/study/CAT/app/src/data/pyq-bank.json';

function plain(html) {
  return String(html || '')
    .replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, '\n$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function norm(q) {
  const raw = String(q.answer || '').trim();
  const choice = raw.match(/^(?:Ch\w*ce\s+)?([A-D])\b/i);
  if (q.type === 'MCQ' || choice) {
    if (!choice) return null;
    const options = (q.options || []).map((t, i) => {
      const text = plain(t);
      return /^[A-D]\)/.test(text) ? text : `${'ABCD'[i]}) ${text}`;
    });
    if (options.length !== 4) return null;
    return { type: 'MCQ', answer: choice[1].toUpperCase(), options };
  }
  const num = raw.match(/^(-?\d+(?:\.\d+)?)\b/);
  const answer = num && raw.length < 48 ? num[1] : raw;
  if (!answer || answer === '(see 2IIM)') return null;
  return { type: 'TITA', answer, options: [] };
}

const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const have = new Set(bank.papers.map((p) => p.id));
const skipped = [];
const groups = new Map();

for (const q of src.questions) {
  const section = q.section === 'QA' ? 'Quant' : q.section;
  const key = `${q.year}-${q.slot}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ ...q, section });
}

const order = { VARC: 0, DILR: 1, Quant: 2 };
const added = [];

for (const [key, list] of groups) {
  const [year, slot] = key.split('-').map(Number);
  const id = `cat-${year}-s${slot}`;
  if (have.has(id)) continue;
  list.sort((a, b) => order[a.section] - order[b.section] || a.qnum - b.qnum);
  const usable = [];
  for (const q of list) {
    const scored = norm(q);
    if (!scored) {
      skipped.push(`${id} ${q.section} Q${q.qnum}`);
      continue;
    }
    const passage = plain(q.passage);
    const stem = plain(q.question);
    usable.push({
      section: q.section,
      topic: plain(q.topic) || q.section,
      question: passage ? `${passage}\n\n${stem}` : stem,
      ...scored,
    });
  }
  const counts = { VARC: 0, DILR: 0, Quant: 0 };
  for (const q of usable) counts[q.section]++;
  const expect = year === 2020
    ? { VARC: 26, DILR: 24, Quant: 26 }
    : year === 2021
      ? { VARC: 24, DILR: 20, Quant: 22 }
      : { VARC: 34, DILR: 32, Quant: 34 };
  const full = counts.VARC === expect.VARC && counts.DILR === expect.DILR && counts.Quant === expect.Quant;
  if (!full) {
    skipped.push(`${id} INCOMPLETE VARC ${counts.VARC} DILR ${counts.DILR} QA ${counts.Quant}`);
    continue;
  }
  const label = `CAT ${year} Slot ${slot}`;
  bank.papers.push({
    id, year, slot, label, counts,
    total: usable.length,
    complete: true,
  });
  usable.forEach((q, i) => {
    bank.questions.push({
      id: `${id}-q${String(i + 1).padStart(2, '0')}`,
      paperId: id,
      year,
      slot,
      section: q.section,
      topic: q.topic,
      type: q.type,
      passage: '',
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: '',
      difficulty: '',
      source: `${label} · 2IIM on-page key`,
    });
  });
  added.push(`${label} ${usable.length}`);
}

bank.papers.sort((a, b) => a.year - b.year || a.slot - b.slot || a.label.localeCompare(b.label));
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2) + '\n');
console.log('Added', added.join(' | ') || 'none');
console.log('Skipped', skipped.length);
if (skipped.length) console.log(skipped.slice(0, 30).join('\n'));
console.log('Papers', bank.papers.length, 'Questions', bank.questions.length);
