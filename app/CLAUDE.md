# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint
```

No test runner is configured.

## What this is

A CAT (Common Admission Test) exam simulator — a React SPA that mimics the real CAT exam interface. Users can take full mock tests or previous year papers (2014–2023) with authentic timing, scoring, and question navigation.

## Architecture

### State management — `src/store/examStore.js`
Single Zustand store that owns all exam state. Key concepts:
- `examStatus`: `'idle'` | `'active'` | `'submitted'` — drives route redirects in components
- `questions`: `{ VARC: [...], DILR: [...], Quant: [...] }` — populated on `startExam()`
- `responses`: keyed by `question.id` → `{ answer, timeSpent, markedForReview, visited }`
- `sectionTimeLeft`: per-section countdown (40 min each); `tickTimer()` auto-advances sections when time expires
- `getQuestionStatus(response)` — returns one of 5 status strings used for the question palette coloring

### Routes — `src/App.jsx`
Three routes: `/` (HomeScreen) → `/exam` (ExamScreen) → `/result` (ResultScreen). Both ExamScreen and ResultScreen redirect to `/` if `examStatus === 'idle'`.

### Question data — `src/data/questions.json`
697 questions with fields: `id`, `year`, `section` (`VARC`|`DILR`|`Quant`), `topic`, `type` (`MCQ`|`TITA`), `passage` (optional), `question`, `options` (MCQ only), `answer`, `difficulty`, `source`. The `answer` field for MCQ stores the full option string (e.g. `"B) ..."`); answer comparison uses `String(r.answer).trim() === String(q.answer).trim()`.

### Scoring
- MCQ: +3 correct, −1 wrong
- TITA (Type In The Answer): +3 correct, 0 wrong (no negative marking)
- Section sizes: VARC=24, DILR=20, Quant=22

### Exam modes
- `mock`: randomly shuffles all questions into the 3 sections
- `pyq`: prioritizes questions matching the selected year; pads from other years if needed (min 66 total)

### Python scripts
`scraper.py`, `generate_questions.py`, `generate_questions2.py` — used to scrape/generate the question bank. Not part of the app runtime.
