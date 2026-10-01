import fs from 'fs';

const htmlDir = 'd:/Code/study/CAT/inbox/grok-md/html';
const bankPath = 'd:/Code/study/CAT/app/src/data/pyq-bank.json';

const expected = {
  2022: { VARC: 24, DILR: 20, Quant: 22 },
  2023: { VARC: 24, DILR: 20, Quant: 22 },
  2024: { VARC: 24, DILR: 22, Quant: 22 },
  2025: { VARC: 24, DILR: 22, Quant: 22 },
};

const fileSection = { VARC: 'VARC', DILR: 'DILR', Quant: 'Quant' };

function parasOf(text) {
  return text
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((p) => !/^(Video|Explanation|Check Stats|Correct:|Incorrect:|Unattempted:)/.test(p));
}

function gapText(raw) {
  const cut = raw.split(/Correct Answer/)[0];
  const paras = parasOf(cut).filter((p) => p.length > 40 && !/^CAT \d{4}/.test(p) && !/2IIM|Scholarship|Score Calculator|Visit our Website/.test(p));
  return paras.join('\n\n');
}

function parseSectionFile(year, slot, fileKey) {
  const section = fileSection[fileKey];
  const text = fs.readFileSync(`${htmlDir}/CAT-${year}-Question-Paper-Slot-${slot}-${fileKey}.txt`, 'utf8');
  const re = /CAT \d{4} Slot \d+ - ([^\n]+)\n([\s\S]*?)\n\s*Correct\s+Answer(?:\s+Choice\s+([A-D]))?(?:\s+([^\n]+))?/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    const topic = m[1].replace(/^(QA|DI LR|VA RC)\s*-\s*/, '').trim();
    const body = m[2];
    const letter = m[3];
    let inline = (m[4] || '').trim();
    if (!letter && !inline) {
      const rest = text.slice(re.lastIndex);
      const next = rest.match(/^\s*([^\n]+)/);
      if (next && !/^Video|^Explanation|^Check/.test(next[1].trim())) inline = next[1].trim();
    }
    const preface = gapText(text.slice(last, m.index));
    last = re.lastIndex;
    const paras = parasOf(body);
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const matched = !letter && paras.length >= 4
      ? paras.slice(-4).findIndex((p) => norm(p) === norm(inline))
      : -1;
    if (letter || matched >= 0) {
      if (paras.length < 4) {
        problems.push(`${year} s${slot} ${section} Q${out.length + 1} ${topic} — key ${letter || 'ABCD'[matched] || inline} but options not in the text`);
        out.push({
          section, topic: topic || section, type: 'MCQ', answer: letter || 'ABCD'[matched],
          options: [], question: [...(preface ? [preface] : []), ...paras].join('\n\n'), broken: true,
        });
        continue;
      }
      const opts = paras.slice(-4);
      const stem = [...(preface ? [preface] : []), ...paras.slice(0, -4)].join('\n\n');
      out.push({
        section,
        topic: topic || section,
        type: 'MCQ',
        answer: letter || 'ABCD'[matched],
        options: opts.map((t, i) => `${'ABCD'[i]}) ${t}`),
        question: stem,
      });
    } else {
      const answer = inline;
      if (!answer) throw new Error(`tita ${year} s${slot} ${section} #${out.length + 1}`);
      out.push({
        section,
        topic: topic || section,
        type: 'TITA',
        answer,
        options: [],
        question: [...(preface ? [preface] : []), ...paras].join('\n\n'),
      });
    }
  }
  return out;
}

const problems = [];
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const have = new Set(bank.papers.map((p) => p.id));
const added = [];

for (const year of [2022, 2023, 2024, 2025]) {
  for (const slot of [1, 2, 3]) {
    const parsed = ['VARC', 'DILR', 'Quant'].flatMap((k) => parseSectionFile(year, slot, k));
    const counts = { VARC: 0, DILR: 0, Quant: 0 };
    for (const q of parsed) counts[q.section]++;
    const exp = expected[year];
    const ok = counts.VARC === exp.VARC && counts.DILR === exp.DILR && counts.Quant === exp.Quant;
    console.log(`${year} s${slot}  VARC ${counts.VARC} DILR ${counts.DILR} QA ${counts.Quant}  ${ok ? 'ok' : 'BAD'}`);
    if (!ok) {
      console.error('Stop. Counts do not match the paper.');
      process.exit(1);
    }
    const id = `cat-${year}-s${slot}`;
    if (have.has(id)) continue;
    const qs = parsed.filter((q) => !q.broken);
    counts.VARC = qs.filter((q) => q.section === 'VARC').length;
    counts.DILR = qs.filter((q) => q.section === 'DILR').length;
    counts.Quant = qs.filter((q) => q.section === 'Quant').length;
    const label = `CAT ${year} Slot ${slot}`;
    bank.papers.push({
      id, year, slot, label,
      counts: { VARC: counts.VARC, DILR: counts.DILR, Quant: counts.Quant },
      total: qs.length,
      complete: true,
    });
    let i = 0;
    for (const q of qs) {
      i += 1;
      bank.questions.push({
        id: `${id}-q${String(i).padStart(2, '0')}`,
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
    }
    added.push(`${label} (${qs.length})`);
  }
}

if (problems.length) {
  console.log('Left out (key letter only, choices not in the file):');
  for (const p of problems) console.log(' -', p);
}
bank.papers.sort((a, b) => a.year - b.year || a.slot - b.slot || a.label.localeCompare(b.label));
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2) + '\n');
console.log('Added:', added.join('; ') || '(already present)');
console.log('Papers', bank.papers.length, 'Questions', bank.questions.length);
