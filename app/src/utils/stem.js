/** RC items in the bank keep the passage inside the question text. VA stems stay whole. */
export function splitStem(question) {
  const raw = String(question?.question || '');
  const field = String(question?.passage || '').trim();
  if (field) return { passage: field, ask: raw };
  const parts = raw.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return { passage: '', ask: raw };
  const instruction = parts[0];
  const set = /key in|odd one out|alternate summaries|proper sequence|coherent paragraph|summary/i.test(instruction);
  if (set) return { passage: '', ask: raw };
  const ask = parts[parts.length - 1];
  const body = parts.slice(0, -1).join('\n\n');
  if (body.length > 400 && ask.length < 500 && ask.length < body.length * 0.45) {
    return { passage: body, ask };
  }
  return { passage: '', ask: raw };
}

export function optionLetter(opt, index) {
  const m = String(opt).trim().match(/^([A-D])\b/i);
  return m ? m[1].toUpperCase() : String.fromCharCode(65 + index);
}
