import React, { useEffect, useRef, useState, useCallback } from 'react';
import PCBBoard from '../components/Board.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
    { text: 'SILICON SOUL v2.0 — INITIALIZING...', delay: 0 },
    { text: 'POST CHECK: RAM .................. OK', delay: 300 },
    { text: 'POST CHECK: GPU .................. OK', delay: 600 },
    { text: 'POST CHECK: PORTFOLIO.EXE ........ LOADED', delay: 900 },
    { text: 'POST CHECK: ESP32_CORE ........... ONLINE', delay: 1200 },
    { text: 'POST CHECK: RF_MODULE ............ CALIBRATED', delay: 1500 },
    { text: 'POST CHECK: EGO_MODULE ........... WARN (within limits)', delay: 1800 },
    { text: 'MOUNTING INTERFACE ...............', delay: 2100 },
    { text: 'SIGNAL ACQUIRED. WELCOME, OPERATOR.', delay: 2400 },
];

// Per-line colors keyed by index, defined per mode inside component
const LINE_COLOR_INDEX = [0, 1, 1, 1, 1, 1, 2, 3, 4];
// 0 = dim, 1 = ok/green, 2 = warn/gold, 3 = muted, 4 = bright

const UPTIME_START = Date.now();

const Hero = ({ isDark, layer = 'components', glitch = false }) => {
    const [bootDone, setBootDone] = useState(false);
    const [visibleLines, setVisibleLines] = useState(0);
    const [progress, setProgress] = useState(0);
    const [uptime, setUptime] = useState('00:00:00');
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [ledPos, setLedPos] = useState({ x: 0.5, y: 0.5 });
    const [inViewport, setInViewport] = useState(true);
    const boardRef = useRef(null);
    const ledPosRef = useRef({ x: 0.5, y: 0.5 });
    const targetPosRef = useRef({ x: 0.5, y: 0.5 });
    const rafRef = useRef(null);

    // ── Palette ────────────────────────────────────────────────────────────────
    // Mirrors the Contact.jsx palette so both modes are cohesive site-wide.
    const textColor         = isDark ? '#ffffff'                    : '#2A2A3A';
    const dimColor          = isDark ? 'rgba(206,208,206,0.55)'     : 'rgba(42,47,69,0.52)';
    const accentColor       = isDark ? '#ced0ce'                    : '#50b1ce';
    const accentGlow        = isDark ? 'rgba(206,208,206,0.35)'     : 'rgba(80,177,206,0.35)';
    const accentHover       = isDark ? '#ffffff'                    : '#2a8fb0';
    const tagBorder         = isDark ? 'rgba(206,208,206,0.6)'      : 'rgba(80,177,206,0.65)';
    const tagBg             = isDark ? 'rgba(206,208,206,0.06)'     : 'rgba(80,177,206,0.08)';
    const statusBg          = isDark ? 'rgba(206,208,206,0.03)'     : 'rgba(80,177,206,0.05)';
    const statusBorder      = isDark ? 'rgba(206,208,206,0.15)'     : 'rgba(80,177,206,0.2)';
    const gridOpacity       = isDark ? 0.25                         : 0.12;
    const beamColor         = isDark ? 'rgba(0,255,136,0.25)'       : 'rgba(80,177,206,0.2)';
    const beamColorFaint    = isDark ? 'rgba(0,255,136,0.05)'       : 'rgba(80,177,206,0.03)';
    const progressTrack     = isDark ? 'rgba(75,216,160,0.15)'      : 'rgba(80,177,206,0.15)';
    const progressFill      = isDark
        ? 'linear-gradient(90deg,#4BD8A0,#6FD4FF)'
        : 'linear-gradient(90deg,#50b1ce,#79bfc9)';
    const terminalBg        = isDark ? '#050808'                    : '#f4f7fc';
    const terminalBorder    = isDark ? 'rgba(75,216,160,0.3)'       : 'rgba(80,177,206,0.35)';
    const terminalLabel     = isDark ? 'rgba(75,216,160,0.5)'       : 'rgba(80,177,206,0.55)';
    const btnTextColor      = isDark ? '#394139'                    : '#ffffff';

    // Boot line colours
    const lineColors = {
        0: dimColor,                                            // dim
        1: isDark ? '#b0ffcc'    : '#50b1ce',                 // ok
        2: isDark ? '#D4A843'    : '#c4973a',                 // warn
        3: isDark ? '#9ca09c'    : 'rgba(42,47,69,0.45)',     // muted
        4: isDark ? '#ffffff'    : '#2A2A3A',                 // bright
    };

    // Status bar specific colours
    const statusOnline  = isDark ? '#4BD8A0'  : '#3aa87e';
    const statusTemp    = isDark ? '#FF5A3C'  : '#e05c3a';

    // ── Boot sequence ──────────────────────────────────────────────────────────
    useEffect(() => {
        BOOT_LINES.forEach((line, i) => {
            setTimeout(() => {
                setVisibleLines(i + 1);
                setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
            }, line.delay);
        });
        setTimeout(() => setBootDone(true), 2800);
    }, []);

    // ── Uptime counter ─────────────────────────────────────────────────────────
    useEffect(() => {
        const tick = () => {
            const elapsed = Math.floor((Date.now() - UPTIME_START) / 1000);
            const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
            const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
            const s = String(elapsed % 60).padStart(2, '0');
            setUptime(`${h}:${m}:${s}`);
        };
        const interval = setInterval(tick, 1000);
        tick();
        return () => clearInterval(interval);
    }, []);

    // ── Mouse tracking ─────────────────────────────────────────────────────────
    const handleMouseMove = useCallback((e) => {
        const nx = e.clientX / window.innerWidth;
        const ny = e.clientY / window.innerHeight;
        setMousePos({ x: nx, y: ny });
        targetPosRef.current = { x: nx, y: ny };
    }, []);
    const handleMouseLeave = useCallback(() => setInViewport(false), []);
    const handleMouseEnter = useCallback(() => setInViewport(true), []);

    // ── LED lerp ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const lerp = (a, b, t) => a + (b - a) * t;
        const animate = () => {
            ledPosRef.current = {
                x: lerp(ledPosRef.current.x, targetPosRef.current.x, 0.08),
                y: lerp(ledPosRef.current.y, targetPosRef.current.y, 0.08),
            };
            setLedPos({ ...ledPosRef.current });
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    // ── Derived values ─────────────────────────────────────────────────────────
    const tiltX = (mousePos.y - 0.5) * -24;
    const tiltY = (mousePos.x - 0.5) * 24;
    const beamX = (mousePos.x - 0.5) * 40;
    const beamY = (mousePos.y - 0.5) * 20;

    return (
        <section
            id="hero"
            style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            data-debug="hero-section"
        >
            {/* ── Background grid ── */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(156,160,156,0.4) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(156,160,156,0.4) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                opacity: gridOpacity,
                pointerEvents: 'none',
            }} />

            {/* ── Bootloader terminal ── */}
            <AnimatePresence>
                {!bootDone && (
                    <motion.div
                        key="boot"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.5 }}
                        className="boot-terminal"
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9990,
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'center', alignItems: 'center',
                            background: terminalBg,
                        }}
                    >
                        <div style={{ width: '90%', maxWidth: '600px' }}>
                            {/* Terminal window chrome */}
                            <div style={{
                                borderBottom: `1px solid ${terminalBorder}`,
                                paddingBottom: '8px', marginBottom: '16px',
                                display: 'flex', gap: '8px', alignItems: 'center',
                            }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#FF5A3C' : '#e05c3a' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4A843' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#4BD8A0' : '#50b1ce' }} />
                                <span style={{
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '0.7rem',
                                    color: terminalLabel,
                                    marginLeft: '8px',
                                }}>
                                    SILICON_SOUL_BIOS v2.0
                                </span>
                            </div>

                            {/* Boot lines */}
                            <div style={{ minHeight: '200px' }}>
                                {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                                    <div
                                        key={i}
                                        className="boot-line"
                                        style={{
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: '0.8rem',
                                            color: lineColors[LINE_COLOR_INDEX[i]],
                                            marginBottom: '6px',
                                            animationDelay: '0ms',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {line.text}
                                        {i === visibleLines - 1 && (
                                            <span style={{
                                                opacity: Math.sin(Date.now() / 300) > 0 ? 1 : 0,
                                                transition: 'opacity 0.1s',
                                            }}>▋</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: terminalLabel }}>
                                        LOADING INTERFACE
                                    </span>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: accentColor }}>
                                        {progress}%
                                    </span>
                                </div>
                                <div style={{ height: '2px', background: progressTrack, borderRadius: '1px' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${progress}%`,
                                        background: progressFill,
                                        borderRadius: '1px',
                                        transition: 'width 0.3s ease',
                                        boxShadow: `0 0 8px ${accentGlow}`,
                                    }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main hero content ── */}
            <AnimatePresence>
                {bootDone && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            width: '100%',
                            padding: '0 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4rem',
                            maxWidth: '1400px',
                            margin: '0 auto',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* Left: text — 45% */}
                        <motion.div
                            initial={{ x: -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            style={{ flex: '0 0 45%', minWidth: '300px' }}
                        >
                            {/* Greeting */}
                            <div style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '1rem',
                                color: accentColor,
                                marginBottom: '0.5rem',
                            }}>
                                herro 😅👋
                            </div>

                            {/* Name */}
                            <h1 style={{
                                fontFamily: 'Syne, sans-serif',
                                fontWeight: 800,
                                fontSize: 'clamp(2.5rem, 5vw, 5.5rem)',
                                color: textColor,
                                lineHeight: 1.0,
                                marginBottom: '0.75rem',
                                letterSpacing: '-0.02em',
                            }}>
                                Kilavi<br />Musyoki
                            </h1>

                            {/* Role */}
                            <div style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '0.85rem',
                                color: dimColor,
                                marginBottom: '1rem',
                                letterSpacing: '0.02em',
                            }}>
                                Telecommunications &amp; Information Engineering Student
                            </div>

                            {/* Tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                                {['Embedded Systems', 'RF Engineering', 'IoT', 'Networking', 'PCB Design'].map((tag) => (
                                    <span key={tag} style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '0.65rem',
                                        padding: '3px 10px',
                                        border: `1px solid ${tagBorder}`,
                                        borderRadius: '2px',
                                        color: accentColor,
                                        background: tagBg,
                                        letterSpacing: '0.05em',
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* System status panel */}
                            <div style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '0.65rem',
                                padding: '10px 14px',
                                border: `1px solid ${statusBorder}`,
                                borderRadius: '3px',
                                background: statusBg,
                                color: dimColor,
                                marginBottom: '1.5rem',
                                letterSpacing: '0.04em',
                                lineHeight: 1.6,
                            }}>
                                <span style={{ color: statusOnline }}>SYSTEM: ONLINE</span>
                                {' | '}
                                <span>UPTIME: {uptime}</span>
                                {' | '}
                                <span style={{ color: statusTemp }}>TEMP: 42°C</span>
                                {' | '}
                                <span>LOC: Machakos, KE</span>
                            </div>

                            {/* Stats strip */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                {[
                                    { val: '2027', label: 'Expected Grad' },
                                    { val: '5',    label: 'Projects'      },
                                    { val: '3',    label: 'Languages'     },
                                    { val: '∞',    label: 'Problems Left' },
                                ].map((stat) => (
                                    <div key={stat.label} style={{ textAlign: 'center' }}>
                                        <div style={{
                                            fontFamily: 'Syne, sans-serif',
                                            fontWeight: 700,
                                            fontSize: '1.8rem',
                                            color: accentColor,
                                            lineHeight: 1,
                                        }}>
                                            {stat.val}
                                        </div>
                                        <div style={{
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: '0.55rem',
                                            color: dimColor,
                                            marginTop: '4px',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                        }}>
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA button */}
                            <a
                                href="#about"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '0.85rem',
                                    padding: '12px 28px',
                                    background: accentColor,
                                    color: btnTextColor,
                                    borderRadius: '2px',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                                    boxShadow: `0 0 20px ${accentGlow}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform  = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow  = `0 4px 30px ${accentGlow}`;
                                    e.currentTarget.style.background = accentHover;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform  = 'translateY(0)';
                                    e.currentTarget.style.boxShadow  = `0 0 20px ${accentGlow}`;
                                    e.currentTarget.style.background = accentColor;
                                }}
                            >
                                Explore my work <span>→</span>
                            </a>
                        </motion.div>

                        {/* Right: board — 55% */}
                        <motion.div
                            initial={{ x: 60, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            ref={boardRef}
                            className={glitch ? 'glitch-flash' : ''}
                            style={{
                                flex: '1 1 300px',
                                maxWidth: '520px',
                                position: 'relative',
                                animation: 'levitate 3.5s ease-in-out infinite',
                                transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                                transition: 'transform 0.05s linear',
                                willChange: 'transform',
                            }}
                        >
                            {/* Tractor beam */}
                            <div style={{
                                position: 'absolute',
                                bottom: `${-60 + beamY}px`,
                                left: `calc(50% + ${beamX}px)`,
                                transform: 'translateX(-50%)',
                                width: '200px',
                                height: '90px',
                                background: `radial-gradient(ellipse at top, ${inViewport ? beamColor : beamColorFaint} 0%, transparent 70%)`,
                                pointerEvents: 'none',
                                transition: 'opacity 0.5s',
                            }} />

                            {/* Board */}
                            <PCBBoard layer={layer} className="" isDark={isDark} />

                            {/* LED eye overlay */}
                            <div style={{
                                position: 'absolute',
                                top: `${28 + ledPos.y * 4}%`,
                                right: `${12 - ledPos.x * 4}%`,
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#FF5A3C',
                                boxShadow: inViewport
                                    ? '0 0 8px 2px #FF5A3C, 0 0 20px #FF5A3C'
                                    : '0 0 4px 1px rgba(255,90,60,0.4)',
                                pointerEvents: 'none',
                                transition: 'box-shadow 0.3s',
                                animation: inViewport ? 'none' : 'blink-slow 1.5s ease-in-out infinite',
                                zIndex: 10,
                            }} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Scroll indicator ── */}
            {bootDone && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.6rem',
                        color: dimColor,
                        letterSpacing: '0.1em',
                    }}>
                        SCROLL TO DECONSTRUCT
                    </span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ color: accentColor, fontSize: '1rem' }}
                    >↓</motion.div>
                </motion.div>
            )}
        </section>
    );
};

export default Hero;
