# CAT PYQ / mock sources — what we have, what still needs you

Personal study copies only. Papers belong to IIM / the host site.

## Already on disk (no login)

### CAT 2017–2020 HTML — `inbox/pyq-html/` + `inbox/pyq-json/cat_2017_2020.json`

All 27 public 2IIM section pages (4 years × slots × Quant/DILR/VARC) parsed to **828 questions** (2017–19: 100 Q × 2 slots × 3 years; 2020: 76 Q × 3 slots). Built into `theory/` topic sheets and `theory/papers/`.

Topic split follows 2IIM’s free bank (https://iim-cat-questions-answers.2iim.com/): arithmetic (percentages / P&L / SI-CI, ratios-mixtures-averages, TSD, work), numbers, algebra, geometry, modern maths; DILR as sets vs tables; VARC as RC vs VA (jumbles / summary / odd sentence).

### Authentic 2IIM PDFs — `inbox/pyq-pdf/`

These downloaded from 2IIM’s public PDF host (no account).

| Year | VARC | DILR | Quant |
|------|------|------|-------|
| 2024 slots 1–3 | yes | yes | yes |
| 2023 slots 1–3 | yes | yes | **missing** |
| 2022 slots 1–3 | yes | yes | slot 3 only |
| 2021 | no | yes (3 slots) | no |
| 2020 | no | yes (3 slots) | no |
| 2025 | no PDF | no PDF | no PDF |

**Best 2IIM no-login HTML** (full questions + answers, including 2025):

- Index: https://online.2iim.com/CAT-question-paper/
- PDF dump page: https://online.2iim.com/CAT-question-paper-pdf/
- Pattern: `https://online.2iim.com/CAT-question-paper/CAT-YYYY-Question-Paper-Slot-N-Quant/`
  (same with `-DILR/` and `-VARC/`)

Confirmed working: CAT 2025 Slot 1 Quant, DILR, VARC HTML. **Use this in the browser with no signup.**

### GitHub JSON — `inbox/pyq-json/`

From https://github.com/Samkarya/online-exam-questions (public, no login).

Complete papers (question counts match official pattern):

- CAT 2021 Slot 1 (66)
- CAT 2022 Slot 1 (66)
- CAT 2023 Slot 1 (66)
- CAT 2024 Slot 1 (68)
- CAT 2025 Slots 1, 2, 3 (68 each)
- Extra: CAT 2024 Quant slots 1–3

**Caveat:** every question has 4 MCQ options. Real CAT has TITA (no options, no negative). Treat these as practice clones, not interface-perfect official papers. 2025 Slot 1 VARC/QA text matches 2IIM, so they are based on the real papers.

## Could not get (login / no public file)

| Source | What they advertise | What actually happens |
|--------|---------------------|------------------------|
| Career Launcher free mocks | 2+ full mocks + CAT 2024/25 actual slots + 80 sectionals | Starts the test, **then asks signup** on submit. I cannot bypass this. |
| Cracku free DashCATs | 3 free full mocks | Site is account-gated. I cannot pull the questions. |
| Official IIM mock | iimcat.ac.in | Not up yet; usually ~2nd week of November. Interface practice only. |

## What you should do (10 minutes)

1. **2IIM, no account:** open https://online.2iim.com/CAT-question-paper/ and bookmark 2025 slots 1–3 (all three sections). That is the cleanest authentic PYQ set.
2. **CL + Cracku (one Google login each):** these are the free *mocks*, not PYQs. I cannot scrape them. Create a throwaway login and take them on their site — we will still analyze your scores here if you paste the scorecard.
3. **Missing PDFs you can try in a browser** (right-click save if they open):
   - 2023 Quant slots 1–3
   - 2022 Quant slots 1–2
   - 2020–2021 Quant + VARC
   Drop anything you save into `inbox/pyq-pdf/`.

## How we will use this

- Gold timed mocks: CAT **2023–2025** (2IIM HTML/PDF + GitHub JSON for the app).
- Volume: 2020–2022 DILR PDFs + remaining JSON slot-1 papers.
- CL/Cracku: live percentile only. Optional.
