import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SKILLS = [
    {
        category: 'Languages', items: [
            { name: 'Python', level: 85 },
            { name: 'C/C++', level: 90 },
            { name: 'MATLAB', level: 75 },
        ]
    },
    {
        category: 'Microcontrollers / Embedded', items: [
            { name: 'ESP32 (UART, SPI, I2C)', level: 92 },
            { name: 'Arduino / AVR', level: 85 },
            { name: 'FreeRTOS', level: 78 },
        ]
    },
    {
        category: 'PCB / Simulation', items: [
            { name: 'Proteus / Multisim', level: 88 },
            { name: 'Logisim Evolution', level: 82 },
            { name: 'Keysight ADS', level: 72 },
            { name: 'LTspice', level: 70 },
        ]
    },
    {
        category: 'Networking', items: [
            { name: 'Cisco Packet Tracer', level: 80 },
            { name: 'TCP/IP, Routing', level: 78 },
            { name: 'MQTT / IoT Protocols', level: 85 },
        ]
    },
    {
        category: 'Cloud / Databases', items: [
            { name: 'Firebase / Firestore', level: 85 },
            { name: 'MySQL / Oracle', level: 72 },
            { name: 'MongoDB', level: 68 },
        ]
    },
    {
        category: 'Tools & Web', items: [
            { name: 'Git / GitHub', level: 82 },
            { name: 'React / Tailwind CSS', level: 78 },
            { name: 'AutoCAD / Inventor', level: 65 },
        ]
    },
];

const getBarGradient = (level) => {
    if (level >= 88) return 'linear-gradient(90deg, #FF5A3C, #FF8C00)'; // hot — strongest
    if (level >= 78) return 'linear-gradient(90deg, #FF8C00, #D4A843)'; // warm
    if (level >= 70) return 'linear-gradient(90deg, #D4A843, #4BD8A0)'; // mid
    return 'linear-gradient(90deg, #4BD8A0, #6FD4FF)';                  // cool
};

