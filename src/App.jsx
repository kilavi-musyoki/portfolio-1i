import React, { useState, useEffect, useCallback, useRef } from 'react';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Projects from './sections/Projects.jsx';
import Milestones from './sections/Milestones.jsx';
import Contact from './sections/Contact.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import DebugOverlay from './components/DebugOverlay.jsx';
import { initScroll } from './scrollSetup.js';

// Spark particle effect on click
const createSparks = (x, y, isDark) => {
  const color = isDark ? '#D4A843' : '#00FF88';
  for (let i = 0; i < 10; i++) {
    const spark = document.createElement('div');
    spark.className = 'spark';
    const angle = (i / 10) * Math.PI * 2;
    const distance = 30 + Math.random() * 40;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    spark.style.cssText = `
      left: ${x}px; top: ${y}px;
      background: ${color};
      box-shadow: 0 0 4px ${color};
      position: fixed; width: 4px; height: 4px;
      border-radius: 50%; pointer-events: none; z-index: 99997;
      animation: none; transition: all 0.5s ease-out;
    `;
    document.body.appendChild(spark);
    requestAnimationFrame(() => {
      spark.style.transform = `translate(${dx}px, ${dy}px)`;
      spark.style.opacity = '0';
      spark.style.width = '2px';
      spark.style.height = '2px';
    });
    setTimeout(() => spark.remove(), 500);
  }
};

const NAV_LINKS = [
  { href: '#about', label: '01 — About' },
  { href: '#projects', label: '02 — Work' },
  { href: '#milestones', label: '03 — Wins' },
  { href: '#contact', label: '04 — Contact' },
];

function App() {
  const [isDark, setIsDark] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [fps, setFps] = useState(60);
  const [navVisible, setNavVisible] = useState(true);
  const [debugBuffer, setDebugBuffer] = useState('');
  const [boardLayer, setBoardLayer] = useState('casing');
  const [boardGlitch, setBoardGlitch] = useState(false);
  const [status, setStatus] = useState({
    available: true,
  });
  const lastScrollY = useRef(0);
  const fpsRef = useRef({ last: performance.now(), frames: 0 });

  // Detect system theme / saved preference on first mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        setIsDark(stored === 'dark');
        return;
      }
    } catch {
      // ignore storage errors and fall back to system preference
    }

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mq.matches);
    }
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Scroll-driven PCB deconstruction
  useEffect(() => {
    const cleanup = initScroll(setBoardLayer, setBoardGlitch);
    return cleanup;
  }, []);

  // Fetch live "hire me" status from backend (optional)
  useEffect(() => {
    let cancelled = false;
    fetch('/api/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data === 'object') {
          setStatus((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch(() => {
        // Silent fail — fall back to defaults
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // FPS counter
  useEffect(() => {
    let rafId;
    const countFPS = () => {
      fpsRef.current.frames++;
      const now = performance.now();
      if (now - fpsRef.current.last >= 1000) {
        setFps(fpsRef.current.frames);
        fpsRef.current.frames = 0;
        fpsRef.current.last = now;
      }
      rafId = requestAnimationFrame(countFPS);
    };
    rafId = requestAnimationFrame(countFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Debug mode key listener — type "debug" anywhere
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key.length === 1) {
        setDebugBuffer(prev => {
          const next = (prev + key).slice(-5);
          if (next === 'debug') {
            setDebugMode(d => !d);
            return '';
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Nav hide on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setNavVisible(y < lastScrollY.current || y < 100);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global click sparks
  useEffect(() => {
    const handleClick = (e) => {
      // Only on non-interactive elements
      const tag = e.target.tagName.toLowerCase();
      if (!['input', 'textarea', 'button', 'a', 'select'].includes(tag)) {
        createSparks(e.clientX, e.clientY, isDark);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isDark]);

  const textColor = isDark ? '#e0ffe8' : '#1A1A2E';
  const dimColor = isDark ? 'rgba(0,255,136,0.5)' : 'rgba(26,26,46,0.5)';
  const accentColor = isDark ? '#00FF88' : '#D4A843';

  return (
    <>
      {/* Navigation */}
      <nav
        className="nav-glass"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
          padding: '0 2rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <a href="#hero" style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '0.75rem',
          color: accentColor,
          textDecoration: 'none',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ width: 8, height: 8, background: accentColor, borderRadius: '50%', boxShadow: `0 0 8px ${accentColor}` }} />
          KM — SILICON SOUL
        </a>

        {/* Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.65rem',
                color: dimColor,
                textDecoration: 'none',
                letterSpacing: '0.08em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = accentColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = dimColor; }}
            >
              {link.label}
            </a>
          ))}

          {/* Status pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            border: `1px solid rgba(0,255,136,0.2)`,
            borderRadius: '2px',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 6px #00FF88', animation: 'blink-slow 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: dimColor, letterSpacing: '0.08em' }}>
              {`SYSTEM: ONLINE | SEEKING: ${status.seeking?.toUpperCase() || 'N/A'} | UNTIL: ${status.until || '—'}`}
            </span>
          </div>

          <ThemeToggle
            isDark={isDark}
            onToggle={() => {
              setIsDark(prev => {
                const next = !prev;
                try {
                  window.localStorage.setItem('theme', next ? 'dark' : 'light');
                } catch {
                  // ignore storage issues
                }
                return next;
              });
            }}
          />
        </div>
      </nav>

      {/* Main sections */}
      <main>
        <Hero isDark={isDark} layer={boardLayer} glitch={boardGlitch} />
        <About isDark={isDark} />
        <Projects isDark={isDark} />
        <Milestones isDark={isDark} />
        <Contact isDark={isDark} />
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: `1px solid ${isDark ? 'rgba(0,255,136,0.1)' : 'rgba(212,168,67,0.15)'}`,
        background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(245,240,232,0.5)',
      }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: dimColor, marginBottom: '4px' }}>
          © 2026 Kilavi Musyoki — SN-2024-KM-PORTFOLIO-REV2
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: isDark ? 'rgba(0,255,136,0.3)' : 'rgba(26,26,46,0.4)', letterSpacing: '0.1em' }}>
          Engineered with intent. Built for impact.
        </div>
      </footer>

      {/* Debug overlay easter egg */}
      <DebugOverlay visible={debugMode} fps={fps} />

      {/* Debug mode screen edge indicators */}
      {debugMode && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: '#00FF88',
          zIndex: 99998,
          boxShadow: '0 0 10px #00FF88',
        }} />
      )}
    </>
  );
}

export default App;
