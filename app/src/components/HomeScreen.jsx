import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useExamStore, { PAPERS, ALL_QUESTIONS } from '../store/examStore';
import useHistoryStore from '../store/historyStore';
import { sectionMinutes } from '../utils/percentile';
import { scoreQuestion } from '../utils/score';

function scoredAttempt(attempt) {
  const rows = attempt.questionResults || [];
  if (!rows.length) return { score: attempt.totalScore, accuracy: attempt.accuracy };
  let score = 0;
  let attempted = 0;
  let correct = 0;
  rows.forEach((q) => {
    const s = scoreQuestion({ type: q.type, answer: q.correctAnswer }, q.yourAnswer);
    score += s.delta;
    if (s.has) {
      attempted += 1;
      if (s.correct) correct += 1;
    }
  });
  return { score, accuracy: attempted ? Math.round((correct / attempted) * 100) : 0 };
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const startExam = useExamStore(s => s.startExam);
  const examStatus = useExamStore(s => s.examStatus);
  const openReview = useExamStore(s => s.openReview);
  const attempts = useHistoryStore(s => s.attempts);
  const deleteAttempt = useHistoryStore(s => s.deleteAttempt);
  const clearHistory = useHistoryStore(s => s.clearHistory);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  useEffect(() => {
    if (examStatus === 'active' || examStatus === 'paused' || examStatus === 'section-break') {
      navigate('/exam');
    }
  }, [examStatus, navigate]);

  const handleSelect = (config) => {
    setSelectedConfig(config);
    setShowRules(true);
  };

  const handleStartRules = () => {
    setShowRules(false);
    setShowFullscreenPrompt(true);
  };

  const handleFullscreenStart = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.warn('Fullscreen not available:', error);
    }
    if (selectedConfig) {
      startExam(selectedConfig);
      navigate('/exam');
    }
  };

  const fullPapers = PAPERS.filter((p) => p.complete);
  const catPapers = fullPapers.filter((p) => p.kind !== 'mock');
  const mockPapers = PAPERS.filter((p) => p.kind === 'mock');

  const paperButton = (paper) => (
    <button
      key={paper.id}
      type="button"
      className="press-paper"
      onClick={() => handleSelect({ type: 'pyq', paperId: paper.id, year: paper.year, label: paper.label })}
    >
      <span>
        <strong>{paper.label}</strong>
        <small>
          VARC {paper.counts.VARC} · DILR {paper.counts.DILR} · QA {paper.counts.Quant}
          {' · '}{sectionMinutes(paper.year)} min each
          {paper.note ? ` · ${paper.note}` : ''}
        </small>
      </span>
      <em>{paper.total}</em>
    </button>
  );

  return (
    <div className="press-page">
      <header className="press-top">
        <span className="press-word">CAT</span>
        <h1>Exam room</h1>
        <a href="/theory/index.html">Theory notes</a>
        <span className="press-quiet" style={{ marginLeft: 'auto' }}>
          {ALL_QUESTIONS.length} questions
        </span>
      </header>

      <main className="press-wrap">
        <div className="press-hero">
          <h2>Sit a paper</h2>
          <p>
            Official-order slots. CAT 2017–2019 locks each section at 60 minutes. From 2020, and on the free mocks, each section is 40 minutes. The percentile uses that year’s published score table.
          </p>
        </div>

        <div className="press-stats">
          <div className="press-stat"><b>{ALL_QUESTIONS.length}</b><span>Questions loaded</span></div>
          <div className="press-stat"><b>{fullPapers.length}</b><span>Full papers</span></div>
          <div className="press-stat"><b>60 / 40</b><span>Minutes per section</span></div>
        </div>

        <p className="press-section-label">CAT papers</p>
        <div className="press-papers">
          {catPapers.map(paperButton)}
        </div>

        <p className="press-section-label">Free mocks</p>
        <div className="press-papers">
          {mockPapers.map(paperButton)}
        </div>

        {attempts.length > 0 && (
          <section style={{ marginTop: '2.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="press-section-label">Recent attempts</p>
              <button type="button" className="press-btn" onClick={() => { if (window.confirm('Clear all history?')) clearHistory(); }}>
                Clear
              </button>
            </div>
            {attempts.slice(0, 5).map(attempt => {
              const scored = scoredAttempt(attempt);
              return (
              <div key={attempt.id} className="press-attempt">
                <b>{scored.score}</b>
                <div>
                  <div>{attempt.examConfig?.label || 'Mock'}</div>
                  <small className="press-quiet">{new Date(attempt.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</small>
                </div>
                <span className="press-quiet">{scored.accuracy}% of attempts right</span>
                <button type="button" className="press-btn" onClick={() => { openReview(attempt); navigate('/result'); }}>Review</button>
                <button type="button" className="press-btn" onClick={() => deleteAttempt(attempt.id)} aria-label="Delete attempt">×</button>
              </div>
              );
            })}
          </section>
        )}
      </main>

      {showRules && selectedConfig && (
        <div className="press-overlay">
          <div className="press-modal">
            <h3>{selectedConfig.label}</h3>
            <p className="press-muted">Same rules as the paper.</p>
            <ul>
              <li>VARC, then DILR, then Quant. {sectionMinutes(selectedConfig.year)} minutes each. A finished section stays closed, and its score is shown before the next one.</li>
              <li>MCQ: +3 correct, −1 wrong. TITA: +3 correct, 0 wrong.</li>
              <li>A marked question with an answer still counts.</li>
            </ul>
            <div className="press-row">
              <button type="button" className="press-btn" onClick={() => setShowRules(false)}>Cancel</button>
              <button type="button" className="press-btn solid" onClick={handleStartRules}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {showFullscreenPrompt && (
        <div className="press-overlay">
          <div className="press-modal">
            <h3>Fullscreen</h3>
            <p>The paper can run in fullscreen. Leaving the window does not end it.</p>
            <div className="press-row">
              <button type="button" className="press-btn" onClick={() => { setShowFullscreenPrompt(false); setShowRules(true); }}>Back</button>
              <button type="button" className="press-btn solid" onClick={handleFullscreenStart}>Start</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
