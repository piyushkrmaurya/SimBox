"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ControlsContainer } from "./controls/ControlsContainer";
import { ControlsConfig, ControlValue } from "../types/controls";
import { SimulationLayout } from "./SimulationLayout";

type Point = { x: number; y: number };
type Body = {
    mass: number;
    radius: number;
    position: Point;
    velocity: Point;
    color: string;
};

const GRAVITATIONAL_CONSTANT = 20;
const TIMESTEP = 1 / 60; // 60 fps

const controls: ControlsConfig = {
    mass1: { type: 'range', id: 'mass1', label: 'Central Body Mass', min: 1000, max: 100000, step: 100, defaultValue: 10000 },
    radius1: { type: 'range', id: 'radius1', label: 'Central Body Radius', min: 10, max: 100, step: 1, defaultValue: 40 },
    mass2: { type: 'range', id: 'mass2', label: 'Satellite Mass', min: 1, max: 500, step: 1, defaultValue: 10 },
    radius2: { type: 'range', id: 'radius2', label: 'Satellite Radius', min: 2, max: 30, step: 1, defaultValue: 8 },
    reset: { type: 'button', id: 'reset', label: 'Reset Simulation' }
};

export function GravityExplorer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const bodiesRef = useRef<[Body, Body] | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });

    const [values, setValues] = useState<{ [key: string]: ControlValue }>({
        mass1: 10000,
        radius1: 40,
        mass2: 10,
        radius2: 8,
    });

    const { mass1, radius1, mass2, radius2 } = values as {
        mass1: number;
        radius1: number;
        mass2: number;
        radius2: number;
    };

    const animationFrameId = useRef<number>();

    const resetSimulation = useCallback(() => {
        const { width, height } = canvasSizeRef.current;
        if (!width || !height) return;

        // Calculate a stable orbital velocity to start with
        const orbitalRadius = 150;
        const orbitalVelocity = Math.sqrt((GRAVITATIONAL_CONSTANT * (values.mass1 as number)) / orbitalRadius);

        bodiesRef.current = [
            { // Central Body
                mass: values.mass1 as number,
                radius: values.radius1 as number,
                position: { x: width / 2, y: height / 2 },
                velocity: { x: 0, y: 0 },
                color: "#FED8B1",
            },
            { // Satellite
                mass: values.mass2 as number,
                radius: values.radius2 as number,
                position: { x: width / 2, y: height / 2 - orbitalRadius },
                velocity: { x: orbitalVelocity, y: 0 },
                color: "white",
            },
        ];
    }, [values]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        resetSimulation();
    }, [resetSimulation]);

    useEffect(() => {
        resetSimulation(); // Reset when parameters change
    }, [values, resetSimulation]);

    const animate = useCallback(() => {
        const ctx = ctxRef.current;
        const bodies = bodiesRef.current;
        const { width, height } = canvasSizeRef.current;

        if (!ctx || !bodies) {
            animationFrameId.current = requestAnimationFrame(animate);
            return;
        }

        const [centralBody, satellite] = bodies;

        // --- Physics Calculation ---
        const dx = satellite.position.x - centralBody.position.x;
        const dy = satellite.position.y - centralBody.position.y;
        const rMag = Math.sqrt(dx * dx + dy * dy);
        const forceMag = (-GRAVITATIONAL_CONSTANT * centralBody.mass * satellite.mass) / (rMag * rMag);
        const forceX = (dx / rMag) * forceMag;
        const forceY = (dy / rMag) * forceMag;

        // Update velocities
        centralBody.velocity.x -= (forceX / centralBody.mass) * TIMESTEP;
        centralBody.velocity.y -= (forceY / centralBody.mass) * TIMESTEP;
        satellite.velocity.x += (forceX / satellite.mass) * TIMESTEP;
        satellite.velocity.y += (forceY / satellite.mass) * TIMESTEP;

        // Update positions
        centralBody.position.x += centralBody.velocity.x * TIMESTEP;
        centralBody.position.y += centralBody.velocity.y * TIMESTEP;
        satellite.position.x += satellite.velocity.x * TIMESTEP;
        satellite.position.y += satellite.velocity.y * TIMESTEP;

        // --- Drawing ---
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0c0a09'; // A dark background for space
        ctx.fillRect(0, 0, width, height);

        // Draw bodies
        [centralBody, satellite].forEach(body => {
            ctx.beginPath();
            ctx.arc(body.position.x, body.position.y, body.radius, 0, 2 * Math.PI);
            ctx.fillStyle = body.color;
            ctx.fill();
        });

        animationFrameId.current = requestAnimationFrame(animate);
    }, []);

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
            tools={
                <ControlsContainer
                    config={controls}
                    values={values}
                    onChange={(key, value) => {
                        if (key !== 'reset') setValues(prev => ({ ...prev, [key]: value }));
                    }}
                    onAction={(key) => key === 'reset' && resetSimulation()}
                    columns={2}
                />
            }
            canvas={(ref) =>
                <canvas ref={ref} />
            }
        />
    );
}