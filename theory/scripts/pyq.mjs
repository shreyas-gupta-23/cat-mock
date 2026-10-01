import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sectionHead } from "./chrome.mjs";

const JSON_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../inbox/pyq-json/cat_2017_2020.json"
);

export const PAPERS = [
  [2017, 1],
  [2017, 2],
  [2018, 1],
  [2018, 2],
  [2019, 1],
  [2019, 2],
  [2020, 1],
  [2020, 2],
  [2020, 3],
];

export function loadPyq() {
  const raw = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  return raw.questions.map((q) => {
    const slug = classify(q);
    const va = slug === "va";
    return {
      ...q,
      slug,
      setTitle: va ? vaLabel(q) : q.setTitle,
      passage: va ? "" : q.passage,
    };
  });
}

function vaLabel(q) {
  const s = q.question;
  if (/summar/i.test(s)) return "Para summary";
  if (/odd one|does not fit|Five jumbled/i.test(s)) return "Odd sentence";
  if (/sequenced|four sentences|labelled A/i.test(s)) return "Para jumble";
  return "Verbal ability";
}

export function classify(q) {
  if (q.section === "VARC") return classifyVarc(q);
  if (q.section === "DILR") return classifyDilr(q);
  return classifyQa(q);
}

function classifyVarc(q) {
  const s = q.question;
  if (
    /four sentences|five jumbled|five sentences|properly sequenced|odd one|does not fit|alternate summaries|summaries\. Choose|labelled A, B, C/i.test(
      s
    )
  ) {
    return "va";
  }
  if (q.type === "TITA" && /[1-5][\.\)]/.test(s) && (s.match(/[1-5][\.\)]/g) || []).length >= 4) {
    return "va";
  }
  return "rc";
}

function classifyDilr(q) {
  const h = `${q.setTitle} ${q.passage} ${q.question}`.toLowerCase();
  if (/<table/i.test(q.passage || "")) return "tables";
  if (
    /table|chart|graph|bar graph|pie |sales|revenue|production|survey|index|vendor|contract|rainfall|patients|pizza|led tv|supermarket|crimes|assets|happiness index|tea tasting|currency exchange|accreditation|smartphones/i.test(
      h
    )
  ) {
    return "tables";
  }
  return "sets";
}

function classifyQa(q) {
  const t = `${q.topic} ${q.topicTag}`.toLowerCase();
  const rules = [
    ["geometry", /geometry|mensuration|coordinate|co-ordinate|cogeo|triangle|circle|trigon/],
    ["tsd", /speed|distance|race/],
    ["time-work", /pipe|cistern|work/],
    ["interest", /interest|\bsici\b|si & ci/],
    ["profit-loss", /profit|loss|discount/],
    ["percentages", /percent/],
    ["mixtures", /mixture|alligation|alloy/],
    ["averages", /average/],
    ["ratio", /ratio|proportion|partnership/],
    ["modern", /permut|combin|probability|set theory|settheory|counting/],
    ["algebra", /algebra|equation|inequal|function|quadratic|logarithm|\blog\b|exponent|progress|sequence|series|modulus|polynomial|linear/],
    ["numbers", /number|digit|remainder|factor|hcf|lcm|divisib/],
  ];
  for (const [slug, re] of rules) {
    if (re.test(t)) return slug;
  }
  return "algebra";
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function groupKey(q) {
  return q.passage || q.setTitle || q.id;
}

function groups(qs) {
  const out = [];
  for (const q of qs) {
    const key = groupKey(q);
    const last = out[out.length - 1];
    if (last && last.key === key) last.items.push(q);
    else out.push({ key, title: q.setTitle, passage: q.passage, items: [q] });
  }
  return out;
}

function renderOne(q) {
  const opts = (q.options || [])
    .filter((o) => String(o).trim())
    .map(
      (o, i) =>
        `<li><span class="opt-k">${String.fromCharCode(65 + i)}</span> ${esc(o)}</li>`
    )
    .join("");
  const stem = q.questionHtml || esc(q.question);
  return `<details class="q pyq">
  <summary>
    <div class="q-meta">
      <span class="chip gold">${esc(q.paper)}</span>
      <span class="chip">${esc(q.section)} Q${q.qnum}</span>
      <span class="chip">${esc(q.type)}</span>
      <span class="chip">${esc(q.topic)}</span>
    </div>
    <div class="q-stem">${stem}</div>
    ${
      opts
        ? `<ol class="opts">${opts}</ol>`
        : `<p class="tita-tag">TITA — no options, no negative marking.</p>`
    }
  </summary>
  <div class="qbody">
    <p><span class="key">${esc(q.answer)}</span></p>
    <p class="src"><a href="${esc(q.sourceUrl)}">${esc(q.paper)} · 2IIM</a></p>
  </div>
</details>`;
}

function renderGroups(qs) {
  return groups(qs)
    .map((g) => {
      const inner = g.items.map(renderOne).join("\n");
      if (g.passage && g.items.length >= 1) {
        const title = (g.title || g.items[0].paper).replace(/The passage below is accompanied by a set of…?/i, "RC");
        return `<div class="set">
  <p class="set-kicker">${esc(title)}</p>
  <div class="passage">${g.passage}</div>
  ${inner}
</div>`;
      }
      return inner;
    })
    .join("\n");
}

export function renderTopicPyq(slug, all) {
  const qs = all
    .filter((q) => q.slug === slug)
    .sort((a, b) => a.year - b.year || a.slot - b.slot || a.qnum - b.qnum);
  const byYear = {};
  for (const q of qs) {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
  }
  const tally = Object.entries(byYear)
    .map(([y, n]) => `${y}: ${n}`)
    .join(" · ");
  return `
${sectionHead("questions", "02", "CAT 2017–2020 PYQs")}
<p class="bank-note">${qs.length} authentic items from 2IIM’s public papers, tagged with year and slot. ${tally}. Open a question for the official answer. Figures load from 2IIM.</p>
${renderGroups(qs)}
`;
}

export function renderPaper(year, slot, all) {
  const qs = all.filter((q) => q.year === year && q.slot === slot);
  const blocks = [
    ["VARC", "01", "VARC"],
    ["DILR", "02", "DILR"],
    ["QA", "03", "Quantitative aptitude"],
  ];
  return blocks
    .map(([sec, num, label]) => {
      const items = qs.filter((q) => q.section === sec).sort((a, b) => a.qnum - b.qnum);
      return `
${sectionHead(sec.toLowerCase(), num, label)}
<p class="bank-note">${items.length} questions · CAT ${year} Slot ${slot}.</p>
${renderGroups(items)}
`;
    })
    .join("\n");
}

export function paperFile(year, slot) {
  return `papers/cat-${year}-s${slot}.html`;
}

export function countsBySlug(all) {
  const c = {};
  for (const q of all) c[q.slug] = (c[q.slug] || 0) + 1;
  return c;
}
