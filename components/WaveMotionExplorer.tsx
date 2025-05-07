"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationLayout } from "./SimulationLayout";

type Wave = {
    id: number;
    amplitude: number;
    frequency: number;
    phaseShift: number;
    waveSpeed: number;
    color: string;
};

const WAVE_COLORS = ['#60a5fa', '#f87171', '#4ade80', '#facc15', '#c084fc'];

const createNewWave = (id: number): Wave => ({
    id,
    amplitude: 80,
    frequency: 0.01,
    phaseShift: 0,
    waveSpeed: 1,
    color: WAVE_COLORS[id % WAVE_COLORS.length],
});

export function WaveMotionExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const animationFrameId = useRef<number>();
    const nextIdRef = useRef(1);

    const [waves, setWaves] = useState<Wave[]>([createNewWave(0)]);
    const [mode, setMode] = useState<'overlay' | 'interference'>('overlay');

    const draw = useCallback((time: number) => {
        const ctx = ctxRef.current;
        const { width, height } = canvasSizeRef.current;
        if (!ctx || !width || !height) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        // Center the vertical axis
        ctx.translate(0, height / 2);

        // --- Draw Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0); // Principal axis
        ctx.stroke();

        if (mode === 'overlay') {
            // --- Draw each wave individually ---
            waves.forEach(wave => {
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = wave.color;
                const timePhase = (time * wave.waveSpeed * wave.frequency) / 10;

                for (let x = 0; x <= width; x++) {
                    const y = wave.amplitude * Math.sin(x * wave.frequency + wave.phaseShift + timePhase);
                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            });
        } else {
            // --- Draw the interference pattern (sum of waves) ---
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffffff'; // White for the resultant wave

            for (let x = 0; x <= width; x++) {
                let totalY = 0;
                waves.forEach(wave => {
                    const timePhase = (time * wave.waveSpeed * wave.frequency) / 10;
                    totalY += wave.amplitude * Math.sin(x * wave.frequency + wave.phaseShift + timePhase);
                });

                if (x === 0) {
                    ctx.moveTo(x, totalY);
                } else {
                    ctx.lineTo(x, totalY);
                }
            }
            ctx.stroke();
        }

        ctx.restore();

    }, [waves, mode]);

    const animate = useCallback((time: number) => {
        draw(time);
        animationFrameId.current = requestAnimationFrame(animate);
    }, [draw]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
    }, []);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [animate]);

    const handleWaveChange = (id: number, property: keyof Omit<Wave, 'id' | 'color'>, value: number) => {
        setWaves(currentWaves =>
            currentWaves.map(wave =>
                wave.id === id ? { ...wave, [property]: value } : wave
            )
        );
    };

    const addWave = () => {
        const newId = nextIdRef.current++;
        setWaves(currentWaves => [...currentWaves, createNewWave(newId)]);
    };

    const removeWave = (id: number) => {
        setWaves(currentWaves => currentWaves.filter(wave => wave.id !== id));
        if (waves.length === 1) addWave(); // Ensure there's always at least one
    };

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            tools={
                <>
                    <div className="sim-controls-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="sim-slider-group">
                            <label htmlFor="mode-toggle">Display Mode</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ color: mode === 'overlay' ? 'white' : '#9ca3af' }}>Overlay</span>
                                <label htmlFor="mode-toggle" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        id="mode-toggle"
                                        checked={mode === 'interference'}
                                        onChange={(e) => setMode(e.target.checked ? 'interference' : 'overlay')}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: mode === 'interference' ? '#34d399' : '#4b5563',
                                        borderRadius: '34px',
                                        transition: 'background-color 0.2s',
                                    }}></span>
                                    <span style={{
                                        position: 'absolute',
                                        content: '""',
                                        height: '18px', width: '18px', left: '3px', bottom: '3px',
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        transition: 'transform 0.2s',
                                        transform: mode === 'interference' ? 'translateX(20px)' : 'translateX(0)',
                                    }}></span>
                                </label>
                                <span style={{ color: mode === 'interference' ? 'white' : '#9ca3af' }}>Interference</span>
                            </div>
                        </div>
                        <div className="sim-slider-group" style={{ justifyContent: 'center' }}>
                            <button onClick={addWave} className="sim-button" style={{ width: '100%', height: '100%' }}>Add Wave</button>
                        </div>
                    </div>

                    {waves.map((wave, index) => (
                        <div key={wave.id} className="sim-controls-container" style={{ borderLeft: `4px solid ${wave.color}`, marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                            <div className="sim-slider-group">
                                <label htmlFor={`amplitude-${wave.id}`}>Amplitude: {wave.amplitude.toFixed(0)}</label>
                                <input
                                    type="range" id={`amplitude-${wave.id}`} min="10" max="150" step="1"
                                    value={wave.amplitude} onChange={(e) => handleWaveChange(wave.id, 'amplitude', Number(e.target.value))}
                                />
                            </div>
                            <div className="sim-slider-group">
                                <label htmlFor={`frequency-${wave.id}`}>Frequency: {wave.frequency.toFixed(3)}</label>
                                <input
                                    type="range" id={`frequency-${wave.id}`} min="0.005" max="0.05" step="0.001"
                                    value={wave.frequency} onChange={(e) => handleWaveChange(wave.id, 'frequency', Number(e.target.value))}
                                />
                            </div>
                            <div className="sim-slider-group">
                                <label htmlFor={`phase-shift-${wave.id}`}>Phase Shift: {(wave.phaseShift / Math.PI).toFixed(2)}π</label>
                                <input
                                    type="range" id={`phase-shift-${wave.id}`} min="0" max={2 * Math.PI} step="0.05"
                                    value={wave.phaseShift} onChange={(e) => handleWaveChange(wave.id, 'phaseShift', Number(e.target.value))}
                                />
                            </div>
                            <div className="sim-slider-group">
                                <label htmlFor={`wave-speed-${wave.id}`}>Wave Speed: {wave.waveSpeed.toFixed(1)}x</label>
                                <input
                                    type="range" id={`wave-speed-${wave.id}`} min="0" max="5" step="0.1"
                                    value={wave.waveSpeed} onChange={(e) => handleWaveChange(wave.id, 'waveSpeed', Number(e.target.value))}
                                />
                            </div>
                            {waves.length > 1 && (
                                <div className="sim-slider-group" style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <button onClick={() => removeWave(wave.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>Remove</button>
                                </div>
                            )}
                        </div>
                    ))}
                </>
            }
            canvas={(ref) =>
                <canvas ref={ref} /> // This ref is from SimulationLayout
            }
        />
    );
}