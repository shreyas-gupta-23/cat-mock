import useExamStore, { getQuestionStatus } from '../store/examStore';

const LABEL = {
  'not-visited': 'Not visited',
  'not-answered': 'Seen, blank',
  'answered': 'Answered',
  'marked': 'Marked',
  'answered-marked': 'Answered and marked',
};

export default function QuestionNav() {
  const { questions, currentSection, currentQuestionIndex, responses, navigateToQuestion } = useExamStore();
  const sectionQs = questions[currentSection] || [];

  const stats = {
    'not-visited': 0, 'not-answered': 0, 'answered': 0, 'marked': 0, 'answered-marked': 0,
  };
  sectionQs.forEach(q => {
    stats[getQuestionStatus(responses[q.id])]++;
  });

  return (
    <aside className="palette">
      <h2>Palette</h2>
      <div className="pal-grid">
        {sectionQs.map((q, idx) => {
          const status = getQuestionStatus(responses[q.id]);
          const current = idx === currentQuestionIndex ? 'now' : '';
          return (
            <button
              key={q.id}
              type="button"
              className={`qdot ${status} ${current}`}
              aria-current={current ? 'true' : undefined}
              onClick={() => navigateToQuestion(idx)}
              title={`Q${idx + 1}: ${LABEL[status]}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      <div className="legend">
        <span><i /> Not visited · {stats['not-visited']}</span>
        <span><i className="not-answered" /> Seen, blank · {stats['not-answered']}</span>
        <span><i className="answered" /> Answered · {stats.answered}</span>
        <span><i className="marked" /> Marked · {stats.marked + stats['answered-marked']}</span>
      </div>
    </aside>
  );
}
