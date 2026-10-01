import { create } from 'zustand';

// Each attempt shape:
// {
//   id: string (timestamp),
//   date: string (ISO),
//   examConfig: { type, year, label },
//   totalScore: number,
//   totalMax: number,
//   percentile: number,
//   accuracy: number,
//   sectionStats: [{ section, score, maxScore, correct, incorrect, attempted, total, avgTime }],
//   questionResults: [{ id, section, topic, type, difficulty, yourAnswer, correctAnswer, isCorrect, timeSpent }]
// }

const useHistoryStore = create((set, get) => ({
  attempts: JSON.parse(localStorage.getItem('cat_attempts') || '[]'),

  saveAttempt: (attemptData) => {
    const attempt = { id: Date.now().toString(), date: new Date().toISOString(), ...attemptData };
    const attempts = [attempt, ...get().attempts].slice(0, 20); // keep last 20
    localStorage.setItem('cat_attempts', JSON.stringify(attempts));
    set({ attempts });
  },

  deleteAttempt: (id) => {
    const attempts = get().attempts.filter(a => a.id !== id);
    localStorage.setItem('cat_attempts', JSON.stringify(attempts));
    set({ attempts });
  },

  clearHistory: () => {
    localStorage.removeItem('cat_attempts');
    set({ attempts: [] });
  },
}));

export default useHistoryStore;
