"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

export function GravityExplorer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const bodiesRef = useRef<[Body, Body] | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });

    const [mass1, setMass1] = useState(10000);
    const [radius1, setRadius1] = useState(40);
    const [mass2, setMass2] = useState(10);
    const [radius2, setRadius2] = useState(8);

    const animationFrameId = useRef<number>();

    const resetSimulation = useCallback(() => {
        const { width, height } = canvasSizeRef.current;
        if (!width || !height) return;

        // Calculate a stable orbital velocity to start with
        const orbitalRadius = 150;
        const orbitalVelocity = Math.sqrt((GRAVITATIONAL_CONSTANT * mass1) / orbitalRadius);

        bodiesRef.current = [
            { // Central Body
                mass: mass1,
                radius: radius1,
                position: { x: width / 2, y: height / 2 },
                velocity: { x: 0, y: 0 },
                color: "#FED8B1",
            },
            { // Satellite
                mass: mass2,
                radius: radius2,
                position: { x: width / 2, y: height / 2 - orbitalRadius },
                velocity: { x: orbitalVelocity, y: 0 },
                color: "white",
            },
        ];
    }, [mass1, mass2, radius1, radius2]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        resetSimulation();
    }, [resetSimulation]);

    useEffect(() => {
        resetSimulation(); // Reset when parameters change
    }, [mass1, radius1, mass2, radius2, resetSimulation]);

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
                <div className="sim-controls-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="sim-slider-group">
                        <label htmlFor="mass1">Central Body Mass: {mass1}</label>
                        <input
                            type="range" id="mass1" min="1000" max="100000" step="100"
                            value={mass1} onChange={(e) => setMass1(Number(e.target.value))}
                        />
                    </div>
                    <div className="sim-slider-group">
                        <label htmlFor="radius1">Central Body Radius: {radius1}</label>
                        <input
                            type="range" id="radius1" min="10" max="100"
                            value={radius1} onChange={(e) => setRadius1(Number(e.target.value))}
                        />
                    </div>
                    <div className="sim-slider-group">
                        <label htmlFor="mass2">Satellite Mass: {mass2}</label>
                        <input
                            type="range" id="mass2" min="1" max="500"
                            value={mass2} onChange={(e) => setMass2(Number(e.target.value))}
                        />
                    </div>
                    <div className="sim-slider-group">
                        <label htmlFor="radius2">Satellite Radius: {radius2}</label>
                        <input
                            type="range" id="radius2" min="2" max="30"
                            value={radius2} onChange={(e) => setRadius2(Number(e.target.value))}
                        />
                    </div>
                </div>
            }
            canvas={(ref) =>
                <canvas ref={ref} />
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