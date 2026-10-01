const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,650;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap";

export function eq(tex, display) {
  const shown = display || tex;
  return `<div class="eq" data-tex="${escapeAttr(tex)}"><button class="copy-eq" type="button">Copy</button>\\[${shown}\\]</div>`;
}

export function qItem(n, stem, answer, why = "") {
  const extra = why ? ` — ${why}` : "";
  return `<details class="q">
  <summary>${n}. ${stem}</summary>
  <div class="qbody"><p><span class="key">${answer}</span>${extra}</p></div>
</details>`;
}

export function page({
  title,
  depth,
  chips,
  lede,
  toc,
  body,
  footer,
}) {
  const rel = depth === 0 ? "" : "../";
  const tocLinks = toc
    .map(
      (t, i) =>
        `<a href="#${t.id}"><small>${String(i + 1).padStart(2, "0")}</small>${t.label}</a>`
    )
    .join("\n    ");
  const reviews = toc
    .filter((t) => t.review)
    .map(
      (t) =>
        `<label class="review"><input type="checkbox"> reviewed</label>`
    );
  // reviews sit in section-heads in body; chrome only needs toc.
  void reviews;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="${rel}css/notes.css">
<script>
MathJax = {
  tex: { inlineMath: [['\\\\(','\\\\)']], displayMath: [['\\\\[','\\\\]']] }
};
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
</head>
<body data-theme="cat">
<canvas id="field" aria-hidden="true"></canvas>
<div class="progress" id="progress"></div>
<button type="button" class="handle left" id="toc-btn" aria-expanded="false">Contents</button>
<button type="button" class="handle right" id="study-btn" aria-expanded="false">Study</button>
<aside class="rail left" id="toc-panel">
  <div class="rail-head">
    <p class="rail-kicker">CAT 2026 · IIM A</p>
    <h2>On this page</h2>
  </div>
  <nav class="rail-body toc" id="toc">
    ${tocLinks}
  </nav>
  <div class="rail-fill" aria-hidden="true"><div class="rail-mark" id="toc-mark"></div></div>
  <div class="rail-foot" id="toc-foot">Contents</div>
</aside>
<aside class="rail right" id="study-panel">
  <div class="rail-head">
    <p class="rail-kicker">Studio</p>
    <h2>Study</h2>
  </div>
  <div class="rail-body">
    <a class="tool" href="${rel}index.html"><small>All topics</small>Theory home</a>
    <button type="button" class="tool" id="exam-btn"><small>Hide commentary</small>Exam mode</button>
    <button type="button" class="tool" id="formula-btn"><small>Only the slabs</small>Formulas</button>
    <button type="button" class="tool" id="draw-btn"><small>From the PYQs</small>Draw a question</button>
    <button type="button" class="tool" id="print-btn"><small>Browser print</small>Print</button>
  </div>
  <div class="draw" id="draw"><span class="lbl">Question</span>Draw a question when you want a prompt without rereading the sheet.</div>
  <div class="rail-fill" aria-hidden="true"><div class="rail-mark" id="study-mark"></div></div>
  <div class="rail-foot">Exam mode keeps formulas, takeaways, traps, and the PYQs (answers hidden). Formulas hides the papers.</div>
</aside>
<article class="page" id="top">
  <header class="mast">
    <div class="meta-row">
      ${chips.map((c) => `<span class="chip${c.gold ? " gold" : ""}">${c.text}</span>`).join("\n      ")}
    </div>
    <h1>${title.replace(/ ·.*/, "")}</h1>
    <p class="lede">${lede}</p>
  </header>
${body}
</article>
<footer class="page">${footer}</footer>
<div class="toast" id="toast">Copied</div>
<script src="${rel}js/notes-ui.js"></script>
</body>
</html>
`;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function sectionHead(id, num, title) {
  return `<div class="section-head" id="${id}">
  <div class="num">${num}</div>
  <h2>${title}</h2>
  <label class="review"><input type="checkbox"> reviewed</label>
</div>`;
}
