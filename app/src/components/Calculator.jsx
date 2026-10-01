import React, { useState, useRef, useEffect } from 'react';

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [hasResult, setHasResult] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (headerRef.current && headerRef.current.contains(e.target)) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          setIsDragging(true);
        }
      }
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleDigitClick = (digit) => {
    if (hasResult) {
      setDisplay(digit);
      setExpression(digit);
      setHasResult(false);
    } else {
      if (display === '0') {
        setDisplay(digit);
        setExpression(digit);
      } else {
        setDisplay(display + digit);
        setExpression(expression + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (hasResult) {
      setDisplay('0.');
      setExpression('0.');
      setHasResult(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const handleOperator = (op) => {
    if (hasResult) {
      setExpression(display + op);
      setDisplay(display);
      setHasResult(false);
    } else {
      setExpression(expression + op);
      setDisplay(display);
    }
  };

  const handleEquals = () => {
    try {
      // Safe math eval: only allow digits, operators, dots, spaces
      if (!/^[0-9+\-*/.() %]+$/.test(expression)) throw new Error('Invalid');
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + expression + ')')();
      const resultStr = String(Number.isFinite(result) ? +result.toFixed(10) : 'Error');
      setDisplay(resultStr);
      setExpression(resultStr);
      setHasResult(true);
    } catch {
      setDisplay('Error');
      setExpression('');
      setHasResult(false);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setHasResult(false);
  };

  const handleClearEntry = () => {
    setDisplay('0');
    if (expression) {
      const lastOpIndex = Math.max(
        expression.lastIndexOf('+'),
        expression.lastIndexOf('-'),
        expression.lastIndexOf('*'),
        expression.lastIndexOf('/')
      );
      if (lastOpIndex !== -1) {
        setExpression(expression.substring(0, lastOpIndex + 1));
      } else {
        setExpression('');
      }
    }
  };

  const handlePercent = () => {
    try {
      const value = parseFloat(display);
      const result = value / 100;
      setDisplay(String(result));
      setExpression(String(result));
      setHasResult(true);
    } catch {
      setDisplay('Error');
    }
  };

  const handleToggleSign = () => {
    const value = parseFloat(display);
    const result = -value;
    setDisplay(String(result));
    setExpression(String(result));
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
        backgroundColor: 'white',
        border: '1px solid #161814',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        fontFamily: 'Arial, sans-serif',
        zIndex: 1000,
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        ref={headerRef}
        style={{
          backgroundColor: '#161814',
          color: 'white',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'move',
          borderRadius: '4px 4px 0 0',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Calculator</span>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Display */}
      <div
        style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          textAlign: 'right',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            minHeight: '16px',
            marginBottom: '4px',
          }}
        >
          {expression}
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#161814',
            wordBreak: 'break-all',
            minHeight: '32px',
          }}
        >
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div style={{ padding: '8px' }}>
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '4px' }}>
          <CalculatorButton label="C" onClick={handleClear} color="red" />
          <CalculatorButton label="CE" onClick={handleClearEntry} color="red" />
          <CalculatorButton label="%" onClick={handlePercent} color="blue" />
          <CalculatorButton label="±" onClick={handleToggleSign} color="blue" />
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '4px' }}>
          <CalculatorButton label="7" onClick={() => handleDigitClick('7')} color="gray" />
          <CalculatorButton label="8" onClick={() => handleDigitClick('8')} color="gray" />
          <CalculatorButton label="9" onClick={() => handleDigitClick('9')} color="gray" />
          <CalculatorButton label="/" onClick={() => handleOperator('/')} color="blue" />
        </div>

        {/* Row 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '4px' }}>
          <CalculatorButton label="4" onClick={() => handleDigitClick('4')} color="gray" />
          <CalculatorButton label="5" onClick={() => handleDigitClick('5')} color="gray" />
          <CalculatorButton label="6" onClick={() => handleDigitClick('6')} color="gray" />
          <CalculatorButton label="*" onClick={() => handleOperator('*')} color="blue" />
        </div>

        {/* Row 4 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '4px' }}>
          <CalculatorButton label="1" onClick={() => handleDigitClick('1')} color="gray" />
          <CalculatorButton label="2" onClick={() => handleDigitClick('2')} color="gray" />
          <CalculatorButton label="3" onClick={() => handleDigitClick('3')} color="gray" />
          <CalculatorButton label="-" onClick={() => handleOperator('-')} color="blue" />
        </div>

        {/* Row 5 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '4px' }}>
          <CalculatorButton label="0" onClick={() => handleDigitClick('0')} color="gray" />
          <CalculatorButton label="." onClick={handleDecimal} color="gray" />
          <CalculatorButton label="=" onClick={handleEquals} color="green" style={{ gridColumn: 'span 2' }} />
        </div>

        {/* Row 6 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          <CalculatorButton label="+" onClick={() => handleOperator('+')} color="blue" style={{ gridColumn: 'span 4' }} />
        </div>
      </div>
    </div>
  );
}

function CalculatorButton({ label, onClick, color, style }) {
  const getBackgroundColor = () => {
    switch (color) {
      case 'blue':
        return '#161814';
      case 'red':
        return '#cc0000';
      case 'green':
        return '#008000';
      case 'gray':
      default:
        return '#e0e0e0';
    }
  };

  const getTextColor = () => {
    return color === 'gray' ? '#000' : '#fff';
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 0',
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'opacity 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.target.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.target.style.opacity = '1';
      }}
    >
      {label}
    </button>
  );
}
