import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../inbox/pyq-html");
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../inbox/pyq-json/cat_2017_2020.json");

function decode(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\\\\frac/g, "\\frac")
    .replace(/\s+/g, " ")
    .trim();
}

function strip(html) {
  return decode(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}

function cleanMath(s) {
  return s
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_, a, b) => `\\(\\frac{${a}}{${b}}\\)`)
    .replace(/√(\d+)/g, (_, n) => `\\(\\sqrt{${n}}\\)`);
}

function absUrl(src, filename) {
  if (!src) return "";
  if (/^https?:/i.test(src)) return src;
  const dir = filename.replace(/\.html$/i, "");
  return `https://online.2iim.com/CAT-question-paper/${dir}/${src.replace(/^\.?\//, "")}`;
}

function keepRich(html, filename) {
  if (!html) return "";
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<img([^>]*)>/gi, (_, attrs) => {
    const m =
      attrs.match(/data-src=["']?([^\s"'>]+)/i) ||
      attrs.match(/\ssrc=["']?([^\s"'>]+)/i);
    if (!m) return "";
    return `<img class="pyq-fig" src="${absUrl(m[1], filename)}" alt="">`;
  });
  s = s.replace(/<(?!\/?(?:br|em|i|b|strong|sub|sup|table|thead|tbody|tr|td|th|img|p|ul|ol|li)\b)[^>]+>/gi, " ");
  s = s.replace(/<p\b[^>]*>/gi, "<p>").replace(/<br\s*\/?>/gi, "<br>");
  return s.replace(/\s+/g, " ").trim();
}

function protectChoices(html) {
  return html.replace(/<ol\s+class=["']?choice[\s\S]*?<\/ol>/gi, (m) =>
    m.replace(/<li/gi, "<chi").replace(/<\/li>/gi, "</chi>")
  );
}

function setsBefore(html, filename) {
  const out = [];
  const h3 = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi;
  let m;
  while ((m = h3.exec(html))) {
    const title = strip(m[1]);
    if (/CAT Questions/i.test(title)) continue;
    const after = html.slice(m.index + m[0].length);
    const untilOl = after.split(/<ol\s+class=["']?ques/i)[0];
    const untilLi = after.split(/<li\b/i)[0];
    const chunk = untilOl.length < untilLi.length ? untilOl : untilLi;
    out.push({
      index: m.index,
      title,
      passage: keepRich(chunk, filename),
    });
  }
  const just = /<p align=justify>([\s\S]*?)<\/p>/gi;
  while ((m = just.exec(html))) {
    const passage = keepRich(m[1], filename);
    const text = strip(m[1]);
    if (text.length < 80) continue;
    out.push({
      index: m.index,
      title: text.slice(0, 48).replace(/\s+\S*$/, "") + "…",
      passage: `<p>${passage}</p>`,
    });
  }
  out.sort((a, b) => a.index - b.index);
  return out;
}

function setAt(sets, index) {
  let cur = { title: "", passage: "" };
  for (const s of sets) {
    if (s.index <= index) cur = s;
    else break;
  }
  return cur;
}

function parseAnswer(chunk, options) {
  const tip = chunk.match(/class=["']?tooltiptext["']?[^>]*>([\s\S]*?)<\/span>/i);
  if (tip) {
    const bold = strip((tip[1].match(/<b>([\s\S]*?)<\/b>/i) || [])[1] || "");
    const after = strip(tip[1].replace(/<b>[\s\S]*?<\/b>/i, " "));
    return cleanMath((bold + (after ? " — " + after : "")).replace(/^[\s—]+/, "").trim());
  }
  const sans = chunk.match(/Correct Answer:\s*([^<]+)/i);
  if (sans) return cleanMath(strip(sans[1]));
  const cans = [...chunk.matchAll(/<chi([^>]*)>([\s\S]*?)<\/chi>/gi)];
  for (let i = 0; i < cans.length; i++) {
    if (/Cans/i.test(cans[i][1])) {
      const t = options[i] || cleanMath(strip(cans[i][2]));
      return `${String.fromCharCode(65 + i)}${t ? " — " + t : ""}`;
    }
  }
  return "";
}

function parseOptions(chunk) {
  const block = chunk.match(/<ol class=["']?choice[\s\S]*?>([\s\S]*?)<\/ol>/i);
  if (!block) return [];
  return [...block[1].matchAll(/<chi([^>]*)>([\s\S]*?)<\/chi>/gi)].map((x) =>
    cleanMath(strip(x[2]))
  );
}

function parseFile(filename) {
  const m = filename.match(/CAT-(\d{4})-Question-Paper-Slot-(\d)-(Quant|DILR|VARC)/i);
  if (!m) return [];
  const year = Number(m[1]);
  const slot = Number(m[2]);
  const section = m[3].toUpperCase() === "QUANT" ? "QA" : m[3].toUpperCase();
  const raw = fs.readFileSync(path.join(DIR, filename), "utf8");
  const html = protectChoices(raw);
  const sets = setsBefore(html, filename);
  const out = [];
  const re = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  let n = 0;
  let lastTopic = section;
  let lastTag = "";
  while ((match = re.exec(html))) {
    const chunk = match[1];
    const hasAns =
      /tooltiptext/i.test(chunk) ||
      /class=['"]?Sans/i.test(chunk) ||
      /class=['"]?Cans/i.test(chunk) ||
      /Correct Answer:/i.test(chunk);
    if (!hasAns) continue;
    const pm = chunk.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    if (!pm) continue;
    const stemHtml = keepRich(pm[1], filename);
    const stem = cleanMath(strip(pm[1]));
    if (stem.length < 8) continue;
    if (/^CAT Online Coaching/i.test(stem) || /CAT Previous Year Paper \/ /i.test(stem)) continue;

    const h4m = chunk.match(/<h4>([\s\S]*?)<\/h4>/i);
    const comment = ((chunk.match(/<!--([\s\S]*?)-->/) || [])[1] || "").trim();
    if (h4m) {
      const heading = strip(h4m[1]);
      lastTopic = heading.includes(" - ")
        ? heading.split(" - ").slice(1).join(" - ").trim()
        : heading.replace(/^CAT.*?(?:Slot \d|paper)\s*-?\s*/i, "").trim() || lastTopic;
      lastTag = comment || lastTag;
    } else if (comment) {
      lastTag = comment;
    }

    const options = parseOptions(chunk);
    const answer = parseAnswer(chunk, options);
    const tita = options.filter(Boolean).length < 2 || /\(TITA\)|\[TITA\]/i.test(stem);
    const set = setAt(sets, match.index);
    n += 1;
    out.push({
      id: `cat-${year}-s${slot}-${section.toLowerCase()}-q${String(n).padStart(2, "0")}`,
      year,
      slot,
      section,
      paper: `CAT ${year} Slot ${slot}`,
      qnum: n,
      topic: lastTopic || lastTag.replace(/_/g, " ") || section,
      topicTag: lastTag,
      setTitle: set.title,
      passage: set.passage,
      type: tita ? "TITA" : "MCQ",
      question: stem.replace(/\(TITA\)|\[TITA\]/gi, "").trim(),
      questionHtml: cleanMath(stemHtml.replace(/\(TITA\)|\[TITA\]/gi, "")).trim(),
      options,
      answer: answer || "(see 2IIM)",
      sourceUrl: `https://online.2iim.com/CAT-question-paper/${filename.replace(/\.html$/, "")}/`,
    });
  }
  return out;
}

const EXPECTED = {
  "2017-1-QA": 34, "2017-1-DILR": 32, "2017-1-VARC": 34,
  "2017-2-QA": 34, "2017-2-DILR": 32, "2017-2-VARC": 34,
  "2018-1-QA": 34, "2018-1-DILR": 32, "2018-1-VARC": 34,
  "2018-2-QA": 34, "2018-2-DILR": 32, "2018-2-VARC": 34,
  "2019-1-QA": 34, "2019-1-DILR": 32, "2019-1-VARC": 34,
  "2019-2-QA": 34, "2019-2-DILR": 32, "2019-2-VARC": 34,
  "2020-1-QA": 26, "2020-1-DILR": 24, "2020-1-VARC": 26,
  "2020-2-QA": 26, "2020-2-DILR": 24, "2020-2-VARC": 26,
  "2020-3-QA": 26, "2020-3-DILR": 24, "2020-3-VARC": 26,
  "2021-2-QA": 22, "2021-2-DILR": 20, "2021-2-VARC": 24,
  "2021-3-QA": 22, "2021-3-DILR": 20, "2021-3-VARC": 24,
};

const files = fs.readdirSync(DIR).filter((f) => /^CAT-20(17|18|19|20)-/.test(f));
const questions = [];
for (const f of files.sort()) {
  const qs = parseFile(f);
  const key = `${qs[0]?.year}-${qs[0]?.slot}-${qs[0]?.section}`;
  const exp = EXPECTED[key];
  const mark = exp && qs.length !== exp ? `  << expected ${exp}` : "";
  console.log(f, qs.length + mark);
  questions.push(...qs);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ count: questions.length, questions }, null, 2));
console.log("total", questions.length, "->", OUT);
