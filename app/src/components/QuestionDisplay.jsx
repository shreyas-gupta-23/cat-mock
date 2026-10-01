import useExamStore from '../store/examStore';

function Prose({ text }) {
  const bits = text.split(/(!\[[^\]]*\]\([^)]+\))/g);
  return bits.map((bit, i) => {
    const img = bit.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) return <img key={i} className="stem-fig" alt={img[1]} src={img[2]} />;
    return <span key={i}>{bit}</span>;
  });
}

function Stem({ text, size }) {
  const parts = String(text || '').split('```');
  return parts.map((part, i) => {
    const body = part.replace(/^\n/, '').replace(/\n$/, '');
    if (!body.trim()) return null;
    if (i % 2 === 1) return <pre key={i} className="figure" style={{ fontSize: size }}>{body}</pre>;
    return <p key={i} className="stem" style={{ fontSize: size }}><Prose text={body} /></p>;
  });
}

export default function QuestionDisplay() {
  const currentSection = useExamStore(s => s.currentSection);
  const currentQuestionIndex = useExamStore(s => s.currentQuestionIndex);
  const questions = useExamStore(s => s.questions);
  const responses = useExamStore(s => s.responses);
  const setAnswer = useExamStore(s => s.setAnswer);
  const fontSizeLevel = useExamStore(s => s.fontSizeLevel);

  const sectionQs = questions[currentSection] || [];
  const question = sectionQs[currentQuestionIndex];

  if (!question) {
    return <div className="exam-read exam-single">No question.</div>;
  }

  const response = responses[question.id] || { answer: null };
  const questionNumber = currentQuestionIndex + 1;
  const marks = question.type === 'TITA' ? '+3 / 0' : '+3 / −1';
  const size = fontSizeLevel === 1 ? '0.98rem' : fontSizeLevel === 3 ? '1.14rem' : '1.05rem';

  const ask = (
    <div className="ask">
      <p className="kicker">Question {questionNumber} · {question.type} · {marks}</p>
      <Stem text={question.question} size={size} />
      {question.type !== 'TITA' && question.options && (
        <div className="opts">
          {question.options.map((opt, idx) => {
            const letter = String(opt).trim().charAt(0);
            const selected = response.answer === letter;
            return (
              <label key={idx} className={selected ? 'on' : ''}>
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={letter}
                  checked={selected}
                  onChange={() => setAnswer(question.id, letter)}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
      {question.type === 'TITA' && (
        <div className="tita">
          <p className="kicker">Type the answer</p>
          <input
            type="text"
            value={response.answer || ''}
            onChange={e => setAnswer(question.id, e.target.value)}
            aria-label="Your answer"
          />
        </div>
      )}
    </div>
  );

  if (!question.passage) {
    return <div className="exam-read exam-single" style={{ fontSize: size }}>{ask}</div>;
  }

  return (
    <div className="exam-read">
      <div className="exam-split">
        <div className="passage">
          <p className="kicker">{currentSection} · passage</p>
          <p style={{ fontSize: size, whiteSpace: 'pre-wrap' }}>{question.passage}</p>
        </div>
        {ask}
      </div>
    </div>
  );
}
