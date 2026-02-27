import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

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
    const contactProvider = (import.meta.env.VITE_CONTACT_PROVIDER || 'api').toLowerCase(); // "api" | "emailjs"

    const textColor = isDark ? '#ced0ce' : '#1A1A2E';
    const dimColor = isDark ? 'rgba(156,160,156,0.9)' : 'rgba(26,26,46,0.5)';
    const accentColor = isDark ? '#ffffff' : '#D4A843';
    const borderColor = isDark ? 'rgba(156,160,156,0.7)' : 'rgba(212,168,67,0.25)';

    // Animate oscilloscope
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

    // Load Cloudflare Turnstile script when site key is present
    useEffect(() => {
        if (!siteKey) return;
        if (turnstileLoadedRef.current) return;

        const existing = document.querySelector('script[data-turnstile]');
        if (existing) {
            turnstileLoadedRef.current = true;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-turnstile', 'true');
        document.body.appendChild(script);

        script.onload = () => {
            turnstileLoadedRef.current = true;
        };

        return () => {
            script.remove();
        };
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
            // Optional Turnstile token
            let turnstileToken = null;
            if (siteKey && window.turnstile && turnstileWidgetRef.current) {
                try {
                    turnstileToken = window.turnstile.getResponse(turnstileWidgetRef.current);
                } catch {
                    turnstileToken = null;
                }
            }

            if (contactProvider === 'emailjs') {
                await emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID,
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                    {
                        from_name: formData.name,
                        from_email: formData.email,
                        subject: formData.subject,
                        message: formData.message,
                    },
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
                );
            } else {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        subject: formData.subject,
                        message: formData.message,
                        turnstileToken,
                    }),
                });

                if (!response.ok) {
                    throw new Error('API error');
                }
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

    return (
        <section id="contact" className="section-base" data-debug="contact-section"
            style={{ background: isDark ? 'rgba(57,65,57,1)' : 'rgba(255,253,247,0.6)' }}
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: dimColor, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                        04 — CONTACT
                    </div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: textColor, marginBottom: '0.75rem' }}>
                        Let's Build Something Real.
                    </h2>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: dimColor, maxWidth: '520px', lineHeight: 1.7, marginBottom: '3rem' }}>
                        If you're working on something meaningful in networking, electronics, or ICT systems — let's talk.
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth <= 900 ? '1fr' : '1fr 1.4fr',
                    gap: '3rem',
                    alignItems: 'start',
                }}>
                    {/* Left: Contact links */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.1em', marginBottom: '16px' }}>
              // CONTACT TERMINALS
                        </div>
                        {[
                            { icon: '📧', label: 'Email', value: 'musyokikilavi870@gmail.com', href: 'mailto:musyokikilavi870@gmail.com' },
                            { icon: '📞', label: 'Phone', value: '+254 700 663 557', href: 'tel:+254700663557' },
                            { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/kilavi-musyoki', href: 'https://www.linkedin.com/in/kilavi-musyoki' },
                            { icon: '🐙', label: 'GitHub', value: 'github.com/kilavi-musyoki', href: 'https://github.com/kilavi-musyoki' },
                            { icon: '⬇️', label: 'Download CV', value: 'Kilavi_Musyoki_CV.pdf', href: (import.meta.env.VITE_CV_TRACKING || 'api') === 'api' ? '/api/track-download' : '/assets/Kilavi_Musyoki_CV.pdf' },
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
                                    marginBottom: '8px',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '3px',
                                    textDecoration: 'none',
                                    background: isDark ? 'rgba(0,255,136,0.02)' : 'rgba(212,168,67,0.03)',
                                    transition: 'border-color 0.3s, background 0.3s',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = accentColor + '77';
                                    e.currentTarget.style.background = accentColor + '10';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = borderColor;
                                    e.currentTarget.style.background = isDark ? 'rgba(0,255,136,0.02)' : 'rgba(212,168,67,0.03)';
                                }}
                            >
                                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: accentColor }}>
                                        {item.value}
                                    </div>
                                </div>
                                <span style={{ marginLeft: 'auto', color: dimColor }}>→</span>
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* Right: Oscilloscope form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Oscilloscope display */}
                        <div className="oscilloscope-container" style={{ marginBottom: '16px', height: '100px', position: 'relative' }}>
                            <div className="oscilloscope-grid" />
                            <svg
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                viewBox="0 0 480 100"
                                preserveAspectRatio="none"
                            >
                                {status === 'sent' ? (
                                    // Flatline then burst
                                    <>
                                        <line x1="0" y1="50" x2="480" y2="50" stroke={accentColor} strokeWidth="1.5" opacity="0.6" />
                                        <motion.circle cx="240" cy="50" r="0" fill="rgba(0,255,136,0.3)"
                                            animate={{ r: [0, 80, 0] }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                        />
                                    </>
                                ) : status === 'error' ? (
                                    <line x1="0" y1="50" x2="480" y2="50" stroke="#FF3D00" strokeWidth="1.5" opacity="0.8" />
                                ) : (
                                    <path d={wavePath} stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.8" />
                                )}
                            </svg>

                            {/* Scope readouts */}
                            <div style={{ position: 'absolute', top: '4px', left: '8px', fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: 'rgba(0,255,136,0.5)' }}>
                                CH1: SIGNAL · 50mV/div
                            </div>
                            <div style={{ position: 'absolute', top: '4px', right: '8px', fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: 'rgba(0,255,136,0.5)' }}>
                                {isTyping ? 'RECEIVING...' : 'STANDBY'}
                            </div>
                        </div>

                        {/* Status messages */}
                        {status === 'sent' && (
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: accentColor, textAlign: 'center', marginBottom: '12px', letterSpacing: '0.05em' }}>
                                ✓ SIGNAL TRANSMITTED. AWAITING RESPONSE...
                            </div>
                        )}
                        {status === 'error' && (
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#FF3D00', textAlign: 'center', marginBottom: '12px', letterSpacing: '0.05em' }}>
                                ✗ TRANSMISSION FAILED. CHECK SIGNAL.
                            </div>
                        )}

                        {/* Form */}
                        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {siteKey && (
                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.08em', marginBottom: '4px' }}>
                                        HUMAN VERIFICATION
                                    </div>
                                    <div
                                        ref={turnstileWidgetRef}
                                        className="cf-turnstile"
                                        data-sitekey={siteKey}
                                    />
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                                        NAME
                                    </label>
                                    <input
                                        className="hud-input"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInput}
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                                        EMAIL
                                    </label>
                                    <input
                                        className="hud-input"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInput}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                                    SUBJECT
                                </label>
                                <input
                                    className="hud-input"
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInput}
                                    placeholder="what do u wanna do?"
                                />
                            </div>

                            <div>
                                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                                    MESSAGE
                                </label>
                                <textarea
                                    className="hud-input"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInput}
                                    placeholder="Describe what you're building..."
                                    required
                                    rows={5}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                style={{
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    padding: '14px 28px',
                                    background: status === 'sending' ? 'rgba(0,255,136,0.3)' : accentColor,
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '2px',
                                    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.2s',
                                    boxShadow: `0 0 20px ${accentColor}40`,
                                }}
                                onMouseEnter={(e) => { if (status !== 'sending') e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
