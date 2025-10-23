"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { distance } from "@/lib/geometry";
import { SimulationLayout } from "./SimulationLayout";

type Point = { x: number; y: number };

export function PythagoreanExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Vertices of the right-angled triangle
    const [vertexA, setVertexA] = useState<Point>({ x: 50, y: 150 });
    const [vertexB, setVertexB] = useState<Point>({ x: 250, y: 350 });
    const vertexC: Point = useMemo(() => ({ x: vertexA.x, y: vertexB.y }), [vertexA.x, vertexB.y]); // The right-angle vertex

    // Side lengths
    const sideB = distance(vertexA, vertexC); // a in a²+b²=c²
    const sideA = distance(vertexB, vertexC); // b in a²+b²=c²
    const sideC = distance(vertexA, vertexB); // c (hypotenuse)

    // Drag state
    const dragStateRef = useRef({ isDraggingA: false, isDraggingB: false });

    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        const { width, height } = canvasSizeRef.current;
        ctx.clearRect(0, 0, width, height);

        // --- Helper function to draw a square from a side
        const drawSquare = (p1: Point, p2: Point, color: string) => {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const p3 = { x: p2.x - dy, y: p2.y + dx };
            const p4 = { x: p1.x - dy, y: p1.y + dx };

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        };

        // --- Draw squares for each side
        drawSquare(vertexC, vertexB, 'rgba(245, 158, 11, 0.2)'); // Square for side 'a'
        drawSquare(vertexA, vertexC, 'rgba(139, 92, 246, 0.2)'); // Square for side 'b'
        drawSquare(vertexB, vertexA, 'rgba(16, 185, 129, 0.2)'); // Square for hypotenuse 'c'

        // --- Draw the main triangle
        ctx.beginPath();
        ctx.moveTo(vertexA.x, vertexA.y);
        ctx.lineTo(vertexB.x, vertexB.y);
        ctx.lineTo(vertexC.x, vertexC.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- Draw right-angle symbol
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(vertexC.x + 15, vertexC.y);
        ctx.lineTo(vertexC.x + 15, vertexC.y - 15);
        ctx.lineTo(vertexC.x, vertexC.y - 15);
        ctx.stroke();

        // --- Draw draggable vertices
        [vertexA, vertexB].forEach((p, i) => {
            const isDragging = (i === 0 && dragStateRef.current.isDraggingA) || (i === 1 && dragStateRef.current.isDraggingB);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = isDragging ? '#d97706' : '#f59e0b';
            ctx.fill();
        });

        // --- Draw labels
        ctx.font = 'bold 16px var(--font-family-sans)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#b45309'; // amber-700
        ctx.fillText('a', (vertexB.x + vertexC.x) / 2 + 15, (vertexB.y + vertexC.y) / 2);

        ctx.fillStyle = '#5b21b6'; // violet-800
        ctx.fillText('b', (vertexA.x + vertexC.x) / 2, (vertexA.y + vertexC.y) / 2 - 15);

        ctx.fillStyle = '#065f46'; // emerald-800
        ctx.save();
        ctx.translate((vertexA.x + vertexB.x) / 2, (vertexA.y + vertexB.y) / 2);
        ctx.rotate(Math.atan2(vertexB.y - vertexA.y, vertexB.x - vertexA.x));
        ctx.fillText('c', 0, -20);
        ctx.restore();

    }, [vertexA, vertexB, vertexC]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };

        // Reset points on resize
        const padding = 50;
        const rightAngleY = height - padding;
        const rightAngleX = padding;
        setVertexA({ x: rightAngleX, y: height * 0.4 });
        setVertexB({ x: width * 0.7, y: rightAngleY });
    }, []);

    useEffect(() => {
        draw();
    }, [vertexA, vertexB, draw]);

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
        const pos = getEventCoordinates(e.nativeEvent);
        const hitRadius = 20;

        if (distance(pos, vertexA) < hitRadius) {
            dragStateRef.current.isDraggingA = true;
        } else if (distance(pos, vertexB) < hitRadius) {
            dragStateRef.current.isDraggingB = true;
        }

        if (dragStateRef.current.isDraggingA || dragStateRef.current.isDraggingB) {
            (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
            draw();
        }
    };

    const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
        const { isDraggingA, isDraggingB } = dragStateRef.current;
        if (!isDraggingA && !isDraggingB) return;
        e.preventDefault();

        const pos = getEventCoordinates(e);
        const { width, height } = canvasSizeRef.current;
        const padding = 20;

        if (isDraggingA) {
            setVertexA(prev => ({
                ...prev,
                y: Math.max(padding, Math.min(pos.y, vertexC.y - padding))
            }));
        } else if (isDraggingB) {
            setVertexB(prev => ({
                ...prev,
                x: Math.max(vertexC.x + padding, Math.min(pos.x, width - padding))
            }));
        }
    }, [vertexC.x, vertexC.y]);

    const handleDragEnd = useCallback(() => {
        dragStateRef.current = { isDraggingA: false, isDraggingB: false };
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        draw();
    }, [draw]);

    const handleCursorUpdate = (e: React.MouseEvent) => {
        if (dragStateRef.current.isDraggingA || dragStateRef.current.isDraggingB) return;
        const pos = getEventCoordinates(e.nativeEvent);
        const hitRadius = 20;
        const onA = distance(pos, vertexA) < hitRadius;
        const onB = distance(pos, vertexB) < hitRadius;
        (e.currentTarget as HTMLElement).style.cursor = (onA || onB) ? 'grab' : 'default';
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

    const scale = 50; // for display purposes

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            // Pythagorean explorer is best as a square
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
                    <div className="sim-info-grid sim-info-grid--3-col">
                        {/* Row 1: Values */}
                        <div className="sim-grid-label">a</div>
                        <div className="sim-grid-label">b</div>
                        <div className="sim-grid-label">c</div>
                        <div className="sim-value text-amber">{(sideA / scale).toFixed(2)}</div>
                        <div className="sim-value text-violet">{(sideB / scale).toFixed(2)}</div>
                        <div className="sim-value text-emerald">{(sideC / scale).toFixed(2)}</div>

                        {/* Row 2: Squared Values */}
                        <div className="sim-grid-label">a²</div>
                        <div className="sim-grid-label">b²</div>
                        <div className="sim-grid-label">c²</div>
                        <div className="sim-value text-amber">{Math.pow(sideA / scale, 2).toFixed(2)}</div>
                        <div className="sim-value text-violet">{Math.pow(sideB / scale, 2).toFixed(2)}</div>
                        <div className="sim-value text-emerald">{Math.pow(sideC / scale, 2).toFixed(2)}</div>
                    </div>

                    <div className="sim-equation-summary">
                        <span className="text-amber">{Math.pow(sideA / scale, 2).toFixed(2)}</span>
                        <span className="sim-equation-operator">+</span>
                        <span className="text-violet">{Math.pow(sideB / scale, 2).toFixed(2)}</span>
                        <span className="sim-equation-operator">=</span>
                        <span className="text-emerald">{(Math.pow(sideA / scale, 2) + Math.pow(sideB / scale, 2)).toFixed(2)}</span>
                    </div>
                    <div className="sim-theorem-summary text-emerald-dark">
                        a² + b² = c²
                    </div>
                </>
            }
        />
    );
}