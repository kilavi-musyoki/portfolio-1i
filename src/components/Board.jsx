import React, { useRef, useEffect, useState } from 'react';

/**
 * PCBBoard — 7-layer deconstructable ESP32 PCB SVG
 * Layers: casing → thermal → bare-pcb → traces → components → die → quantum
 */
const PCBBoard = ({ layer = 'casing', className = '', isDark = true }) => {
    const [tooltip, setTooltip] = useState(null);
    const tooltipTimer = useRef(null);

    const components = [
        { id: 'U1', x: 95, y: 65, w: 38, h: 38, label: 'ESP32-WROOM-32', func: 'Core processing unit', rating: '240MHz dual-core', color: '#2a2a2a' },
        { id: 'C1', x: 25, y: 30, w: 8, h: 6, label: 'C1 100nF', func: 'Decoupling cap', rating: '50V X7R', color: '#D4A843' },
        { id: 'C2', x: 38, y: 30, w: 8, h: 6, label: 'C2 10uF', func: 'Bulk capacitor', rating: '16V', color: '#D4A843' },
        { id: 'C3', x: 25, y: 50, w: 8, h: 6, label: 'C3 100nF', func: 'Decoupling cap', rating: '50V X7R', color: '#D4A843' },
        { id: 'C4', x: 38, y: 50, w: 8, h: 6, label: 'C4 4.7uF', func: 'Filter cap', rating: '25V', color: '#D4A843' },
        { id: 'R1', x: 25, y: 72, w: 10, h: 5, label: 'R1 10kΩ', func: 'Pull-up resistor', rating: '1/4W', color: '#8a6cd4' },
        { id: 'R2', x: 40, y: 72, w: 10, h: 5, label: 'R2 4.7kΩ', func: 'Pull-up resistor', rating: '1/4W', color: '#8a6cd4' },
        { id: 'R3', x: 25, y: 82, w: 10, h: 5, label: 'R3 330Ω', func: 'LED current limit', rating: '1/4W', color: '#8a6cd4' },
        { id: 'R4', x: 40, y: 82, w: 10, h: 5, label: 'R4 1kΩ', func: 'Base resistor', rating: '1/4W', color: '#8a6cd4' },
        { id: 'R5', x: 25, y: 92, w: 10, h: 5, label: 'R5 2.2kΩ', func: 'Pulldown resistor', rating: '1/4W', color: '#8a6cd4' },
        { id: 'R6', x: 40, y: 92, w: 10, h: 5, label: 'R6 100kΩ', func: 'Bias resistor', rating: '1/4W', color: '#8a6cd4' },
    ];

    const handleComponentHover = (e, comp) => {
        clearTimeout(tooltipTimer.current);
        const rect = e.currentTarget.closest('svg').getBoundingClientRect();
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 70,
            comp,
        });
    };

    const handleComponentLeave = () => {
        tooltipTimer.current = setTimeout(() => setTooltip(null), 200);
    };

    const layerVisibility = {
        casing: { casing: 1, thermal: 0, pcb: 0, traces: 0, components: 0, die: 0, quantum: 0 },
        thermal: { casing: 0, thermal: 1, pcb: 1, traces: 0, components: 0, die: 0, quantum: 0 },
        pcb: { casing: 0, thermal: 0, pcb: 1, traces: 1, components: 0, die: 0, quantum: 0 },
        traces: { casing: 0, thermal: 0, pcb: 1, traces: 1, components: 1, die: 0, quantum: 0 },
        components: { casing: 0, thermal: 0, pcb: 1, traces: 1, components: 1, die: 0, quantum: 0 },
        die: { casing: 0, thermal: 0, pcb: 0.3, traces: 0.4, components: 0.5, die: 1, quantum: 0 },
        quantum: { casing: 0, thermal: 0, pcb: 0, traces: 0, components: 0, die: 0.2, quantum: 1 },
    };

    const vis = layerVisibility[layer] || layerVisibility.casing;

    return (
        <div className={`relative board-container ${className}`}>
            <svg
                viewBox="0 0 200 160"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
                <defs>
                    <radialGradient id="board-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={isDark ? '#4BD8A0' : '#D4A843'} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={isDark ? '#4BD8A0' : '#D4A843'} stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="quantum-glow" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor={isDark ? '#6FD4FF' : '#D4A843'} stopOpacity="0.3" />
                        <stop offset="50%" stopColor={isDark ? '#4BD8A0' : '#E3C08A'} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={isDark ? '#FF5A3C' : '#C28A3A'} stopOpacity="0" />
                    </radialGradient>
                    <filter id="pcb-glow">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="led-glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="thermal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0000FF" stopOpacity="0.3" />
                        <stop offset="30%" stopColor="#00FF00" stopOpacity="0.25" />
                        <stop offset="60%" stopColor="#FFAA00" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FF0000" stopOpacity="0.4" />
                    </linearGradient>
                    <pattern id="wafer-grid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                        <rect width="8" height="8" fill="none" stroke="rgba(0,255,136,0.15)" strokeWidth="0.3" />
                    </pattern>
                    <radialGradient id="die-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4DFFFF" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#00FF88" stopOpacity="0.05" />
                    </radialGradient>
                </defs>

                {/* ======= LAYER: CASING (avatar case) ======= */}
                <g opacity={vis.casing} style={{ transition: 'opacity 0.8s ease' }}>
                    {/* Outer casing body */}
                    <rect
                        x="2"
                        y="2"
                        width="196"
                        height="156"
                        rx="6"
                        fill={isDark ? '#2a2a2a' : '#E5D2B5'}
                        stroke={isDark ? '#444' : '#C7A979'}
                        strokeWidth="1"
                    />
                    {/* Inner bezel / faceplate */}
                    <rect
                        x="8"
                        y="8"
                        width="184"
                        height="144"
                        rx="4"
                        fill={isDark ? '#222' : '#F6ECDE'}
                        stroke={isDark ? '#333' : '#D9BE8F'}
                        strokeWidth="0.5"
                    />
                    {/* Brushed metal texture lines */}
                    {[...Array(14)].map((_, i) => (
                        <line key={i} x1="8" y1={14 + i * 10} x2="192" y2={14 + i * 10} stroke="#2f2f2f" strokeWidth="0.3" />
                    ))}
                    {/* Screws in corners */}
                    {[[14, 14], [186, 14], [14, 146], [186, 146]].map(([cx, cy], i) => (
                        <g key={i}>
                            <circle cx={cx} cy={cy} r="5" fill="#1a1a1a" stroke="#555" strokeWidth="0.8" />
                            <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="#777" strokeWidth="0.8" />
                            <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} stroke="#777" strokeWidth="0.8" />
                        </g>
                    ))}
                    {/* Laser-etched serial */}
                    <text x="100" y="86" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="5.5" fill="rgba(0,255,136,0.6)" letterSpacing="0.3">
                        SN-2024-KM-PORTFOLIO-REV2
                    </text>
                    <text x="100" y="94" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="3.5" fill="rgba(0,255,136,0.35)" letterSpacing="0.1">
                        SILICON SOUL · KILAVI MUSYOKI · DEKUT
                    </text>
                    {/* Ventilation slots */}
                    {[...Array(6)].map((_, i) => (
                        <rect key={i} x={170} y={30 + i * 16} width="18" height="4" rx="2" fill="#111" />
                    ))}
                </g>

                {/* ======= LAYER: THERMAL ======= */}
                <g opacity={vis.thermal} style={{ transition: 'opacity 0.8s ease' }}>
                    <rect x="2" y="2" width="196" height="156" rx="6" fill="url(#thermal-grad)" />
                    <text x="100" y="85" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="4" fill="rgba(255,170,0,0.8)">
                        THERMAL PROFILE — ACTIVE
                    </text>
                    {/* Hot zones */}
                    <circle cx="114" cy="84" r="20" fill="rgba(255,60,0,0.25)" />
                    <circle cx="114" cy="84" r="12" fill="rgba(255,120,0,0.2)" />
                </g>

                {/* ======= LAYER: PCB BASE / Oscillator panel ======= */}
                <g opacity={vis.pcb} style={{ transition: 'opacity 0.8s ease' }}>
                    {/* PCB / panel substrate */}
                    <rect
                        x="4"
                        y="4"
                        width="192"
                        height="152"
                        rx="5"
                        fill={isDark ? '#1a2e1a' : '#F2DFC4'}
                        stroke={isDark ? '#4BD8A0' : '#C79A4D'}
                        strokeWidth="0.5"
                        strokeOpacity="0.4"
                    />
                    {/* Mounting holes */}
                    {[[14, 14], [186, 14], [14, 146], [186, 146]].map(([cx, cy], i) => (
                        <g key={i}>
                            <circle cx={cx} cy={cy} r="4" fill="none" stroke="#D4A843" strokeWidth="1.2" />
                            <circle cx={cx} cy={cy} r="2" fill="#D4A843" opacity="0.5" />
                        </g>
                    ))}

                    {/* 40-pin header strip (left edge) */}
                    {[...Array(20)].map((_, i) => (
                        <g key={i}>
                            <rect x="5" y={20 + i * 6} width="6" height="4" rx="0.5" fill="#D4A843" />
                            <rect x="6.5" y={21 + i * 6} width="3" height="2" rx="0" fill="#111" />
                        </g>
                    ))}
                    <text x="13" y="10" fontFamily="JetBrains Mono, monospace" fontSize="3" fill="rgba(0,255,136,0.5)">GPIO</text>

                    {/* USB-C port (bottom edge) */}
                    <rect x="86" y="148" width="28" height="8" rx="2" fill="#333" stroke="#D4A843" strokeWidth="0.8" />
                    <rect x="90" y="150" width="20" height="4" rx="1" fill="#111" />
                    <text x="100" y="155" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill="#D4A843">USB-C</text>

                    {/* RF Antenna trace (top right) */}
                    <g stroke="#00FF88" strokeWidth="1.5" fill="none" opacity="0.7" filter="url(#pcb-glow)">
                        <path d="M150 8 L160 8 L160 20 L175 20 L175 8 L185 8" />
                        <path d="M160 12 L167 12" />
                        <path d="M168 12 L175 12" />
                    </g>
                    <text x="167" y="7" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill="rgba(0,255,136,0.5)">ANT1</text>

                    {/* Silk screen labels */}
                    <text x="100" y="155" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill="rgba(255,255,255,0.2)">SN-2024-KM-PORTFOLIO-REV2</text>
                    <text x="5" y="140" fontFamily="JetBrains Mono, monospace" fontSize="2" fill="rgba(255,255,255,0.2)">UART</text>
                </g>

                {/* ======= LAYER: PCB TRACES ======= */}
                <g opacity={vis.traces} style={{ transition: 'opacity 0.8s ease' }}>
                    <g stroke="#00FF88" strokeWidth="1" fill="none" opacity="0.6" filter="url(#pcb-glow)">
                        {/* Power traces */}
                        <path d="M12 80 L22 80 L22 68 L90 68 L90 65" strokeWidth="1.5" />
                        <path d="M12 90 L22 90 L22 95 L90 95 L90 103" strokeWidth="1.2" />
                        {/* Signal traces */}
                        <path d="M55 35 L70 35 L70 50 L90 50" strokeWidth="0.8" />
                        <path d="M55 55 L70 55 L70 60 L90 60" strokeWidth="0.8" />
                        <path d="M55 75 L80 75 L80 80 L90 80" strokeWidth="0.8" />
                        <path d="M55 87 L80 87 L80 90 L90 90" strokeWidth="0.8" />
                        <path d="M133 84 L150 84 L150 35 L170 35" strokeWidth="0.8" />
                        <path d="M133 74 L145 74 L145 30 L155 30" strokeWidth="0.8" />
                        <path d="M133 94 L150 94 L150 120" strokeWidth="0.8" />
                        <path d="M100 103 L100 120 L55 120" strokeWidth="1" />
                        <path d="M114 103 L114 135 L100 135 L85 135 L85 148" strokeWidth="1.2" />
                    </g>
                    {/* Via pads */}
                    {[[75, 50], [75, 60], [150, 84], [85, 148], [100, 120]].map(([cx, cy], i) => (
                        <g key={i}>
                            <circle cx={cx} cy={cy} r="2.5" fill="none" stroke="#D4A843" strokeWidth="1" />
                            <circle cx={cx} cy={cy} r="1.2" fill="#D4A843" opacity="0.7" />
                        </g>
                    ))}
                </g>

                {/* ======= LAYER: COMPONENTS ======= */}
                <g opacity={vis.components} style={{ transition: 'opacity 0.8s ease' }}>
                    {/* ESP32 Module (U1) */}
                    <g
                        onMouseEnter={(e) => handleComponentHover(e, { id: 'U1', label: 'ESP32-WROOM-32', func: 'Core Processing Unit', rating: '240MHz dual-core Xtensa LX6' })}
                        onMouseLeave={handleComponentLeave}
                        style={{ cursor: 'crosshair' }}
                    >
                        <rect x="90" y="60" width="48" height="48" rx="2" fill="#1a1a1a" stroke="#D4A843" strokeWidth="1" />
                        <rect x="92" y="62" width="44" height="44" rx="1" fill="#0d0d0d" />
                        {/* Module pads — top */}
                        {[...Array(8)].map((_, i) => <rect key={i} x={93 + i * 5.5} y="59" width="3" height="3" rx="0.5" fill="#D4A843" />)}
                        {/* Module pads — bottom */}
                        {[...Array(8)].map((_, i) => <rect key={i} x={93 + i * 5.5} y="106" width="3" height="3" rx="0.5" fill="#D4A843" />)}
                        {/* Module pads — right */}
                        {[...Array(5)].map((_, i) => <rect key={i} x="137" y={63 + i * 8} width="3" height="3" rx="0.5" fill="#D4A843" />)}
                        <text x="114" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="3.5" fill="rgba(255,255,255,0.6)">ESP32</text>
                        <text x="114" y="89" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill="rgba(0,255,136,0.4)">WROOM-32</text>
                        <text x="96" y="58" fontFamily="JetBrains Mono, monospace" fontSize="3" fill="rgba(0,255,136,0.5)">U1</text>
                    </g>

                    {/* Capacitors & Resistors */}
                    {components.slice(1).map((comp) => (
                        <g
                            key={comp.id}
                            onMouseEnter={(e) => handleComponentHover(e, comp)}
                            onMouseLeave={handleComponentLeave}
                            style={{ cursor: 'crosshair' }}
                        >
                            <rect x={comp.x} y={comp.y} width={comp.w} height={comp.h} rx="1" fill={comp.color} stroke="rgba(212,168,67,0.4)" strokeWidth="0.5" />
                            <text x={comp.x + comp.w / 2} y={comp.y - 1} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill="rgba(0,255,136,0.5)">{comp.id}</text>
                        </g>
                    ))}

                    {/* LED1 (Red Eye) */}
                    <g id="board-led" filter="url(#led-glow)">
                        <circle cx="170" cy="55" r="4" fill="#FF3D00" opacity="0.9" className="board-eye" />
                        <circle cx="170" cy="55" r="2" fill="#FF8060" />
                        <text x="174" y="54" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill="rgba(255,61,0,0.7)">LED1</text>
                    </g>

                    {/* Silk labels */}
                    <text x="22" y="17" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill="rgba(255,255,255,0.25)">KILAVI MUSYOKI</text>
                    <text x="22" y="13" fontFamily="JetBrains Mono, monospace" fontSize="2" fill="rgba(0,255,136,0.25)">DeKUT · ELECTRONICS</text>
                </g>

                {/* ======= LAYER: SILICON DIE ======= */}
                <g opacity={vis.die} style={{ transition: 'opacity 0.8s ease' }}>
                    <rect x="4" y="4" width="192" height="152" rx="5" fill="#000810" />
                    <rect x="60" y="40" width="80" height="80" fill="url(#wafer-grid)" />
                    <rect x="60" y="40" width="80" height="80" fill="url(#die-glow)" />
                    <circle cx="100" cy="80" r="30" fill="none" stroke="rgba(77,255,255,0.3)" strokeWidth="0.5" />
                    <circle cx="100" cy="80" r="15" fill="none" stroke="rgba(0,255,136,0.4)" strokeWidth="0.5" />
                    <circle cx="100" cy="80" r="5" fill="rgba(77,255,255,0.5)" />
                    <text x="100" y="130" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="3.5" fill="rgba(77,255,255,0.5)">SILICON · DIE · VIEW</text>
                    {/* Milestone cells */}
                    {[...Array(10)].map((_, i) => (
                        [...Array(10)].map((_, j) => (
                            <rect key={`${i}-${j}`} x={62 + j * 8} y={42 + i * 8} width="6" height="6" rx="0.5"
                                fill={Math.random() > 0.7 ? 'rgba(0,255,136,0.3)' : 'rgba(77,255,255,0.1)'}
                            />
                        ))
                    ))}
                </g>

                {/* ======= LAYER: QUANTUM CORE ======= */}
                <g opacity={vis.quantum} style={{ transition: 'opacity 0.8s ease' }}>
                    <rect x="0" y="0" width="200" height="160" fill="#000005" />
                    <ellipse cx="100" cy="80" rx="80" ry="60" fill="url(#quantum-glow)" />
                    <text x="100" y="76" textAnchor="middle" fontFamily="Syne, sans-serif" fontSize="7" fontWeight="700" fill="rgba(77,255,255,0.6)">QUANTUM</text>
                    <text x="100" y="86" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="4" fill="rgba(0,255,136,0.5)">CORE ENERGY</text>
                </g>

                {/* Board ambient glow */}
                <ellipse
                    cx="100" cy="160"
                    rx="70" ry="20"
                    fill="url(#board-glow)"
                    style={{ animation: 'glow-pulse 3.5s ease-in-out infinite' }}
                />
            </svg>

            {/* Component Tooltip */}
            {tooltip && (
                <div
                    className="pcb-tooltip"
                    style={{ left: tooltip.x + 10, top: tooltip.y }}
                >
                    <div style={{ color: '#D4A843', marginBottom: '2px' }}>PART: {tooltip.comp.id}</div>
                    <div>FUNCTION: {tooltip.comp.label || tooltip.comp.func}</div>
                    {tooltip.comp.rating && <div>RATING: {tooltip.comp.rating}</div>}
                    <div style={{ color: 'rgba(0,255,136,0.5)', marginTop: '2px' }}>OWNER: Kilavi Musyoki</div>
                </div>
            )}
        </div>
    );
};

export default PCBBoard;
