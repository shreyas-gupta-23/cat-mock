import katex from 'katex';
import 'katex/dist/katex.min.css';
import useExamStore from '../store/examStore';
import { decodeEntities, presentText } from '../utils/stem';

const TOKEN = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$(?:\\.|[^$\n])+?\$|\*\*[^*\n]+?\*\*|\*[A-Za-z][^*\n]*?\*|`[^`\n]+`)/g;

function mathHtml(tex, display) {
  try {
    return katex.renderToString(tex.trim(), { throwOnError: false, displayMode: display, strict: 'ignore' });
  } catch {
    return '';
  }
}

function MathSpan({ tex, display }) {
  const html = mathHtml(tex, display);
  if (!html) return tex;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function inlinePieces(text, prefix) {
  const nodes = [];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(TOKEN)) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const s = match[0];
    const key = `${prefix}-${n}`;
    n += 1;
    if (s.startsWith('$$')) nodes.push(<MathSpan key={key} tex={s.slice(2, -2)} display />);
    else if (s.startsWith('\\[')) nodes.push(<MathSpan key={key} tex={s.slice(2, -2)} display />);
    else if (s.startsWith('\\(')) nodes.push(<MathSpan key={key} tex={s.slice(2, -2)} />);
    else if (s.startsWith('$')) nodes.push(<MathSpan key={key} tex={s.slice(1, -1)} />);
    else if (s.startsWith('**')) nodes.push(<strong key={key}>{s.slice(2, -2)}</strong>);
    else if (s.startsWith('*')) nodes.push(<em key={key}>{s.slice(1, -1)}</em>);
    else nodes.push(<code key={key}>{s.slice(1, -1)}</code>);
    last = match.index + s.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const FIG = /(!\[[^\]]*\]\([^)]+\)|https?:\/\/[^\s<>"']+\.(?:png|jpe?g|gif|webp)(?:\?[^\s<>"']*)?)/gi;

export function Rich({ text }) {
  const bits = decodeEntities(text).split(FIG);
  return bits.map((bit, i) => {
    if (!bit) return null;
    const md = bit.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (md) return <img key={i} className="stem-fig" alt={md[1] || 'Figure'} src={md[2]} />;
    if (/^https?:\/\/\S+\.(?:png|jpe?g|gif|webp)(?:\?\S*)?$/i.test(bit)) {
      return <img key={i} className="stem-fig" alt="Figure" src={bit} />;
    }
    return <span key={i}>{inlinePieces(bit, i)}</span>;
  });
}

export function Stem({ text, size }) {
  const parts = presentText(text).split('```');
  return parts.map((part, i) => {
    const body = part.replace(/^\n/, '').replace(/\n$/, '');
    if (!body.trim()) return null;
    if (i % 2 === 1) return <pre key={i} className="figure" style={{ fontSize: size }}>{body}</pre>;
    return <p key={i} className="stem" style={{ fontSize: size }}><Rich text={body} /></p>;
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
                <span><Rich text={opt} /></span>
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
          <Stem text={question.passage} size={size} />
        </div>
        {ask}
      </div>
    </div>
  );
}
