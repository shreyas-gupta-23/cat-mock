if (/[?&]exam=1/.test(location.search)) document.body.classList.add("exam");

(function () {
  var root = document.documentElement;
  var key = "cat-notes-theme";
  var themes = [
    { id: "midnight", name: "Midnight" },
    { id: "ink", name: "Ink" },
    { id: "moss", name: "Moss" },
    { id: "wine", name: "Wine" },
    { id: "slate", name: "Slate" },
    { id: "mono", name: "Mono" }
  ];
  var legacy = { bone: "midnight", lamp: "wine", night: "midnight", olive: "moss", paper: "midnight", ocean: "ink", ember: "wine", dusk: "slate" };
  function find(id) { return themes.filter(function (t) { return t.id === id; })[0]; }
  var saved = "";
  try { saved = localStorage.getItem(key) || ""; } catch (e) {}
  if (legacy[saved]) saved = legacy[saved];
  if (!find(saved)) saved = "midnight";

  var tocBtn = document.getElementById("toc-btn");
  var studyBtn = document.getElementById("study-btn");
  var home = document.querySelector("#study-panel a.tool");
  var h1 = document.querySelector("article.page h1");

  var bar = document.createElement("header");
  bar.className = "topbar";
  var brand = document.createElement("a");
  brand.className = "brand";
  brand.href = home ? home.getAttribute("href") : "index.html";
  brand.innerHTML = "CAT<span>/26</span>";
  var crumb = document.createElement("span");
  crumb.className = "crumb";
  crumb.textContent = h1 ? h1.textContent : "";
  var spacer = document.createElement("span");
  spacer.className = "spacer";
  var label = document.createElement("span");
  label.className = "theme-name";
  var dots = document.createElement("div");
  dots.className = "theme-dots";
  dots.setAttribute("role", "radiogroup");
  dots.setAttribute("aria-label", "Theme");

  function apply(id) {
    root.setAttribute("data-notes", id);
    label.textContent = find(id).name;
    [].forEach.call(dots.children, function (b) {
      var on = b.getAttribute("data-notes") === id;
      b.classList.toggle("on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    try { localStorage.setItem(key, id); } catch (e) {}
    window.dispatchEvent(new CustomEvent("notes-theme"));
  }

  themes.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "dot " + t.id;
    b.title = t.name + " (press T to cycle)";
    b.setAttribute("data-notes", t.id);
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", t.name);
    b.addEventListener("click", function () { apply(t.id); });
    dots.appendChild(b);
  });

  if (tocBtn) bar.appendChild(tocBtn);
  bar.appendChild(brand);
  bar.appendChild(crumb);
  bar.appendChild(spacer);
  bar.appendChild(label);
  bar.appendChild(dots);
  if (studyBtn) bar.appendChild(studyBtn);
  document.body.insertBefore(bar, document.body.firstChild);

  var scrim = document.createElement("div");
  scrim.className = "scrim";
  scrim.addEventListener("click", function () {
    document.body.classList.remove("toc-open", "study-open");
    if (tocBtn) tocBtn.setAttribute("aria-expanded", "false");
    if (studyBtn) studyBtn.setAttribute("aria-expanded", "false");
  });
  document.body.appendChild(scrim);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "t" && e.key !== "T") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
    var i = themes.indexOf(find(root.getAttribute("data-notes")));
    var step = e.shiftKey ? themes.length - 1 : 1;
    apply(themes[(i + step) % themes.length].id);
  });

  function onScroll() { document.body.classList.toggle("scrolled", scrollY > 140); }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  apply(saved);
})();

