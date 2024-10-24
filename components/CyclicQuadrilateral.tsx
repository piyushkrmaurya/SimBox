"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { distance, calculateAngle, Point } from "@/lib/geometry";
import { SimulationLayout } from "./SimulationLayout";

type Circle = { x: number; y: number; radius: number };

export function CyclicQuadrilateral() {
    // Refs for DOM elements and stable values
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // State for interactive values that trigger re-renders
    const [angles, setAngles] = useState({
        theta1: 90,
        theta2: 90,
        centerAngle: 180,
    });
    const [circle, setCircle] = useState<Circle>({ x: 0, y: 0, radius: 0 });
    const [fixedPoint1Angle, setFixedPoint1Angle] = useState(-Math.PI / 2);
    const [fixedPoint2Angle, setFixedPoint2Angle] = useState(Math.PI / 2);
    const [chordY, setChordY] = useState(0);

    // Refs for drag state to avoid re-renders on mouse move
    const dragStateRef = useRef({
        isDraggingChord: false,
        isDraggingPoint1: false,
        isDraggingPoint2: false,
        dragOffsetY: 0,
    });

    // Effect for calculating angles when dependencies change
    useEffect(() => {
        if (!circle || circle.radius === 0) return; // Don't calculate if circle isn't set up

        const dy = chordY - circle.y;
        // Ensure the value inside sqrt is non-negative
        const dx = Math.sqrt(Math.max(0, circle.radius * circle.radius - dy * dy));
        const chordP1 = { x: circle.x - dx, y: chordY };
        const chordP2 = { x: circle.x + dx, y: chordY };

        const newTheta1 = calculateAngle({ x: circle.x + circle.radius * Math.cos(fixedPoint1Angle), y: circle.y + circle.radius * Math.sin(fixedPoint1Angle) }, chordP1, chordP2);
        const newTheta2 = calculateAngle({ x: circle.x + circle.radius * Math.cos(fixedPoint2Angle), y: circle.y + circle.radius * Math.sin(fixedPoint2Angle) }, chordP1, chordP2);
        const newCenterAngle = calculateAngle(circle, chordP1, chordP2);

        setAngles({ theta1: newTheta1, theta2: newTheta2, centerAngle: newCenterAngle });
    }, [chordY, fixedPoint1Angle, fixedPoint2Angle, circle]);

    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx || !circle.radius) return;

        ctx.clearRect(0, 0, ctx.canvas.width / (window.devicePixelRatio || 1), ctx.canvas.height / (window.devicePixelRatio || 1));

        const fixedPoint1 = { x: circle.x + circle.radius * Math.cos(fixedPoint1Angle), y: circle.y + circle.radius * Math.sin(fixedPoint1Angle) };
        const fixedPoint2 = { x: circle.x + circle.radius * Math.cos(fixedPoint2Angle), y: circle.y + circle.radius * Math.sin(fixedPoint2Angle) };

        const dy = chordY - circle.y;
        const dx = Math.sqrt(Math.max(0, circle.radius * circle.radius - dy * dy));
        const chordP1 = { x: circle.x - dx, y: chordY };
        const chordP2 = { x: circle.x + dx, y: chordY };

        // --- Drawing Logic ---
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(chordP1.x, chordP1.y);
        ctx.lineTo(circle.x, circle.y);
        ctx.lineTo(chordP2.x, chordP2.y);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(chordP1.x, chordP1.y);
        ctx.lineTo(fixedPoint1.x, fixedPoint1.y);
        ctx.lineTo(chordP2.x, chordP2.y);
        ctx.lineTo(fixedPoint2.x, fixedPoint2.y);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(chordP1.x, chordP1.y);
        ctx.lineTo(chordP2.x, chordP2.y);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        [fixedPoint1, fixedPoint2, chordP1, chordP2].forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
            let pointColor = 'rgba(0,0,0,0.6)';
            if (p === chordP1 || p === chordP2) pointColor = '#06b6d4';
            if ((p === fixedPoint1 && dragStateRef.current.isDraggingPoint1) || (p === fixedPoint2 && dragStateRef.current.isDraggingPoint2)) {
                pointColor = '#f59e0b';
            }
            ctx.fillStyle = pointColor;
            ctx.fill();
        });

        ctx.font = 'bold 18px var(--font-inter)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#f59e0b';
        const angle1LabelOffset = fixedPoint1.y < circle.y ? -25 : 30;
        ctx.fillText(`θ₁ = ${angles.theta1.toFixed(1)}°`, fixedPoint1.x, fixedPoint1.y + angle1LabelOffset);

        ctx.fillStyle = '#8b5cf6';
        const angle2LabelOffset = fixedPoint2.y < circle.y ? -25 : 30;
        ctx.fillText(`θ₂ = ${angles.theta2.toFixed(1)}°`, fixedPoint2.x, fixedPoint2.y + angle2LabelOffset);

        const textYOffset = (chordY < circle.y) ? 20 : -20;
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`${angles.centerAngle.toFixed(1)}°`, circle.x, circle.y + textYOffset);
    }, [chordY, fixedPoint1Angle, fixedPoint2Angle, angles, circle]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;

        const padding = 40;
        const newCircle = {
            x: width / 2,
            y: height / 2,
            radius: Math.min(width, height) / 2 - padding
        };
        setCircle(newCircle);
        setChordY(newCircle.y); // Initialize chordY based on new size
    }, []);

    // Effect for re-drawing when state changes
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

    const getDraggableTarget = (pos: Point) => {
        const hitRadius = 20;
        const p1Pos = { x: circle.x + circle.radius * Math.cos(fixedPoint1Angle), y: circle.y + circle.radius * Math.sin(fixedPoint1Angle) };
        if (distance(pos, p1Pos) < hitRadius) return 'point1';

        const p2Pos = { x: circle.x + circle.radius * Math.cos(fixedPoint2Angle), y: circle.y + circle.radius * Math.sin(fixedPoint2Angle) };
        if (distance(pos, p2Pos) < hitRadius) return 'point2';

        const dy = chordY - circle.y;
        const dx = Math.sqrt(Math.max(0, circle.radius * circle.radius - dy * dy));
        const chordP1 = { x: circle.x - dx, y: chordY };
        const chordP2 = { x: circle.x + dx, y: chordY };
        if (Math.abs(pos.y - chordY) < hitRadius && pos.x >= chordP1.x && pos.x <= chordP2.x) return 'chord';

        return null;
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const pos = getEventCoordinates(e.nativeEvent);
        const target = getDraggableTarget(pos);

        if (target === 'point1') dragStateRef.current.isDraggingPoint1 = true;
        else if (target === 'point2') dragStateRef.current.isDraggingPoint2 = true;
        else if (target === 'chord') {
            dragStateRef.current.isDraggingChord = true;
            dragStateRef.current.dragOffsetY = pos.y - chordY;
        }

        if (target) {
            (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
            draw();
        }
    };

    const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
        const { isDraggingChord, isDraggingPoint1, isDraggingPoint2, dragOffsetY } = dragStateRef.current;
        if (!isDraggingChord && !isDraggingPoint1 && !isDraggingPoint2) return;
        e.preventDefault();

        const pos = getEventCoordinates(e);

        if (isDraggingChord) {
            const newY = pos.y - dragOffsetY;
            const topBound = circle.y - circle.radius + 1;
            const bottomBound = circle.y + circle.radius - 1;
            setChordY(Math.max(topBound, Math.min(bottomBound, newY)));
        } else if (isDraggingPoint1) {
            setFixedPoint1Angle(Math.atan2(pos.y - circle.y, pos.x - circle.x));
        } else if (isDraggingPoint2) {
            setFixedPoint2Angle(Math.atan2(pos.y - circle.y, pos.x - circle.x));
        }
    }, [circle]);

    const handleDragEnd = useCallback(() => {
        dragStateRef.current = { ...dragStateRef.current, isDraggingChord: false, isDraggingPoint1: false, isDraggingPoint2: false };
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        draw(); // Final draw to remove active styles
    }, [draw]);

    const handleCursorUpdate = (e: React.MouseEvent) => {
        const { isDraggingChord, isDraggingPoint1, isDraggingPoint2 } = dragStateRef.current;
        if (isDraggingChord || isDraggingPoint1 || isDraggingPoint2) return;

        const pos = getEventCoordinates(e.nativeEvent);
        const target = getDraggableTarget(pos);
        (e.currentTarget as HTMLElement).style.cursor = target ? 'grab' : 'default';
    };

    // Add/remove global event listeners for dragging
    useEffect(() => {
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDrag, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
        document.addEventListener('touchcancel', handleDragEnd);

        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', handleDragEnd);
            document.removeEventListener('touchcancel', handleDragEnd);
        };
    }, [handleDrag, handleDragEnd]);

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            canvasHeight={-1} // Make canvas a square
            canvas={(ref) => {
                // Assign the ref from SimulationLayout to our local ref
                (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = ref.current;
                return (
                    <canvas
                        ref={ref}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        onMouseMove={handleCursorUpdate}
                        onMouseLeave={() => { if (ref.current) ref.current.style.cursor = 'default'; }}
                    />
                );
            }}
            info={
                <>
                    <div className="sim-results-row">
                        <div>
                            <p className="sim-results-label">Angle 1 (θ₁)</p>
                            <p className="sim-results-value text-amber">{angles.theta1.toFixed(1)}°</p>
                        </div>
                        <div className="sim-results-operator">+</div>
                        <div>
                            <p className="sim-results-label">Angle 2 (θ₂)</p>
                            <p className="sim-results-value text-violet">{angles.theta2.toFixed(1)}°</p>
                        </div>
                        <div className="sim-results-operator">=</div>
                        <div>
                            <p className="sim-results-label">Sum</p>
                            <p className="sim-results-value text-emerald">{(angles.theta1 + angles.theta2).toFixed(0)}°</p>
                        </div>
                    </div>
                    <div className="sim-theorem-summary text-emerald-dark">
                        θ₁ + θ₂ = 180°
                    </div>
                    <div className="sim-results-separator"></div>
                    <div className="sim-results-row">
                        <div>
                            <p className="sim-results-label">Center Angle</p>
                            <p className="sim-results-value text-amber">{angles.centerAngle.toFixed(1)}°</p>
                        </div>
                        <div className="sim-results-operator">=</div>
                        <div>
                            <p className="sim-results-label">2 × θ₁</p>
                            <p className="sim-results-value text-amber">{(2 * angles.theta1).toFixed(1)}°</p>
                        </div>
                    </div>
                    <div className="sim-theorem-summary text-amber-dark">
                        Angle at Center = 2 × Angle at Circumference
                    </div>
                </>
            }
        />
    );
}