import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const CHANGELOG = [
    {
        version: 'v4.0.0',
        status: 'PURSUING',
        title: 'BSc Telecommunications & Information Engineering',
        body: 'DeKUT, Nyeri, Kenya. One of Kenya\'s leading STEM institutions. 2023–2027',
        color: '#00FF88',
    },
    {
        version: 'v3.2.0',
        status: 'LEADERSHIP',
        title: 'Class Representative',
        body: 'Elected class rep — bridging students and faculty, organising academic activities. Ongoing',
        color: '#4DFFFF',
    },
    {
        version: 'v3.1.0',
        status: 'MEMBERSHIP',
        title: 'IEEE Student Branch, DeKUT',
        body: 'Engaging with global engineering standards, workshops, and professional development. Ongoing',
        color: '#4DFFFF',
    },
    {
        version: 'v2.5.0',
        status: 'COMMS',
        title: 'Trilingual Communicator',
        body: 'Fluent: English, Kiswahili. Beginner: Mandarin. Cross-cultural engineering collaboration. Lifelong',
        color: '#D4A843',
    },
    {
        version: 'v2.0.0',
        status: 'TOOLKIT',
        title: 'Multi-Domain Technical Proficiency',
        body: 'Simulation (Multisim, Proteus, LTspice, ADS), Networking (Packet Tracer), CAD (AutoCAD, Autodesk Inventor), Databases (MySQL, MongoDB, Oracle). Built over 2+ years.',
        color: '#D4A843',
    },
    {
        version: 'v1.0.0',
        status: 'SHIPPED',
        title: 'Cloud-Connected IoT Pipeline',
        body: 'Full IoT pipeline: ESP32 sensors → MQTT → Firebase backend → live web dashboard. 2024',
        color: '#00FF88',
    },
];

const Milestones = ({ isDark }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const textColor = isDark ? '#e0ffe8' : '#1A1A2E';
    const dimColor = isDark ? 'rgba(0,255,136,0.5)' : 'rgba(26,26,46,0.5)';

    return (
        <section id="milestones" className="section-base" data-debug="milestones-section">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: dimColor, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                        03 — RECOGNITION
                    </div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: textColor, marginBottom: '0.5rem' }}>
                        Wins &amp; Milestones
                    </h2>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: dimColor, marginBottom: '3rem' }}>
            // FIRMWARE CHANGELOG FORMAT — hover for signal trace
                    </p>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {CHANGELOG.map((entry, idx) => (
                        <motion.div
                            key={entry.version}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.5, delay: idx * 0.08 }}
                            className="changelog-entry"
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            style={{
                                borderLeftColor: hoveredIdx === idx ? entry.color : `${entry.color}44`,
                                paddingBottom: '2rem',
                                cursor: 'default',
                                transition: 'border-color 0.3s',
                            }}
                        >
                            {/* Version badge + status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <span style={{
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: '0.7rem',
                                    color: entry.color,
                                    letterSpacing: '0.05em',
                                    minWidth: '60px',
                                }}>
                                    {entry.version}
                                </span>
                                <span style={{
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: '0.6rem',
                                    padding: '2px 8px',
                                    border: `1px solid ${entry.color}55`,
                                    borderRadius: '2px',
                                    color: entry.color,
                                    background: `${entry.color}10`,
                                    letterSpacing: '0.08em',
                                }}>
                                    {entry.status}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 style={{
                                fontFamily: 'Syne, sans-serif',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                color: textColor,
                                marginBottom: '6px',
                                transition: 'color 0.3s',
                            }}>
                                {entry.title}
                            </h3>

                            {/* Body */}
                            <p style={{
                                fontFamily: 'JetBrains Mono',
                                fontSize: '0.75rem',
                                color: isDark ? 'rgba(176,255,204,0.7)' : 'rgba(26,26,46,0.65)',
                                lineHeight: 1.7,
                                maxWidth: '600px',
                            }}>
                                {entry.body}
                            </p>

                            {/* Animated trace line on hover */}
                            {hoveredIdx === idx && (
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        height: '1px',
                                        background: `linear-gradient(90deg, ${entry.color}, transparent)`,
                                        transformOrigin: 'left',
                                    }}
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Milestones;
