import { create } from 'zustand';
import bank from '../data/pyq-bank.json';
import { sectionSeconds } from '../utils/percentile';

function sectionClock(year) {
  const seconds = sectionSeconds(year);
  return { VARC: seconds, DILR: seconds, Quant: seconds };
}
export const SECTIONS = ['VARC', 'DILR', 'Quant'];
export const SECTION_LABELS = { VARC: 'VARC', DILR: 'DILR', Quant: 'Quantitative Ability' };
export const PAPERS = bank.papers;
export const ALL_QUESTIONS = bank.questions;

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

const useExamStore = create((set, get) => ({
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
  fromHistory: false,

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

  tickTimer: () => {
    const { sectionTimeLeft, currentSection, examStatus } = get();
    if (examStatus !== 'active') return;
    const newTimeLeft = { ...sectionTimeLeft };
    if (newTimeLeft[currentSection] <= 0) {
      const idx = SECTIONS.indexOf(currentSection);
      if (idx < SECTIONS.length - 1) {
        const nextSection = SECTIONS[idx + 1];
        const { questions, responses } = get();
        const sectionQs = questions[nextSection];
        const newResponses = { ...responses };
        if (sectionQs.length > 0 && !newResponses[sectionQs[0].id]?.visited) {
          newResponses[sectionQs[0].id] = { ...newResponses[sectionQs[0].id], visited: true };
        }
        set({ sectionTimeLeft: newTimeLeft, currentSection: nextSection, currentQuestionIndex: 0, responses: newResponses, questionStartTime: Date.now(), currentInput: '' });
      } else {
        get().submitExam();
      }
      return;
    }
    newTimeLeft[currentSection] = newTimeLeft[currentSection] - 1;
    set({ sectionTimeLeft: newTimeLeft });
  },

  switchSection: (section) => {
    if (!SECTIONS.includes(section)) return;
    const { currentSection, questions, responses, questionStartTime } = get();
    if (section === currentSection) return;
    const currentQ = get().getCurrentQuestion();
    const newResponses = { ...responses };
    if (currentQ) {
      const elapsed = Math.floor((Date.now() - (questionStartTime || Date.now())) / 1000);
      newResponses[currentQ.id] = {
        ...newResponses[currentQ.id],
        timeSpent: (newResponses[currentQ.id]?.timeSpent || 0) + elapsed,
      };
    }
    const sectionQs = questions[section] || [];
    if (sectionQs[0] && !newResponses[sectionQs[0].id]?.visited) {
      newResponses[sectionQs[0].id] = { ...newResponses[sectionQs[0].id], visited: true };
    }
    set({
      currentSection: section,
      currentQuestionIndex: 0,
      responses: newResponses,
      questionStartTime: Date.now(),
      currentInput: '',
    });
  },

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
    fromHistory: false,
  }),
}));

export default useExamStore;
