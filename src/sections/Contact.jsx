import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

// ── Responsive hook ────────────────────────────────────────────────────────────
const useWindowWidth = () => {
    const [width, setWidth] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return width;
};

// Oscilloscope waveform generator
const generateWavePath = (text, isTyping, width = 480, height = 80) => {
    const amplitude = Math.min(8 + text.length * 0.4, 32);
    const freq = isTyping ? 0.06 : 0.03;
    const points = [];
    for (let x = 0; x <= width; x += 4) {
        const y = height / 2 + Math.sin(x * freq + Date.now() * 0.004) * amplitude * (1 + 0.2 * Math.sin(x * 0.02));
        points.push(`${x},${y}`);
    }
    return `M${points.join(' L')}`;
};

const Contact = ({ isDark }) => {
    const formRef = useRef(null);
    const wavePathRef = useRef(null);
    const rafRef = useRef(null);
    const turnstileWidgetRef = useRef(null);
    const turnstileLoadedRef = useRef(false);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error
    const [isTyping, setIsTyping] = useState(false);
    const [wavePath, setWavePath] = useState('');
    const typingTimerRef = useRef(null);
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const contactProvider = (import.meta.env.VITE_CONTACT_PROVIDER || 'api').toLowerCase();

    // ── Responsive breakpoints ─────────────────────────────────────────────────
    const windowWidth = useWindowWidth();
    const isMobile  = windowWidth < 640;   // < 640px  → stack everything
    const isTablet  = windowWidth < 900;   // < 900px  → single column main grid

    // ── Palette ────────────────────────────────────────────────────────────────
    const textColor        = isDark ? '#ffffff'                     : '#2A2A3A';
    const dimColor         = isDark ? 'rgba(206,208,206,0.55)'      : 'rgba(42,47,69,0.52)';
    const accentColor      = isDark ? '#ced0ce'                     : '#50b1ce';
    const accentGlow       = isDark ? 'rgba(206,208,206,0.35)'      : 'rgba(80,177,206,0.35)';
    const accentHover      = isDark ? '#ffffff'                     : '#2a8fb0';
    const borderColor      = isDark ? 'rgba(107,113,107,0.65)'      : 'rgba(158,176,210,0.55)';
    const borderHover      = isDark ? 'rgba(206,208,206,0.55)'      : 'rgba(80,177,206,0.7)';
    const cardBg           = isDark ? 'rgba(156,160,156,0.04)'      : 'rgba(208,206,225,0.2)';
    const cardBgHover      = isDark ? 'rgba(206,208,206,0.07)'      : 'rgba(80,177,206,0.07)';
    const sectionBg        = isDark ? 'rgba(57,65,57,1)'            : '#f6f7fb';
    const scopeBg          = isDark ? '#000810'                     : '#eef2fa';
    const scopeBorderColor = isDark ? 'rgba(107,113,107,0.6)'       : 'rgba(80,177,206,0.45)';
    const scopeGridColor   = isDark ? 'rgba(107,113,107,0.07)'      : 'rgba(80,177,206,0.07)';
    const scopeLabelColor  = isDark ? 'rgba(107,113,107,0.7)'       : 'rgba(80,177,206,0.6)';
    const waveColor        = isDark ? '#9ca09c'                     : '#50b1ce';
    const btnColor         = isDark ? '#394139'                     : '#ffffff';
    const errorColor       = '#FF5A3C';

    // ── Oscilloscope animation ─────────────────────────────────────────────────
    useEffect(() => {
        const animateWave = () => {
            const text = formData.name + formData.email + formData.subject + formData.message;
            setWavePath(generateWavePath(text, isTyping));
            rafRef.current = requestAnimationFrame(animateWave);
        };
        if (status === 'idle' || status === 'sending') {
            rafRef.current = requestAnimationFrame(animateWave);
        }
        return () => cancelAnimationFrame(rafRef.current);
    }, [formData, isTyping, status]);

    // ── Turnstile ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!siteKey) return;
        if (turnstileLoadedRef.current) return;
        const existing = document.querySelector('script[data-turnstile]');
        if (existing) { turnstileLoadedRef.current = true; return; }
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-turnstile', 'true');
        document.body.appendChild(script);
        script.onload = () => { turnstileLoadedRef.current = true; };
        return () => { script.remove(); };
    }, [siteKey]);

    const handleInput = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 500);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            let turnstileToken = null;
            if (siteKey && window.turnstile && turnstileWidgetRef.current) {
                try { turnstileToken = window.turnstile.getResponse(turnstileWidgetRef.current); }
                catch { turnstileToken = null; }
            }

            if (contactProvider === 'emailjs') {
                await emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID,
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                    { from_name: formData.name, from_email: formData.email, subject: formData.subject, message: formData.message },
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
                );
            } else {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, turnstileToken }),
                });
                if (!response.ok) throw new Error('API error');
            }

            setStatus('sent');
            setTimeout(() => {
                setStatus('idle');
                setFormData({ name: '', email: '', subject: '', message: '' });
            }, 5000);
        } catch (err) {
            console.error('Contact send error:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    // ── Shared style helpers ───────────────────────────────────────────────────
    const labelStyle = {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6rem',
        color: dimColor,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: '4px',
    };

    return (
        <section
            id="contact"
            className="section-base"
            data-debug="contact-section"
            style={{ background: sectionBg }}
        >
            {/* ── FIX 1: Added horizontal padding so content never touches screen edge ── */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>

                {/* ── Section header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: dimColor, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                        04 — CONTACT
                    </div>
                    <h2 style={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 800,
                        fontSize: 'clamp(1.6rem, 5vw, 3.5rem)', // ── FIX 2: Lower min clamp for small screens
                        color: textColor,
                        marginBottom: '0.75rem',
                    }}>
                        Let's Build Something Real.
                    </h2>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: dimColor, maxWidth: '520px', lineHeight: 1.7, marginBottom: '3rem' }}>
                        If you're working on something meaningful in networking, electronics, or ICT systems — let's talk.
                    </p>
                </motion.div>

                {/* ── FIX 3: Main grid collapses to single column on tablet/mobile ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isTablet ? '1fr' : 'clamp(260px, 35%, 360px) 1fr',
                    gap: isMobile ? '2rem' : '3rem',
                    alignItems: 'start',
                }}>

                    {/* ── Left: contact links ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.1em', marginBottom: '16px' }}>
                            // CONTACT TERMINALS
                        </div>

                        {/* ── FIX 4: Links display as 2-col grid on tablet, 1-col on mobile ── */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: (isTablet && !isMobile) ? '1fr 1fr' : '1fr',
                            gap: '8px',
                        }}>
                            {[
                                { icon: '📧', label: 'Email',       value: 'musyokikilavi870@gmail.com',       href: 'mailto:musyokikilavi870@gmail.com' },
                                { icon: '📞', label: 'Phone',       value: '+254 700 663 557',                  href: 'tel:+254700663557' },
                                { icon: '💼', label: 'LinkedIn',    value: 'linkedin.com/in/kilavi-musyoki',   href: 'https://www.linkedin.com/in/kilavi-musyoki' },
                                { icon: '🐙', label: 'GitHub',      value: 'github.com/kilavi-musyoki',        href: 'https://github.com/kilavi-musyoki' },
                                { icon: '⬇️', label: 'Download CV', value: 'Kilavi_Musyoki_CV.pdf',            href: (import.meta.env.VITE_CV_TRACKING || 'api') === 'api' ? '/api/track-download' : '/assets/Kilavi_Musyoki_CV.pdf' },
                            ].map((item, i) => (
                                <motion.a
                                    key={item.label}
                                    href={item.href}
                                    target={item.href.startsWith('http') ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '3px',
                                        textDecoration: 'none',
                                        background: cardBg,
                                        transition: 'border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
                                        cursor: 'pointer',
                                        // ── FIX 5: min-width 0 prevents overflow on narrow screens
                                        minWidth: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = borderHover;
                                        e.currentTarget.style.background   = cardBgHover;
                                        e.currentTarget.style.boxShadow    = `0 0 14px ${accentGlow}`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = borderColor;
                                        e.currentTarget.style.background   = cardBg;
                                        e.currentTarget.style.boxShadow    = 'none';
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                            {item.label}
                                        </div>
                                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: accentColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.value}
                                        </div>
                                    </div>
                                    <span style={{ marginLeft: 'auto', color: dimColor, flexShrink: 0 }}>→</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Right: oscilloscope + form ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Oscilloscope display */}
                        <div
                            style={{
                                marginBottom: '16px',
                                height: '100px',
                                position: 'relative',
                                background: scopeBg,
                                border: `2px solid ${scopeBorderColor}`,
                                borderRadius: '8px',
                                overflow: 'hidden',
                                transition: 'background 0.4s, border-color 0.4s',
                            }}
                        >
                            {/* Grid */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `
                                    linear-gradient(${scopeGridColor} 1px, transparent 1px),
                                    linear-gradient(90deg, ${scopeGridColor} 1px, transparent 1px)
                                `,
                                backgroundSize: '40px 40px',
                            }} />

                            {/* Wave SVG */}
                            <svg
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                viewBox="0 0 480 100"
                                preserveAspectRatio="none"
                            >
                                {status === 'sent' ? (
                                    <>
                                        <line x1="0" y1="50" x2="480" y2="50" stroke={accentColor} strokeWidth="1.5" opacity="0.6" />
                                        <motion.circle cx="240" cy="50" r="0" fill={`${accentColor}44`}
                                            animate={{ r: [0, 80, 0] }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                        />
                                    </>
                                ) : status === 'error' ? (
                                    <line x1="0" y1="50" x2="480" y2="50" stroke={errorColor} strokeWidth="1.5" opacity="0.8" />
                                ) : (
                                    <path d={wavePath} stroke={waveColor} strokeWidth="1.5" fill="none" opacity="0.85" />
                                )}
                            </svg>

                            {/* Scope readouts */}
                            <div style={{ position: 'absolute', top: '5px', left: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: scopeLabelColor }}>
                                CH1: SIGNAL · 50mV/div
                            </div>
                            <div style={{ position: 'absolute', top: '5px', right: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: scopeLabelColor }}>
                                {isTyping ? 'RECEIVING...' : 'STANDBY'}
                            </div>
                        </div>

                        {/* Status messages */}
                        {status === 'sent' && (
                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: accentColor, textAlign: 'center', marginBottom: '12px', letterSpacing: '0.05em' }}>
                                ✓ SIGNAL TRANSMITTED. AWAITING RESPONSE...
                            </div>
                        )}
                        {status === 'error' && (
                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: errorColor, textAlign: 'center', marginBottom: '12px', letterSpacing: '0.05em' }}>
                                ✗ TRANSMISSION FAILED. CHECK SIGNAL.
                            </div>
                        )}

                        {/* Form */}
                        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                            {/* Turnstile */}
                            {siteKey && (
                                <div style={{ marginBottom: '8px' }}>
                                    <div style={labelStyle}>HUMAN VERIFICATION</div>
                                    <div ref={turnstileWidgetRef} className="cf-turnstile" data-sitekey={siteKey} />
                                </div>
                            )}

                            {/* ── FIX 6: Name + Email stacks on mobile ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={labelStyle}>NAME</label>
                                    <input className="hud-input" type="text" name="name" value={formData.name} onChange={handleInput} placeholder="Your name" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>EMAIL</label>
                                    <input className="hud-input" type="email" name="email" value={formData.email} onChange={handleInput} placeholder="your@email.com" required />
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label style={labelStyle}>SUBJECT</label>
                                <input className="hud-input" type="text" name="subject" value={formData.subject} onChange={handleInput} placeholder="What do you want to build?" />
                            </div>

                            {/* Message */}
                            <div>
                                <label style={labelStyle}>MESSAGE</label>
                                <textarea className="hud-input" name="message" value={formData.message} onChange={handleInput} placeholder="Describe what you're building..." required rows={5} style={{ resize: 'vertical' }} />
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                style={{
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    padding: '14px 28px',
                                    width: '100%', // ── FIX 7: Full width button on all screens
                                    background: status === 'sending'
                                        ? `${accentColor}55`
                                        : accentColor,
                                    color: btnColor,
                                    border: 'none',
                                    borderRadius: '2px',
                                    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.2s ease',
                                    boxShadow: `0 0 20px ${accentGlow}`,
                                }}
                                onMouseEnter={(e) => {
                                    if (status !== 'sending') {
                                        e.currentTarget.style.transform  = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow  = `0 4px 28px ${accentGlow}`;
                                        e.currentTarget.style.background = accentHover;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform  = 'translateY(0)';
                                    e.currentTarget.style.boxShadow  = `0 0 20px ${accentGlow}`;
                                    e.currentTarget.style.background = status === 'sending' ? `${accentColor}55` : accentColor;
                                }}
                            >
                                {status === 'sending' ? 'TRANSMITTING...' : 'SEND MESSAGE →'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;