"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationLayout } from "./SimulationLayout";

type Point = { x: number; y: number };

const GRAVITY = 9.81; // m/s^2
const SCALE = 2; // pixels per meter
const TIME_SCALE = 5; // slow down the simulation

export function ProjectileMotionExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const animationFrameId = useRef<number>();

    const [initialVelocity, setInitialVelocity] = useState(50); // m/s
    const [launchAngle, setLaunchAngle] = useState(45); // degrees
    const [isSimulating, setIsSimulating] = useState(false);

    const [path, setPath] = useState<Point[]>([]);
    const [projectile, setProjectile] = useState<Point | null>(null);
    const [results, setResults] = useState({ range: 0, maxHeight: 0, time: 0 });

    // --- Drawing Function ---
    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        const { width, height } = canvasSizeRef.current;
        if (!ctx || !width || !height) return;

        const groundY = height - 40;

        // Clear the entire canvas
        ctx.clearRect(0, 0, width, height);

        // Set up crisp lines
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Ground
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(0, groundY, width, height - groundY);

        // Draw trajectory path
        if (path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw current projectile position
        if (projectile) {
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = "#d97706";
            ctx.fill();
        }

        // Draw cannon
        const cannonBase: Point = { x: 30, y: groundY };
        ctx.save();
        ctx.translate(cannonBase.x, cannonBase.y);
        ctx.rotate(-launchAngle * (Math.PI / 180));
        ctx.fillStyle = "#4b5563";
        ctx.fillRect(0, -10, 50, 20);
        ctx.restore();
    }, [path, projectile, launchAngle]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        draw(); // Initial draw
    }, [draw]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleLaunch = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        setResults({ range: 0, maxHeight: 0, time: 0 });
        setPath([]);
    };

    // --- Animation Loop ---
    useEffect(() => {
        if (!isSimulating) {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            return;
        }

        const { height } = canvasSizeRef.current;
        const groundY = height - 40;
        const angleRad = launchAngle * (Math.PI / 180);
        const v0x = initialVelocity * Math.cos(angleRad);
        const v0y = initialVelocity * Math.sin(angleRad);
        const cannonLength = 50;
        const startPos: Point = {
            x: 30 + cannonLength * Math.cos(angleRad),
            y: groundY - cannonLength * Math.sin(angleRad)
        };
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const t = (currentTime - startTime) / 1000 * TIME_SCALE; // scaled seconds

            // Calculate position in meters
            const x_m = v0x * t;
            const y_m = v0y * t - 0.5 * GRAVITY * t * t;

            const currentPos = {
                x: startPos.x + (x_m * SCALE),
                y: startPos.y - (y_m * SCALE) // Screen coordinates increase downward
            };

            if (currentPos.y >= groundY) {
                cancelAnimationFrame(animationFrameId.current!);
                setIsSimulating(false);
                setProjectile(null);
            } else {
                setProjectile(currentPos);
                setPath(prev => [...prev, currentPos]);
                animationFrameId.current = requestAnimationFrame(animate);
            }
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [isSimulating, launchAngle, initialVelocity]);

    // Calculate results when simulation ends
    useEffect(() => {
        // Check path.length > 1 to avoid calculating on initial reset
        if (!isSimulating && path.length > 1) {
            const angleRad = launchAngle * (Math.PI / 180);
            const timeOfFlight = (2 * initialVelocity * Math.sin(angleRad)) / GRAVITY;
            const range = (Math.pow(initialVelocity, 2) * Math.sin(2 * angleRad)) / GRAVITY;
            const maxHeight = Math.pow(initialVelocity * Math.sin(angleRad), 2) / (2 * GRAVITY);
            setResults({ range, maxHeight, time: timeOfFlight });
        }
    }, [isSimulating, path.length, launchAngle, initialVelocity]); // path.length is a more stable dependency

    // --- UI ---
    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            canvasHeight={400}
            tools={
                <div className="sim-controls-container" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                    <div className="sim-slider-group">
                        <label htmlFor="velocity">Velocity: {initialVelocity} m/s</label>
                        <input
                            type="range" id="velocity" min="10" max="100"
                            value={initialVelocity}
                            onChange={(e) => setInitialVelocity(Number(e.target.value))}
                            disabled={isSimulating}
                        />
                    </div>
                    <div className="sim-slider-group">
                        <label htmlFor="angle">Angle: {launchAngle}°</label>
                        <input
                            type="range" id="angle" min="1" max="90"
                            value={launchAngle}
                            onChange={(e) => setLaunchAngle(Number(e.target.value))}
                            disabled={isSimulating}
                        />
                    </div>
                    <button
                        onClick={handleLaunch}
                        disabled={isSimulating}
                        className="sim-button"
                        style={{ alignSelf: 'end' }}
                    >
                        {isSimulating ? "Simulating..." : "Launch"}
                    </button>
                </div>
            }
            canvas={
                (ref) => <canvas ref={ref} />
            }
            info={
                <>
                    <div className="sim-info-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="sim-info-item">
                            <span className="sim-info-label">Max Height</span>
                            <span className="sim-info-value">{results.maxHeight.toFixed(2)} m</span>
                        </div>
                        <div className="sim-info-item">
                            <span className="sim-info-label">Range</span>
                            <span className="sim-info-value">{results.range.toFixed(2)} m</span>
                        </div>
                        <div className="sim-info-item">
                            <span className="sim-info-label">Time of Flight</span>
                            <span className="sim-info-value">{results.time.toFixed(2)} s</span>
                        </div>
                    </div>
                </>
            }
        />
    );
}
