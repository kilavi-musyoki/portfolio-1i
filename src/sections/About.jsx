import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const About = ({ isDark }) => {
    const textColor = isDark ? '#ced0ce' : '#1A1A2E';
    const accentColor = isDark ? '#ffffff' : '#D4A843';
    const dimColor = isDark ? 'rgba(156,160,156,0.9)' : 'rgba(26,26,46,0.5)';
    const borderColor = isDark ? 'rgba(156,160,156,0.7)' : 'rgba(212,168,67,0.25)';
    const bgCard = isDark ? 'rgba(57,65,57,0.9)' : 'rgba(212,168,67,0.04)';

    return (
        <section
            id="about"
            className="section-base"
            style={{ background: isDark ? 'rgba(57,65,57,1)' : 'rgba(255,253,247,0.7)' }}
            data-debug="about-section"
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: dimColor, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                        01 — ABOUT
                    </div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: textColor, marginBottom: '0.5rem' }}>
                        Who I Am
                    </h2>
                    <div style={{
                        width: '60px', height: '2px',
                        background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                        marginBottom: '3rem',
                    }} />
                </motion.div>

                {/* Simple bio card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        border: `1px solid ${borderColor}`,
                        borderRadius: '4px',
                        background: bgCard,
                        padding: '20px 24px',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
                        gap: '24px',
                    }}
                >
                    {/* Left: short narrative */}
                    <div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: dimColor, letterSpacing: '0.12em', marginBottom: '10px' }}>
                            // SUMMARY
                        </div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: textColor, lineHeight: 1.8, marginBottom: '1.25rem' }}>
                            Telecommunications &amp; Information Engineering student at DeKUT, building systems where
                            hardware, firmware, and software meet. I enjoy taking ideas from whiteboard sketches to
                            working prototypes — from ESP32 boards and RF simulations to clean, reliable web dashboards.
                        </p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: dimColor, lineHeight: 1.7 }}>
                            Right now my focus is on embedded IoT, networking, and practical electronics that solve real
                            problems for real people.
                        </p>
                    </div>

                    {/* Right: compact key facts */}
                    <div style={{
                        borderLeft: `1px solid ${borderColor}`,
                        paddingLeft: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: dimColor, letterSpacing: '0.12em' }}>
                            // SNAPSHOT
                        </div>
                        {[
                            { label: 'Location', value: 'Machakos, Kenya' },
                            { label: 'Programme', value: 'BSc Telecommunications & Information Engineering (DeKUT)' },
                            { label: 'Graduation', value: 'Expected 2027' },
                            { label: 'Domains', value: 'Embedded IoT · RF/ADS · Networking · Web UIs' },
                        ].map((item) => (
                            <div key={item.label}>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    {item.label}
                                </div>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: textColor }}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
