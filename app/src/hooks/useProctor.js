import { useState, useEffect, useRef } from 'react';

export function useProctor({ enabled = false }) {
  const [violations, setViolations] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);
  const warningTimeoutRef = useRef(null);

  const dismissWarning = () => {
    setWarningVisible(false);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  };

  const incrementViolations = () => {
    setViolations(prev => prev + 1);
    setWarningVisible(true);

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    warningTimeoutRef.current = setTimeout(() => {
      setWarningVisible(false);
    }, 4000);
  };

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Request fullscreen on mount
    requestFullscreen();

    // Fullscreen change listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        incrementViolations();
      }
    };

    // Visibility change listener (tab switch detection)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementViolations();
      }
    };

    // Window blur listener
    const handleBlur = () => {
      incrementViolations();
    };

    // Context menu prevention (disable right-click)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Keyboard shortcut prevention
    const handleKeyDown = (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Ctrl+U (or Cmd+U on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I (or Cmd+Option+I on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'i') {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+J (or Cmd+Option+J on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'j') {
        e.preventDefault();
        return;
      }

      // Ctrl+S (or Cmd+S on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return;
      }

      // Alt+Tab
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      // F11
      if (e.key === 'F11') {
        e.preventDefault();
        return;
      }
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [enabled]);

  return {
    violations,
    warningVisible,
    dismissWarning,
    exitFullscreen,
    requestFullscreen,
  };
}
