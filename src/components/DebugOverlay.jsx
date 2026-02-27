import React, { useEffect, useState, useRef } from 'react';

const DebugOverlay = ({ visible, fps }) => {
    const [heap, setHeap] = useState(47);
    const [stack, setStack] = useState(12);
    const sections = [
        { name: 'hero', bounds: '[0 - 100vh]', var: 'bootComplete, layer, mousePos' },
        { name: 'about', bounds: '[100vh - 200vh]', var: 'skills[], datasheetVisible' },
        { name: 'projects', bounds: '[200vh - 300vh]', var: 'activeCard, expandedId' },
        { name: 'milestones', bounds: '[300vh - 400vh]', var: 'changelog[], hoverEntry' },
        { name: 'contact', bounds: '[400vh - 500vh]', var: 'waveform, formState, emailStatus' },
    ];

    useEffect(() => {
        if (!visible) return;
        const interval = setInterval(() => {
            setHeap(Math.round(40 + Math.random() * 20));
            setStack(Math.round(8 + Math.random() * 12));
        }, 2000);
        return () => clearInterval(interval);
    }, [visible]);

    if (!visible) return null;

    return (
        <div className="debug-overlay" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid rgba(0,255,136,0.4)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#FF3D00' }}>■ DEBUG MODE ACTIVE</span>
                {'  '}
                <span>OPERATOR: Kilavi Musyoki</span>
                {'  '}
                <span style={{ color: '#D4A843' }}>CLEARANCE: LEVEL 4</span>
            </div>

            {/* System stats */}
            <div style={{ marginBottom: '8px', display: 'flex', gap: '24px' }}>
                <span>HEAP: <span style={{ color: '#4DFFFF' }}>{heap}%</span></span>
                <span>STACK: <span style={{ color: '#4DFFFF' }}>{stack}%</span></span>
                <span>FPS: <span style={{ color: fps < 30 ? '#FF3D00' : '#00FF88' }}>{fps}</span></span>
                <span>BUILD: <span style={{ color: '#D4A843' }}>REV2</span></span>
            </div>

            {/* Section bounding boxes */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ color: 'rgba(0,255,136,0.5)', marginBottom: '4px' }}>// SECTION REGISTERS</div>
                {sections.map((s) => (
                    <div key={s.name} style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                        <span style={{ color: '#D4A843', width: '80px' }}>{s.name.toUpperCase()}</span>
                        <span style={{ color: 'rgba(0,255,136,0.4)', width: '140px' }}>{s.bounds}</span>
                        <span style={{ color: '#4DFFFF' }}>{s.var}</span>
                    </div>
                ))}
            </div>

            {/* Dismiss hint */}
            <div style={{ marginTop: '12px', color: 'rgba(0,255,136,0.35)' }}>
        // TYPE "debug" AGAIN TO DISMISS
            </div>

            {/* Bounding box overlays */}
            <style>{`
        section { outline: 1px dashed rgba(0, 255, 136, 0.15) !important; }
        [data-debug] { outline: 1px solid rgba(77, 255, 255, 0.3) !important; }
      `}</style>
        </div>
    );
};

export default DebugOverlay;
