# CAT Mocks Offline Pack

Agent-friendly offline pack of free / publicly captured CAT practice material.
Packaged: **1 Oct 2026** (Asia/Calcutta / IST).

**Primary study pack with keys:** `with-keys/` (CAT 2022–2025 slots, questions + on-page answers).  
**Detailed catalog:** `INVENTORY.md`  
**Access / gate notes:** `docs/`

---

## Quick map (what to open first)

| Goal | Path | Keys? |
| --- | --- | --- |
| CAT 2022–2025 PYQ with answers | `with-keys/CAT-YYYY-Slot-N-with-keys.md` | **Yes** (on-page 2IIM) |
| Same years, per section | `with-keys/CAT-YYYY-Slot-N-{VARC,DILR,Quant}-with-keys.md` | **Yes** |
| Earlier years 2017–2021 keys/extracts | `with-keys/earlier-years/` | Partial (see `MISSING-KEYS.md`) |
| Raw 2IIM HTML extracts 2022–2025 | `2iim-html/*.txt` | Keys in with-keys (preferred) |
| 2IIM PYQ PDFs 2017–2021 | `2iim-pyq/*.pdf` | Some answer-key PDFs |
| 2IIM Blitzkrieg topic PDFs | `2iim-blitzkrieg/` | Solutions via YouTube (README) |
| Cracku Free Mock 1–3 | `cracku/free-mock-N.md` + `free-mock-N-answers.md` | **Yes** (post-submit) |
| Cracku public solved PYQ PDFs | `cracku/pyq-public/` | **Yes** (in PDF) |
| Career Launcher free mocks / CAT 2025 slots | `career-launcher/` | **No** (keys delayed / session lost) |

---

## Folder tree

```
cat-mocks/
├── README.md                 ← you are here (human + agent index)
├── INVENTORY.md              ← detailed source catalog + blockers
├── docs/                     ← access notes, gates, catalogs for incomplete sources
├── with-keys/                ← polished PYQ pack (prefer this for 2022–2025)
├── 2iim-pyq/                 ← CAT 2017–2021 PDFs from 2IIM
├── 2iim-html/                ← CAT 2022–2025 raw text extracts (source for with-keys)
├── 2iim-blitzkrieg/          ← topic-wise Blitzkrieg PDFs (Ep 1–18)
├── cracku/                   ← Free Mock 1–3 + public solved PDFs
└── career-launcher/          ← Free Mock 1–2 + CAT 2025 Slot 1–3 questions
```

Each content folder has a `README.md` (or `INVENTORY.md` for Cracku) describing naming, keys status, and source URL.

---

## Naming conventions

| Area | Pattern | Example |
| --- | --- | --- |
| with-keys (full slot) | `CAT-YYYY-Slot-N-with-keys.md` | `CAT-2024-Slot-2-with-keys.md` |
| with-keys (section) | `CAT-YYYY-Slot-N-{VARC\|DILR\|Quant}-with-keys.md` | `CAT-2025-Slot-1-VARC-with-keys.md` |
| Cracku mocks | `free-mock-N.md` (questions) + `free-mock-N-answers.md` (keys/solutions) | `free-mock-2.md` |
| Career Launcher | `free-mock-N.md` / `free-mock-N-answers.md`; `cat-2025-slot-N.md` | `cat-2025-slot-3.md` |
| 2iim-html | `CAT-YYYY-Question-Paper-Slot-N-{VARC\|DILR\|Quant}.txt` | as named by 2IIM |
| 2iim-blitzkrieg | `Blitzkrieg-Series-Ep-N.pdf` | Ep 1–18 |

**Cracku convention (chosen):** keep `free-mock-N.md` + `free-mock-N-answers.md` (not zero-padded). Same pattern used under `career-launcher/`.

---

## Keys status summary

### Fully keyed (use these)

- **`with-keys/` CAT 2022–2025:** every listed question has an on-page **ANSWER** from public 2IIM pages. Prefer combined slot files.
- **`cracku/` Free Mock 1–3:** answer keys + text solutions captured after blank submit. See each `*-answers.md`.
- **`cracku/pyq-public/`:** solved PDFs (CAT 2025 Slot 1–3 VARC+Quant; CAT 1999/2001 papers).

### Partial / incomplete keys

- **`with-keys/earlier-years/` (2017–2021):** text extracts often TITA-only; MCQ keys often need opening the PDF (color / click-to-reveal). See `with-keys/MISSING-KEYS.md`.
- **`2iim-pyq/`:** question PDFs + some answer-key PDFs; missing `CAT-2020-Verbal-Slot1.pdf` (was 0-byte); some answer-key URLs 404’d historically.

### No keys (questions only)

- **`career-launcher/free-mock-1.md` / `free-mock-2.md`:** CL shows solutions ~1 day after the test window; `*-answers.md` files only record scorecard/session notes (no keys fabricated).
- **`career-launcher/cat-2025-slot-*.md`:** question captures; keys not in these files (use `with-keys/` for CAT 2025 instead).

---

## Skipped / not captured

| Source | Why |
| --- | --- |
| **InsideIIM** sectionals / daily mocks | Registration-gated interactive hub — no public PDFs. Notes in `docs/insideiim-access.md`. |
| **Quantifiers** TruCAT + PYQ PDFs | TruCAT is interactive-only; box TLS to `quantifiers.in` failed for PDF download. Notes + known URLs in `docs/`. |
| Cracku free sectionals (VARC/Quant/LRDI) | Login-gated; not separately captured. |
| Cracku CAT 2025 full-slot + DILR PDFs | Login-gated downloads. |
| Paid series | TIME AIMCAT, IMS SimCAT, Cracku DashCAT, etc. — not scraped. |

---

## How another agent should read this pack

1. Start at this `README.md`, then `INVENTORY.md` for blockers.
2. For PYQ drills with answers → `with-keys/` combined slot files.
3. For Cracku mocks → pair `cracku/free-mock-N.md` with `cracku/free-mock-N-answers.md`.
4. For CL mocks → questions in `career-launcher/`; treat `*-answers.md` as status notes only until keys are retrieved.
5. Do **not** invent answer keys. Gaps are documented in `with-keys/MISSING-KEYS.md` and `docs/`.

---

## Source hubs (public)

- 2IIM PYQ: https://online.2iim.com/CAT-question-paper/
- 2IIM Blitzkrieg: https://online.2iim.com/blitzkrieg
- Cracku free mocks: https://cracku.in/cat-mock-test
- Career Launcher freecatmock: https://www.careerlauncher.com/cat-mba/freecatmock/

Only publicly linked / already-unlocked material was saved. No paywall bypass.

## Download note (split packs)

Full pack exceeded the 100 MB transfer-to-computer limit, so use these two instead:

| Zip | Contents |
| --- | --- |
| `cat-mocks-keyed-study.zip` | with-keys, Cracku mocks+pyq-public, CL questions, 2iim-html, docs |
| `cat-mocks-2iim-pdfs.zip` | 2iim-pyq (2017–2021), 2iim-blitzkrieg |
