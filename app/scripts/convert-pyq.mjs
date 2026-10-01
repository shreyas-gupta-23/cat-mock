import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('d:/Code/study/CAT/inbox/pyq-json');
const OUT = path.resolve('d:/Code/study/CAT/app/src/data/pyq-bank.json');

function mapSection(subject) {
  const s = String(subject || '').toLowerCase();
  if (s.includes('verbal') || s === 'varc') return 'VARC';
  if (s.includes('data') || s.includes('dilr') || s.includes('logical')) return 'DILR';
  return 'Quant';
}

function optionLetter(key) {
  return String(key).trim().toUpperCase().slice(0, 1);
}

function convertFile(filename) {
  const m = filename.match(/cat_(\d{4})_slot(\d)/i);
  const year = m ? Number(m[1]) : 0;
  const slot = m ? Number(m[2]) : 1;
  const paperId = `cat-${year}-s${slot}`;
  const raw = JSON.parse(fs.readFileSync(path.join(SRC, filename), 'utf8'));
  const questions = [];

  raw.forEach((q, i) => {
    const opts = q.options && typeof q.options === 'object' ? q.options : {};
    const optEntries = Object.entries(opts).filter(([, v]) => v != null && String(v).trim() !== '');
    const isTita = optEntries.length < 2;
    const options = isTita
      ? []
      : optEntries.map(([k, v]) => `${optionLetter(k)}) ${String(v).trim()}`);
    const correct = isTita
      ? String(q.correct_answer ?? '').trim()
      : optionLetter(q.correct_answer || optEntries[0]?.[0] || 'A');

    questions.push({
      id: `${paperId}-q${String(q.question_number ?? i + 1).padStart(2, '0')}`,
      paperId,
      year,
      slot,
      section: mapSection(q.subject),
      topic: q.topic || 'General',
      type: isTita ? 'TITA' : 'MCQ',
      passage: '',
      question: String(q.question_text || '').trim(),
      options,
      answer: correct,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'Medium',
      source: `CAT ${year} Slot ${slot}`,
    });
  });

  const counts = { VARC: 0, DILR: 0, Quant: 0 };
  questions.forEach((q) => { counts[q.section] += 1; });

  return {
    paper: {
      id: paperId,
      year,
      slot,
      label: `CAT ${year} Slot ${slot}`,
      counts,
      total: questions.length,
      complete: counts.VARC >= 20 && counts.DILR >= 18 && counts.Quant >= 18,
    },
    questions,
  };
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.json') && f.includes('completePaper'));
const papers = [];
const questions = [];

for (const f of files.sort()) {
  const { paper, questions: qs } = convertFile(f);
  papers.push(paper);
  questions.push(...qs);
}

const bank = { papers, questions };
fs.writeFileSync(OUT, JSON.stringify(bank, null, 2));
console.log(`Wrote ${papers.length} papers, ${questions.length} questions -> ${OUT}`);
papers.forEach((p) => {
  console.log(`  ${p.label}  VARC ${p.counts.VARC}  DILR ${p.counts.DILR}  QA ${p.counts.Quant}  ${p.complete ? 'FULL' : 'partial'}`);
});
