import { create } from 'zustand';
import bank from '../data/pyq-bank.json';
import { estimateSectionPercentile, sectionSeconds } from '../utils/percentile';
import { scoreQuestion, titaFigure } from '../utils/score';
import { optionLetter, splitStem } from '../utils/stem';

function sectionClock(year) {
  const seconds = sectionSeconds(year);
  return { VARC: seconds, DILR: seconds, Quant: seconds };
}
export const SECTIONS = ['VARC', 'DILR', 'Quant'];
export const SECTION_LABELS = { VARC: 'VARC', DILR: 'DILR', Quant: 'Quantitative Ability' };
export const PAPERS = bank.papers;
export const ALL_QUESTIONS = bank.questions;

function shownAnswer(question, given) {
  if (given === null || given === undefined || String(given).trim() === '') return '';
  if (question.type !== 'MCQ') return titaFigure(given) || String(given).trim();
  const letter = String(given).trim().charAt(0).toUpperCase();
  const opt = (question.options || []).find((item, i) => optionLetter(item, i) === letter);
  if (!opt) return letter;
  const text = String(opt).trim();
  return text.toUpperCase().startsWith(letter) ? text : `${letter}) ${text}`;
}

function questionLine(question) {
  const parts = String(splitStem(question).ask).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const body = parts.length > 1 ? parts[parts.length - 1] : (parts[0] || '');
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > 220 ? `${flat.slice(0, 217)}…` : flat;
}

function sectionResult(section, questions, responses, year) {
  const qs = questions[section] || [];
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  let score = 0;
  const misses = [];
  qs.forEach((q, index) => {
    const given = responses[q.id]?.answer;
    const scored = scoreQuestion(q, given);
    score += scored.delta;
    if (!scored.has) return;
    attempted += 1;
    if (scored.correct) {
      correct += 1;
      return;
    }
    incorrect += 1;
    misses.push({
      n: index + 1,
      type: q.type,
      line: questionLine(q),
      yours: shownAnswer(q, given),
      key: shownAnswer(q, q.answer),
    });
  });
  return {
    section,
    total: qs.length,
    attempted,
    correct,
    incorrect,
    blank: qs.length - attempted,
    score,
    maxScore: qs.length * 3,
    percentile: estimateSectionPercentile(section, score, year),
    misses,
  };
}

function selectQuestions(config) {
  const paperId = config.paperId;
  const pool = paperId
    ? bank.questions.filter((q) => q.paperId === paperId)
    : [];
  // Keep official order. Do not shuffle — RC/DILR sets must stay together.
  return {
    VARC: pool.filter((q) => q.section === 'VARC'),
    DILR: pool.filter((q) => q.section === 'DILR'),
    Quant: pool.filter((q) => q.section === 'Quant'),
  };
}

export function getQuestionStatus(response) {
  if (!response || !response.visited) return 'not-visited';
  const hasAnswer = response.answer !== null && response.answer !== '' && response.answer !== undefined;
  if (response.markedForReview && hasAnswer) return 'answered-marked';
  if (response.markedForReview) return 'marked';
  if (hasAnswer) return 'answered';
  return 'not-answered';
}

const LIVE_KEY = 'cat_live_exam';

function liveSnapshot(state) {
  return {
    examConfig: state.examConfig,
    responses: state.responses,
    currentSection: state.currentSection,
    currentQuestionIndex: state.currentQuestionIndex,
    sectionTimeLeft: state.sectionTimeLeft,
    examStatus: state.examStatus,
    currentInput: state.currentInput,
    fontSizeLevel: state.fontSizeLevel,
    sectionInstructionsShown: state.sectionInstructionsShown,
    sectionResults: state.sectionResults,
    sectionBreak: state.sectionBreak,
    clockExpiry: state.clockExpiry,
  };
}

function readLive() {
  try {
    const snap = JSON.parse(localStorage.getItem(LIVE_KEY) || 'null');
    if (!snap?.examConfig) return null;
    if (!['active', 'paused', 'section-break'].includes(snap.examStatus)) return null;
    return {
      ...snap,
      questions: selectQuestions(snap.examConfig),
      questionStartTime: snap.examStatus === 'active' ? Date.now() : null,
      showSectionWarning: false,
      pendingSection: null,
      showSubmitConfirm: false,
      fromHistory: false,
    };
  } catch {
    return null;
  }
}

const restored = readLive();