(function () {
  var tocBtn = document.getElementById("toc-btn");
  var studyBtn = document.getElementById("study-btn");
  var examBtn = document.getElementById("exam-btn");
  var formulaBtn = document.getElementById("formula-btn");
  var drawBtn = document.getElementById("draw-btn");
  var printBtn = document.getElementById("print-btn");
  var draw = document.getElementById("draw");
  var toast = document.getElementById("toast");
  var progress = document.getElementById("progress");
  var links = [].slice.call(document.querySelectorAll("#toc a"));
  var sections = links.map(function (a) {
    var href = a.getAttribute("href") || "";
    return href.charAt(0) === "#" ? document.getElementById(href.slice(1)) : null;
  }).filter(Boolean);

  var questions = [].slice.call(document.querySelectorAll(".check li")).map(function (li) {
    return li.innerHTML;
  });
  if (!questions.length) {
    questions = [].slice.call(document.querySelectorAll("details.q .q-stem, .card.problem .trigger, details.q summary")).map(function (el) {
      return el.innerHTML;
    });
  }

  var marks = {
    groups: "  ∘   G\n   ⊕  ⟨a⟩\n  Z/nZ\n    φ\n  [m]P\n   ECDLP",
    crypto: "  ∘   G\n   ⊕  ⟨a⟩\n  Z/nZ\n    φ\n  [m]P\n   ECDLP",
    number: "  a≡b\n   φ(n)\n  (a/p)\n   CRT\n  QR_n\n   Blum",
    owf: "  x → f(x)\n   hard ←\n  trapdoor\n   h.c.p.\n  f(x)·r\n   GL",
    complexity: "  PPT\n   P⊂NP\n  Adv_D\n   H0 H1\n  negl(n)\n   ≈_c",
    prng: "  G(s)\n   seed\n  01011\n   stretch\n  next-bit\n   hybrid",
    python: "  >>>\n  np.array\n  0.1+0.2\n   λ x\n  def f():\n   plot",
    software: "  UML\n   MVC\n  sprint\n   NFR\n  layer\n   → →",
    dsa: "  [a,b]\n   O(n)\n    /\\\n   /  \\\n  stack\n   → →",
    play: "  Act I\n   aside\n  [gun]\n   attic\n  orchard\n   · · ·",
    cat: "  %ile\n   2ab/(a+b)\n  (1-x/V)^n\n   AM-GM\n  VARC\n   DILR"
  };

  function setRail(which, open) {
    if (which === "toc") {
      document.body.classList.toggle("toc-open", open);
      if (tocBtn) tocBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        document.body.classList.remove("study-open");
        if (studyBtn) studyBtn.setAttribute("aria-expanded", "false");
      }
    } else {
      document.body.classList.toggle("study-open", open);
      if (studyBtn) studyBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        document.body.classList.remove("toc-open");
        if (tocBtn) tocBtn.setAttribute("aria-expanded", "false");
      }
    }
  }
  if (tocBtn) tocBtn.addEventListener("click", function () {
    setRail("toc", !document.body.classList.contains("toc-open"));
  });
  if (studyBtn) studyBtn.addEventListener("click", function () {
    setRail("study", !document.body.classList.contains("study-open"));
  });
  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") {
        setRail("toc", false);
        return;
      }
      var el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      setRail("toc", false);
      if (history.replaceState) history.replaceState(null, "", href);
      else location.hash = href;
      requestAnimationFrame(function () {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setRail("toc", false); setRail("study", false); }
  });

  function setMode(mode) {
    document.body.classList.remove("exam", "formulas");
    if (examBtn) examBtn.classList.remove("on");
    if (formulaBtn) formulaBtn.classList.remove("on");
    if (mode === "exam") { document.body.classList.add("exam"); if (examBtn) examBtn.classList.add("on"); }
    if (mode === "formulas") { document.body.classList.add("formulas"); if (formulaBtn) formulaBtn.classList.add("on"); }
  }
  if (examBtn) examBtn.addEventListener("click", function () {
    setMode(document.body.classList.contains("exam") ? "" : "exam");
  });
  if (formulaBtn) formulaBtn.addEventListener("click", function () {
    setMode(document.body.classList.contains("formulas") ? "" : "formulas");
  });
  if (printBtn) printBtn.addEventListener("click", function () {
    setRail("study", false);
    window.print();
  });

  function typeset(el) {
    function go() {
      if (!window.MathJax || !MathJax.typesetPromise) return;
      if (MathJax.typesetClear) {
        try { MathJax.typesetClear([el]); } catch (err) {}
      }
      MathJax.typesetPromise([el]).catch(function () {});
    }
    if (window.MathJax && MathJax.startup && MathJax.startup.promise) {
      MathJax.startup.promise.then(go);
    } else {
      go();
    }
  }

  if (drawBtn && draw) drawBtn.addEventListener("click", function () {
    if (!questions.length) return;
    var q = questions[Math.floor(Math.random() * questions.length)];
    draw.innerHTML = "<span class=\"lbl\">Question</span><div class=\"draw-q\">" + q + "</div>";
    typeset(draw);
  });

  function reviewed() {
    var boxes = document.querySelectorAll(".review input");
    var foot = document.getElementById("toc-foot");
    if (!foot || !boxes.length) return;
    var n = 0;
    boxes.forEach(function (b) { if (b.checked) n++; });
    foot.textContent = n + " of " + boxes.length + " sections reviewed";
  }
  document.querySelectorAll(".review input").forEach(function (b) {
    b.addEventListener("change", reviewed);
  });
  reviewed();

  document.querySelectorAll(".copy-eq").forEach(function (b) {
    b.addEventListener("click", function () {
      navigator.clipboard.writeText(b.parentElement.getAttribute("data-tex") || "").then(function () {
        if (!toast) return;
        toast.textContent = "Equation copied";
        toast.classList.add("show");
        setTimeout(function () { toast.classList.remove("show"); }, 1100);
      });
    });
  });

  function paintMarks(theme) {
    var t = marks[theme] || marks.groups;
    var tocMark = document.getElementById("toc-mark");
    var studyMark = document.getElementById("study-mark");
    if (tocMark) tocMark.textContent = t;
    if (studyMark) studyMark.textContent = t;
  }
  paintMarks(document.body.getAttribute("data-theme") || "groups");
  document.querySelectorAll("button[data-theme]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("button[data-theme]").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      var th = btn.getAttribute("data-theme");
      document.body.setAttribute("data-theme", th);
      paintMarks(th);
    });
  });

  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    var current = sections[0] && sections[0].id;
    sections.forEach(function (el) {
      if (el.getBoundingClientRect().top < 110) current = el.id;
    });
    links.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

