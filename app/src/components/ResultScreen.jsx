import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useExamStore from '../store/examStore';
import useHistoryStore from '../store/historyStore';
import { answersMatch } from '../utils/score';
import { buildReviewMarkdown, downloadMarkdown } from '../utils/reviewMarkdown';

const SECTIONS = ['VARC', 'DILR', 'Quant'];
const OVERALL_REF = 204;
const SECTION_REF = { VARC: 72, DILR: 60, Quant: 66 };
const PERCENTILE_BANDS = [
  { label: '99.7', at: 105 },
  { label: '99.5', at: 96 },
  { label: '99', at: 82 },
  { label: '95', at: 62 },
  { label: '90', at: 50 },
];

function scaleToRef(score, actualMax, referenceMax) {
  if (!actualMax || actualMax <= 0) return score;
  return (score / actualMax) * referenceMax;
}

function estimatePercentile(score, maxScore = OVERALL_REF) {
  // Bands are a CAT 2025 ballpark on a 204-mark paper. Other lengths are scaled onto that.
  const scaled = scaleToRef(score, maxScore, OVERALL_REF);
  if (scaled >= 115) return 99.9;
  if (scaled >= 110) return 99.8;
  if (scaled >= 105) return 99.7;
  if (scaled >= 96) return 99.5;
  if (scaled >= 82) return 99.0;
  if (scaled >= 71) return 98.0;
  if (scaled >= 62) return 95.0;
  if (scaled >= 50) return 90.0;
  if (scaled >= 42) return 85.0;
  if (scaled >= 36) return 80.0;
  if (scaled >= 28) return 70.0;
  if (scaled >= 20) return 60.0;
  if (scaled >= 12) return 50.0;
  return 30.0;
}

