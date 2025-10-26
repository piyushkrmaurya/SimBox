"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ControlsContainer } from "./controls/ControlsContainer";
import { ControlsConfig, ControlValue } from "../types/controls";
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

const getWaveControls = (wave: Wave): ControlsConfig => ({
    amplitude: {
        type: 'range', id: `amplitude-${wave.id}`, label: 'Amplitude',
        min: 10, max: 150, step: 1, defaultValue: wave.amplitude
    },
    frequency: {
        type: 'range', id: `frequency-${wave.id}`, label: 'Frequency',
        min: 0.005, max: 0.05, step: 0.001, defaultValue: wave.frequency
    },
    phaseShift: {
        type: 'range', id: `phase-shift-${wave.id}`, label: 'Phase Shift',
        min: 0, max: 2 * Math.PI, step: 0.05, defaultValue: wave.phaseShift,
        displayValue: (val) => `${(val / Math.PI).toFixed(2)}π`
    },
    waveSpeed: {
        type: 'range', id: `wave-speed-${wave.id}`, label: 'Wave Speed',
        min: 0, max: 5, step: 0.1, defaultValue: wave.waveSpeed, unit: 'x'
    }
});

export function WaveMotionExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const animationFrameId = useRef<number>();
    const nextIdRef = useRef(1);

    const [globalControls, setGlobalControls] = useState<{ [key: string]: ControlValue }>({
        mode: 'overlay',
    });
    const mode = globalControls.mode as 'overlay' | 'interference';

    const [waves, setWaves] = useState<Wave[]>([createNewWave(0)]);

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

    const globalControlsConfig: ControlsConfig = {
        mode: { type: 'toggle', id: 'mode-toggle', label: 'Interference Mode', defaultValue: false },
        addWave: { type: 'button', id: 'add-wave', label: 'Add Wave' }
    };

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            tools={
                <>
                    <ControlsContainer
                        config={globalControlsConfig}
                        values={{ mode: mode === 'interference' }}
                        onChange={(key, value) => {
                            if (key === 'mode') {
                                setGlobalControls(prev => ({ ...prev, mode: value ? 'interference' : 'overlay' }));
                            }
                        }}
                        onAction={(key) => {
                            if (key === 'addWave') addWave();
                        }}
                        columns={2}
                    />

                    {waves.map((wave, index) => (
                        <div key={wave.id} style={{ borderLeft: `4px solid ${wave.color}`, marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem' }}>
                            <ControlsContainer
                                config={getWaveControls(wave)}
                                values={wave}
                                onChange={(key, value) => handleWaveChange(wave.id, key as keyof Omit<Wave, 'id' | 'color'>, value as number)}
                                columns={1}
                            />
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