const useExamStore = create((set, get) => ({
  examConfig: restored?.examConfig || { type: 'mock', year: null },
  questions: { VARC: [], DILR: [], Quant: [] },
  responses: {},
  currentSection: 'VARC',
  currentQuestionIndex: 0,
  sectionTimeLeft: sectionClock(null),
  questionStartTime: null,
  examStatus: 'idle',
  showSectionWarning: false,
  pendingSection: null,
  showSubmitConfirm: false,
  currentInput: '',
  fontSizeLevel: 1,
  sectionInstructionsShown: { VARC: false, DILR: false, Quant: false },
  sectionResults: {},
  sectionBreak: null,
  clockExpiry: 0,
  fromHistory: false,
  ...(restored || {}),

  setCurrentInput: (val) => set({ currentInput: val }),

  setFontSize: (level) => set({ fontSizeLevel: Math.max(1, Math.min(3, level)) }),

  acknowledgeSectionInstructions: (section) =>
    set(state => ({
      sectionInstructionsShown: { ...state.sectionInstructionsShown, [section]: true }
    })),

  startExam: (config) => {
    const questionsBySection = selectQuestions(config);
    const allQ = Object.values(questionsBySection).flat();
    const initialResponses = {};
    allQ.forEach(q => {
      initialResponses[q.id] = { answer: null, timeSpent: 0, markedForReview: false, visited: false };
    });
    if (questionsBySection.VARC.length > 0) {
      initialResponses[questionsBySection.VARC[0].id].visited = true;
    }
    set({
      examConfig: config,
      questions: questionsBySection,
      responses: initialResponses,
      currentSection: 'VARC',
      currentQuestionIndex: 0,
      sectionTimeLeft: sectionClock(config?.year),
      questionStartTime: Date.now(),
      examStatus: 'active',
      showSectionWarning: false,
      pendingSection: null,
      showSubmitConfirm: false,
      currentInput: '',
      fontSizeLevel: 1,
      sectionInstructionsShown: { VARC: false, DILR: false, Quant: false },
      sectionResults: {},
      sectionBreak: null,
      clockExpiry: 0,
      fromHistory: false,
    });
  },

  openReview: (attempt) => {
    const config = attempt?.examConfig || {};
    let questionsBySection = selectQuestions(config);
    if (!Object.values(questionsBySection).flat().length && attempt?.questionResults) {
      questionsBySection = { VARC: [], DILR: [], Quant: [] };
      attempt.questionResults.forEach((r) => {
        const section = questionsBySection[r.section] ? r.section : 'VARC';
        questionsBySection[section].push({
          id: r.id,
          section,
          topic: r.topic,
          type: r.type,
          difficulty: r.difficulty,
          question: r.question || '',
          passage: r.passage || '',
          options: r.options || [],
          answer: r.correctAnswer,
          explanation: r.explanation || '',
        });
      });
    }
    const responses = {};
    Object.values(questionsBySection).flat().forEach((q) => {
      responses[q.id] = { answer: null, timeSpent: 0, markedForReview: false, visited: true };
    });
    (attempt?.questionResults || []).forEach((r) => {
      if (!responses[r.id]) return;
      responses[r.id] = {
        answer: r.yourAnswer ?? null,
        timeSpent: r.timeSpent || 0,
        markedForReview: false,
        visited: true,
      };
    });
    set({
      examConfig: config,
      questions: questionsBySection,
      responses,
      currentSection: 'VARC',
      currentQuestionIndex: 0,
      sectionTimeLeft: sectionClock(config?.year),
      questionStartTime: null,
      examStatus: 'submitted',
      showSectionWarning: false,
      pendingSection: null,
      showSubmitConfirm: false,
      currentInput: '',
      fontSizeLevel: 1,
      sectionInstructionsShown: { VARC: true, DILR: true, Quant: true },
      sectionResults: {},
      sectionBreak: null,
      clockExpiry: 0,
      fromHistory: true,
    });
  },

  getCurrentQuestion: () => {
    const { questions, currentSection, currentQuestionIndex } = get();
    return questions[currentSection]?.[currentQuestionIndex] || null;
  },

  _accumulateTime: (questionId) => {
    const { responses, questionStartTime } = get();
    const elapsed = Math.floor((Date.now() - (questionStartTime || Date.now())) / 1000);
    return {
      ...responses,
      [questionId]: {
        ...responses[questionId],
        timeSpent: (responses[questionId]?.timeSpent || 0) + elapsed,
      },
    };
  },

  answerQuestion: (questionId, answer) => {
    set(state => ({
      responses: {
        ...state.responses,
        [questionId]: { ...state.responses[questionId], answer, visited: true },
      },
    }));
  },

  clearResponse: (questionId) => {
    set(state => ({
      responses: {
        ...state.responses,
        [questionId]: { ...state.responses[questionId], answer: null },
      },
      currentInput: '',
    }));
  },

  _advanceQuestion: (currentQ, newResponses) => {
    const { questions, currentSection, currentQuestionIndex } = get();
    const sectionQs = questions[currentSection];
    const nextIdx = Math.min(currentQuestionIndex + 1, sectionQs.length - 1);
    const nextQ = sectionQs[nextIdx];
    if (nextQ && !newResponses[nextQ.id]?.visited) {
      newResponses[nextQ.id] = { ...newResponses[nextQ.id], visited: true };
    }
    const moved = nextIdx !== currentQuestionIndex;
    return { nextIdx: moved ? nextIdx : currentQuestionIndex, newResponses };
  },

  saveAndNext: (questionId, answer) => {
    const state = get();
    let newResponses = state._accumulateTime(questionId);
    newResponses[questionId] = { ...newResponses[questionId], answer, visited: true };
    const { nextIdx, newResponses: nr } = state._advanceQuestion({ id: questionId }, newResponses);
    set({ responses: nr, currentQuestionIndex: nextIdx, questionStartTime: Date.now(), currentInput: '' });
  },

  markForReviewAndNext: (questionId, answer) => {
    const state = get();
    let newResponses = state._accumulateTime(questionId);
    newResponses[questionId] = { ...newResponses[questionId], answer, visited: true, markedForReview: true };
    const { nextIdx, newResponses: nr } = state._advanceQuestion({ id: questionId }, newResponses);
    set({ responses: nr, currentQuestionIndex: nextIdx, questionStartTime: Date.now(), currentInput: '' });
  },

  navigateToQuestion: (index) => {
    const { questions, currentSection, responses, questionStartTime } = get();
    const currentQ = get().getCurrentQuestion();
    const sectionQs = questions[currentSection];
    if (index < 0 || index >= sectionQs.length) return;

    let newResponses = { ...responses };
    if (currentQ) {
      const elapsed = Math.floor((Date.now() - (questionStartTime || Date.now())) / 1000);
      newResponses[currentQ.id] = { ...newResponses[currentQ.id], timeSpent: (newResponses[currentQ.id]?.timeSpent || 0) + elapsed };
    }
    const targetQ = sectionQs[index];
    if (targetQ && !newResponses[targetQ.id]?.visited) {
      newResponses[targetQ.id] = { ...newResponses[targetQ.id], visited: true };
    }
    set({ responses: newResponses, currentQuestionIndex: index, questionStartTime: Date.now() });
  },

  requestSectionSwitch: (section) => {
    get().switchSection(section);
  },

  confirmSectionSwitch: () => {
    const { pendingSection, questions, responses } = get();
    if (!pendingSection) return;
    const sectionQs = questions[pendingSection];
    const newResponses = { ...responses };
    if (sectionQs.length > 0 && !newResponses[sectionQs[0].id]?.visited) {
      newResponses[sectionQs[0].id] = { ...newResponses[sectionQs[0].id], visited: true };
    }
    set({ currentSection: pendingSection, currentQuestionIndex: 0, showSectionWarning: false, pendingSection: null, responses: newResponses, questionStartTime: Date.now(), currentInput: '' });
  },

  cancelSectionSwitch: () => set({ showSectionWarning: false, pendingSection: null }),

  pauseExam: () => {
    const { examStatus, questionStartTime, responses } = get();
    if (examStatus !== 'active') return;
    const currentQ = get().getCurrentQuestion();
    let nextResponses = responses;
    if (currentQ && questionStartTime) {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      nextResponses = {
        ...responses,
        [currentQ.id]: {
          ...responses[currentQ.id],
          timeSpent: (responses[currentQ.id]?.timeSpent || 0) + elapsed,
        },
      };
    }
    set({
      responses: nextResponses,
      questionStartTime: null,
      examStatus: 'paused',
      showSubmitConfirm: false,
    });
  },

  resumeExam: () => {
    if (get().examStatus !== 'paused') return;
    set({ examStatus: 'active', questionStartTime: Date.now() });
  },

  rescoreClosed: () => {
    const state = get();
    const next = { ...state.sectionResults };
    let changed = false;
    Object.keys(next).forEach((section) => {
      const result = sectionResult(section, state.questions, state.responses, state.examConfig?.year);
      const prev = next[section];
      const same = prev
        && prev.score === result.score
        && prev.incorrect === result.incorrect
        && (prev.misses || []).length === result.misses.length;
      if (!same) {
        next[section] = result;
        changed = true;
      }
    });
    if (changed) set({ sectionResults: next });
  },

  closeSection: ({ expired } = {}) => {
    const state = get();
    if (state.sectionBreak) return;
    if (state.examStatus !== 'active' && state.examStatus !== 'paused') return;
    const section = state.currentSection;
    const currentQ = state.getCurrentQuestion();
    let responses = state.responses;
    if (currentQ && state.questionStartTime) {
      const elapsed = Math.floor((Date.now() - state.questionStartTime) / 1000);
      responses = {
        ...responses,
        [currentQ.id]: {
          ...responses[currentQ.id],
          timeSpent: (responses[currentQ.id]?.timeSpent || 0) + elapsed,
        },
      };
    }
    const result = sectionResult(section, state.questions, responses, state.examConfig?.year);
    set({
      responses,
      questionStartTime: null,
      currentInput: '',
      sectionTimeLeft: { ...state.sectionTimeLeft, [section]: 0 },
      sectionResults: { ...state.sectionResults, [section]: result },
      sectionBreak: section,
      examStatus: 'section-break',
      showSubmitConfirm: false,
      clockExpiry: expired ? state.clockExpiry + 1 : state.clockExpiry,
    });
  },

  continueFromBreak: () => {
    const { sectionBreak, questions, responses } = get();
    if (!sectionBreak) return;
    const idx = SECTIONS.indexOf(sectionBreak);
    if (idx < 0 || idx >= SECTIONS.length - 1) {
      set({ sectionBreak: null });
      get().submitExam();
      return;
    }
    const nextSection = SECTIONS[idx + 1];
    const sectionQs = questions[nextSection] || [];
    const nextResponses = { ...responses };
    if (sectionQs[0] && !nextResponses[sectionQs[0].id]?.visited) {
      nextResponses[sectionQs[0].id] = { ...nextResponses[sectionQs[0].id], visited: true };
    }
    set({
      responses: nextResponses,
      currentSection: nextSection,
      currentQuestionIndex: 0,
      sectionBreak: null,
      examStatus: 'active',
      questionStartTime: Date.now(),
      currentInput: '',
    });
  },

  tickTimer: () => {
    const { sectionTimeLeft, currentSection, examStatus } = get();
    if (examStatus !== 'active') return;
    const left = sectionTimeLeft[currentSection] ?? 0;
    if (left <= 1) {
      set({ sectionTimeLeft: { ...sectionTimeLeft, [currentSection]: 0 } });
      get().closeSection({ expired: true });
      return;
    }
    set({ sectionTimeLeft: { ...sectionTimeLeft, [currentSection]: left - 1 } });
  },

  switchSection: () => {},

  nextQuestion: () => {
    const { questions, currentSection, currentQuestionIndex } = get();
    const sectionQs = questions[currentSection] || [];
    const nextIdx = Math.min(currentQuestionIndex + 1, sectionQs.length - 1);
    if (nextIdx !== currentQuestionIndex) get().navigateToQuestion(nextIdx);
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    const prevIdx = Math.max(currentQuestionIndex - 1, 0);
    if (prevIdx !== currentQuestionIndex) get().navigateToQuestion(prevIdx);
  },

  markForReview: (questionId) => {
    set(state => ({
      responses: {
        ...state.responses,
        [questionId]: { ...state.responses[questionId], markedForReview: !state.responses[questionId]?.markedForReview },
      },
    }));
  },

  setAnswer: (questionId, answer) => {
    set(state => ({
      responses: {
        ...state.responses,
        [questionId]: { ...state.responses[questionId], answer, visited: true },
      },
    }));
  },

  getSectionStats: (section) => {
    const { questions, responses } = get();
    const sectionQs = questions[section] || [];
    const answered = sectionQs.filter(q => {
      const r = responses[q.id];
      return r?.answer !== null && r?.answer !== undefined && r?.answer !== '';
    }).length;
    return { answered, total: sectionQs.length };
  },

  requestSubmit: () => set({ showSubmitConfirm: true }),
  cancelSubmit: () => set({ showSubmitConfirm: false }),
  submitExam: () => set({ examStatus: 'submitted', showSubmitConfirm: false }),

  resetExam: () => set({
    examConfig: { type: 'mock', year: null },
    questions: { VARC: [], DILR: [], Quant: [] },
    responses: {},
    currentSection: 'VARC',
    currentQuestionIndex: 0,
    sectionTimeLeft: sectionClock(null),
    questionStartTime: null,
    examStatus: 'idle',
    showSectionWarning: false,
    pendingSection: null,
    showSubmitConfirm: false,
    currentInput: '',
    fontSizeLevel: 1,
    sectionInstructionsShown: { VARC: false, DILR: false, Quant: false },
    sectionResults: {},
    sectionBreak: null,
    clockExpiry: 0,
    fromHistory: false,
  }),
}));

useExamStore.subscribe((state) => {
  if (['active', 'paused', 'section-break'].includes(state.examStatus)) {
    localStorage.setItem(LIVE_KEY, JSON.stringify(liveSnapshot(state)));
    return;
  }
  localStorage.removeItem(LIVE_KEY);
});

export default useExamStore;
