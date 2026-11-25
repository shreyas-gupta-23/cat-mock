import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useExamStore from '../store/examStore';
import QuestionNav from './QuestionNav';
import QuestionDisplay, { Rich } from './QuestionDisplay';
import Timer from './Timer';
import Calculator from './Calculator';
import ScratchPad from './ScratchPad';
import SectionInstructions from './SectionInstructions';
import { sectionMinutes } from '../utils/percentile';
import { playWarningBeep, playTimeUpSound } from '../utils/sounds';

const SECTIONS = ['VARC', 'DILR', 'Quant'];

function sectionShort(section) {
  return section === 'Quant' ? 'QA' : section;
}

function SectionScore({ result, nextSection, onContinue }) {
  if (!result) return null;
  const name = sectionShort(result.section);
  const misses = result.misses || [];
  return (
    <div className="exam-paused section-break">
      <h2>{name}</h2>
      <p className="section-score-total">{result.score} <span>/ {result.maxScore}</span></p>
      <div className="section-score">
        <div><b>{result.correct}</b><span>Correct</span></div>
        <div><b>{result.incorrect}</b><span>Wrong</span></div>
        <div><b>{result.blank}</b><span>Blank</span></div>
        <div><b>{result.percentile}</b><span>Percentile</span></div>
      </div>
      <p>MCQ wrong answers are −1. TITA wrong answers are 0. This section stays closed.</p>
      <h3 className="miss-head">Wrong answers</h3>
      {misses.length === 0 ? (
        <p>None in this section.</p>
      ) : (
        <ol className="miss-list">
          {misses.map((item) => (
            <li key={item.n} className="miss">
              <p className="miss-q">Question {item.n} · {item.type}</p>
              <p className="miss-line"><Rich text={item.line} /></p>
              <p className="miss-ans yours"><span>You</span><Rich text={item.yours} /></p>
              <p className="miss-ans key"><span>Correct</span><Rich text={item.key} /></p>
            </li>
          ))}
        </ol>
      )}
      <button type="button" className="exam-pause" onClick={onContinue}>
        {nextSection ? `Start ${sectionShort(nextSection)}` : 'See result'}
      </button>
    </div>
  );
}

