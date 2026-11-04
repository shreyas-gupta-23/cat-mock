import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useExamStore from '../store/examStore';
import { useProctor } from '../hooks/useProctor';
import QuestionNav from './QuestionNav';
import QuestionDisplay from './QuestionDisplay';
import Timer from './Timer';
import Calculator from './Calculator';
import ScratchPad from './ScratchPad';
import SectionInstructions from './SectionInstructions';
import { sectionMinutes } from '../utils/percentile';
import { playWarningBeep, playTimeUpSound, playViolationSound } from '../utils/sounds';

const SECTIONS = ['VARC', 'DILR', 'Quant'];

export default function ExamScreen() {
  const navigate = useNavigate();

  // Store state
  const examStatus = useExamStore(s => s.examStatus);
  const examConfig = useExamStore(s => s.examConfig);
  const currentSection = useExamStore(s => s.currentSection);
  const currentQuestionIndex = useExamStore(s => s.currentQuestionIndex);
  const questions = useExamStore(s => s.questions);
  const responses = useExamStore(s => s.responses);
  const showSubmitConfirm = useExamStore(s => s.showSubmitConfirm);
  const fontSizeLevel = useExamStore(s => s.fontSizeLevel);
  const setFontSize = useExamStore(s => s.setFontSize);
  const sectionInstructionsShown = useExamStore(s => s.sectionInstructionsShown);
  const acknowledgeSectionInstructions = useExamStore(s => s.acknowledgeSectionInstructions);
  const sectionTimeLeft = useExamStore(s => s.sectionTimeLeft);

  // Store actions
  const nextQuestion = useExamStore(s => s.nextQuestion);
  const prevQuestion = useExamStore(s => s.prevQuestion);
  const markForReview = useExamStore(s => s.markForReview);
  const clearResponse = useExamStore(s => s.clearResponse);
  const getCurrentQuestion = useExamStore(s => s.getCurrentQuestion);
  const getSectionStats = useExamStore(s => s.getSectionStats);
  const requestSubmit = useExamStore(s => s.requestSubmit);
  const cancelSubmit = useExamStore(s => s.cancelSubmit);
  const submitExam = useExamStore(s => s.submitExam);
  const switchSection = useExamStore(s => s.switchSection);

  // Proctoring
  const { violations, warningVisible, dismissWarning, requestFullscreen } = useProctor({ enabled: true });

  // State
  const [submitShake, setSubmitShake] = useState(false);
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

  // Trigger shake animation on warning
  useEffect(() => {
    if (warningVisible) {
      setSubmitShake(true);
      const timer = setTimeout(() => setSubmitShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [warningVisible]);

  // Warning beep at 5 minutes remaining and time up sound
  useEffect(() => {
    const timeLeft = sectionTimeLeft[currentSection];
    if (timeLeft === 300) playWarningBeep(); // exactly at 5 min
    if (timeLeft === 0) playTimeUpSound();
  }, [sectionTimeLeft, currentSection]);

  // Violation sound
  useEffect(() => {
    if (warningVisible) playViolationSound();
  }, [warningVisible]);

  const handleMarkAndNext = () => {
    if (currentQuestion) markForReview(currentQuestion.id);
    nextQuestion();
  };

  const handleClear = () => {
    if (currentQuestion) clearResponse(currentQuestion.id);
  };

  const handleReturnToExam = async () => {
    await requestFullscreen();
    dismissWarning();
  };

  const handleSubmitClick = () => {
    requestSubmit();
  };

  const handleConfirmSubmit = () => {
    submitExam();
  };

  const handleCancelSubmit = () => {
    cancelSubmit();
  };

  const showSectionInstructions = currentSection && !sectionInstructionsShown?.[currentSection];

  return (
    <div className={`exam-active exam-shell ${submitShake ? 'warning-shake' : ''}`}>
      <header className="exam-top">
        <span className="press-brand">{examConfig?.label || 'CAT'}</span>
        <nav className="exam-tabs">
          {SECTIONS.map(section => {
            const stats = getSectionStats(section);
            const name = section === 'Quant' ? 'QA' : section;
            return (
              <button
                key={section}
                type="button"
                title={section === currentSection ? 'This section' : 'Open this section. Its clock runs only while it is open.'}
                className={section === currentSection ? 'exam-tab on' : 'exam-tab'}
                onClick={() => switchSection(section)}
              >
                {name} {stats.answered}/{stats.total}
              </button>
            );
          })}
        </nav>
        <div className="exam-tools">
          <button type="button" onClick={() => setFontSize(fontSizeLevel - 1)} disabled={fontSizeLevel <= 1}>A−</button>
          <button type="button" onClick={() => setFontSize(fontSizeLevel + 1)} disabled={fontSizeLevel >= 3}>A+</button>
          <button type="button" className={showCalculator ? 'on' : ''} onClick={() => setShowCalculator(v => !v)}>Calc</button>
          <button type="button" className={showScratchPad ? 'on' : ''} onClick={() => setShowScratchPad(v => !v)}>Notes</button>
        </div>
        <Timer />
      </header>

      <div className="exam-body">
        <QuestionDisplay />
        <QuestionNav />
      </div>

      <footer className="exam-foot">
        <div className="group">
          <button type="button" className="press-btn" onClick={prevQuestion} disabled={isFirstQuestion}>Previous</button>
          <button type="button" className="press-btn" onClick={handleMarkAndNext}>Mark for review</button>
          <button type="button" className="press-btn" onClick={handleClear}>Clear</button>
        </div>
        <div className="group">
          <button type="button" className="press-btn solid" onClick={nextQuestion} disabled={isLastQuestion}>Save and next</button>
          <button type="button" className="press-btn bad" onClick={handleSubmitClick}>Submit</button>
        </div>
      </footer>

      {/* Proctoring Warning Modal */}
      {warningVisible && (
        <div className="press-overlay">
          <div className="press-modal">
            <h3>You left the window</h3>
            <p>Violations recorded: {violations}</p>
            <div className="press-row">
              <button type="button" className="press-btn solid" onClick={handleReturnToExam}>Return</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="press-overlay">
          <div className="press-modal">
            <h3>Submit this paper?</h3>
            <p>{totalAnswered} answered of {totalQuestions}. This cannot be undone.</p>
            {violations > 0 && <p>{violations} window leave{violations === 1 ? '' : 's'} recorded.</p>}
            <div className="press-row">
              <button type="button" className="press-btn" onClick={handleCancelSubmit}>Cancel</button>
              <button type="button" className="press-btn bad" onClick={handleConfirmSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Section Instructions Modal */}
      {showSectionInstructions && (
        <SectionInstructions
          section={currentSection}
          minutes={sectionMinutes(examConfig?.year)}
          onAcknowledge={() => acknowledgeSectionInstructions(currentSection)}
        />
      )}

      {/* Calculator and ScratchPad */}
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      {showScratchPad && <ScratchPad onClose={() => setShowScratchPad(false)} />}

      {/* CSS Animation for shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
