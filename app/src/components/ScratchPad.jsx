import React, { useState, useRef, useEffect } from 'react';

export default function ScratchPad({ onClose }) {
  const [text, setText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    // Set initial position (bottom-right)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initialX = window.innerWidth - rect.width - 20;
      const initialY = window.innerHeight - rect.height - 80;
      setPosition({ x: initialX, y: initialY });
    }
  }, []);

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

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the rough work?')) {
      setText('');
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '300px',
        backgroundColor: 'white',
        border: '1px solid #161814',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        fontFamily: 'Arial, sans-serif',
        zIndex: 1000,
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
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
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Rough Work</span>
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

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: '100%',
          height: '200px',
          padding: '8px',
          border: 'none',
          borderBottom: '1px solid #ddd',
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          resize: 'none',
          boxSizing: 'border-box',
          flex: 1,
        }}
        placeholder="Enter your rough work here..."
      />

      {/* Clear Button */}
      <div style={{ padding: '8px', textAlign: 'right' }}>
        <button
          onClick={handleClear}
          style={{
            padding: '6px 12px',
            backgroundColor: '#9c3b2e',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
