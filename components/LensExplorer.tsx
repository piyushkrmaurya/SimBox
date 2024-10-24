"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationLayout } from "./SimulationLayout";

type Point = { x: number; y: number };
type LensType = 'convex' | 'concave';

export function LensExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const isDraggingRef = useRef(false);

    const [lensType, setLensType] = useState<LensType>('convex');
    const [focalLength, setFocalLength] = useState(150);
    const [objectPos, setObjectPos] = useState<Point>({ x: -300, y: -50 });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        const { width, height } = canvasSizeRef.current;
        if (!ctx || !width || !height) return;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2);

        const f = (lensType === "convex" ? 1 : -1) * focalLength;
        let lensRadius = Math.abs(2 * f);
        const { x: objectX, y: objectY } = objectPos;

        // --- Draw Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        ctx.lineTo(width / 2, 0);
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, height / 2);
        ctx.stroke();

        // --- Physics Calculation
        const imageX = (f * objectX) / (f + objectX);
        const imageY = (imageX * objectY) / objectX;

        // --- Draw Object (as an arrow)
        const objectColor = isDraggingRef.current ? "#f59e0b" : "#facc15"; // yellow-400 / amber-500
        // Body
        ctx.strokeStyle = objectColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objectX, 0);
        ctx.lineTo(objectX, objectY);
        ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(objectX, objectY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = objectColor;
        ctx.fill();

        // --- Draw Lens
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        if (lensType === 'convex') {
            const lensHeight = 100; // The half-height of the lens
            // Ensure lensRadius is not smaller than lensHeight to avoid NaN from asin
            if (lensRadius < lensHeight) { lensRadius = lensHeight; }
            const angle = Math.asin(lensHeight / lensRadius);
            const arcCenterX = Math.sqrt(lensRadius * lensRadius - lensHeight * lensHeight);
            ctx.beginPath();
            ctx.arc(arcCenterX, 0, lensRadius, Math.PI - angle, Math.PI + angle);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(-arcCenterX, 0, lensRadius, -angle, angle);
            ctx.stroke();
        } else { // Concave
            const angle = Math.PI / 4; // A fixed angle for aesthetics
            ctx.beginPath();
            ctx.arc(-lensRadius, 0, lensRadius, -angle, angle);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(lensRadius, 0, lensRadius, Math.PI - angle, Math.PI + angle);
            ctx.stroke();
        }

        // --- Draw Image (as an arrow)
        if (isFinite(imageX) && isFinite(imageY)) {
            const imageColor = "#86efac"; // green-300
            // Body
            ctx.strokeStyle = imageColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(imageX, 0);
            ctx.lineTo(imageX, imageY);
            ctx.stroke();
            // Head
            ctx.beginPath();
            ctx.arc(imageX, imageY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = imageColor;
            ctx.fill();
        }

        // --- Draw Principal Rays
        ctx.lineWidth = 1;

        // Ray 1: Parallel to axis, then through focal point
        ctx.strokeStyle = "rgba(255, 100, 100, 0.7)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(objectX, objectY);
        ctx.lineTo(0, objectY);
        ctx.stroke();

        // Ray 1 after lens
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, objectY);
        if (isFinite(imageX)) {
            ctx.lineTo(imageX, imageY);
        }
        ctx.stroke();

        // Ray 2: Through center of lens, undeviated
        ctx.strokeStyle = "rgba(100, 255, 100, 0.7)";
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(objectX, objectY);
        if (isFinite(imageX)) ctx.lineTo(imageX, imageY);
        ctx.stroke();

        // Ray 3: Through focal point, then parallel to axis
        ctx.strokeStyle = "rgba(100, 100, 255, 0.7)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(objectX, objectY);
        ctx.lineTo(-f, 0); // Aim for the object-side focal point
        ctx.stroke();

        // Ray 3 after lens
        const yAtLens = (objectY * f) / (f + objectX); // y-position where ray 3 hits the lens
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, yAtLens);
        if (isFinite(imageX)) {
            ctx.lineTo(imageX, imageY);
        }
        ctx.stroke();

        // --- Draw Focal Points
        ctx.fillStyle = "white";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("F", f, -10);
        ctx.fillText("F", -f, -10);
        ctx.beginPath();
        ctx.arc(f, 0, 3, 0, 2 * Math.PI);
        ctx.arc(-f, 0, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }, [lensType, focalLength, objectPos]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
    }, []);

    useEffect(() => {
        // This useEffect is to re-draw when parameters change.
        draw();
    }, [lensType, focalLength, objectPos, draw]);

    useEffect(() => {
        draw();
    }, [draw]);

    const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const { width, height } = canvasSizeRef.current;
        return { x: clientX - rect.left - width / 2, y: clientY - rect.top - height / 2 };
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        isDraggingRef.current = true;
        document.body.style.cursor = 'grabbing';
        const pos = getEventCoordinates(e.nativeEvent);
        setObjectPos(pos);
    };

    const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current) return;
        const pos = getEventCoordinates(e);
        setObjectPos(pos);
    }, []);

    const handleDragEnd = useCallback(() => {
        isDraggingRef.current = false;
        document.body.style.cursor = 'default';
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('touchmove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);

        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [handleDrag, handleDragEnd]);

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            canvasHeight={500}
            tools={
                <div className="sim-controls-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="sim-slider-group">
                        <label htmlFor="lens-type">Lens Type</label>
                        <select id="lens-type" value={lensType} onChange={(e) => setLensType(e.target.value as LensType)} className="form-group" style={{ padding: '0.5rem' }}>
                            <option value="convex">Convex</option>
                            <option value="concave">Concave</option>
                        </select>
                    </div>
                    <div className="sim-slider-group">
                        <label htmlFor="focal-length">Focal Length: {focalLength}px</label>
                        <input type="range" id="focal-length" min="50" max="300" value={focalLength} onChange={(e) => setFocalLength(Number(e.target.value))} />
                    </div>
                </div>
            }
            canvas={
                (ref) => {
                    // We need to assign the ref from SimulationLayout to our local ref
                    // because the drag handlers are attached directly to the canvas element.
                    (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = ref.current;
                    return <canvas ref={ref} onMouseDown={handleDragStart} onTouchStart={handleDragStart} style={{ cursor: 'grab' }} />
                }
            }
            infoText="Click and drag on the canvas to move the object (yellow dot)."
        />
    );
}