export default function ExamScreen() {
  const navigate = useNavigate();

  // Store state
  const examStatus = useExamStore(s => s.examStatus);
  const examConfig = useExamStore(s => s.examConfig);
  const currentSection = useExamStore(s => s.currentSection);
  const currentQuestionIndex = useExamStore(s => s.currentQuestionIndex);
  const questions = useExamStore(s => s.questions);
  const responses = useExamStore(s => s.responses);
  const fontSizeLevel = useExamStore(s => s.fontSizeLevel);
  const setFontSize = useExamStore(s => s.setFontSize);
  const sectionInstructionsShown = useExamStore(s => s.sectionInstructionsShown);
  const acknowledgeSectionInstructions = useExamStore(s => s.acknowledgeSectionInstructions);
  const sectionTimeLeft = useExamStore(s => s.sectionTimeLeft);
  const resumeExam = useExamStore(s => s.resumeExam);
  const closeSection = useExamStore(s => s.closeSection);
  const rescoreClosed = useExamStore(s => s.rescoreClosed);
  const continueFromBreak = useExamStore(s => s.continueFromBreak);
  const sectionResults = useExamStore(s => s.sectionResults);
  const sectionBreak = useExamStore(s => s.sectionBreak);
  const clockExpiry = useExamStore(s => s.clockExpiry);
  const paused = examStatus === 'paused';
  const onBreak = examStatus === 'section-break';

  // Store actions
  const nextQuestion = useExamStore(s => s.nextQuestion);
  const prevQuestion = useExamStore(s => s.prevQuestion);
  const markForReview = useExamStore(s => s.markForReview);
  const clearResponse = useExamStore(s => s.clearResponse);
  const getCurrentQuestion = useExamStore(s => s.getCurrentQuestion);
  const getSectionStats = useExamStore(s => s.getSectionStats);

  const [confirmSection, setConfirmSection] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchPad, setShowScratchPad] = useState(false);

  const currentQuestion = getCurrentQuestion();
  const sectionQs = questions[currentSection] || [];
  const totalAnswered = Object.values(responses).filter(r => r?.answer).length;
  const totalQuestions = Object.values(questions).flat().length;
  const isLastQuestion = currentQuestionIndex === sectionQs.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Redirect if exam not running
  useEffect(() => {
    if (examStatus === 'idle') navigate('/');
    if (examStatus === 'submitted') navigate('/result');
  }, [examStatus, navigate]);

  useEffect(() => {
    if (onBreak) rescoreClosed();
  }, [onBreak, rescoreClosed]);

  useEffect(() => {
    const timeLeft = sectionTimeLeft[currentSection];
    if (timeLeft === 300) playWarningBeep();
  }, [sectionTimeLeft, currentSection]);

  useEffect(() => {
    if (clockExpiry > 0) playTimeUpSound();
  }, [clockExpiry]);

  const handleMarkAndNext = () => {
    if (currentQuestion) markForReview(currentQuestion.id);
    nextQuestion();
  };

  const handleClear = () => {
    if (currentQuestion) clearResponse(currentQuestion.id);
  };

  const handleSubmitClick = () => {
    setConfirmSection(true);
  };

  const handleConfirmSection = () => {
    setConfirmSection(false);
    closeSection();
  };

  const showSectionInstructions = currentSection && !sectionInstructionsShown?.[currentSection];

  return (
    <div className="exam-active exam-shell">
      <header className="exam-top">
        <span className="press-brand">{examConfig?.label || 'CAT'}</span>
        <nav className="exam-tabs">
          {SECTIONS.map(section => {
            const stats = getSectionStats(section);
            const name = section === 'Quant' ? 'QA' : section;
            const result = sectionResults[section];
            const here = section === currentSection && !onBreak;
            const label = result ? `${name} ${result.score}` : here ? `${name} ${stats.answered}/${stats.total}` : name;
            return (
              <button
                key={section}
                type="button"
                disabled
                title={result ? `${name} is closed` : here ? 'This section' : 'Opens after this section'}
                className={here ? 'exam-tab on' : 'exam-tab'}
              >
                {label}
              </button>
            );
          })}
        </nav>
        <div className="exam-tools">
          <button type="button" onClick={() => setFontSize(fontSizeLevel - 1)} disabled={paused || onBreak || fontSizeLevel <= 1}>A−</button>
          <button type="button" onClick={() => setFontSize(fontSizeLevel + 1)} disabled={paused || onBreak || fontSizeLevel >= 3}>A+</button>
          <button type="button" className={showCalculator ? 'on' : ''} disabled={paused || onBreak} onClick={() => setShowCalculator(v => !v)}>Calc</button>
          <button type="button" className={showScratchPad ? 'on' : ''} disabled={paused || onBreak} onClick={() => setShowScratchPad(v => !v)}>Notes</button>
        </div>
        <Timer />
      </header>

      {onBreak ? (
        <div className="exam-body">
          <SectionScore
            result={sectionResults[sectionBreak]}
            nextSection={SECTIONS[SECTIONS.indexOf(sectionBreak) + 1]}
            onContinue={continueFromBreak}
          />
        </div>
      ) : paused ? (
        <div className="exam-body">
          <div className="exam-paused">
            <h2>Paused</h2>
            <p>The clock is stopped. The paper stays hidden until you start again.</p>
            <button type="button" className="exam-pause" onClick={resumeExam}>Start</button>
          </div>
        </div>
      ) : (
      <div className="exam-body">
        <QuestionDisplay />
        <QuestionNav />
      </div>
      )}

      {!paused && !onBreak && (
      <footer className="exam-foot">
        <div className="group">
          <button type="button" className="press-btn" onClick={prevQuestion} disabled={isFirstQuestion}>Previous</button>
          <button type="button" className="press-btn" onClick={handleMarkAndNext}>Mark for review</button>
          <button type="button" className="press-btn" onClick={handleClear}>Clear</button>
        </div>
        <div className="group">
          <button type="button" className="press-btn solid" onClick={nextQuestion} disabled={isLastQuestion}>Save and next</button>
          <button type="button" className="press-btn bad" onClick={handleSubmitClick}>Submit section</button>
        </div>
      </footer>
      )}

      {confirmSection && !paused && !onBreak && (
        <div className="press-overlay">
          <div className="press-modal">
            <h3>Submit {currentSection === 'Quant' ? 'QA' : currentSection}?</h3>
            <p>{totalAnswered} answered of {totalQuestions} on the paper. You cannot return to this section.</p>
            <div className="press-row">
              <button type="button" className="press-btn" onClick={() => setConfirmSection(false)}>Cancel</button>
              <button type="button" className="press-btn bad" onClick={handleConfirmSection}>Submit section</button>
            </div>
          </div>
        </div>
      )}

      {/* Section Instructions Modal */}
      {!paused && !onBreak && showSectionInstructions && (
        <SectionInstructions
          section={currentSection}
          minutes={sectionMinutes(examConfig?.year)}
          onAcknowledge={() => acknowledgeSectionInstructions(currentSection)}
        />
      )}

      {/* Calculator and ScratchPad */}
      {!paused && !onBreak && showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      {!paused && !onBreak && showScratchPad && <ScratchPad onClose={() => setShowScratchPad(false)} />}
    </div>
  );
}
