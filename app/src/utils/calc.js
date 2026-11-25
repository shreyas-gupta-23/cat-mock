export const initialCalc = { acc: '', entry: '0', fresh: true, error: false };

function formatResult(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  return String(Math.round(n * 1e10) / 1e10);
}

function evaluate(formula) {
  const clean = formula.replace(/[+\-*/]$/, '');
  if (!clean) return '0';
  if (!/^-?(?:\d+\.?\d*|\.\d+)(?:[+\-*/]-?(?:\d+\.?\d*|\.\d+))*$/.test(clean)) return null;
  try {
    const result = Function(`"use strict"; return (${clean})`)();
    return formatResult(result);
  } catch {
    return null;
  }
}

function toggled(entry) {
  if (entry.startsWith('-')) return entry.slice(1) || '0';
  if (entry === '0' || entry === '0.') return entry;
  return `-${entry}`;
}

function replaceLastNumber(formula, next) {
  const match = formula.match(/^(.*?)(-?\d*\.?\d+)([+\-*/]?)$/);
  if (!match) return next;
  return match[1] + next + match[3];
}

export function calcFormula(state) {
  if (state.error) return '';
  if (state.fresh) return state.acc;
  return state.acc + state.entry;
}

export function calcStep(state, type, payload) {
  if (state.error && type !== 'clear') {
    if (type === 'digit' || type === 'dot') return calcStep(initialCalc, type, payload);
    return state;
  }

  if (type === 'clear') return { ...initialCalc };

  if (type === 'digit') {
    const digit = payload;
    if (state.fresh) {
      return { ...state, entry: digit, fresh: false, error: false };
    }
    if (state.entry === '0') return { ...state, entry: digit };
    if (state.entry === '-') return { ...state, entry: `-${digit}` };
    return { ...state, entry: state.entry + digit };
  }

  if (type === 'dot') {
    if (state.fresh) return { ...state, entry: '0.', fresh: false };
    if (state.entry === '-') return { ...state, entry: '-0.' };
    if (state.entry.includes('.')) return state;
    return { ...state, entry: `${state.entry}.` };
  }

  if (type === 'op') {
    const op = payload;
    if (state.fresh && state.acc === '' && (state.entry === '0' || state.entry === '0.') && op === '-') {
      return { ...state, acc: '', entry: '-', fresh: false };
    }
    if (state.fresh && /[+\-*/]$/.test(state.acc)) {
      return { ...state, acc: state.acc.slice(0, -1) + op };
    }
    const shown = state.entry.replace(/\.$/, '') || '0';
    const base = (state.fresh ? (state.acc || shown) : state.acc + state.entry).replace(/\.$/, '');
    if (!/\d$/.test(base)) return state;
    return { ...state, acc: `${base}${op}`, entry: shown, fresh: true };
  }

  if (type === 'eq') {
    const formula = calcFormula(state);
    const result = evaluate(formula);
    if (result == null) return { ...initialCalc, entry: 'Error', error: true };
    return { acc: '', entry: result, fresh: true, error: false };
  }

  if (type === 'ce') {
    if (!state.fresh && state.acc.endsWith && state.entry) {
      return { ...state, entry: '0', fresh: true };
    }
    return { ...state, entry: '0', fresh: true };
  }

  if (type === 'sign') {
    const next = toggled(state.entry);
    if (state.fresh && /[+\-*/]$/.test(state.acc)) {
      return { ...state, acc: replaceLastNumber(state.acc, next), entry: next };
    }
    return { ...state, entry: next };
  }

  if (type === 'percent') {
    const value = parseFloat(state.entry);
    if (!Number.isFinite(value)) return state;
    const next = formatResult(value / 100);
    if (next == null) return { ...initialCalc, entry: 'Error', error: true };
    if (state.fresh && /[+\-*/]$/.test(state.acc)) {
      return { ...state, acc: replaceLastNumber(state.acc, next), entry: next };
    }
    return { ...state, entry: next, fresh: state.fresh };
  }

  return state;
}
