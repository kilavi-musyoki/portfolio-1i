import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PROJECTS = [
    {
        id: 'p1',
        number: '01',
        title: 'Firebase Real-Time Voting Platform',
        subtitle: 'Real-time democratic decision infrastructure',
        problem: 'Organizations needed a transparent, tamper-resistant voting system for concurrent votes with live result visibility and zero server maintenance burden.',
        approach: 'Serverless React SPA backed by Cloud Firestore with security rules enforcing one-vote-per-authenticated-user. Real-time listeners propagate vote counts without polling. Firebase Auth for session management; Firestore transactions prevent race conditions.',
        outcome: 'Sub-100ms result propagation to all connected clients. Zero server costs at scale. Double-voting prevented at database rule level, independent of client logic.',
        lessons: 'Firestore security rules are Turing-complete but tricky — early iterations had a race condition during simultaneous votes requiring transactional write pattern. Client-side validation is never a substitute for server-side rule enforcement.',
        stack: ['React', 'Firebase Auth', 'Cloud Firestore', 'Firebase Hosting', 'Tailwind CSS'],
        color: '#ffffff',
        icon: '🗳️',
    },
    {
        id: 'p2',
        number: '02',
        title: 'ESP32 / MQTT Fire Detection System',
        subtitle: 'IoT sensor mesh with edge alerting',
        problem: 'Smoke detectors in multi-room buildings operate in isolation with no centralized visibility. A network-aware system was needed for real-time monitoring, automatic threshold alerting, and zone-level escalation.',
        approach: 'Mesh of ESP32 nodes reading MQ-2 gas and DHT22 temperature/humidity sensors. Nodes publish structured MQTT payloads to a Mosquitto broker; Node-RED dashboard aggregates readings and triggers SMS + email alerts on threshold breach. FreeRTOS task architecture separates sensor sampling, Wi-Fi management, and MQTT publishing.',
        outcome: 'Average alert latency under 1.5 seconds from sensor threshold breach to admin notification. Validated across 4 independent zones with 100% detection rate during controlled smoke tests.',
        lessons: 'Wi-Fi reconnection on ESP32 requires a carefully tuned watchdog — naive reconnect loops stall the sensor-read task entirely. FreeRTOS separate tasks eliminated all lockups. MQ-2 sensor warm-up delays are critical for accuracy.',
        stack: ['ESP32 (C++)', 'FreeRTOS', 'MQ-2 / DHT22', 'MQTT / Mosquitto', 'Node-RED', 'Telegram Bot API'],
        color: '#ced0ce',
        icon: '🔥',
    },
    {
        id: 'p3',
        number: '03',
        title: 'Digital Clock Converter (24H → 12H)',
        subtitle: 'BCD logic design & Logisim validation',
        problem: 'Embedded display systems operating on 24-hour BCD time need 12-hour format output for user interfaces — including AM/PM detection, tens-digit rollover, and midnight/noon edge cases — all without a microcontroller.',
        approach: 'Combinational and sequential digital logic using comparators, BCD decoders, flip-flops, and a multiplexer network. Tens-of-hours digit conditionally suppressed for hours 01–09. Dedicated comparator block for 12:xx AM/PM toggling; second comparator for 00:xx → 12:xx midnight remapping. Full circuit built and exhaustively simulated in Logisim Evolution with 1,440 test vectors.',
        outcome: 'Verified functional correctness across all 1,440 daily minute-states. All edge cases handled without glitching or invalid BCD output.',
        lessons: 'Midnight/noon conversions require separate comparator branches — one threshold comparator can\'t differentiate both. BCD addition overflow must be corrected explicitly; binary adders produce values above 9 without a correction stage.',
        stack: ['Logisim Evolution', 'BCD Logic', 'Combinational Circuits', 'Flip-Flops', 'Comparators', 'MUX/DEMUX'],
        color: '#9ca09c',
        icon: '🕐',
    },
    {
        id: 'p4',
        number: '04',
        title: 'Home Automation System',
        subtitle: 'Microcontroller-based integrated control',
        problem: 'Manual household subsystem control is inefficient and unresponsive. A unified, sensor-driven system was needed for lighting, curtains, and environmental monitoring — without internet connectivity.',
        approach: 'AVR microcontroller integrating PIR motion detection for occupancy-driven lighting, LDR for ambient-light-dependent control, DHT22 for temperature/humidity monitoring. DS3231 RTC for time-based curtain actuation via servo. All readings on 16×2 LCD. Control logic structured as cooperative state machine with interrupt-driven sensor reads for sub-200ms response.',
        outcome: 'Full hardware-software integration across 5 sensor types and 3 actuator subsystems. Sub-200ms response to motion and light changes. Presented as final hardware project to engineering faculty.',
        lessons: 'Polling all sensors in a tight loop introduced 400ms lag. Restructuring into interrupt-driven reads with cooperative scheduler reduced latency to under 200ms and eliminated missed sensor events.',
        stack: ['AVR Microcontroller (C)', 'PIR Sensor', 'LDR', 'DHT22', 'DS3231 RTC', '16×2 LCD', 'Servo', 'Relay'],
        color: '#6b716b',
        icon: '🏠',
    },
    {
        id: 'p5',
        number: '05',
        title: 'Keysight ADS Microstrip Simulations',
        subtitle: 'RF / microwave line design & validation',
        problem: 'Designing microstrip transmission lines for matching networks requires accounting for substrate permittivity, conductor losses, and frequency-dependent dispersion that analytical formulas approximate poorly above 5 GHz.',
        approach: 'ADS Momentum EM simulations for 50Ω microstrip lines on FR-4 and Rogers RO4003C substrates. Swept S-parameter analysis from 1 GHz to 10 GHz; results compared against LineCalc analytical predictions. Post-processed S2P data in MATLAB for statistical deviation analysis.',
        outcome: '<0.3 dB insertion loss deviation between simulation and theoretical model at 5 GHz. Substrate loss tangent identified as dominant error contributor above 6 GHz; RO4003C outperforms FR-4 by 0.9 dB at 10 GHz.',
        lessons: 'Mesh density in Momentum has non-linear accuracy impact. Too coarse at high frequencies introduces ~1.2 dB error; too fine makes solve time impractical. Frequency-adaptive mesh at 20 cells/wavelength struck the right balance.',
        stack: ['Keysight ADS', 'Momentum EM Solver', 'LineCalc', 'MATLAB', 'S-parameter Analysis'],
        color: '#394139',
        icon: '📡',
    },
];

