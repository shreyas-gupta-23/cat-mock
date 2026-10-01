import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useExamStore, { PAPERS, ALL_QUESTIONS } from '../store/examStore';
import useHistoryStore from '../store/historyStore';

export default function HomeScreen() {
  const navigate = useNavigate();
  const startExam = useExamStore(s => s.startExam);
  const attempts = useHistoryStore(s => s.attempts);
  const deleteAttempt = useHistoryStore(s => s.deleteAttempt);
  const clearHistory = useHistoryStore(s => s.clearHistory);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

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
            Official-order slots. Each section locks at 40 minutes. The percentile on the result is a CAT 2025 ballpark, not All-India rank.
          </p>
        </div>

        <div className="press-stats">
          <div className="press-stat"><b>{ALL_QUESTIONS.length}</b><span>Questions loaded</span></div>
          <div className="press-stat"><b>{fullPapers.length}</b><span>Full papers</span></div>
          <div className="press-stat"><b>120 min</b><span>Three locked sections</span></div>
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
            {attempts.slice(0, 5).map(attempt => (
              <div key={attempt.id} className="press-attempt">
                <b>{attempt.totalScore}</b>
                <div>
                  <div>{attempt.examConfig?.label || 'Mock'}</div>
                  <small className="press-quiet">{new Date(attempt.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</small>
                </div>
                <span className="press-quiet">{attempt.accuracy}% of attempts right</span>
                <button type="button" className="press-btn" onClick={() => deleteAttempt(attempt.id)} aria-label="Delete attempt">×</button>
              </div>
            ))}
          </section>
        )}
      </main>

      {showRules && selectedConfig && (
        <div className="press-overlay">
          <div className="press-modal">
            <h3>{selectedConfig.label}</h3>
            <p className="press-muted">Same rules as the paper.</p>
            <ul>
              <li>VARC, DILR, Quant. 40 minutes each. No switching.</li>
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
            <p>The paper runs in fullscreen. Leaving the window is recorded.</p>
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
