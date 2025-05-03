"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { SimulationLayout } from "./SimulationLayout";
type Point = { x: number; y: number };
type Circle = { x: number; y: number; radius: number };

export function UnitCircleExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const circleRef = useRef<Circle>({ x: 0, y: 0, radius: 0 });
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [angle, setAngle] = useState(-Math.PI / 4); // Initial angle

    const dragStateRef = useRef({ isDragging: false });

    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        const circle = circleRef.current;
        const { width, height } = canvasSizeRef.current;
        if (!ctx || !width || !height) return;

        ctx.clearRect(0, 0, width, height);

        const pointOnCircle: Point = {
            x: circle.x + circle.radius * Math.cos(angle),
            y: circle.y + circle.radius * Math.sin(angle),
        };

        // --- Draw Axes
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, circle.y);
        ctx.lineTo(width, circle.y);
        ctx.moveTo(circle.x, 0);
        ctx.lineTo(circle.x, height);
        ctx.stroke();

        // --- Draw Unit Circle
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- Draw Cosine line (adjacent)
        ctx.beginPath();
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(pointOnCircle.x, circle.y);
        ctx.strokeStyle = '#f59e0b'; // amber-500
        ctx.lineWidth = 3;
        ctx.stroke();

        // --- Draw Sine line (opposite)
        ctx.beginPath();
        ctx.moveTo(pointOnCircle.x, circle.y);
        ctx.lineTo(pointOnCircle.x, pointOnCircle.y);
        ctx.strokeStyle = '#8b5cf6'; // violet-500
        ctx.lineWidth = 3;
        ctx.stroke();

        // --- Draw Tangent line
        const tanValue = Math.tan(angle);
        const tanEndPointY = circle.y - circle.radius * tanValue;
        const tanStartPointX = circle.x + circle.radius;
        ctx.beginPath();
        ctx.moveTo(tanStartPointX, circle.y);
        ctx.lineTo(tanStartPointX, tanEndPointY);
        ctx.strokeStyle = '#2563eb'; // blue-600
        ctx.lineWidth = 3;
        ctx.stroke();

        // --- Draw Hypotenuse (radius)
        ctx.beginPath();
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(pointOnCircle.x, pointOnCircle.y);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- Draw Draggable Point
        ctx.beginPath();
        ctx.arc(pointOnCircle.x, pointOnCircle.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = dragStateRef.current.isDragging ? '#d97706' : '#f59e0b';
        ctx.fill();

        // --- Draw Angle Arc
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 20, 0, angle, angle < 0);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke();

    }, [angle]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };

        const padding = 40;
        circleRef.current = { x: width / 2, y: height / 2, radius: Math.min(width, height) / 2 - padding };
    }, []);

    useEffect(() => {
        draw();
    }, [angle, draw]);

    useEffect(() => {
        draw();
    }, [draw]);

    const getEventCoordinates = (e: MouseEvent | TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        dragStateRef.current.isDragging = true;
        (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
        handleDrag(e.nativeEvent); // Update angle immediately on click
    };

    const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
        if (!dragStateRef.current.isDragging) return;
        e.preventDefault();
        const pos = getEventCoordinates(e);
        const circle = circleRef.current;
        setAngle(Math.atan2(pos.y - circle.y, pos.x - circle.x));
    }, []);

    const handleDragEnd = useCallback(() => {
        dragStateRef.current.isDragging = false;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    }, []);

    const handleCursorUpdate = (e: React.MouseEvent) => {
        if (dragStateRef.current.isDragging) return;
        (e.currentTarget as HTMLElement).style.cursor = 'grab';
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDrag, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [handleDrag, handleDragEnd]);

    const angleDeg = angle * (180 / Math.PI);
    const cosValue = Math.cos(angle);
    const sinValue = Math.sin(angle);
    const tanValue = Math.tan(angle);

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            canvasHeight={-1} // Special value to trigger aspect ratio based on width
            canvas={
                (ref) => {
                    (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = ref.current;
                    return (
                        <canvas
                            ref={ref}
                            onMouseDown={handleDragStart}
                            onTouchStart={handleDragStart}
                            onMouseMove={handleCursorUpdate}
                            onMouseLeave={() => { if (ref.current) ref.current.style.cursor = 'default'; }}
                        />);
                }
            }
            info={
                <>
                    <div className="unit-angle-display">
                        <div className="unit-angle-value">{(angleDeg).toFixed(1)}°</div>
                        <div className="unit-angle-label">Degrees</div>
                    </div>
                    <div className="unit-angle-display">
                        <div className="unit-angle-value">{(angle).toFixed(2)}</div>
                        <div className="unit-angle-label">Radians</div>
                    </div>
                    <div className="unit-trig-grid">
                        <div className="unit-trig-label text-amber">cos(θ)</div>
                        <div className="unit-trig-value text-amber">{cosValue.toFixed(3)}</div>
                        <div className="unit-trig-label text-violet">sin(θ)</div>
                        <div className="unit-trig-value text-violet">{sinValue.toFixed(3)}</div>
                        <div className="unit-trig-label text-blue">tan(θ)</div>
                        <div className="unit-trig-value text-blue">
                            {Math.abs(tanValue) > 1000 ? (tanValue > 0 ? '∞' : '-∞') : tanValue.toFixed(3)}
                        </div>
                    </div>
                </>
            }
        />
    );
}