const ProjectCard = ({ project, isDark, isExpanded, onToggle }) => {
    const textColor = isDark ? '#ced0ce' : '#1A1A2E';
    const dimColor = isDark ? 'rgba(156,160,156,0.9)' : 'rgba(26,26,46,0.5)';
    const borderColor = isDark ? `${project.color}33` : `${project.color}44`;
    const bgCard = isDark ? `${project.color}08` : `${project.color}06`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="pcb-card"
            style={{
                border: `1px solid ${isExpanded ? project.color + '77' : borderColor}`,
                background: isExpanded ? `${project.color}0c` : bgCard,
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: isExpanded ? `0 0 30px ${project.color}20` : 'none',
                transition: 'all 0.3s ease',
            }}
            onClick={onToggle}
        >
            {/* Card header */}
            <div style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
            }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                    {/* Module icon */}
                    <div style={{
                        width: '48px', height: '48px', flexShrink: 0,
                        border: `1px solid ${project.color}55`,
                        borderRadius: '3px',
                        background: `${project.color}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                    }}>
                        {project.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: project.color, letterSpacing: '0.1em' }}>
                                MODULE {project.number}
                            </span>
                            <div style={{ width: '40px', height: '1px', background: `${project.color}44` }} />
                        </div>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: textColor, marginBottom: '4px' }}>
                            {project.title}
                        </h3>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: dimColor }}>
                            {project.subtitle}
                        </div>
                    </div>
                </div>

                {/* Expand indicator */}
                <motion.div
                    animate={{ rotate: isExpanded ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: project.color, fontSize: '1.2rem', flexShrink: 0, marginTop: '4px' }}
                >
                    +
                </motion.div>
            </div>

                    {/* Expanded content (shortened copy) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '0 24px 20px',
                            borderTop: `1px solid ${project.color}22`,
                            paddingTop: '16px',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
                            gap: '16px',
                        }}>
                            <div>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: project.color, letterSpacing: '0.1em', marginBottom: '6px' }}>
                                    // OVERVIEW
                                </div>
                                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: textColor, lineHeight: 1.7 }}>
                                    {project.problem}
                                </p>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: project.color, letterSpacing: '0.1em', marginBottom: '6px' }}>
                                    // RESULT
                                </div>
                                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: dimColor, lineHeight: 1.7 }}>
                                    {project.outcome}
                                </p>
                            </div>
                        </div>

                        {/* Stack tags */}
                        <div style={{ padding: '12px 24px 20px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {project.stack.map((tech) => (
                                <span key={tech} style={{
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: '0.6rem',
                                    padding: '3px 8px',
                                    border: `1px solid ${project.color}44`,
                                    borderRadius: '2px',
                                    color: project.color,
                                    background: `${project.color}10`,
                                    letterSpacing: '0.04em',
                                }}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PCB slot connector strip at bottom */}
            <div style={{
                height: '4px',
                background: `linear-gradient(90deg, ${project.color}00 0%, ${project.color}88 30%, ${project.color}88 70%, ${project.color}00 100%)`,
            }} />
        </motion.div>
    );
};

const Projects = ({ isDark }) => {
    const [expandedId, setExpandedId] = useState(null);
    const textColor = isDark ? '#ced0ce' : '#1A1A2E';
    const dimColor = isDark ? 'rgba(156,160,156,0.9)' : 'rgba(26,26,46,0.5)';

    return (
        <section id="projects" className="section-base" data-debug="projects-section">
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: dimColor, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                        02 — WORK
                    </div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: textColor, marginBottom: '0.5rem' }}>
                        Selected Projects
                    </h2>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: dimColor, marginBottom: '3rem', maxWidth: '500px' }}>
                        Each module represents a complete engineering challenge — click to expand the datasheet.
                    </p>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {PROJECTS.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            isDark={isDark}
                            isExpanded={expandedId === project.id}
                            onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
