/**
 * Load v2 keys into the exam room.
 * Only a paper whose every question has a usable key is inserted.
 * MCQ needs four choices and a letter. TITA needs a typed value.
 */
import fs from 'fs';

const root = 'd:/Code/study/CAT';
const v2 = `${root}/inbox/zipsv2/cat-mocks`;
const bankPath = `${root}/app/src/data/pyq-bank.json`;
const src2020 = `${root}/inbox/pyq-json/cat_2017_2020.json`;

const EXPECT68 = { VARC: 24, DILR: 22, Quant: 22 };
const EXPECT76 = { VARC: 26, DILR: 24, Quant: 26 };

function read(p) {
  return fs.readFileSync(p, 'utf8').replace(/\r/g, '');
}

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

function letterOptions(parts) {
  return parts.map((t, i) => {
    const text = String(t).replace(/\s+/g, ' ').trim();
    return /^[A-D]\)/.test(text) ? text : `${'ABCD'[i]}) ${text}`;
  });
}

function countsOf(qs) {
  const counts = { VARC: 0, DILR: 0, Quant: 0 };
  for (const q of qs) counts[q.section]++;
  return counts;
}

function full(counts, expect) {
  return counts.VARC === expect.VARC && counts.DILR === expect.DILR && counts.Quant === expect.Quant;
}

function pushPaper(bank, paper, qs) {
  bank.papers.push(paper);
  for (const q of qs) bank.questions.push(q);
}

function packQuestion(paperId, year, slot, label, source, q, i) {
  return {
    id: `${paperId}-q${String(i + 1).padStart(2, '0')}`,
    paperId,
    year,
    slot,
    section: q.section,
    topic: q.topic || q.section,
    type: q.type,
    passage: '',
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: '',
    difficulty: '',
    source,
  };
}

function usable(q) {
  if (!q.question || !q.question.trim()) return false;
  if (q.type === 'MCQ') {
    return q.options.length === 4 && /^[A-D]$/.test(q.answer);
  }
  return q.type === 'TITA' && String(q.answer).trim() !== '';
}

// --- Career Launcher -------------------------------------------------------

