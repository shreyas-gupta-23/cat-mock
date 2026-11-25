const NAMED = {
  ndash: '\u2013',
  mdash: '\u2014',
  nbsp: ' ',
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  uuml: '\u00fc',
  le: '\u2264',
  ge: '\u2265',
  ne: '\u2260',
  radic: '\u221a',
  ang: '\u2220',
  deg: '\u00b0',
  hellip: '\u2026',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201c',
  rdquo: '\u201d',
  times: '\u00d7',
  divide: '\u00f7',
  minus: '\u2212',
};

/** Turn &ndash; and numeric character references into the characters they name. */
export function decodeEntities(text) {
  return String(text || '').replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body) => {
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X';
      const cp = parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) return whole;
      return String.fromCodePoint(cp);
    }
    return Object.prototype.hasOwnProperty.call(NAMED, body) ? NAMED[body] : whole;
  });
}

const CHROME = /Month-End Sale is Live|^How to prepare for CAT|^CAT Online Live Classes|^Signup Login -->|^CAT Question Paper\b|^CAT Online Coaching\b|^CAT Quantitative Aptitude\b|^Attempt these questions as a Timed Quiz|best way to improve your VARC skill|DI LR section has become increasingly tough|Quant, unlike previous years was not dominated by Arithmetic/i;

const VA_START = /^(?:Five jumbled up sentences|The four sentences \(labelled|The passage given below is followed by four alternate summaries|Directions for (?:question number|Summary)|A paragraph is followed by four)/i;

/**
 * Drop 2IIM page chrome and an RC passage that was pasted above a verbal item.
 * The verbal instruction, and everything after it, stays.
 */
export function presentText(text) {
  const decoded = decodeEntities(text);
  let parts = decoded.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  parts = parts.filter((p) => !CHROME.test(p));
  const vaAt = parts.findIndex((p) => VA_START.test(p));
  if (vaAt > 0) parts = parts.slice(vaAt);
  return parts.join('\n\n');
}

/** RC items in the bank keep the passage inside the question text. VA stems stay whole. */
export function splitStem(question) {
  const raw = presentText(question?.question || '');
  const field = presentText(question?.passage || '').trim();
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
