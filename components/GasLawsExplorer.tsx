"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationLayout } from "./SimulationLayout";
import { ControlsContainer } from "./controls/ControlsContainer";
import { ControlsConfig, ControlValue } from "../types/controls";
import styles from '../styles/simulation.module.css';

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

const controls: ControlsConfig = {
    temperature: {
        type: 'range',
        id: 'temperature',
        label: 'Temperature',
        min: 100,
        max: 600,
        step: 1,
        unit: ' K',
        defaultValue: 298
    },
    volume: {
        type: 'range',
        id: 'volume',
        label: 'Volume (Piston Position)',
        min: 0.2,
        max: 1,
        step: 0.01,
        defaultValue: 0.7
    }
};

export function GasLawsExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameId = useRef<number>();
    const particlesRef = useRef<Particle[]>([]);
    const canvasSizeRef = useRef({ width: 0, height: 0 });

    const [values, setValues] = useState<{ [key: string]: ControlValue }>({
        temperature: controls.temperature.defaultValue,
        volume: controls.volume.defaultValue
    });

    const temperature = values.temperature as number;
    const volume = values.volume as number;
    const pressure = (PARTICLE_COUNT * R * temperature) / (volume * 1000); // Simplified pressure calculation for display

    const createParticles = useCallback((width: number, height: number, pistonY: number) => {
        const newParticles: Particle[] = [];
        const currentTemp = values.temperature as number;
        const speedFactor = Math.sqrt(currentTemp) * 0.1;
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
    }, [values.temperature]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        const pistonY = height * (values.volume as number);
        createParticles(width, height, pistonY);
    }, [createParticles, values.volume]);

    useEffect(() => {
        const { width, height } = canvasSizeRef.current;
        if (width > 0 && height > 0) createParticles(width, height, height * (values.volume as number));
    }, [values.temperature, values.volume, createParticles]);

    const animate = useCallback(() => {
        const ctx = ctxRef.current;
        const particles = particlesRef.current;
        const { width, height } = canvasSizeRef.current;

        if (!ctx) {
            animationFrameId.current = requestAnimationFrame(animate);
            return;
        }

        const pistonY = height * (values.volume as number);
        const speedFactor = Math.sqrt(values.temperature as number) * 0.1;

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
    }, [values.temperature, values.volume]);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [animate]);

    const handleControlChange = (key: string, value: ControlValue) => {
        setValues(prev => ({ ...prev, [key]: value }));
    };

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            canvasHeight={500}
            tools={
                <ControlsContainer
                    config={controls}
                    values={values}
                    onChange={handleControlChange}
                    columns={1}
                />
            }
            canvas={
                (ref) => <canvas ref={ref} />
            }
            info={
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Pressure (P)</span>
                        <span className={styles.infoValue}>{pressure.toFixed(2)} kPa</span>
                    </div>
                </div>
            }
            infoText="Based on the Ideal Gas Law (PV=nRT), where n and R are constant."
        />
    );
}