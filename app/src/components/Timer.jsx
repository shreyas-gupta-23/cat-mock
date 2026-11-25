import { useEffect } from 'react';
import useExamStore from '../store/examStore';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Timer() {
  const { sectionTimeLeft, currentSection, examStatus, tickTimer, pauseExam, resumeExam } = useExamStore();

  useEffect(() => {
    if (examStatus !== 'active') return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [examStatus, tickTimer]);

  const left = sectionTimeLeft[currentSection] ?? 0;
  const tone = left < 300 ? 'bad' : left < 600 ? 'warn' : '';
  const paused = examStatus === 'paused';

  return (
    <div className="exam-clock-wrap">
      <div className={`exam-clock ${tone}`} aria-label="Time left in this section">
        {formatTime(left)}
      </div>
      {examStatus === 'active' && (
        <button type="button" className="exam-pause" onClick={pauseExam}>Pause</button>
      )}
      {paused && (
        <button type="button" className="exam-pause" onClick={resumeExam}>Start</button>
      )}
    </div>
  );
}
