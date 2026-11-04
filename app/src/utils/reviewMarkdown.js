import { scoreQuestion } from './score';

function line(s = '') {
  return s.replace(/\r\n/g, '\n').trim();
}

export function buildReviewMarkdown({ examConfig, questions, responses, sectionStats, totalScore, totalMax, percentile, accuracy }) {
  const when = new Date().toISOString();
  const label = examConfig?.label || 'Mock';
  const flat = ['VARC', 'DILR', 'Quant'].flatMap((section) =>
    (questions[section] || []).map((q, i) => ({ ...q, section, n: i + 1 }))
  );

  const rows = flat.map((q) => {
    const given = responses[q.id]?.answer ?? '';
    const scored = scoreQuestion(q, given);
    return {
      ...q,
      given: given === null || given === undefined || given === '' ? '' : String(given),
      ...scored,
      time: responses[q.id]?.timeSpent || 0,
    };
  });

  const mistakes = rows.filter((r) => r.has && !r.correct);
  const blanks = rows.filter((r) => !r.has);

  const sectionLines = (sectionStats || []).map((s) =>
    `| ${s.section} | ${s.score} / ${s.maxScore} | ${s.attempted} | ${s.correct} | ${s.incorrect} | ${s.total - s.attempted} |`
  );

  const mistakeBlocks = mistakes.map((r) => {
    const stem = line(r.question || '').slice(0, 500);
    return [
      `### ${r.section} Q${r.n} · ${r.topic || 'topic'} · ${r.type} · ${r.time}s`,
      `- You: ${r.given || '—'}`,
      `- Key: ${r.correctAnswer || r.answer || '—'}`,
      `- Delta: ${r.delta}`,
      '',
      stem,
      '',
    ].join('\n');
  });

  const blankLines = blanks.map((r) => `- ${r.section} Q${r.n} · ${r.topic || ''} · ${r.type}`);

  return [
    `# Attempt · ${label}`,
    '',
    `- When: ${when}`,
    `- Score: ${totalScore} / ${totalMax}`,
    `- Accuracy on attempts: ${accuracy}%`,
    `- Percentile (that year's published scaled-score table, not an All-India rank): ${percentile}`,
    `- Wrong MCQ: ${mistakes.filter((r) => r.type === 'MCQ').length}`,
    `- Wrong TITA (no penalty): ${mistakes.filter((r) => r.type === 'TITA').length}`,
    `- Blank: ${blanks.length}`,
    '',
    '## Sections',
    '',
    '| Section | Score | Attempted | Correct | Wrong | Blank |',
    '| --- | --- | --- | --- | --- | --- |',
    ...sectionLines,
    '',
    '## Mistakes',
    '',
    mistakeBlocks.join('\n') || '_None._',
    '',
    '## Left blank',
    '',
    blankLines.join('\n') || '_None._',
    '',
    'Review this file with reviews/HOW-TO-REVIEW.md.',
    '',
  ].join('\n');
}

export function downloadMarkdown(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
