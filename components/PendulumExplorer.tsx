"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationLayout } from "./SimulationLayout";

type Point = { x: number; y: number };

const TIMESTEP = 1 / 60; // 60 fps

export function PendulumExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameId = useRef<number>();
    const pendulumStateRef = useRef({
        angle: (3 * Math.PI) / 4,
        velocity: 0,
    });
    const canvasSizeRef = useRef({ width: 0, height: 0 });

    const [length, setLength] = useState(200);
    const [gravity, setGravity] = useState(9.81);

    const resetSimulation = useCallback(() => {
        pendulumStateRef.current = {
            angle: (3 * Math.PI) / 4,
            velocity: 0,
        };
    }, []);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        resetSimulation();
    }, [resetSimulation]);

    useEffect(() => {
        // Reset simulation when parameters change
        resetSimulation();
    }, [length, gravity, resetSimulation]);

    const animate = useCallback(() => {
        const ctx = ctxRef.current;
        const { width, height } = canvasSizeRef.current;
        const { angle, velocity } = pendulumStateRef.current;

        if (!ctx) {
            animationFrameId.current = requestAnimationFrame(animate);
            return;
        }

        // --- Physics Update ---
        const acceleration = ((-gravity * TIMESTEP) / length) * Math.sin(angle);
        const newVelocity = velocity + acceleration;
        const newAngle = angle + newVelocity;
        pendulumStateRef.current = { angle: newAngle, velocity: newVelocity };

        // --- Drawing ---
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0c0a09'; // A dark background
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2);

        const bobRadius = 15;
        const x = length * Math.sin(newAngle);
        const y = length * Math.cos(newAngle);

        // Draw the pivot/plank
        ctx.fillStyle = "white";
        ctx.fillRect(-25, -10, 50, 10);

        // Draw the pendulum string
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the pendulum bob
        ctx.beginPath();
        ctx.arc(x, y, bobRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "#FED8B1";
        ctx.fill();

        ctx.restore();

        animationFrameId.current = requestAnimationFrame(animate);
    }, [length, gravity]);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [animate]);

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            canvasHeight={500}
            tools={
                <div className="sim-controls-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="sim-slider-group">
                        <label htmlFor="length">Pendulum Length: {length}px</label>
                        <input
                            type="range" id="length" min="50" max="300" step="1"
                            value={length} onChange={(e) => setLength(Number(e.target.value))}
                        />
                    </div>
                    <div className="sim-slider-group">
                        <label htmlFor="gravity">Gravity: {gravity.toFixed(2)} m/s²</label>
                        <input
                            type="range" id="gravity" min="1" max="25" step="0.1"
                            value={gravity} onChange={(e) => setGravity(Number(e.target.value))}
                        />
                    </div>
                </div>
            }
            canvas={
                (ref) => <canvas ref={ref} />
            }
            info={
                <div className="sim-results-container" style={{ maxWidth: '100%', marginTop: '1.5rem' }}>
                    <button
                        onClick={resetSimulation}
                        className="sim-button"
                        style={{ width: '100%', textAlign: 'center' }}
                    >
                        Reset Simulation
                    </button>
                </div>
            }
        />
    );
}