const About = ({ isDark }) => {
    const [activeTab, setActiveTab] = useState('description');
    const textColor = isDark ? '#e0f5ec' : '#1A1A2E';
    const accentColor = isDark ? '#4BD8A0' : '#D4A843';
    const dimColor = isDark ? 'rgba(75,216,160,0.6)' : 'rgba(26,26,46,0.5)';
    const borderColor = isDark ? 'rgba(75,216,160,0.22)' : 'rgba(212,168,67,0.25)';
    const bgCard = isDark ? 'rgba(6,10,12,0.85)' : 'rgba(212,168,67,0.04)';

    return (
        <section
            id="about"
            className="section-base"
            style={{ background: isDark ? 'rgba(3,6,10,0.9)' : 'rgba(255,253,247,0.7)' }}
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

                {/* Datasheet container */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        border: `1px solid ${borderColor}`,
                        borderRadius: '4px',
                        background: bgCard,
                        overflow: 'hidden',
                    }}
                >
                    {/* Datasheet header */}
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: `1px solid ${borderColor}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isDark ? 'rgba(0,255,136,0.05)' : 'rgba(212,168,67,0.07)',
                    }}>
                        <div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: textColor }}>
                                MUSYOKI-KM-2024 — Human Engineering Interface
                            </div>
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: dimColor, marginTop: '2px' }}>
                                Rev 2.0 · DeKUT, Nyeri, Kenya · TIE Programme
                            </div>
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: accentColor, textAlign: 'right' }}>
                            <div>PART #: SN-2024-KM</div>
                            <div>STATUS: ACTIVE</div>
                        </div>
                    </div>

                    {/* Tab navigation */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${borderColor}` }}>
                        {['description', 'specifications', 'ratings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: '0.65rem',
                                    padding: '10px 20px',
                                    background: activeTab === tab ? accentColor : 'transparent',
                                    color: activeTab === tab ? '#000' : dimColor,
                                    border: 'none',
                                    cursor: 'pointer',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    transition: 'background 0.2s, color 0.2s',
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '24px' }}>
                        {/* DESCRIPTION tab */}
                        {activeTab === 'description' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: dimColor, letterSpacing: '0.1em', marginBottom: '12px' }}>
                                    // DESCRIPTION
                                </div>
                                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: textColor, lineHeight: 1.8, marginBottom: '2rem' }}>
                                    I'm a Telecommunications and Information Engineering student at Dedan Kimathi University
                                    of Technology, Nyeri — passionate about building systems that bridge hardware and software
                                    to solve real-world problems. My technical foundation spans electronics, embedded systems,
                                    networking, and programming — from designing PCB circuits in Proteus to configuring routers
                                    and writing signal processing code in Python and MATLAB.
                                </p>

                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: dimColor, letterSpacing: '0.1em', marginBottom: '12px' }}>
                                    // KEY FEATURES
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {SKILLS.map((group) => (
                                        <div key={group.category} style={{ padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '3px' }}>
                                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: accentColor, letterSpacing: '0.1em', marginBottom: '8px' }}>
                                                {group.category.toUpperCase()}
                                            </div>
                                            {group.items.map((skill) => (
                                                <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: textColor, minWidth: '140px', maxWidth: '100%' }}>
                                                        {skill.name}
                                                    </span>
                                                    <div className="skill-bar" style={{ flex: 1, minWidth: '140px', height: '4px', background: isDark ? 'rgba(75,216,160,0.12)' : 'rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${skill.level}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{ duration: 1, delay: 0.2 }}
                                                            style={{ height: '100%', background: getBarGradient(skill.level), borderRadius: '2px' }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* SPECIFICATIONS tab */}
                        {activeTab === 'specifications' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: dimColor, letterSpacing: '0.1em', marginBottom: '12px' }}>
                                    // ELECTRICAL CHARACTERISTICS — PROFICIENCY HEATMAP
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                    {SKILLS.flatMap(g => g.items).map((skill) => (
                                        <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: textColor, minWidth: '160px', maxWidth: '100%', flexShrink: 0 }}>
                                                {skill.name}
                                            </span>
                                            <div style={{ flex: 1, minWidth: '160px', height: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${skill.level}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1.2, delay: 0.1 }}
                                                    style={{ height: '100%', background: getBarGradient(skill.level), borderRadius: '4px', boxShadow: `0 0 8px ${skill.level >= 88 ? '#FF5A3C60' : '#4BD8A040'}` }}
                                                />
                                            </div>
                                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: accentColor, width: '40px', textAlign: 'right' }}>
                                                {skill.level}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        {[
                                        { color: '#FF5A3C', label: '88–100% — Expert (Hot)' },
                                        { color: '#D4A843', label: '78–87% — Advanced (Warm)' },
                                        { color: '#4BD8A0', label: '70–77% — Proficient (Green)' },
                                        { color: '#6FD4FF', label: '<70% — Learning (Cool)' },
                                    ].map((l) => (
                                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '12px', height: '4px', background: l.color, borderRadius: '2px' }} />
                                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: dimColor }}>{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* RATINGS tab */}
                        {activeTab === 'ratings' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: dimColor, letterSpacing: '0.1em', marginBottom: '12px' }}>
                                    // ABSOLUTE MAXIMUM RATINGS (soft skills)
                                </div>
                                <div style={{ width: '100%', overflowX: 'auto' }}>
                                    <table className="datasheet-table" style={{ minWidth: '480px' }}>
                                        <thead>
                                            <tr>
                                                <th>Parameter</th>
                                                <th>Value</th>
                                                <th>Unit</th>
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td>Problem-solving endurance</td><td style={{ color: '#FF3D00' }}>MAX</td><td>hrs</td><td>Tested under final exam conditions</td></tr>
                                            <tr><td>Cross-domain curiosity</td><td style={{ color: '#FF3D00' }}>UNBOUNDED</td><td>—</td><td>RF → web → DB → firmware → repeat</td></tr>
                                            <tr><td>Communication clarity</td><td style={{ color: '#D4A843' }}>HIGH</td><td>—</td><td>3 languages: EN, SW, Mandarin (learning)</td></tr>
                                            <tr><td>Team collaboration</td><td style={{ color: '#4BD8A0' }}>RATED</td><td>—</td><td>Class Rep, IEEE member</td></tr>
                                            <tr><td>Deadline compliance</td><td style={{ color: '#D4A843' }}>HIGH</td><td>%</td><td>Nominal under typical conditions</td></tr>
                                            <tr><td>Self-directed learning rate</td><td style={{ color: '#FF3D00' }}>FAST</td><td>kB/s</td><td>New domains absorbed in days, not weeks</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