function estimateSectionPercentile(section, score, maxScore) {
  const ref = SECTION_REF[section] || 72;
  const scaled = scaleToRef(score, maxScore, ref);
  const thresholds = {
    VARC: [
      { p: 99, min: 65 },
      { p: 95, min: 52 },
      { p: 90, min: 42 },
      { p: 85, min: 35 },
      { p: 80, min: 28 },
    ],
    DILR: [
      { p: 99, min: 52 },
      { p: 95, min: 42 },
      { p: 90, min: 33 },
      { p: 85, min: 27 },
      { p: 80, min: 21 },
    ],
    Quant: [
      { p: 99, min: 57 },
      { p: 95, min: 48 },
      { p: 90, min: 39 },
      { p: 85, min: 32 },
      { p: 80, min: 25 },
    ],
  };

  const sectionThresholds = thresholds[section] || [];
  for (const threshold of sectionThresholds) {
    if (scaled >= threshold.min) return threshold.p;
  }

  const proportional = Math.round((scaled / ref) * 99);
  return Math.max(10, Math.min(99, proportional));
}

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
  const saveAttempt = useHistoryStore(s => s.saveAttempt);

  const [activeTab, setActiveTab] = useState('summary');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [sortBy, setSortBy] = useState('section');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
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

    const sectionPercentile = estimateSectionPercentile(section, score, qs.length * 3);

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
  const percentile = estimatePercentile(totalScore, totalMax);
  const scaledOverall = scaleToRef(totalScore, totalMax, OVERALL_REF);
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Flatten all questions with metadata
  const allQuestionsFlat = Object.values(questions).flat();

  // Save attempt on mount
  useEffect(() => {
    if (!savedRef.current && examStatus === 'submitted') {
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
  }, [examStatus, saveAttempt, allQuestionsFlat, responses, examConfig, totalScore, totalMax, percentile, accuracy, sectionStats]);

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
  const questionResults = allQuestionsFlat.map((q, idx) => {
    const r = responses[q.id];
    const hasAnswer = r?.answer !== null && r?.answer !== '' && r?.answer !== undefined;
    const isCorrect = hasAnswer && answersMatch(q, r.answer);
    return {
      index: idx + 1,
      id: q.id,
      section: q.section,
      topic: q.topic,
      type: q.type,
      difficulty: q.difficulty,
      question: q.question,
      yourAnswer: r?.answer ?? null,
      correctAnswer: q.answer,
      isCorrect: isCorrect,
      timeSpent: r?.timeSpent || 0,
      options: q.options || [],
      explanation: q.explanation || '',
      hasAnswer,
    };
  });

  // Apply filter and sort
  let filteredResults = questionResults.filter(q => {
    if (reviewFilter === 'correct') return q.hasAnswer && q.isCorrect;
    if (reviewFilter === 'incorrect') return q.hasAnswer && !q.isCorrect;
    if (reviewFilter === 'unattempted') return !q.hasAnswer;
    return true;
  });

  if (sortBy === 'time') {
    filteredResults.sort((a, b) => b.timeSpent - a.timeSpent);
  } else if (sortBy === 'result') {
    filteredResults.sort((a, b) => {
      if (a.hasAnswer && !b.hasAnswer) return -1;
      if (!a.hasAnswer && b.hasAnswer) return 1;
      if (a.isCorrect && !b.isCorrect) return -1;
      if (!a.isCorrect && b.isCorrect) return 1;
      return 0;
    });
  } else {
    filteredResults.sort((a, b) => {
      const sectionOrder = { VARC: 0, DILR: 1, Quant: 2 };
      return (sectionOrder[a.section] || 999) - (sectionOrder[b.section] || 999);
    });
  }

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

      <div className="press-wrap" style={{ padding: 0 }}>
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
                <span>Percentile, scaled to this paper</span>
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
                              {s.percentile.toFixed(0)}
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
                  {PERCENTILE_BANDS.map((row, i) => {
                    const marks = Math.round((row.at * totalMax) / OVERALL_REF);
                    const isYou = scaledOverall >= row.at && (i === 0 || scaledOverall < PERCENTILE_BANDS[i - 1].at);
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

        {/* Review Tab */}
        {activeTab === 'review' && (
          <>
            {/* Filter and Sort Controls */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Filter</h3>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'correct', 'incorrect', 'unattempted'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setReviewFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                          reviewFilter === filter
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {filter === 'all' && 'All'}
                        {filter === 'correct' && 'Correct'}
                        {filter === 'incorrect' && 'Incorrect'}
                        {filter === 'unattempted' && 'Unattempted'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-medium focus:outline-none focus:border-blue-400"
                  >
                    <option value="section">Section (Default)</option>
                    <option value="time">Time Spent</option>
                    <option value="result">Result</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Showing {filteredResults.length} of {questionResults.length} questions
              </p>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filteredResults.map(q => {
                let rowBgColor = 'bg-white/5';
                let resultColor = 'text-slate-400';
                let resultSymbol = '—';

                if (q.hasAnswer && q.isCorrect) {
                  rowBgColor = 'bg-green-500/10 border-green-500/50';
                  resultColor = 'text-green-400';
                  resultSymbol = '✓';
                } else if (q.hasAnswer && !q.isCorrect) {
                  rowBgColor = 'bg-red-500/10 border-red-500/50';
                  resultColor = 'text-red-400';
                  resultSymbol = '✗';
                } else {
                  rowBgColor = 'bg-slate-500/10 border-slate-500/50';
                  resultColor = 'text-slate-400';
                  resultSymbol = '—';
                }

                const sectionColor = SECTION_COLORS[q.section];

                return (
                  <div
                    key={q.id}
                    className={`border border-white/10 rounded-xl overflow-hidden transition-colors ${rowBgColor}`}
                  >
                    {/* Question Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() =>
                        setExpandedQuestion(expandedQuestion === q.id ? null : q.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-xs font-bold text-slate-400 min-w-8">Q{q.index}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${sectionColor.bg} ${sectionColor.text} font-medium`}>
                            {q.section}
                          </span>
                          <span className="text-xs text-slate-400">{q.topic}</span>
                          <span className="text-xs text-slate-500">
                            {q.difficulty && `• ${q.difficulty}`}
                          </span>
                          <span className="text-xs text-slate-500 ml-auto">
                            {q.timeSpent}s
                          </span>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className={`text-lg font-bold ${resultColor}`}>{resultSymbol}</span>
                          <span className={`text-xs ${expandedQuestion === q.id ? 'rotate-180' : ''} transition-transform`}>
                            ▼
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedQuestion === q.id && (
                      <div className="border-t border-white/10 p-4 space-y-3 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Question:</p>
                          <p className="text-slate-200">{q.question}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Your Answer:</p>
                            <p className={`font-mono ${q.hasAnswer ? 'text-blue-300' : 'text-slate-500'}`}>
                              {q.hasAnswer ? q.yourAnswer : 'Not attempted'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Correct Answer:</p>
                            <p className="font-mono text-green-300">{q.correctAnswer}</p>
                          </div>
                        </div>

                        {q.options && q.options.length > 0 && (
                          <div>
                            <p className="text-slate-400 text-xs mb-2">Options:</p>
                            <ul className="space-y-1 ml-4">
                              {q.options.map((opt, i) => (
                                <li key={i} className="text-slate-300 text-xs">
                                  {String.fromCharCode(65 + i)}) {opt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {q.explanation && (
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Explanation:</p>
                            <p className="text-slate-300 text-xs leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredResults.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No questions match the selected filter.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
