"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationLayout } from "./SimulationLayout";

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
};

const PARTICLE_COUNT = 100;
const PARTICLE_RADIUS = 4;
const R = 8.314; // Ideal gas constant for display calculation

export function GasLawsExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameId = useRef<number>();
    const particlesRef = useRef<Particle[]>([]);
    const canvasSizeRef = useRef({ width: 0, height: 0 });

    const [temperature, setTemperature] = useState(298); // Kelvin
    const [volume, setVolume] = useState(0.7); // Percentage of max volume (0 to 1)

    const pressure = (PARTICLE_COUNT * R * temperature) / (volume * 1000); // Simplified pressure calculation for display

    const createParticles = useCallback((width: number, height: number, pistonY: number) => {
        const newParticles: Particle[] = [];
        const speedFactor = Math.sqrt(temperature) * 0.1;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = Math.random() * 2 * Math.PI;
            newParticles.push({
                x: Math.random() * (width - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS,
                y: Math.random() * (pistonY - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS,
                vx: Math.cos(angle) * speedFactor,
                vy: Math.sin(angle) * speedFactor,
                radius: PARTICLE_RADIUS,
                color: `hsl(${200 + Math.random() * 60}, 100%, 60%)`,
            });
        }
        particlesRef.current = newParticles;
    }, [temperature]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        const pistonY = height * volume;
        createParticles(width, height, pistonY);
    }, [createParticles, volume]);

    useEffect(() => {
        const { width, height } = canvasSizeRef.current;
        if (width > 0 && height > 0) createParticles(width, height, height * volume);
    }, [temperature, volume, createParticles]);

    const animate = useCallback(() => {
        const ctx = ctxRef.current;
        const particles = particlesRef.current;
        const { width, height } = canvasSizeRef.current;

        if (!ctx) {
            animationFrameId.current = requestAnimationFrame(animate);
            return;
        }

        const pistonY = height * volume;
        const speedFactor = Math.sqrt(temperature) * 0.1;

        // --- Drawing ---
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(0, 0, width, height);

        // --- Physics & Particle Update ---
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Wall collisions
            if (p.x - p.radius < 0 || p.x + p.radius > width) p.vx *= -1;
            if (p.y - p.radius < 0) p.vy *= -1;
            if (p.y + p.radius > pistonY) {
                p.y = pistonY - p.radius;
                p.vy *= -1;
            }

            // Adjust speed based on temperature
            const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (currentSpeed > 0) {
                p.vx = (p.vx / currentSpeed) * speedFactor;
                p.vy = (p.vy / currentSpeed) * speedFactor;
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Draw Piston
        ctx.fillStyle = "#9ca3af"; // gray-400
        ctx.fillRect(0, pistonY, width, height - pistonY);
        ctx.fillStyle = "#6b7280"; // gray-500
        ctx.fillRect(width / 2 - 20, pistonY - 10, 40, 10);

        animationFrameId.current = requestAnimationFrame(animate);
    }, [temperature, volume]);

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
                        <label htmlFor="temperature">Temperature: {temperature} K</label>
                        <input
                            type="range" id="temperature" min="100" max="600" step="1"
                            value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
                        />
                    </div>
                    <div className="sim-slider-group">
                        <label htmlFor="volume">Volume (Piston Position)</label>
                        <input
                            type="range" id="volume" min="0.2" max="1" step="0.01"
                            value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                        />
                    </div>
                </div>
            }
            canvas={
                (ref) => <canvas ref={ref} />
            }
            info={
                <div className="sim-info-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="sim-info-item">
                        <span className="sim-info-label">Pressure (P)</span>
                        <span className="sim-info-value">{pressure.toFixed(2)} kPa</span>
                    </div>
                </div>
            }
            infoText="Based on the Ideal Gas Law (PV=nRT), where n and R are constant."
        />
    );
}