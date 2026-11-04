import { useEffect, useMemo, useRef, useState } from 'react';
import { Rich, Stem } from './QuestionDisplay';
import { splitStem, optionLetter } from '../utils/stem';

const SECTIONS = ['VARC', 'DILR', 'Quant'];

function clock(seconds) {
  const n = Number(seconds) || 0;
  if (n < 60) return `${n}s`;
  const m = Math.floor(n / 60);
  const s = n % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export default function ReviewPane({ questions }) {
  const [section, setSection] = useState('VARC');
  const [filter, setFilter] = useState('all');
  const [currentId, setCurrentId] = useState(null);

  const inSection = useMemo(
    () => questions.filter((q) => section === 'all' || q.section === section),
    [questions, section],
  );

  const matches = useMemo(() => inSection.filter((q) => {
    if (filter === 'correct') return q.hasAnswer && q.isCorrect;
    if (filter === 'incorrect') return q.hasAnswer && !q.isCorrect;
    if (filter === 'unattempted') return !q.hasAnswer;
    return true;
  }), [inSection, filter]);

  const matchKey = matches.map((q) => q.id).join('|');
  const sectionKey = inSection.map((q) => q.id).join('|');
  const matchesRef = useRef(matches);
  const inSectionRef = useRef(inSection);
  matchesRef.current = matches;
  inSectionRef.current = inSection;

  useEffect(() => {
    const pool = matchesRef.current.length ? matchesRef.current : inSectionRef.current;
    setCurrentId((id) => {
      if (id && pool.some((item) => item.id === id)) return id;
      return pool[0]?.id ?? null;
    });
  }, [section, filter, sectionKey, matchKey]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const pool = matches.some((item) => item.id === currentId) ? matches : inSection;
      const i = pool.findIndex((item) => item.id === currentId);
      const next = e.key === 'ArrowRight' ? pool[i + 1] : pool[i - 1];
      if (!next) return;
      e.preventDefault();
      setCurrentId(next.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [matches, inSection, currentId]);

  const q = inSection.find((item) => item.id === currentId) || null;
  const stepList = q && matches.some((item) => item.id === q.id) ? matches : inSection;
  const step = q ? stepList.findIndex((item) => item.id === q.id) : -1;

  const go = (dir) => {
    const next = stepList[step + dir];
    if (next) setCurrentId(next.id);
  };

  let mark = 'Blank';
  let markClass = 'blank';
  if (q?.hasAnswer && q.isCorrect) {
    mark = 'Right';
    markClass = 'ok';
  } else if (q?.hasAnswer) {
    mark = 'Wrong';
    markClass = 'bad';
  }

  const parts = q ? splitStem(q) : { passage: '', ask: '' };

  return (
    <div>
      <div className="review-tools">
        <div className="exam-tabs">
          {['all', ...SECTIONS].map((name) => (
            <button
              key={name}
              type="button"
              className={section === name ? 'exam-tab on' : 'exam-tab'}
              onClick={() => setSection(name)}
            >
              {name === 'all' ? 'All' : name}
            </button>
          ))}
        </div>
        <div className="exam-tabs">
          {['all', 'incorrect', 'correct', 'unattempted'].map((name) => (
            <button
              key={name}
              type="button"
              className={filter === name ? 'exam-tab on' : 'exam-tab'}
              onClick={() => setFilter(name)}
            >
              {name === 'all' ? 'All' : name === 'incorrect' ? 'Wrong' : name === 'correct' ? 'Right' : 'Blank'}
            </button>
          ))}
        </div>
      </div>

      <div className="review-layout">
        <div className="review-stage">
          {!q && <p className="review-empty">Nothing in this filter.</p>}
          {q && (
            <>
              <div className="review-bar">
                <button type="button" className="review-nav" onClick={() => go(-1)} disabled={step <= 0}>Previous</button>
                <p>
                  Question {q.sectionIndex}
                  <span className="review-meta"> · {q.section} · {q.type} · </span>
                  <span className={`mark ${markClass}`}>{mark}</span>
                  <span className="review-meta"> · {clock(q.timeSpent)}</span>
                </p>
                <button type="button" className="review-nav" onClick={() => go(1)} disabled={step < 0 || step >= stepList.length - 1}>Next</button>
              </div>
              <div className={parts.passage ? 'review-split' : 'review-single'}>
                {parts.passage && (
                  <div className="passage">
                    <p className="kicker">{q.section} · passage</p>
                    <Stem text={parts.passage} />
                  </div>
                )}
                <div className="ask">
                  <p className="kicker">Question {q.sectionIndex}</p>
                  <Stem text={parts.ask} />
                  {q.type !== 'TITA' && q.options?.length > 0 && (
                    <div className="opt-list">
                      {q.options.map((opt, i) => {
                        const letter = optionLetter(opt, i);
                        const yours = String(q.yourAnswer || '').trim().charAt(0).toUpperCase();
                        const key = String(q.correctAnswer || '').trim().charAt(0).toUpperCase();
                        const isYours = q.hasAnswer && yours === letter;
                        const isKey = key === letter;
                        const cls = isYours && isKey ? 'hit' : isYours ? 'pick' : isKey ? 'key' : '';
                        return (
                          <div key={i} className={`opt-row ${cls}`}>
                            <span><Rich text={opt} /></span>
                            {isYours && isKey && <em>Your pick, and the key</em>}
                            {isYours && !isKey && <em>Your pick</em>}
                            {!isYours && isKey && <em>Key</em>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.type === 'TITA' && (
                    <div className="tita-review">
                      <div>
                        <p className="kicker">You typed</p>
                        <p>{q.hasAnswer ? q.yourAnswer : 'Blank'}</p>
                      </div>
                      <div>
                        <p className="kicker">Key</p>
                        <p><Rich text={q.correctAnswer} /></p>
                      </div>
                    </div>
                  )}
                  {q.explanation && (
                    <div className="review-note">
                      <p className="kicker">Note</p>
                      <p><Rich text={q.explanation} /></p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="palette review-pal">
          <h2>{section === 'all' ? 'Paper' : section}</h2>
          <div className="pal-grid">
            {inSection.map((item) => {
              const shown = filter === 'all' || matches.some((m) => m.id === item.id);
              let status = 'blank';
              if (item.hasAnswer && item.isCorrect) status = 'right';
              else if (item.hasAnswer) status = 'wrong';
              const now = item.id === q?.id ? 'now' : '';
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`qdot ${status} ${now} ${shown ? '' : 'dim'}`}
                  aria-current={now ? 'true' : undefined}
                  onClick={() => setCurrentId(item.id)}
                  title={`Question ${item.sectionIndex}`}
                >
                  {item.sectionIndex}
                </button>
              );
            })}
          </div>
          <div className="legend">
            <span><i className="now-key" /> Open question</span>
            <span><i className="right" /> Right</span>
            <span><i className="wrong" /> Wrong</span>
            <span><i /> Blank</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
