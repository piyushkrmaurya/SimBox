"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ControlsContainer } from "./controls/ControlsContainer";
import { ControlsConfig, ControlValue } from "../types/controls";
import { SimulationLayout } from "./SimulationLayout";

type Point = { x: number; y: number };
type LensType = 'convex' | 'concave';

const controls: ControlsConfig = {
    lensType: {
        type: 'select', id: 'lens-type', label: 'Lens Type',
        defaultValue: 'convex',
        options: [
            { value: 'convex', label: 'Convex' },
            { value: 'concave', label: 'Concave' }
        ]
    },
    focalLength: {
        type: 'range', id: 'focal-length', label: 'Focal Length',
        min: 50, max: 300, step: 1, unit: 'px', defaultValue: 150
    }
};

export function LensExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const isDraggingRef = useRef(false);

    const [values, setValues] = useState<{ [key: string]: ControlValue }>({
        lensType: controls.lensType.defaultValue,
        focalLength: controls.focalLength.defaultValue,
    });
    const { lensType, focalLength } = values as { lensType: LensType, focalLength: number };
    const [objectPos, setObjectPos] = useState<Point>({ x: -300, y: -50 });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        const { width, height } = canvasSizeRef.current;
        if (!ctx || !width || !height) return;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#0c0a09";
        ctx.fillRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);

        const { x: objX, y: objY } = objectPos;

        // Determine signed focal length based on lens type and object side
        let f = lensType === "convex" ? focalLength : -focalLength;
        if (objX > 0) f = -f; // flip for objects on right side

        const u = -objX; // object distance from lens (positive left)
        let v: number;
        if (Math.abs(u - f) < 1e-6) v = Infinity;
        else v = (f * u) / (u - f); // general lens formula
        const imgX = v;
        const imgY = isFinite(v) ? (-v / u) * objY : 0;

        const lensRadius = Math.max(Math.abs(2 * Math.abs(f)), 100);

        // Axes
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        ctx.lineTo(width / 2, 0);
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, height / 2);
        ctx.stroke();

        // Object
        const objColor = isDraggingRef.current ? "#f59e0b" : "#facc15";
        ctx.strokeStyle = objColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objX, 0);
        ctx.lineTo(objX, objY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(objX, objY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = objColor;
        ctx.fill();

        // Lens drawing
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 2;
        const angle = Math.asin(100 / lensRadius);
        const cx = Math.sqrt(lensRadius ** 2 - 100 ** 2);

        if (lensType === "convex") {
            ctx.beginPath();
            ctx.arc(cx, 0, lensRadius, Math.PI - angle, Math.PI + angle);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(-cx, 0, lensRadius, -angle, angle);
            ctx.stroke();
        } else {
            const ang = Math.PI / 4;
            ctx.beginPath();
            ctx.arc(-lensRadius, 0, lensRadius, -ang, ang);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(lensRadius, 0, lensRadius, Math.PI - ang, Math.PI + ang);
            ctx.stroke();
        }

        // Helper to extend rays
        const extendRay = (x1: number, y1: number, x2: number, y2: number, scale = 2) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            return [x2 + dx * scale, y2 + dy * scale];
        };

        // Rays: parallel → focus
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "orange";
        ctx.beginPath();
        if (u < 0) {
            // real object left
            ctx.moveTo(objX, objY);
            ctx.lineTo(0, objY);
            if (isFinite(imgX)) ctx.lineTo(imgX, imgY);
        } else {
            // virtual object right
            ctx.moveTo(objX, objY);
            ctx.lineTo(0, objY);
            if (isFinite(imgX)) {
                const [vx, vy] = extendRay(0, objY, imgX, imgY);
                ctx.lineTo(vx, vy);
            }
        }
        ctx.stroke();

        // Rays: through optical center (undeviated)
        ctx.strokeStyle = "purple";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(objX, objY);
        if (isFinite(imgX)) ctx.lineTo(imgX, imgY);
        else ctx.lineTo(objX + 10 * Math.sign(f), objY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Image arrow
        if (isFinite(imgX)) {
            ctx.strokeStyle = "#86efac";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(imgX, 0);
            ctx.lineTo(imgX, imgY);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(imgX, imgY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#86efac";
            ctx.fill();
        }

        // Focal points
        ctx.fillStyle = "white";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        const F1 = -f, F2 = f;
        [F1, 2 * F1, F2, 2 * F2].forEach((pos, i) => {
            const label = i < 2 ? ["F₁", "2F₁"][i] : ["F₂", "2F₂"][i - 2];
            ctx.fillText(label, pos, -15);
            ctx.beginPath();
            ctx.arc(pos, 0, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        ctx.restore();
    }, [lensType, focalLength, objectPos, isDraggingRef.current]);


    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        // Initial draw call is needed here after canvas is set up.
        draw();
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
                <ControlsContainer
                    config={controls}
                    values={values}
                    onChange={(key, value) => setValues(prev => ({ ...prev, [key]: value }))}
                    columns={1}
                />
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