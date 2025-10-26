"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ControlsContainer } from "./controls/ControlsContainer";
import { ControlsConfig, ControlValue } from "../types/controls";
import { SimulationLayout } from "./SimulationLayout";

type Point = { x: number; y: number };

const TIMESTEP = 1 / 60; // 60 fps

const controls: ControlsConfig = {
    length: {
        type: 'range', id: 'length', label: 'Pendulum Length',
        min: 50, max: 300, step: 1, unit: 'px', defaultValue: 200
    },
    gravity: {
        type: 'range', id: 'gravity', label: 'Gravity',
        min: 1, max: 25, step: 0.1, unit: ' m/s²', defaultValue: 9.81
    },
    reset: {
        type: 'button',
        id: 'reset',
        label: 'Reset Simulation'
    }
};

export function PendulumExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameId = useRef<number>();
    const pendulumStateRef = useRef({
        angle: (3 * Math.PI) / 4,
        velocity: 0,
    });
    const canvasSizeRef = useRef({ width: 0, height: 0 });

    const [values, setValues] = useState<{ [key: string]: ControlValue }>({
        length: controls.length.defaultValue,
        gravity: controls.gravity.defaultValue,
    });

    const { length, gravity } = values as { length: number, gravity: number };

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
        if (ctxRef.current) resetSimulation();
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
                    onAction={(key) => key === 'reset' && resetSimulation()}
                    columns={1}
                />
            }
            canvas={
                (ref) => <canvas ref={ref} />
            }
        />
    );
}