function clKeys(md) {
  const keys = {};
  let section = '';
  for (const line of md.split('\n')) {
    if (/^## VARC/.test(line)) section = 'VARC';
    else if (/^## DILR/.test(line)) section = 'DILR';
    else if (/^## QA/.test(line)) section = 'Quant';
    const cells = [...line.matchAll(/(\d+)\|(\d+(?:\.\d+)?)/g)];
    if (!section || cells.length < 2) continue;
    for (const c of cells) keys[Number(c[1])] = { section, value: c[2] };
  }
  return keys;
}

function clOptions(body) {
  const cleaned = body.replace(/\n##[\s\S]*$/, '').trim();
  const re = /(^|\s)([1-4])\)\s+/g;
  const hits = [];
  let m;
  while ((m = re.exec(cleaned))) {
    const n = Number(m[2]);
    if (hits.length && n <= hits[hits.length - 1].n) break;
    hits.push({ n, at: m.index + m[0].length });
    if (hits.length === 4) break;
  }
  if (hits.length !== 4 || hits.map((h) => h.n).join('') !== '1234') return [];
  return hits.map((h, i) => {
    const end = i + 1 < hits.length ? hits[i + 1].at - (`${hits[i + 1].n})`.length) - 1 : cleaned.length;
    return cleaned.slice(h.at, end).replace(/\s+/g, ' ').trim();
  });
}

function firstPassages(md) {
  const passages = [];
  for (const chunk of md.split(/\n(?=### )/)) {
    if (!/^### Passage/.test(chunk)) continue;
    const body = chunk.replace(/^### [^\n]+\n/, '').split(/(?:^|\n)(?:### |\*\*Q\d+)/)[0].trim();
    if (body.length > 80) passages.push(body);
    if (passages.length === 4) break;
  }
  return passages;
}

function setBlurb(md, at, n) {
  const before = md.slice(0, at);
  const setAt = before.lastIndexOf('\n### Set ');
  if (setAt < 0) return '';
  const header = before.slice(setAt + 1, setAt + 120);
  const range = header.match(/Q(\d+)\s*[–-]\s*Q(\d+)/);
  if (!range || n < Number(range[1]) || n > Number(range[2])) return '';
  let blurb = before.slice(setAt + 1);
  const qAt = blurb.search(/\n\*\*Q\d+\.\*\*/);
  if (qAt >= 0) blurb = blurb.slice(0, qAt);
  blurb = blurb.split(/\nFinal solution\b|\nBulb positions:|\nThe solution confirms/)[0];
  return blurb.replace(/^### Set [^\n]+\n/, '').trim();
}

function parseCl(md, keys) {
  const passages = firstPassages(md);
  const re = /(?:^|\n)(?:### Q(\d+)\b[^\n]*\n|\*\*Q(\d+)\.\*\*\s*)/g;
  const marks = [];
  let m;
  while ((m = re.exec(md))) marks.push({ n: Number(m[1] || m[2]), start: m.index, from: re.lastIndex });
  const out = [];
  for (let i = 0; i < marks.length; i++) {
    const { n, from } = marks[i];
    const until = i + 1 < marks.length ? marks[i + 1].start : md.length;
    let body = md.slice(from, until);
    const cut = body.search(/\n## |\n- (?:QA|VARC|DILR) capture/);
    if (cut >= 0) body = body.slice(0, cut);
    const key = keys[n];
    if (!key) {
      out.push({ n, bad: `no key` });
      continue;
    }
    const nmcq = /\(N-MCQ/i.test(body);
    const odd = /odd one out/i.test(body) && /(^|\s)5\)\s+/.test(body);
    const opts = odd || nmcq ? [] : clOptions(body);
    const stem = body
      .replace(/\*\(N-MCQ[^)]*\)\*/gi, '')
      .replace(/^\*\*Q\d+\.\*\*\s*/, '')
      .replace(odd || nmcq ? /$^/ : /(^|\s)[1-4]\)\s+[\s\S]*$/, '')
      .replace(/^Q\s*\d+\.?\s*/, '')
      .trim();
    let question = stem;
    if (n >= 1 && n <= 16 && passages[Math.floor((n - 1) / 4)] && passages[Math.floor((n - 1) / 4)].length > 80) {
      question = `${passages[Math.floor((n - 1) / 4)]}\n\n${stem}`;
    } else if (n >= 25) {
      const blurb = setBlurb(md, from, n);
      if (blurb) question = `${blurb}\n\n${stem}`;
    }
    const numeric = /^\d+(\.\d+)?$/.test(key.value);
    const asIndex = numeric && Number(key.value) >= 1 && Number(key.value) <= 4;
    let type;
    let answer;
    if (!nmcq && opts.length === 4 && asIndex) {
      type = 'MCQ';
      answer = 'ABCD'[Number(key.value) - 1];
    } else {
      type = 'TITA';
      answer = key.value;
    }
    out.push({
      n,
      section: key.section,
      topic: key.section,
      type,
      answer,
      options: type === 'MCQ' ? letterOptions(opts) : [],
      question,
    });
  }
  return out;
}

// --- Cracku ----------------------------------------------------------------

function crackuKeys(md) {
  const keys = {};
  for (const line of md.split('\n')) {
    const m = line.match(/^\|\s*(VARC|LRDI|Quant)\s*\|\s*(\d+)\s*\|\s*(MCQ|TITA)\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|/);
    if (!m) continue;
    const section = m[1] === 'LRDI' ? 'DILR' : m[1];
    keys[Number(m[2])] = {
      section,
      type: m[3],
      answer: m[4].trim(),
      choices: [m[5], m[6], m[7], m[8]].map((s) => s.trim()).filter((s) => s && !s.endsWith('…') && !s.endsWith('...')),
    };
  }
  return keys;
}

function dropChrome(chunks) {
  const line = /^(Skipped|Report|Show answer|Question & Solutions|Q\. Analysis|Correct|Incorrect|Bookmark|Loading\.\.\.|Fetching Questions|Previous Question|Next Question|Solution|VARC|LRDI|QUANT|Quant)$/;
  return chunks.filter((c) => {
    if (/^Correct Answer:/i.test(c)) return false;
    const lines = c.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!lines.length) return false;
    return !lines.every((row) => line.test(row) || /^Question(?: No\.)? \d+$/.test(row));
  });
}

function splitStemOptions(raw, type) {
  let text = raw;
  const sol = text.search(/\nSolution\b|\nText Solution\b|\nPrevious Question\b/);
  if (sol >= 0) text = text.slice(0, sol);
  text = text.replace(/\nBackspace[\s\S]*$/, '');
  text = text.replace(/\nCorrect Answer:.*$/g, '');
  let chunks = text.split(/\n\s*\n/).map((c) => c.replace(/[ \t]+/g, ' ').trim()).filter(Boolean);
  chunks = dropChrome(chunks);
  if (type === 'TITA') return { stem: chunks.join('\n\n'), options: [] };
  const letterIdx = chunks.findIndex((c) => /^[A-D]$/.test(c));
  if (letterIdx >= 0) {
    const missingBefore = 'ABCD'.indexOf(chunks[letterIdx]);
    const start = Math.max(0, letterIdx - missingBefore);
    const options = [];
    for (let i = start; i < chunks.length && options.length < 4;) {
      if (/^[A-D]$/.test(chunks[i]) && chunks[i + 1] && !/^[A-D]$/.test(chunks[i + 1])) {
        options.push(chunks[i + 1]);
        i += 2;
      } else if (!/^[A-D]$/.test(chunks[i])) {
        options.push(chunks[i]);
        i += 1;
      } else i += 1;
    }
    return { stem: chunks.slice(0, start).join('\n\n'), options };
  }
  if (chunks.length >= 5) {
    return { stem: chunks.slice(0, -4).join('\n\n'), options: chunks.slice(-4) };
  }
  return { stem: chunks.join('\n\n'), options: [] };
}

function sectionSlice(md, title) {
  const at = md.indexOf(title);
  if (at < 0) return '';
  const rest = md.slice(at + title.length);
  const next = rest.search(/\n# /);
  return next < 0 ? rest : rest.slice(0, next);
}

function blocksFromHeadings(slice, localToGlobal) {
  const map = new Map();
  const re = /## Question (\d+)\n([\s\S]*?)(?=\n## Question |\n# |$)/g;
  let m;
  while ((m = re.exec(slice))) {
    const local = Number(m[1]);
    map.set(localToGlobal(local), m[2]);
  }
  return map;
}

function blocksFromResults(md) {
  const map = new Map();
  const re = /## Result Question (\d+)\n([\s\S]*?)(?=\n## Result Question |\n# |$)/g;
  let m;
  while ((m = re.exec(md))) {
    const block = m[2];
    if (!/\nReport\n/.test(block)) continue;
    if (/Text Solution\s*\n\s*Loading/.test(block.slice(0, 500))) continue;
    map.set(Number(m[1]), block);
  }
  return map;
}

function blocksMock3(md) {
  const map = new Map();
  const re = /### (?:VARC|LRDI|Quant) Question \d+ \(review item (\d+)\)\n([\s\S]*?)(?=\n### |\n## |$)/g;
  let m;
  while ((m = re.exec(md))) map.set(Number(m[1]), m[2]);
  return map;
}

function crackuBlocks(n, md) {
  if (n === 3) return blocksMock3(md);
  const map = new Map();
  if (n === 2) {
    for (const title of [
      '# Free CAT Mock 2 — VARC Questions and Options Q1-8',
      '# Free CAT Mock 2 — VARC Questions and Options Q9-16',
      '# Free CAT Mock 2 — VARC Questions and Options Q17-24',
    ]) {
      for (const [k, v] of blocksFromHeadings(sectionSlice(md, title), (local) => local)) map.set(k, v);
    }
  }
  if (n === 1) {
    for (const [k, v] of blocksFromHeadings(
      sectionSlice(md, '# Free CAT Mock 1 — LRDI Questions and Options'),
      (local) => local + 24,
    )) map.set(k, v);
    for (const [k, v] of blocksFromHeadings(
      sectionSlice(md, '# Free CAT Mock 1 — Quant Questions and Options'),
      (local) => local + 46,
    )) map.set(k, v);
  }
  for (const [k, v] of blocksFromResults(md)) if (!map.has(k)) map.set(k, v);
  return map;
}

function recoverLetter(answersMd, qnum, options) {
  const re = new RegExp(`## Result Question ${qnum}\\n([\\s\\S]*?)(?=\\n## Result Question |\\n# |$)`);
  const m = answersMd.match(re);
  if (!m) return null;
  const sol = (m[1].split(/Text Solution/)[1] || '');
  const hence = sol.match(/Hence,\s*Option\s+([A-D])/i) || sol.match(/correct (?:choice|answer) is \(?([A-D])\)?/i);
  if (hence) return hence[1].toUpperCase();
  const tail = sol.slice(-700).toLowerCase().replace(/\s+/g, ' ');
  const hits = [];
  options.forEach((opt, i) => {
    const t = opt.replace(/^[A-D]\)\s*/, '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (t.length >= 4 && tail.includes(t)) hits.push('ABCD'[i]);
  });
  return hits.length === 1 ? hits[0] : null;
}

function parseCracku(n) {
  const md = read(`${v2}/cracku/free-mock-${n}.md`);
  const answers = read(`${v2}/cracku/free-mock-${n}-answers.md`);
  const keys = crackuKeys(read(`${v2}/cracku/free-mock-${n}-key.md`));
  const blocks = crackuBlocks(n, md);
  const problems = [];
  const out = [];
  for (let qn = 1; qn <= 68; qn++) {
    const key = keys[qn];
    if (!key) {
      problems.push(`Q${qn} missing from key table`);
      continue;
    }
    const block = blocks.get(qn) || '';
    let type = key.type === 'TITA' ? 'TITA' : 'MCQ';
    let answer = key.answer;
    if (type === 'MCQ' && /^[1-4]$/.test(answer)) answer = 'ABCD'[Number(answer) - 1];
    const split = splitStemOptions(block, type);
    let options = split.options;
    if (type === 'MCQ' && options.length !== 4 && key.choices.length === 4) options = key.choices;
    if (type === 'MCQ') options = letterOptions(options);
    if (type === 'MCQ' && !/^[A-D]$/.test(answer) && options.length === 4) {
      const want = answer.replace(/\s+/g, '').toLowerCase();
      const idx = options.findIndex((opt) => opt.replace(/^[A-D]\)\s*/, '').replace(/\s+/g, '').toLowerCase() === want);
      if (idx >= 0) answer = 'ABCD'[idx];
      else {
        const recovered = recoverLetter(answers, qn, options);
        if (recovered) answer = recovered;
      }
    }
    const row = {
      qnum: qn,
      section: key.section,
      topic: key.section,
      type,
      answer,
      options: type === 'MCQ' ? options : [],
      question: split.stem,
    };
    if (!usable(row)) {
      const why = !row.question ? 'no stem' : type === 'MCQ' ? `options ${options.length}, answer ${answer || 'blank'}` : 'empty answer';
      problems.push(`Q${qn} ${key.section} ${why}`);
      continue;
    }
    out.push(row);
  }
  return { out, problems, blocks: blocks.size };
}

function mcq(section, qnum, answer, question, options) {
  return {
    qnum, section, topic: section, type: 'MCQ', answer,
    question, options: letterOptions(options),
  };
}

function gapFill(n) {
  if (n === 1) {
    return [
      mcq('VARC', 1, 'D', '“In Marx’s case, the labour and need for a wage can be seen as the oppressor causing humans to disassociate themselves from work and the products made due to a feeling of labour being a means to an end.” The given statement best serves to', [
        'highlight how Marx’s alienation is conceptually the same as Nietzsche\'s slave morality in describing modern society',
        'illustrate the concept of alienation by explaining how the need for wages can be disadvantageous to human flourishing.',
        'explain the manner in which alienation manifests in a capitalistic society, emphasising how the present condition of society is disadvantageous to human flourishing',
        'illuminate the convergence between the notions of Marx\'s alienation and Nietzsche\'s slave morality.',
      ]),
      mcq('VARC', 2, 'B', 'The author claims that “due to humanity’s continued desire to be unique, the struggle to avoid conformity in modern life has resulted in many accidentally conforming”. Which one of the following statements best expresses the point being made by the author?', [
        'The pursuit of uniqueness often leads modern individuals to struggle against societal norms, inadvertently making them more conformist.',
        'Modern individuals aspire to break free from conformity, but - at times - they unknowingly embrace it in their pursuit of being exceptional.',
        'Society\'s demand for conformity is often overshadowed by the subconscious urge to be unique or non-conformist, leading to efforts to be distinctive.',
        'Despite the widespread desire for distinctiveness, modern individuals often unintentionally fall victim to societal pressures, thereby inadvertently conforming.',
      ]),
      mcq('VARC', 3, 'C', 'All of the following claims can be inferred from the passage, EXCEPT:', [
        'Marx believes that the labour-wage relationship in capitalism leads to a diminished sense of connection between workers and their work.',
        'Mill argues that a conformist society could inhibit the development of individuality and excellence.',
        'Nietzsche\'s "slave morality" is rooted in the idea that individuals willingly embrace societal oppression for the sake of collective well-being.',
        'The struggle to avoid conformity in modern life can result in individuals inadvertently conforming to new forms of non-conformist behaviour.',
      ]),
      mcq('VARC', 4, 'C', 'Which of the following statements is most consistent with the second paragraph?', [
        'The reduction of human qualities to quantitative values has alienated humans from the fruits of their labour, creating a society that - according to Marx - is less conducive to human growth.',
        'Marx suggests that individuals no longer view labour as a means to an end, leading to a decline in human flourishing and a focus on monetary rewards.',
        'Marx emphasises that the detachment of individuals from their labour’s results, driven by the desire for wages, undermines the perception of man as a “species-being.”',
        'According to Marx, in our increasingly modern society, labour is no longer viewed as a manifestation of our life but as the sole mechanism to accrue wealth.',
      ]),
      mcq('VARC', 5, 'C', 'Based on the passage, which of the following statements about the author is true?', [
        'The author suggests that loving one\'s enemies is a requirement solely dictated by a moral tradition, often not based on rational considerations.',
        'The author discusses how loving one\'s enemies is mainly a result of moral or theological pressure rather than personal conviction.',
        'The author introduces the idea that loving one\'s enemies can also be motivated by self-interest and psychological well-being.',
        'The author proposes that loving one\'s enemies is primarily a selfless obligation to follow ethical guidelines, such as the one delineated in Christianity.',
      ]),
      mcq('VARC', 6, 'D', 'In the context of the passage, how does Nietzsche\'s idea of master-morality and slave-morality relate to the concept of loving one\'s enemies?', [
        'The discussion on master-morality and slave-morality offers clarity on the moral obligation to love one\'s enemies, which is often presented as a dictum in Christianity.',
        'The idea of how Christianity is premised on slave-morality helps explain the origin and underlying components of the concept of loving one\'s enemies.',
        'The categorization of traits under slave-morality supports the idea of loving one\'s enemies as an objective moral principle.',
        'The perspective on slave-morality disputes the injunction/moral obligation to love one\'s enemies by presenting it as a construct of oppressed values.',
      ]),
      mcq('VARC', 7, 'B', '“That said, one might feel the guidance is too demanding still.” Which one of the following statements best explains this quote in the context of the passage?', [
        'While the principle of loving one\'s enemies appears simple in theory, the variability in one\'s ability to forgive transgressions is often underestimated.',
        'Individuals may perceive the moral obligation to love their enemies as overly onerous, especially given the challenge of emotionally detaching oneself from feelings of ill will.',
        'Despite the guidance to love one\'s enemies being rooted in moral tradition, individuals might still struggle with its practical application due to inherent psychological biases.',
        'Some individuals might find it challenging to cultivate genuine affection for their enemies, making the concept of loving one\'s enemies unrealistic.',
      ]),
      mcq('VARC', 8, 'C', 'Which one of the following statements best describes what the passage is about?', [
        'An exploration of the historical and religious origins of the concept of loving one\'s enemies, along with its varying interpretations.',
        'A critique of Nietzsche\'s classification of Christian morality as slave-morality, particularly in relation to the injunction of loving one\'s enemies.',
        'An analysis of the moral obligations and psychological implications of loving one\'s enemies, drawing from different philosophical traditions.',
        'A juxtaposition of Western thought and Nietzschean perspectives on morality, assessing the feasibility and rationale behind loving one\'s adversaries.',
      ]),
      mcq('VARC', 10, 'C', 'Which of the following can be inferred about the upcoming boom in mining?', [
        'It was long overdue and was delayed because of a lack of investor interest that has since recovered owing to the transition towards green energy.',
        'Any deal would probably be far smaller than the largest ones made during the previous cycle, and mining executives could still be wary because of the ghosts of agreements past.',
        'It can be seen as the first deal wave of the green transition, as demand for "green" metals like copper is expected to increase due to the growth of electric vehicles and other green industries.',
        'It can be seen as an industry freed from a decade of inaction, as mining bosses are once again dreaming up fantasy deals due to the surge in commodity prices.',
      ]),
      mcq('VARC', 12, 'D', 'Which one of the following statements, if false, could be seen as contradicting the facts/arguments in the passage?', [
        'The mining industry\'s current focus on acquisitions rather than new projects is driven by the low availability of capital for developing new projects.',
        'China\'s overdependence on coal and iron ores has led to a shortage of non-ferrous metals, particularly copper, making copper mining lucrative for American companies.',
        'Mining companies that position themselves as green metals "pure play" are less attractive to investors compared to companies with a diversified portfolio.',
        'The revival of deal activity in the mining industry can be primarily attributed to the surge in commodity prices and the prospects of increased demand for green metals.',
      ]),
      mcq('VARC', 17, 'C', 'The passage given below is followed by four alternate summaries. Choose the option that best captures the essence of the passage.\n\nPolitical labels are not static, of course, but evolve in response to changing realities, insights, and sensibilities. The long-standing distinction between so-called developed and developing countries, for instance, has been critiqued for relying both implicitly and explicitly on a teleological standard of linear progress that classifies nations along a spectrum, according to how closely they approximate a Western model. For these reasons, the World Bank announced in 2015 that it would start phasing out its use of the term “developing world,” noting that the Sustainable Development Goals (SDGs)—intended to guide global efforts at improving the human condition through 2030—were meant to apply to all countries, regardless of income status.', [
        'The phasing out of the term \'developing world\' by The World Bank illustrates how political labels change in response to mandates by organisations or society in general.',
        'The World Bank\'s 2015 decision to phase out the term \'developing world\' has had a considerable impact on the perception of political labels.',
        'Perceptions of political labels shift in accordance with changing circumstances, as exemplified by the World Bank\'s decision to phase out the term \'developing world\' in 2015.',
        'The World Bank’s decisions to phase out the term “developing world” sets the stage for more inclusivity when it comes to guiding global efforts to improve socio-economic conditions.',
      ]),
    ];
  }
  if (n === 2) {
    return [
      mcq('DILR', 25, 'A', 'If \'M\' is the sum of passcodes for stages 1 and 2, find the sum of digits of M.', ['44', '41', '36', '47']),
      mcq('DILR', 36, 'C', 'Total millets produced during a period of 4 consecutive financial years is termed as sentinal value. What is the the ratio of maximum possible sentinal value to the minimum possible sentinal value for the given period?', ['2:1', '54:25', '11:5', 'None of the above']),
      { qnum: 47, section: 'Quant', topic: 'Quant', type: 'TITA', answer: '350', options: [], question: 'A survey of 800 students was conducted to know about the liking of cricketers of students. It was found that 700 students liked Virat Kohli, 550 students liked Rohit Sharma and 300 students liked K.L Rahul. Find the maximum number of students who like exactly one cricketer if it is known that every student liked at least one cricketer.' },
    ];
  }
  return [];
}

const PASSCODE_SET = `Mystery Rooms is a puzzle challenge where all the participants are locked in a room. To find their way out, they must solve each puzzle to get the passcode for each stage. Five friends take part. There are two stages. Only after finishing stage 1 can they reach stage 2.

The passcode for stage 1 is a 7-digit number: PQRSTUV.
The passcode for stage 2 is a 10-digit number: JIHGFEDCBA.

Stage 1. P, Q, R, S, T, U and V are unique single-digit natural numbers which are either prime or composite.
Average of all the numbers is an integer.
UQ is a prime number.
PQRS + SRQP = QVSU

Stage 2. Alphabets A to J are unique single-digit whole numbers. The mark x means multiplication.
\`\`\`
      A B C
    × C D E
    -------
    G F B E
  H H A I
D J F C
---------
D A H G B E
\`\`\``;

const MILLET_SET = `The graph below is the percentage of millets produced in each financial year, out of the total millets produced in India from 2001-02 to 2018-19.

The total millets produced in India during this period is 2500 million tonnes.
\`\`\`
Year       %
2001-02    5
2002-03    9
2003-04    5
2004-05    6
2005-06    3
2006-07    4
2007-08    2.5
2008-09    3
2009-10    6
2010-11    7.5
2011-12    6
2012-13    4
2013-14    5.5
2014-15    6
2015-16    6.5
2016-17    7
2017-18    7.5
2018-19    6.5
\`\`\``;

function attachMock2Sets(out) {
  for (const q of out) {
    if (q.qnum >= 25 && q.qnum <= 29 && !q.question.includes('Mystery Rooms')) {
      q.question = `${PASSCODE_SET}\n\n${q.question}`;
    }
    if (q.qnum >= 35 && q.qnum <= 38 && !q.question.includes('2500 million tonnes')) {
      q.question = `${MILLET_SET}\n\n${q.question}`;
    }
  }
}

function withGaps(n, out) {
  const have = new Set(out.map((q) => q.qnum));
  const added = [];
  for (const g of gapFill(n)) {
    if (have.has(g.qnum)) continue;
    if (!usable(g)) continue;
    out.push(g);
    added.push(g.qnum);
  }
  out.sort((a, b) => a.qnum - b.qnum);
  return added;
}

// --- CAT 2020 --------------------------------------------------------------

function oddNumber(question, answer) {
  if (!/key in the number/i.test(question)) return null;
  const letter = String(answer).trim().match(/^([A-E])\b/);
  if (!letter) return null;
  return String('ABCDE'.indexOf(letter[1]) + 1);
}

function score2020(q) {
  const question = [plain(q.passage), plain(q.question)].filter(Boolean).join('\n\n');
  const raw = String(q.answer || '').trim();
  if (q.type === 'TITA') {
    const odd = oddNumber(question, raw);
    if (odd) return { type: 'TITA', answer: odd, options: [], question, topic: plain(q.topic) || 'VARC' };
    const order = raw.match(/^([A-E]{4,5})\b/);
    const num = raw.match(/^(-?\d+(?:\.\d+)?)\b/);
    const answer = order ? order[1] : num && raw.length < 48 ? num[1] : raw;
    if (!answer || answer === '(see 2IIM)') return null;
    return { type: 'TITA', answer, options: [], question, topic: plain(q.topic) || q.section };
  }
  const choice = raw.match(/^(?:Ch\w*ce\s+)?([A-D])\b/i);
  if (!choice) return null;
  const options = letterOptions((q.options || []).map(plain));
  if (options.length !== 4) return null;
  return { type: 'MCQ', answer: choice[1].toUpperCase(), options, question, topic: plain(q.topic) || q.section };
}

function load2020(bank) {
  const src = JSON.parse(read(src2020));
  const groups = new Map();
  for (const q of src.questions) {
    if (q.year !== 2020) continue;
    const section = q.section === 'QA' ? 'Quant' : q.section;
    const key = q.slot;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...q, section });
  }
  const added = [];
  const skipped = [];
  const order = { VARC: 0, DILR: 1, Quant: 2 };
  for (const slot of [1, 2, 3]) {
    const list = (groups.get(slot) || []).slice().sort((a, b) => order[a.section] - order[b.section] || a.qnum - b.qnum);
    const usableQs = [];
    for (const q of list) {
      const scored = score2020(q);
      if (!scored) {
        skipped.push(`2020 s${slot} ${q.section} Q${q.qnum}`);
        continue;
      }
      usableQs.push({ section: q.section, ...scored });
    }
    const counts = countsOf(usableQs);
    if (!full(counts, EXPECT76)) {
      skipped.push(`2020 s${slot} incomplete VARC ${counts.VARC} DILR ${counts.DILR} QA ${counts.Quant}`);
      continue;
    }
    const id = `cat-2020-s${slot}`;
    const label = `CAT 2020 Slot ${slot}`;
    pushPaper(bank, {
      id, year: 2020, slot, label, counts, total: usableQs.length, complete: true, kind: 'cat',
    }, usableQs.map((q, i) => packQuestion(id, 2020, slot, label, `${label} · 2IIM on-page key`, q, i)));
    added.push(`${label} (${usableQs.length})`);
  }
  return { added, skipped };
}

// --- CAT 2024 Slot 2 inequality --------------------------------------------

function patch2024(bank) {
  const id = 'cat-2024-s2';
  const qs = bank.questions.filter((q) => q.paperId === id);
  if (qs.some((q) => /frac\{1\}\{x\+5\}/.test(q.question) || /1\/\(x\+5\)/.test(q.question))) {
    return 'already present';
  }
  const at = qs.findIndex((q) => /4 x\^2\+4 y\^2/.test(q.question) || /4x\^2\+4y\^2/.test(q.question));
  if (at < 0) return 'could not find the following question, inequality not inserted';
  const inequality = {
    id: `${id}-qineq`,
    paperId: id,
    year: 2024,
    slot: 2,
    section: 'Quant',
    topic: 'Inequalities',
    type: 'MCQ',
    passage: '',
    question: 'All the values of \\(x\\) satisfying the inequality \\(\\frac{1}{x+5} \\leq \\frac{1}{2x-3}\\) are',
    options: [
      'A) \\(x<-5\\) or \\(x>\\frac{3}{2}\\)',
      'B) \\(x<-5\\) or \\(\\frac{3}{2}<x \\leq 8\\)',
      'C) \\(-5<x<\\frac{3}{2}\\) or \\(\\frac{3}{2}<x \\leq 8\\)',
      'D) \\(-5<x<\\frac{3}{2}\\) or \\(x>\\frac{3}{2}\\)',
    ],
    answer: 'B',
    explanation: '',
    difficulty: '',
    source: 'CAT 2024 Slot 2 · 2IIM on-page key',
  };
  qs.splice(at, 0, inequality);
  qs.forEach((q, i) => { q.id = `${id}-q${String(i + 1).padStart(2, '0')}`; });
  const counts = countsOf(qs);
  const paper = bank.papers.find((p) => p.id === id);
  paper.counts = counts;
  paper.total = qs.length;
  paper.complete = full(counts, EXPECT68);
  const start = bank.questions.findIndex((q) => q.paperId === id);
  const old = bank.questions.filter((q) => q.paperId === id).length;
  bank.questions.splice(start, old, ...qs);
  return `inserted inequality; quant ${counts.Quant}, total ${qs.length}, complete ${paper.complete}`;
}

// --- assemble --------------------------------------------------------------

const bank = JSON.parse(read(bankPath));
const replace = new Set(['cat-2020-s1', 'cat-2020-s2', 'cat-2020-s3', 'cl-free-1', 'cl-free-2', 'cracku-free-1', 'cracku-free-2', 'cracku-free-3']);
bank.papers = bank.papers.filter((p) => !replace.has(p.id));
bank.questions = bank.questions.filter((q) => !replace.has(q.paperId));

const report = [];

const y2020 = load2020(bank);
report.push(`CAT 2020: ${y2020.added.join('; ') || 'none'}`);
if (y2020.skipped.length) report.push(`  left out: ${y2020.skipped.slice(0, 12).join(' | ')}`);

report.push(`CAT 2024 Slot 2: ${patch2024(bank)}`);

for (const [file, id, label] of [
  ['free-mock-1', 'cl-free-1', 'Career Launcher Free Mock 1'],
  ['free-mock-2', 'cl-free-2', 'Career Launcher Free Mock 2'],
]) {
  const keys = clKeys(read(`${v2}/career-launcher/${file}-answers.md`));
  const parsed = parseCl(read(`${v2}/career-launcher/${file}.md`), keys);
  const qs = parsed.filter(usable);
  const counts = countsOf(qs);
  const ok = parsed.length === 68 && qs.length === 68 && full(counts, EXPECT68);
  const bad = parsed.filter((q) => !usable(q)).map((q) => `Q${q.n} ${q.bad || q.type}`);
  report.push(`${label}: ${ok ? '68' : 'NOT FULL'} VARC ${counts.VARC} DILR ${counts.DILR} QA ${counts.Quant}${bad.length ? ' — ' + bad.slice(0, 8).join('; ') : ''}`);
  if (!ok) continue;
  pushPaper(bank, {
    id, year: null, slot: null, label, counts, total: 68, complete: true, kind: 'mock',
  }, qs.map((q, i) => packQuestion(id, null, null, label, `${label} · MyZone Solutions key`, q, i)));
}

for (const n of [1, 2, 3]) {
  const parsed = parseCracku(n);
  const out = parsed.out;
  const filled = withGaps(n, out);
  if (n === 2) attachMock2Sets(out);
  const problems = parsed.problems.filter((p) => {
    const num = Number((p.match(/^Q(\d+)/) || [])[1]);
    return !filled.includes(num);
  });
  const counts = countsOf(out);
  const ok = out.length === 68 && full(counts, EXPECT68);
  const label = `Cracku Free Mock ${n}`;
  report.push(`${label}: ${ok ? '68' : out.length + '/68'} VARC ${counts.VARC} DILR ${counts.DILR} QA ${counts.Quant}`);
  if (problems.length) report.push(`  gaps: ${problems.slice(0, 14).join(' | ')}`);
  if (!out.length) continue;
  const id = `cracku-free-${n}`;
  const missing = problems.map((p) => p.match(/^Q(\d+)/)?.[1]).filter(Boolean);
  pushPaper(bank, {
    id, year: null, slot: null, label, counts,
    total: out.length,
    complete: ok,
    kind: 'mock',
    note: ok ? '' : `${out.length} of 68 · missing Q${missing.join(', Q')}`,
  }, out.map((q, i) => packQuestion(id, null, null, label, `${label} · Cracku review key`, q, i)));
}

bank.papers.sort((a, b) => {
  const ka = a.kind === 'mock' ? 1 : 0;
  const kb = b.kind === 'mock' ? 1 : 0;
  if (ka !== kb) return ka - kb;
  return (a.year || 0) - (b.year || 0) || (a.slot || 0) - (b.slot || 0) || a.label.localeCompare(b.label);
});

const seen = new Set();
let dup = 0;
let badMcq = 0;
let badTita = 0;
for (const q of bank.questions) {
  if (seen.has(q.id)) dup++;
  seen.add(q.id);
  if (q.type === 'MCQ' && (q.options.length !== 4 || !/^[A-D]$/.test(String(q.answer)))) badMcq++;
  if (q.type === 'TITA' && !String(q.answer || '').trim()) badTita++;
}
for (const p of bank.papers) {
  const n = bank.questions.filter((q) => q.paperId === p.id).length;
  if (n !== p.total) report.push(`COUNT MISMATCH ${p.label} paper ${p.total} questions ${n}`);
}

report.push(`Bank: ${bank.papers.length} papers, ${bank.questions.length} questions. Duplicate ids ${dup}. MCQ problems ${badMcq}. Empty TITA ${badTita}.`);
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2) + '\n');
console.log(report.join('\n'));
