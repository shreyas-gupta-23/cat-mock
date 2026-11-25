import React, { useState, useRef, useEffect } from 'react';
import { calcFormula, calcStep, initialCalc } from '../utils/calc';

function placeCalc() {
  const width = 280;
  const palette = 17.5 * 16;
  const x = Math.max(12, window.innerWidth - width - palette - 28);
  return { x, y: 68 };
}

export default function Calculator({ onClose }) {
  const [calc, setCalc] = useState(initialCalc);
  const [position, setPosition] = useState(placeCalc);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isDragging) return undefined;
    const move = (e) => {
      const width = containerRef.current?.offsetWidth || 280;
      const height = containerRef.current?.offsetHeight || 360;
      const x = Math.min(window.innerWidth - width, Math.max(0, e.clientX - dragOffset.current.x));
      const y = Math.min(window.innerHeight - 48, Math.max(0, e.clientY - dragOffset.current.y));
      setPosition({ x, y });
    };
    const up = () => setIsDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [isDragging]);

  const step = (type, payload) => setCalc((prev) => calcStep(prev, type, payload));

  const onHeaderDown = (e) => {
    if (e.target.closest('button')) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDragging(true);
  };

  const formula = calcFormula(calc);
  const expression = !calc.error && formula && formula !== calc.entry ? formula : '';

  return (
    <div
      ref={containerRef}
      className="calc-pop"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="calc-head" onMouseDown={onHeaderDown}>
        <span>Calculator</span>
        <button type="button" onClick={onClose} aria-label="Close calculator">×</button>
      </div>

      <div className="calc-screen">
        <div className="calc-expr"><span>{expression}</span></div>
        <div className="calc-value">{calc.error ? 'Error' : calc.entry}</div>
      </div>

      <div className="calc-keys">
        <CalcKey label="C" tone="red" onClick={() => step('clear')} />
        <CalcKey label="CE" tone="red" onClick={() => step('ce')} />
        <CalcKey label="%" tone="ink" onClick={() => step('percent')} />
        <CalcKey label="±" tone="ink" onClick={() => step('sign')} />
        <CalcKey label="7" onClick={() => step('digit', '7')} />
        <CalcKey label="8" onClick={() => step('digit', '8')} />
        <CalcKey label="9" onClick={() => step('digit', '9')} />
        <CalcKey label="/" tone="ink" onClick={() => step('op', '/')} />
        <CalcKey label="4" onClick={() => step('digit', '4')} />
        <CalcKey label="5" onClick={() => step('digit', '5')} />
        <CalcKey label="6" onClick={() => step('digit', '6')} />
        <CalcKey label="*" tone="ink" onClick={() => step('op', '*')} />
        <CalcKey label="1" onClick={() => step('digit', '1')} />
        <CalcKey label="2" onClick={() => step('digit', '2')} />
        <CalcKey label="3" onClick={() => step('digit', '3')} />
        <CalcKey label="-" tone="ink" onClick={() => step('op', '-')} />
        <CalcKey label="0" onClick={() => step('digit', '0')} />
        <CalcKey label="." onClick={() => step('dot')} />
        <CalcKey label="=" tone="ok" onClick={() => step('eq')} />
        <CalcKey label="+" tone="ink" onClick={() => step('op', '+')} />
      </div>
    </div>
  );
}

function CalcKey({ label, onClick, tone }) {
  return (
    <button type="button" className={tone ? `calc-key ${tone}` : 'calc-key'} onClick={onClick}>
      {label}
    </button>
  );
}
