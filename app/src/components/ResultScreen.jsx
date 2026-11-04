import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useExamStore from '../store/examStore';
import useHistoryStore from '../store/historyStore';
import { answersMatch } from '../utils/score';
import { buildReviewMarkdown, downloadMarkdown } from '../utils/reviewMarkdown';
import ReviewPane from './ReviewPane';
import {
  DISPLAY_BANDS,
  estimatePercentile,
  estimateSectionPercentile,
  marksAtPercentile,
  percentileCaption,
} from '../utils/percentile';

const SECTIONS = ['VARC', 'DILR', 'Quant'];

function getPercentileColor() {
  return '';
}

export default function ResultScreen() {
  const navigate = useNavigate();
  const examStatus = useExamStore(s => s.examStatus);
  const questions = useExamStore(s => s.questions);
  const responses = useExamStore(s => s.responses);
  const examConfig = useExamStore(s => s.examConfig);
  const resetExam = useExamStore(s => s.resetExam);
  const fromHistory = useExamStore(s => s.fromHistory);
  const saveAttempt = useHistoryStore(s => s.saveAttempt);

  const [activeTab, setActiveTab] = useState(fromHistory ? 'review' : 'summary');
  const savedRef = useRef(false);

  useEffect(() => {
    if (examStatus === 'idle') navigate('/');
  }, [examStatus, navigate]);

  // Compute per-section stats
  const sectionStats = SECTIONS.map(section => {
    const qs = questions[section] || [];
    let attempted = 0, correct = 0, incorrect = 0, score = 0, totalTime = 0;
    const topicMap = {};

    qs.forEach(q => {
      const r = responses[q.id];
      const hasAnswer = r?.answer !== null && r?.answer !== '' && r?.answer !== undefined;
      totalTime += r?.timeSpent || 0;

      if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
      topicMap[q.topic].total++;

      if (hasAnswer) {
        attempted++;
        const isCorrect = answersMatch(q, r.answer);
        if (isCorrect) {
          correct++;
          score += 3;
          topicMap[q.topic].correct++;
        } else if (q.type === 'MCQ') {
          incorrect++;
          score -= 1;
        }
      }
    });

    const weakTopics = Object.entries(topicMap)
      .filter(([, v]) => v.total > 0)
      .map(([topic, v]) => ({ topic, accuracy: Math.round((v.correct / v.total) * 100) }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    const sectionPercentile = estimateSectionPercentile(section, score, examConfig?.year);

    return {
      section,
      total: qs.length,
      attempted,
      correct,
      incorrect,
      score,
      maxScore: qs.length * 3,
      avgTime: attempted > 0 ? Math.round(totalTime / attempted) : 0,
      weakTopics,
      percentile: sectionPercentile,
    };
  });

  const totalScore = sectionStats.reduce((sum, s) => sum + s.score, 0);
  const totalMax = sectionStats.reduce((sum, s) => sum + s.maxScore, 0);
  const totalAttempted = sectionStats.reduce((sum, s) => sum + s.attempted, 0);
  const totalCorrect = sectionStats.reduce((sum, s) => sum + s.correct, 0);
  const totalQuestions = sectionStats.reduce((sum, s) => sum + s.total, 0);
  const percentile = estimatePercentile(totalScore, examConfig?.year);
  const percentileBands = DISPLAY_BANDS.map((p) => ({
    label: String(p),
    at: marksAtPercentile(examConfig?.year, p),
  }));
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Flatten all questions with metadata
  const allQuestionsFlat = Object.values(questions).flat();

  // Save attempt on mount
  useEffect(() => {
    if (!savedRef.current && examStatus === 'submitted' && !fromHistory) {
      savedRef.current = true;
      const questionResults = allQuestionsFlat.map(q => {
        const r = responses[q.id];
        const hasAnswer = r?.answer !== null && r?.answer !== '' && r?.answer !== undefined;
        const isCorrect = hasAnswer && answersMatch(q, r.answer);
        return {
          id: q.id,
          section: q.section,
          topic: q.topic,
          type: q.type,
          difficulty: q.difficulty,
          question: q.question,
          yourAnswer: r?.answer ?? null,
          correctAnswer: q.answer,
          isCorrect,
          timeSpent: r?.timeSpent || 0,
          options: q.options || [],
          explanation: q.explanation || '',
        };
      });

      saveAttempt({
        examConfig,
        totalScore,
        totalMax,
        percentile,
        accuracy,
        sectionStats,
        questionResults,
      });
    }
  }, [examStatus, saveAttempt, allQuestionsFlat, responses, examConfig, totalScore, totalMax, percentile, accuracy, sectionStats, fromHistory]);

  const allWeakTopics = sectionStats
    .flatMap(s => s.weakTopics.map(t => ({ ...t, section: s.section })))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const handleRetake = () => {
    resetExam();
    navigate('/');
  };

  const handleExportPDF = () => {
    window.print();
  };

  const reviewFile = () => buildReviewMarkdown({
    examConfig,
    questions,
    responses,
    sectionStats,
    totalScore,
    totalMax,
    percentile,
    accuracy,
  });

  const handleDownloadReview = () => {
    const slug = (examConfig?.label || 'attempt').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadMarkdown(`${slug}.md`, reviewFile());
  };

  const handleCopyAttempt = async () => {
    const payload = {
      exam: examConfig,
      date: new Date().toISOString(),
      totalScore,
      totalMax,
      percentileBallpark: percentile,
      accuracy,
      sectionStats: sectionStats.map((s) => ({
        section: s.section,
        score: s.score,
        maxScore: s.maxScore,
        attempted: s.attempted,
        correct: s.correct,
        incorrect: s.incorrect,
        percentileBallpark: s.percentile,
      })),
      mistakes: questionResults
        .filter((q) => q.hasAnswer && !q.isCorrect)
        .map((q) => ({
          id: q.id,
          section: q.section,
          topic: q.topic,
          yourAnswer: q.yourAnswer,
          correctAnswer: q.correctAnswer,
          timeSpent: q.timeSpent,
        })),
      unattempted: questionResults.filter((q) => !q.hasAnswer).map((q) => ({
        id: q.id,
        section: q.section,
        topic: q.topic,
      })),
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert('Attempt JSON copied. Paste it in chat for review.');
  };

  // Build question results for review
  const sectionCount = {};
  const questionResults = allQuestionsFlat.map((q, idx) => {
    const r = responses[q.id];
    const hasAnswer = r?.answer !== null && r?.answer !== '' && r?.answer !== undefined;
    const isCorrect = hasAnswer && answersMatch(q, r.answer);
    sectionCount[q.section] = (sectionCount[q.section] || 0) + 1;
    return {
      index: idx + 1,
      sectionIndex: sectionCount[q.section],
      id: q.id,
      section: q.section,
      topic: q.topic,
      type: q.type,
      difficulty: q.difficulty,
      question: q.question,
      passage: q.passage || '',
      yourAnswer: r?.answer ?? null,
      correctAnswer: q.answer,
      isCorrect: isCorrect,
      timeSpent: r?.timeSpent || 0,
      options: q.options || [],
      explanation: q.explanation || '',
      hasAnswer,
    };
  });

  const SECTION_COLORS = {
    VARC: { bg: '', border: '', text: '' },
    DILR: { bg: '', border: '', text: '' },
    Quant: { bg: '', border: '', text: '' },
  };

  return (
    <div className="press-page" style={{ padding: '1.5rem 1.75rem 3rem' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .bg-gradient-to-br { background: white !important; }
          body { background: white !important; }
          .text-white { color: black !important; }
          .bg-white\/5 { background: white !important; border: 1px solid #ccc !important; }
          .border-white\/10 { border-color: #ccc !important; }
          .text-slate-300, .text-slate-400, .text-slate-500, .text-slate-600 { color: #666 !important; }
          .text-green-400, .text-blue-400, .text-purple-400 { color: #000 !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      <div className={activeTab === 'review' ? 'press-wrap review-open' : 'press-wrap'} style={{ padding: 0 }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'end', marginBottom: '1.4rem' }}>
          <div>
            <p className="press-section-label">Result</p>
            <h1 className="press-brand" style={{ fontSize: '1.6rem' }}>{examConfig?.label || 'Paper'}</h1>
            <p className="press-quiet">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button type="button" className="press-btn solid" onClick={handleDownloadReview}>Download review</button>
            <button type="button" className="press-btn" onClick={handleCopyAttempt}>Copy JSON</button>
            <button type="button" className="press-btn" onClick={handleExportPDF}>Print</button>
            <button type="button" className="press-btn" onClick={handleRetake}>Another paper</button>
            <button type="button" className="press-btn" onClick={() => { resetExam(); navigate('/'); }}>Home</button>
          </div>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' }}>
          <button type="button" className={activeTab === 'summary' ? 'exam-tab on' : 'exam-tab'} onClick={() => setActiveTab('summary')}>Summary</button>
          <button type="button" className={activeTab === 'review' ? 'exam-tab on' : 'exam-tab'} onClick={() => setActiveTab('review')}>Questions</button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <>
            {/* Score Summary */}
            <div className="score-grid">
              <div>
                <p className="score-num">{totalScore}</p>
                <p className="press-quiet">of {totalMax}</p>
              </div>
              <div className="press-stat">
                <b>{percentile.toFixed(1)}</b>
                <span>Percentile, CAT {examConfig?.year || 2025} table</span>
              </div>
              <div className="press-stat">
                <b>{totalAttempted}/{totalQuestions}</b>
                <span>Attempted</span>
              </div>
              <div className="press-stat">
                <b>{accuracy}%</b>
                <span>Right among attempts</span>
              </div>
            </div>

            {/* Section Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Section Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="text-left py-2 pb-3">Section</th>
                      <th className="text-center py-2 pb-3">Questions</th>
                      <th className="text-center py-2 pb-3">Attempted</th>
                      <th className="text-center py-2 pb-3 text-green-400">Correct</th>
                      <th className="text-center py-2 pb-3 text-red-400">Incorrect</th>
                      <th className="text-center py-2 pb-3">Score</th>
                      <th className="text-center py-2 pb-3">Accuracy</th>
                      <th className="text-center py-2 pb-3">Percentile</th>
                      <th className="text-center py-2 pb-3">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionStats.map(s => {
                      const c = SECTION_COLORS[s.section];
                      const acc = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
                      return (
                        <tr key={s.section} className="border-b border-white/5">
                          <td className="py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.border} border ${c.text}`}>
                              {s.section}
                            </span>
                          </td>
                          <td className="text-center text-slate-300">{s.total}</td>
                          <td className="text-center text-slate-300">{s.attempted}</td>
                          <td className="text-center text-green-400 font-semibold">{s.correct}</td>
                          <td className="text-center text-red-400 font-semibold">{s.incorrect}</td>
                          <td className="text-center font-bold">
                            <span className={s.score >= 0 ? 'text-green-400' : 'text-red-400'}>{s.score}</span>
                            <span className="text-slate-600 text-xs"> /{s.maxScore}</span>
                          </td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-white/10 rounded-full h-1.5">
                                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${acc}%` }} />
                              </div>
                              <span className="text-slate-300 text-xs">{acc}%</span>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className={`text-xs font-bold ${getPercentileColor(s.percentile)}`}>
                              {s.percentile.toFixed(1)}
                            </span>
                          </td>
                          <td className="text-center text-slate-400 text-xs">{s.avgTime}s/q</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Percentile Scale + Weak Areas */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Percentile scale */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Percentile scale for this paper</h2>
                <div className="space-y-2">
                  {percentileBands.map((row, i) => {
                    const marks = Math.round(row.at);
                    const isYou = totalScore >= row.at && (i === 0 || totalScore < percentileBands[i - 1].at);
                    const color = ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-orange-400', 'bg-red-400'][i];
                    return (
                      <div
                        key={row.label}
                        className={`flex items-center gap-3 p-2 rounded-lg ${isYou ? 'bg-white/10 border border-white/20' : ''}`}
                      >
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-slate-300 text-sm flex-1">{row.label}</span>
                        <span className="text-slate-500 text-xs">About {marks} marks</span>
                        {isYou && <span className="text-xs font-bold text-yellow-400">← You</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <span className="text-slate-400 text-sm">Your estimated percentile: </span>
                    <span className={`text-xl font-bold ${getPercentileColor(percentile)}`}>{percentile.toFixed(1)}th</span>
                    <p className="text-slate-500 text-xs mt-2">{percentileCaption(examConfig?.year)}</p>
                  </div>
                </div>
              </div>

              {/* Weak topics */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Areas to Improve</h2>
                {allWeakTopics.length === 0 ? (
                  <p className="text-slate-400 text-sm">No data — attempt more questions to see weak areas.</p>
                ) : (
                  <div className="space-y-3">
                    {allWeakTopics.map((t, i) => {
                      const c = SECTION_COLORS[t.section];
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text} font-medium`}>
                            {t.section}
                          </span>
                          <span className="flex-1 text-slate-300 text-sm">{t.topic}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-white/10 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  t.accuracy < 40 ? 'bg-red-400' : t.accuracy < 70 ? 'bg-orange-400' : 'bg-green-400'
                                }`}
                                style={{ width: `${t.accuracy}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-8 text-right">{t.accuracy}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-500">
                  Focus on these topics to improve your percentile significantly.
                </div>
              </div>
            </div>

            {/* Section-wise score bars */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Score Distribution</h2>
              <div className="space-y-4">
                {sectionStats.map(s => {
                  const c = SECTION_COLORS[s.section];
                  const pct = s.maxScore > 0 ? Math.max(0, (s.score / s.maxScore) * 100) : 0;
                  return (
                    <div key={s.section}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={c.text + ' font-semibold'}>{s.section}</span>
                        <span className="text-slate-400">
                          {s.score} / {s.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            s.score < 0
                              ? 'bg-red-500'
                              : c.text.replace('text-', 'bg-').replace('-400', '-500')
                          }`}
                          style={{ width: `${Math.max(0, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'review' && <ReviewPane questions={questionResults} />}
      </div>
    </div>
  );
}