(function () {
  var canvas = document.getElementById("field");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var paper = document.querySelector("article.page");
  if (!ctx || !paper) return;
  var mouse = { x: -9999, y: -9999 };
  var bits = [];
  var stamps = [];
  var shapes = [];
  var themes = {
    groups: {
      glyphs: ["∘","⊕","⊗","ℤ","φ","∞","⟨a⟩","gˣ","P","Q","F_q","[m]P","Z/n","H≤G","ECDLP","∈","∀","∃","→","×","○","◆","▲","□","╱","╲"],
      stamps: ["┌─┐\n│+│\n└─┘"," /\\\n/  \\\n────"," ⟨ ⟩ ","[ m ]","Z/nZ","g^x","P+Q","H ≤ G"],
      wall: "#050506", ink: "#c4a86a", glow: "#e8d5a0"
    },
    number: {
      glyphs: ["≡","φ","gcd","CRT","(a/p)","QR","n|a-b","ℤ_n","λ","Blum","±1","mod","y²","p·q","φ(n)","│","─","○","□","×"],
      stamps: ["a ≡ b\n mod n","CRT\n× ×","(a/p)","QR_p","φ(n)","x² ≡ a","p≡3(4)","n=pq"],
      wall: "#050506", ink: "#c4a86a", glow: "#e8d5a0"
    },
    owf: {
      glyphs: ["f","x","y","→","←","¹","td","hcp","⟨x,r⟩","GL","OWP","inv","PPT","Adv","1^n","⊕","·","□","○","│"],
      stamps: ["x → f(x)","hard ←","trapdoor","h.c.p.","f(x)·r","Gen","Inv","owf"],
      wall: "#060504", ink: "#c9a06a", glow: "#efd3a0"
    },
    complexity: {
      glyphs: ["P","NP","BPP","PPT","TM","≈_c","H_i","negl","Adv","Δ","poly","SAT","RP","ZPP","∀","∃","│","─","□","○"],
      stamps: ["P ⊂ NP","PPT A","H0→H1","Adv_D","negl(n)","≈_c","TM","BPP"],
      wall: "#050508", ink: "#b8a878", glow: "#e4d6a8"
    },
    prng: {
      glyphs: ["G","s","0","1","→","ℓ","H_k","nb","seed","U_ℓ","stretch","⊕","bit","PRF","│","─","○","□","·"],
      stamps: ["G(s)","seed\n │\n v","01011","next-bit","H_k","stretch","U_n","PRG"],
      wall: "#050607", ink: "#c2ab72", glow: "#ead7a4"
    },
    python: {
      glyphs: [">>>","np","λ","0.1","axis","def","None","NaN","plot","f64","for","sin","dx","π","e","#","│","─","~","^"],
      stamps: [">>> _","np.sin","0.1+0.2","def f():","[::]","y = ax","IEEE","ε"],
      wall: "#050807", ink: "#8fd0b0", glow: "#c8ead8"
    },
    software: {
      glyphs: ["UML","MVC","NFR","use","class","seq","layer","pipe","repo","sprint","XP","CI","→","□","○","│"],
      stamps: ["MVC\n V\n M C","layer\nlayer","client\n  |\nserver","pipe | filter","sprint","NFR"],
      wall: "#050608", ink: "#9bb8d4", glow: "#c8d8ec"
    },
    dsa: {
      glyphs: ["[]","O(n)","O(1)","→","head","push","pop","/\\","dp","i..j","stack","heap","BFS","DFS","mid","lo","hi","│","─","◆"],
      stamps: ["  *\n / \\\n*   *","[1|2|3]","top\n |\n v","n-1","l <-> r","dp[][]","lo..hi"],
      wall: "#05060a", ink: "#9ec4d4", glow: "#c8e4f0"
    },
    play: {
      glyphs: ["I","II","III","Act","…","“","”","·","—","attic","gun","loft","tree","duck","§","¶","│","─"],
      stamps: ["Act I","[aside]","· · ·","attic","gun","loft","trees","notes"],
      wall: "#080706", ink: "#c4ae7a", glow: "#ead9a8"
    },
    cat: {
      glyphs: ["%","∑","÷","√","π","Δ","AM","HM","CI","SP","MP","RC","LR","QA","99.7","│","─","○","□","×"],
      stamps: ["a+b+ab/100","2ab/(a+b)","(1-x/V)^n","CI−SI","HCF·LCM","AM≥GM","VARC","DILR"],
      wall: "#050506", ink: "#c4a86a", glow: "#e8d5a0"
    }
  };
  themes.crypto = themes.groups;

  function themeName() {
    return document.body.getAttribute("data-theme") || "groups";
  }
  function theme() {
    return themes[themeName()] || themes.groups;
  }
  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    spawn();
  }
  function spawn() {
    var th = theme();
    var g = th.glyphs;
    var n = Math.max(220, Math.floor((innerWidth * innerHeight) / 3800));
    bits = [];
    for (var i = 0; i < n; i++) {
      bits.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        g: g[i % g.length],
        s: 10 + Math.random() * 16,
        v: 6 + Math.random() * 22,
        p: Math.random() * Math.PI * 2,
        a: 0.12 + Math.random() * 0.22
      });
    }
    stamps = [];
    var sn = Math.max(28, Math.floor((innerWidth * innerHeight) / 28000));
    for (var j = 0; j < sn; j++) {
      stamps.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        t: th.stamps[j % th.stamps.length],
        v: 4 + Math.random() * 10,
        p: Math.random() * Math.PI * 2,
        a: 0.1 + Math.random() * 0.14
      });
    }
    shapes = [];
    for (var k = 0; k < 18; k++) {
      shapes.push({
        kind: k % 5,
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: 18 + Math.random() * 42,
        v: 3 + Math.random() * 8,
        p: Math.random() * Math.PI * 2
      });
    }
  }
  var colors = { ink: "", glow: "" };
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    colors.ink = cs.getPropertyValue("--rain").trim() || theme().ink;
    colors.glow = cs.getPropertyValue("--rain-glow").trim() || theme().glow;
  }
  readColors();
  addEventListener("notes-theme", readColors);
  var foot = document.querySelector("footer.page");
  var lane = { top: 0, left: 0, right: 0, bottom: 0 };
  function measureLane() {
    var r = paper.getBoundingClientRect();
    var bottom = r.bottom;
    var left = r.left;
    var right = r.right;
    if (foot) {
      var f = foot.getBoundingClientRect();
      bottom = Math.max(bottom, f.bottom);
      left = Math.min(left, f.left);
      right = Math.max(right, f.right);
    }
    lane.top = r.top;
    lane.left = left;
    lane.right = right;
    lane.bottom = bottom;
  }
  measureLane();
  function fadeAt(x, y) {
    if (y < lane.top || y > lane.bottom) return 1;
    var d = x < lane.left ? lane.left - x : x > lane.right ? x - lane.right : 0;
    if (d < 16) return 0;
    return Math.min(1, (d - 16) / 64);
  }
  addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  addEventListener("resize", resize);
  new MutationObserver(spawn).observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var base = theme();
    var th = { glyphs: base.glyphs, stamps: base.stamps, ink: colors.ink, glow: colors.glow };
    measureLane();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    var ink = th.ink;
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i];
      b.y -= b.v * dt;
      b.x += Math.sin(now / 1400 + b.p) * 8 * dt;
      if (b.y < -24) { b.y = canvas.height + 24; b.x = Math.random() * canvas.width; }
      var fb = fadeAt(b.x, b.y);
      if (fb <= 0.02) continue;
      var d = Math.hypot(b.x - mouse.x, b.y - mouse.y);
      var glow = d < 160 ? (160 - d) / 160 * 0.45 : 0;
      ctx.globalAlpha = Math.min(0.85, b.a + glow) * fb;
      ctx.fillStyle = glow > 0.08 ? th.glow : ink;
      ctx.font = "500 " + b.s + "px 'IBM Plex Mono', monospace";
      ctx.fillText(b.g, b.x, b.y);
    }
    ctx.textAlign = "left";
    ctx.font = "500 11px 'IBM Plex Mono', monospace";
    for (var s = 0; s < stamps.length; s++) {
      var st = stamps[s];
      st.y -= st.v * dt;
      st.x += Math.sin(now / 1800 + st.p) * 5 * dt;
      if (st.y < -60) { st.y = canvas.height + 40; st.x = Math.random() * canvas.width; }
      var fs = fadeAt(st.x + 20, st.y + 16);
      if (fs <= 0.02) continue;
      ctx.globalAlpha = st.a * fs;
      ctx.fillStyle = ink;
      var lines = st.t.split("\n");
      for (var li = 0; li < lines.length; li++) ctx.fillText(lines[li], st.x, st.y + li * 13);
    }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    for (var sh = 0; sh < shapes.length; sh++) {
      var q = shapes[sh];
      q.y -= q.v * dt;
      q.x += Math.sin(now / 1600 + q.p) * 4 * dt;
      if (q.y < -50) { q.y = canvas.height + 40; q.x = Math.random() * canvas.width; }
      var fq = fadeAt(q.x, q.y);
      if (fq <= 0.02) continue;
      ctx.globalAlpha = 0.16 * fq;
      ctx.strokeStyle = ink;
      ctx.beginPath();
      if (q.kind === 0) ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
      else if (q.kind === 1) {
        ctx.moveTo(q.x, q.y - q.r);
        ctx.lineTo(q.x + q.r, q.y);
        ctx.lineTo(q.x, q.y + q.r);
        ctx.lineTo(q.x - q.r, q.y);
        ctx.closePath();
      } else if (q.kind === 2) {
        ctx.rect(q.x - q.r * 0.7, q.y - q.r * 0.7, q.r * 1.4, q.r * 1.4);
      } else if (q.kind === 3) {
        ctx.moveTo(q.x - q.r, q.y);
        ctx.lineTo(q.x + q.r, q.y);
        ctx.moveTo(q.x, q.y - q.r);
        ctx.lineTo(q.x, q.y + q.r);
      } else {
        ctx.moveTo(q.x, q.y - q.r);
        ctx.lineTo(q.x + q.r * 0.86, q.y + q.r * 0.5);
        ctx.lineTo(q.x - q.r * 0.86, q.y + q.r * 0.5);
        ctx.closePath();
      }
      ctx.stroke();
    }
    ctx.textAlign = "center";
    var r = lane;
    var ornaments = {
      groups: drawGroups, crypto: drawGroups, number: drawNumber, owf: drawOwf,
      complexity: drawComplexity, prng: drawPrng, python: drawPython, software: drawSoftware, dsa: drawDsa, play: drawPlay, cat: drawNumber
    };
    var fn = ornaments[themeName()];
    if (fn) fn(now, r, th);
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  function drawGroups(now, r, th) {
    var cx = r.right + Math.min(110, (canvas.width - r.right) * 0.55);
    var cy = canvas.height * 0.36;
    if (cx < canvas.width - 36 && r.right < canvas.width - 80) {
      ctx.globalAlpha = 0.28; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (var t = -1.4; t <= 1.4; t += 0.03) {
        var x = cx + t * 78, y = cy - (t * t * t - t) * 42;
        if (t === -1.4) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      var u = (Math.sin(now / 1800) + 1) / 2 * 2.6 - 1.3;
      var px = cx + u * 78, py = cy - (u * u * u - u) * 42;
      ctx.globalAlpha = 0.55; ctx.fillStyle = th.glow;
      ctx.beginPath(); ctx.arc(px, py, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "500 11px 'IBM Plex Mono', monospace";
      ctx.fillText("P", px + 10, py - 6);
      ctx.globalAlpha = 0.25; ctx.fillText("y² = x³ − x", cx, cy + 78);
    }
    var lx = Math.min(r.left * 0.45, 90), ly = canvas.height * 0.62;
    if (r.left > 80) {
      ctx.globalAlpha = 0.25; ctx.strokeStyle = th.ink;
      ctx.beginPath(); ctx.arc(lx, ly, 54, 0, Math.PI * 2); ctx.stroke();
      for (var k = 0; k < 12; k++) {
        var ang = -Math.PI / 2 + k * Math.PI / 6;
        var on = Math.floor((now / 700) % 12) === k;
        ctx.globalAlpha = on ? 0.65 : 0.2;
        ctx.fillStyle = on ? th.glow : th.ink;
        ctx.font = (on ? "600 13px" : "500 11px") + " 'IBM Plex Mono', monospace";
        ctx.fillText(String(k), lx + Math.cos(ang) * 54, ly + Math.sin(ang) * 54 + 4);
      }
      ctx.globalAlpha = 0.22; ctx.fillText("Z₁₂", lx, ly + 4);
    }
  }

  function drawNumber(now, r, th) {
    var lx = Math.min(r.left * 0.42, 88);
    var ly = canvas.height * 0.38;
    if (r.left > 80) {
      ctx.strokeStyle = th.ink; ctx.fillStyle = th.ink;
      ctx.globalAlpha = 0.28;
      ctx.beginPath(); ctx.arc(lx, ly, 40, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(lx, ly, 62, 0, Math.PI * 2); ctx.stroke();
      var a = (now / 900) % (Math.PI * 2);
      var b = (now / 1400) % (Math.PI * 2);
      ctx.globalAlpha = 0.55; ctx.fillStyle = th.glow;
      ctx.beginPath(); ctx.arc(lx + Math.cos(a) * 40, ly + Math.sin(a) * 40, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(lx + Math.cos(b) * 62, ly + Math.sin(b) * 62, 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = "500 11px 'IBM Plex Mono', monospace";
      ctx.globalAlpha = 0.28; ctx.fillText("CRT", lx, ly + 4);
      ctx.fillText("mod 3 · 5", lx, ly + 86);
    }
    if (r.right < canvas.width - 80) {
      var gx = r.right + 64, gy = canvas.height * 0.58;
      ctx.globalAlpha = 0.22; ctx.strokeStyle = th.ink; ctx.fillStyle = th.ink;
      ctx.font = "500 12px 'IBM Plex Mono', monospace";
      ctx.strokeRect(gx, gy, 86, 52);
      ctx.fillText("(a/p)", gx + 43, gy + 32);
      ctx.globalAlpha = 0.18;
      ctx.fillText("Jacobi", gx + 43, gy + 70);
    }
  }

  function drawOwf(now, r, th) {
    if (r.right >= canvas.width - 80) return;
    var x = r.right + 48, y = canvas.height * 0.34;
    ctx.strokeStyle = th.ink; ctx.fillStyle = th.ink;
    ctx.font = "500 12px 'IBM Plex Mono', monospace";
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(x, y, 36, 28);
    ctx.fillText("x", x + 18, y + 18);
    ctx.beginPath(); ctx.moveTo(x + 44, y + 14); ctx.lineTo(x + 88, y + 14); ctx.stroke();
    ctx.moveTo(x + 80, y + 8); ctx.lineTo(x + 88, y + 14); ctx.lineTo(x + 80, y + 20); ctx.stroke();
    ctx.strokeRect(x + 96, y, 48, 28);
    ctx.fillText("f(x)", x + 120, y + 18);
    ctx.globalAlpha = 0.18;
    ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.moveTo(x + 120, y + 40); ctx.lineTo(x + 18, y + 40); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText("hard", x + 70, y + 56);
    var pulse = 0.2 + 0.15 * Math.sin(now / 600);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = th.glow;
    ctx.fillText("trapdoor", x + 70, y + 92);
  }

  function drawComplexity(now, r, th) {
    if (r.right >= canvas.width - 80) return;
    var x = r.right + 40, y = canvas.height * 0.3;
    ctx.strokeStyle = th.ink; ctx.fillStyle = th.ink;
    ctx.font = "500 11px 'IBM Plex Mono', monospace";
    ctx.globalAlpha = 0.26;
    var i, head = Math.floor((now / 420) % 8);
    for (i = 0; i < 8; i++) {
      ctx.strokeRect(x + i * 18, y, 18, 22);
      ctx.globalAlpha = i === head ? 0.6 : 0.2;
      ctx.fillStyle = i === head ? th.glow : th.ink;
      ctx.fillText(String((i + Math.floor(now / 800)) % 2), x + i * 18 + 9, y + 15);
    }
    ctx.globalAlpha = 0.28; ctx.fillStyle = th.ink;
    ctx.fillText("TM", x + 72, y - 10);
    ctx.fillText("P ⊂ NP", x + 72, y + 52);
    var hy = y + 90;
    ctx.globalAlpha = 0.22;
    ctx.fillText("H0 → H1 → H2", x + 72, hy);
  }

  function drawPrng(now, r, th) {
    if (r.right >= canvas.width - 80) return;
    var x = r.right + 44, y = canvas.height * 0.36;
    ctx.strokeStyle = th.ink; ctx.fillStyle = th.ink;
    ctx.font = "500 11px 'IBM Plex Mono', monospace";
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(x, y, 34, 24);
    ctx.fillText("s", x + 17, y + 16);
    ctx.beginPath(); ctx.moveTo(x + 34, y + 12); ctx.lineTo(x + 58, y + 12); ctx.stroke();
    var bitsn = 14, i, t = Math.floor(now / 180);
    for (i = 0; i < bitsn; i++) {
      var on = ((t + i * 3) % 2) === 0;
      ctx.globalAlpha = on ? 0.55 : 0.18;
      ctx.fillStyle = on ? th.glow : th.ink;
      ctx.fillText(on ? "1" : "0", x + 70 + i * 10, y + 16);
    }
    ctx.globalAlpha = 0.25; ctx.fillStyle = th.ink;
    ctx.fillText("G(s)  stretch", x + 78, y + 44);
  }

  function drawPython(now, r, th) {
    var cx = r.right + Math.min(108, (canvas.width - r.right) * 0.52);
    var cy = canvas.height * 0.42;
    if (r.right < canvas.width - 80) {
      ctx.globalAlpha = 0.3; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (var t = 0; t <= 1; t += 0.02) {
        var x = cx - 70 + t * 140;
        var y = cy - Math.sin(t * Math.PI * 2 + now / 700) * 36;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 0.22;
      ctx.font = "500 11px 'IBM Plex Mono', monospace";
      ctx.fillStyle = th.ink;
      ctx.fillText("np.sin", cx, cy + 58);
      ctx.fillText(">>> 0.1 + 0.2", cx, cy + 76);
    }
  }

  function drawSoftware(now, r, th) {
    if (r.right >= canvas.width - 80) return;
    var x = r.right + 46, y = canvas.height * 0.34;
    ctx.strokeStyle = th.ink; ctx.fillStyle = th.ink;
    ctx.font = "500 11px 'IBM Plex Mono', monospace";
    ctx.globalAlpha = 0.28;
    ctx.strokeRect(x, y, 88, 22);
    ctx.fillText("view", x + 44, y + 15);
    ctx.strokeRect(x, y + 36, 88, 22);
    ctx.fillText("model", x + 44, y + 51);
    ctx.strokeRect(x, y + 72, 88, 22);
    ctx.fillText("ctrl", x + 44, y + 87);
    ctx.beginPath();
    ctx.moveTo(x + 44, y + 22); ctx.lineTo(x + 44, y + 36);
    ctx.moveTo(x + 44, y + 58); ctx.lineTo(x + 44, y + 72);
    ctx.stroke();
    ctx.globalAlpha = 0.22 + 0.12 * Math.sin(now / 700);
    ctx.fillText("MVC", x + 44, y + 118);
  }

  function drawDsa(now, r, th) {
    var cx = r.right + Math.min(100, (canvas.width - r.right) * 0.5);
    var cy = canvas.height * 0.32;
    if (r.right < canvas.width - 80) {
      ctx.globalAlpha = 0.3; ctx.strokeStyle = th.ink; ctx.fillStyle = th.ink;
      ctx.font = "500 12px 'IBM Plex Mono', monospace";
      function node(x, y, s) {
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke(); ctx.fillText(s, x, y + 4);
      }
      function edge(a, b, c, d) {
        ctx.beginPath(); ctx.moveTo(a, b + 11); ctx.lineTo(c, d - 11); ctx.stroke();
      }
      node(cx, cy, "8");
      edge(cx, cy, cx - 48, cy + 56); edge(cx, cy, cx + 48, cy + 56);
      node(cx - 48, cy + 56, "3"); node(cx + 48, cy + 56, "10");
      edge(cx - 48, cy + 56, cx - 78, cy + 112); edge(cx - 48, cy + 56, cx - 18, cy + 112);
      node(cx - 78, cy + 112, "1"); node(cx - 18, cy + 112, "6");
      ctx.globalAlpha = 0.25 + 0.2 * Math.sin(now / 500);
      ctx.fillText("heap", cx + 4, cy + 150);
    }
  }

  function drawPlay(now, r, th) {
    if (r.right >= canvas.width - 80) return;
    var x = r.right + 50, y = canvas.height * 0.32;
    ctx.strokeStyle = th.ink; ctx.fillStyle = th.ink;
    ctx.font = "500 12px 'IBM Plex Mono', monospace";
    ctx.globalAlpha = 0.22;
    ctx.strokeRect(x, y, 90, 120);
    ctx.fillText("I", x + 20, y + 36);
    ctx.fillText("II", x + 48, y + 36);
    ctx.fillText("III", x + 76, y + 36);
    var line = 0.15 + 0.08 * Math.sin(now / 800);
    ctx.globalAlpha = line;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 58); ctx.lineTo(x + 78, y + 58);
    ctx.moveTo(x + 12, y + 74); ctx.lineTo(x + 70, y + 74);
    ctx.moveTo(x + 12, y + 90); ctx.lineTo(x + 62, y + 90);
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.fillText("notes", x + 45, y + 112);
  }

  resize();
  requestAnimationFrame(frame);
})();

(function () {
  function keyLetter(text) {
    var t = String(text || "").replace(/\s+/g, " ").trim();
    var m = t.match(/^(?:Ch\w*ce\s+)?([A-D])\b/i);
    if (!m) return "";
    var rest = t.slice(m[0].length).trim();
    if (rest && !/^[—–-]/.test(rest)) return "";
    return m[1].toUpperCase();
  }
  [].forEach.call(document.querySelectorAll("details.q.pyq"), function (card) {
    var key = card.querySelector(".qbody .key");
    var letter = keyLetter(key ? key.textContent : "");
    if (!letter) return;
    [].forEach.call(card.querySelectorAll("ol.opts li"), function (li) {
      var mark = li.querySelector(".opt-k");
      if (mark && mark.textContent.trim().toUpperCase() === letter) li.classList.add("is-key");
    });
  });

  [].forEach.call(document.querySelectorAll("ol.opts"), function (ol) {
    var longest = 0;
    [].forEach.call(ol.children, function (li) {
      var mark = li.querySelector(".opt-k");
      var text = li.textContent.replace(/\s+/g, " ").trim();
      if (mark) text = text.slice(mark.textContent.trim().length).trim();
      longest = Math.max(longest, text.length);
    });
    if (ol.querySelector("img")) return;
    if (ol.children.length === 4 && longest <= 10) ol.classList.add("opts-row");
    else if (longest <= 38) ol.classList.add("opts-grid");
  });

  document.addEventListener("click", function (e) {
    var li = e.target.closest && e.target.closest("details.q.pyq ol.opts > li");
    if (!li) return;
    var card = li.closest("details");
    var again = li.classList.contains("picked");
    [].forEach.call(li.parentNode.children, function (x) { x.classList.remove("picked"); });
    if (document.body.classList.contains("exam")) {
      e.preventDefault();
      if (!again) li.classList.add("picked");
      return;
    }
    li.classList.add("picked");
    if (card.open) e.preventDefault();
  });
  document.addEventListener("toggle", function (e) {
    var card = e.target;
    if (!card.matches || !card.matches("details.q.pyq") || card.open) return;
    [].forEach.call(card.querySelectorAll("li.picked"), function (x) { x.classList.remove("picked"); });
  }, true);
})();
