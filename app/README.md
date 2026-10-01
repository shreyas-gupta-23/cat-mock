# CAT Exam Simulator

A full-fidelity CAT (Common Admission Test) exam simulator that replicates the TCS iON exam center experience — the actual interface used in the real exam.

**[Live Demo](https://your-username.github.io/cat-simulator)** <!-- update after deploy -->

![CAT Simulator Screenshot](public/screenshot.png)

## Why this exists

Every free CAT mock platform uses a simplified custom UI. Paid platforms (₹500–2000) are better but still don't look like the real exam. This is the only open-source simulator that replicates TCS iON's actual interface — so you practice in the exact environment you'll be tested in.

## Features

### Exam Interface (TCS iON accurate)
- Navy blue header with section tabs showing answered/total counts
- 70/30 split: question area left, question palette right
- Circular color-coded question palette (gray / red / green / purple / split-color)
- Section-wise 40-minute countdown timer with color warnings
- Mandatory section instruction gate before each section (like real CAT)
- Fullscreen enforcement with violation tracking
- Tab-switch and window-blur detection

### Question Types & Scoring
- **MCQ**: +3 correct, −1 wrong
- **TITA** (Type In The Answer): +3 correct, 0 wrong (no negative marking)
- 697 questions across VARC (24Q), DILR (20Q), Quant (22Q)
- Previous Year Papers: CAT 2014–2023

### Exam Tools
- On-screen draggable **Calculator**
- Draggable **Rough Work / Scratch Pad**
- **Font size controls** (A- / A+, 3 levels)
- **Sound alerts** — warning beep at 5 min, time-up tone on section end

### Results & Analytics
- Estimated overall and **sectional percentile** (VARC / DILR / Quant)
- Per-question review — your answer vs correct answer with explanations
- Time spent per question
- Weak topic identification by section
- **Export results as PDF**
- **Attempt history** — last 20 attempts saved locally

## Installation

```bash
# Clone the repo
git clone https://github.com/your-username/cat-simulator.git
cd cat-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

## Tech stack

- **React 19** + **Vite 8**
- **Zustand** — exam state management
- **Tailwind CSS v4**
- **React Router v7**
- Web Audio API — in-browser sound effects (no audio files)
- localStorage — attempt history persistence

## Project structure

```
src/
├── components/
│   ├── HomeScreen.jsx       # Exam selection + attempt history
│   ├── ExamScreen.jsx       # Main exam interface (TCS iON layout)
│   ├── QuestionDisplay.jsx  # Question + answer input
│   ├── QuestionNav.jsx      # Right-panel question palette
│   ├── Timer.jsx            # Section countdown timer
│   ├── ResultScreen.jsx     # Results + question review
│   ├── SectionInstructions.jsx  # Pre-section acknowledgement modal
│   ├── Calculator.jsx       # Floating draggable calculator
│   └── ScratchPad.jsx       # Floating draggable rough work pad
├── store/
│   ├── examStore.js         # All exam state (Zustand)
│   └── historyStore.js      # Attempt history (localStorage)
├── hooks/
│   └── useProctor.js        # Fullscreen + tab-switch enforcement
├── utils/
│   └── sounds.js            # Web Audio API sound effects
└── data/
    └── questions.json       # 697 questions (MCQ + TITA)
```

## Contributing

PRs welcome. Most needed:
- More questions (especially post-2023)
- Better percentile calibration
- Mobile layout improvements

## License

MIT
