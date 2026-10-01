import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page } from "./chrome.mjs";
import { TOPICS, theory } from "./content.mjs";
import {
  loadPyq,
  renderTopicPyq,
  renderPaper,
  paperFile,
  PAPERS,
  countsBySlug,
} from "./pyq.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pyq = loadPyq();
const counts = countsBySlug(pyq);

function write(rel, html) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
  console.log("wrote", rel, Buffer.byteLength(html), "bytes");
}

function cards(list) {
  return list
    .map((t) => {
      const n = counts[t.slug] || 0;
      return `<a href="${t.file}">
      <div class="meta">${t.chip} · ${n} PYQs</div>
      <h3>${t.title}</h3>
      <p>${t.blurb}</p>
    </a>`;
    })
    .join("\n    ");
}

function paperCards() {
  return PAPERS.map(([year, slot]) => {
    const n = pyq.filter((q) => q.year === year && q.slot === slot).length;
    const pattern = year === 2020 ? "76 Q · 3 sections" : "100 Q · 3 sections";
    return `<a href="${paperFile(year, slot)}">
      <div class="meta">Full paper · ${n} Q</div>
      <h3>CAT ${year} Slot ${slot}</h3>
      <p>${pattern}. VARC, DILR, then QA, with 2IIM answers.</p>
    </a>`;
  }).join("\n    ");
}

write(
  "index.html",
  page({
    title: "CAT 2026 theory",
    depth: 0,
    chips: [
      { text: "CAT 2026" },
      { text: "IIM A · 99.7", gold: true },
    ],
    lede: "Short sheets: every CAT-usable identity, none of the Class-10 filler. Practice is the real CAT 2017–2020 papers, classified the way 2IIM and Cracku split the syllabus — percentages / P&amp;L / SI-CI, ratios-mixtures-averages, TSD, work, geometry, numbers, algebra, modern maths; DILR as sets vs tables; VARC as RC vs VA.",
    toc: [
      { id: "how", label: "How" },
      { id: "qa", label: "QA" },
      { id: "rest", label: "DILR / VARC" },
      { id: "papers", label: "2017–2020 papers" },
    ],
    body: `
<h2 id="how">How to use this</h2>
<ol>
<li>Open a sheet. If you cannot see why a formula is there, you do not know the topic yet.</li>
<li>Exam mode (right rail) for a clean pass; Formulas for the slabs only.</li>
<li>Every topic ends with the actual CAT 2017–2020 questions on that idea, tagged by paper and slot. Then sit a full paper under Papers.</li>
<li>Order: arithmetic → algebra / numbers → geometry → modern maths. DILR is selection plus families. VARC is traps; there is no grammar syllabus.</li>
</ol>
<div class="take"><strong>Target.</strong> 99.7 / rank ~800 / scaled ~105–110, no section under 92. Profile in <code>PROFILE.md</code>. Simulator at <code>/</code> (2021–25).</div>
<p class="bank-note">${pyq.length} questions from nine public 2IIM papers (2017–19 two slots × 100 Q; 2020 three slots × 76 Q).</p>
<h2 id="qa">Quantitative aptitude</h2>
<div class="hub-grid">
    ${cards(TOPICS.filter((t) => t.file.startsWith("qa/")))}
</div>
<h2 id="rest">DILR and VARC</h2>
<div class="hub-grid">
    ${cards(TOPICS.filter((t) => !t.file.startsWith("qa/")))}
</div>
<h2 id="papers">CAT 2017–2020 papers</h2>
<div class="hub-grid">
    ${paperCards()}
</div>
`,
    footer: "CAT 2026 · IIM Ahmedabad track · General",
  })
);

for (const t of TOPICS) {
  const depth = t.file.split("/").length - 1;
  const n = counts[t.slug] || 0;
  const html = page({
    title: `${t.title} · CAT`,
    depth,
    chips: [{ text: "CAT 2026" }, { text: t.chip, gold: true }, { text: `${n} PYQs` }],
    lede: t.blurb,
    toc: [
      { id: "sheet", label: "Sheet" },
      { id: "questions", label: `PYQs (${n})` },
    ],
    body: theory(t.slug) + "\n" + renderTopicPyq(t.slug, pyq),
    footer: `${t.title} · CAT 2017–2020 PYQs`,
  });
  write(t.file, html);
}

for (const [year, slot] of PAPERS) {
  const rel = paperFile(year, slot);
  const n = pyq.filter((q) => q.year === year && q.slot === slot).length;
  write(
    rel,
    page({
      title: `CAT ${year} Slot ${slot}`,
      depth: 1,
      chips: [
        { text: "Full paper" },
        { text: `${n} questions`, gold: true },
      ],
      lede: `Public 2IIM HTML of CAT ${year} Slot ${slot}. Answers fold open. Figures load from 2IIM. Timed attempt belongs in the simulator for 2021–25; this page is for review and topic tagging.`,
      toc: [
        { id: "varc", label: "VARC" },
        { id: "dilr", label: "DILR" },
        { id: "qa", label: "QA" },
      ],
      body: renderPaper(year, slot, pyq),
      footer: `CAT ${year} Slot ${slot} · 2IIM public paper`,
    })
  );
}

console.log("classified", counts);
console.log("total PYQ", pyq.length);
