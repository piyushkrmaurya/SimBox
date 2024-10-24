"use client";

import React, { useRef, useEffect, useState, useCallback, MutableRefObject, useMemo } from 'react';
import { SimulationLayout } from './SimulationLayout';

type Matrix = [[number, number], [number, number]];

const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
    ctx.beginPath();
    ctx.strokeStyle = '#333'; // Darker grid for better visibility
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = -width / 2; x <= width / 2; x += scale) {
        ctx.moveTo(x, -height / 2);
        ctx.lineTo(x, height / 2);
    }

    // Horizontal lines
    for (let y = -height / 2; y <= height / 2; y += scale) {
        ctx.moveTo(-width / 2, y);
        ctx.lineTo(width / 2, y);
    }
    ctx.stroke();

    // Axes
    ctx.beginPath();
    ctx.strokeStyle = '#888'; // Lighter axes
    ctx.lineWidth = 1;
    // X-Axis
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(width / 2, 0);
    // Y-Axis
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(0, height / 2);
    ctx.stroke();
};

const drawShape = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[], color: string, scale: number) => {
    if (points.length === 0) return;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(points[0].x * scale, -points[0].y * scale); // Invert Y for canvas coordinates
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * scale, -points[i].y * scale);
    }
    ctx.closePath();
    ctx.fill();
};

const drawImage = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, offset: { x: number, y: number }, scale: number) => {
    const w = image.width;
    const h = image.height;
    // We'll treat the image as a 1x1 unit square for transformation purposes, based on its aspect ratio.
    const aspectRatio = w / h;
    const unitWidth = 1 * aspectRatio;
    const unitHeight = 1;
    ctx.drawImage(image, (offset.x - unitWidth / 2) * scale, (-offset.y - unitHeight / 2) * scale, unitWidth * scale, unitHeight * scale);
};

const transformPoint = (p: { x: number, y: number }, m: Matrix) => {
    return {
        x: m[0][0] * p.x + m[0][1] * p.y,
        y: m[1][0] * p.x + m[1][1] * p.y,
    };
};

const isPointInsidePolygon = (point: { x: number, y: number }, polygonPoints: { x: number, y: number }[], offset: { x: number, y: number }) => {
    let inside = false;
    // Translate polygon points by the current shape offset
    const translatedPoints = polygonPoints.map(p => ({ x: p.x + offset.x, y: p.y + offset.y }));

    for (let i = 0, j = translatedPoints.length - 1; i < translatedPoints.length; j = i++) {
        const xi = translatedPoints[i].x, yi = translatedPoints[i].y;
        const xj = translatedPoints[j].x, yj = translatedPoints[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const isPointInsideCircle = (point: { x: number, y: number }, center: { x: number, y: number }, radius: number) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return (dx * dx + dy * dy) <= (radius * radius);
};

type ShapeType = 'square' | 'triangle' | 'circle';
const shapes: Record<ShapeType, { x: number, y: number }[]> = { // Defined outside component to prevent re-creation
    square: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
    ],
    triangle: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: Math.sqrt(3) / 2 }, // Equilateral triangle
    ],
    circle: Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * 2 * Math.PI;
        return { x: Math.cos(angle), y: Math.sin(angle) };
    }),
};

const checkPointInCurrentShape = (point: { x: number, y: number }, shapeType: ShapeType | 'image', shapePoints: { x: number, y: number }[], offset: { x: number, y: number }, image: HTMLImageElement | null): boolean => {
    if (shapeType === 'circle') {
        // For the circle, its definition is a unit circle centered at (0,0)
        // So, its effective center is shapeOffset and radius is 1.
        return isPointInsideCircle(point, offset, 1);
    } else if (shapeType === 'image' && image) {
        // For image, we approximate its draggable area based on its aspect ratio, centered at the offset.
        const aspectRatio = image.width / image.height;
        const unitWidth = 1 * aspectRatio;
        const unitHeight = 1;
        return point.x >= offset.x - unitWidth / 2 && point.x <= offset.x + unitWidth / 2 &&
            point.y >= offset.y - unitHeight / 2 && point.y <= offset.y + unitHeight / 2;
    } else if (shapeType === 'square' || shapeType === 'triangle') {
        // For square and triangle, use the point-in-polygon test
        return isPointInsidePolygon(point, shapePoints, offset);
    }
    return false;
};
export const LinearTransformationsExplorer = () => {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null); // Local ref for mouse events

    const [matrix, setMatrix] = useState<Matrix>([[1, 0], [0, 1]]);
    const [shapeOffset, setShapeOffset] = useState({ x: 0, y: 0 });
    const dragStateRef = useRef({ isDraggingShape: false, dragStartOffset: { x: 0, y: 0 } });
    const [selectedShapeType, setSelectedShapeType] = useState<ShapeType | 'image'>('square');
    const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
    const currentShape = useMemo(() => selectedShapeType !== 'image' ? shapes[selectedShapeType] : [], [selectedShapeType]);

    // Reset shape offset when shape type changes
    useEffect(() => {
        setShapeOffset({ x: 0, y: 0 });
    }, [selectedShapeType]);

    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        const { width, height } = canvasSizeRef.current;
        if (!ctx || !width || !height) return;

        const scale = 40; // pixels per unit

        // Clear and prepare canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0c0a09'; // Match other simulations' background
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2); // Center the origin

        drawGrid(ctx, width, height, scale);

        // Draw original shape (semi-transparent blue)
        if (selectedShapeType === 'image' && userImage) {
            // Draw original image with transparency
            ctx.globalAlpha = 0.5;
            drawImage(ctx, userImage, shapeOffset, scale);
            ctx.globalAlpha = 1.0;

            // Draw transformed image
            ctx.save();
            ctx.transform(matrix[0][0], matrix[1][0], matrix[0][1], matrix[1][1], 0, 0);
            drawImage(ctx, userImage, shapeOffset, scale);
            ctx.restore();
        } else {
            const offsetOriginalShape = currentShape.map(p => ({
                x: p.x + shapeOffset.x,
                y: p.y + shapeOffset.y
            }));
            drawShape(ctx, offsetOriginalShape, 'rgba(59, 130, 246, 0.5)', scale);

            // Calculate and draw transformed shape (solid purple)
            const transformedShape = offsetOriginalShape.map(p => transformPoint(p, matrix));
            drawShape(ctx, transformedShape, 'rgba(168, 85, 247, 0.8)', scale);
        }

        ctx.restore();
    }, [matrix, currentShape, shapeOffset, selectedShapeType, userImage]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        draw();
    }, [draw]);

    useEffect(() => {
        // Re-draw whenever the matrix or canvas size changes
        draw(); // draw is already memoized and depends on matrix and shapeOffset
    }, [draw]); // Only draw is needed here as a dependency

    const handleMatrixChange = (row: number, col: number, value: string) => {
        const numValue = parseFloat(value) || 0;
        const newMatrix = [...matrix].map(r => [...r]) as Matrix;
        newMatrix[row][col] = numValue;
        setMatrix(newMatrix);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => setUserImage(img);
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): { x: number, y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const { width, height } = canvasSizeRef.current;
        const scale = 40; // pixels per unit, consistent with draw function
        return {
            x: ((clientX - rect.left) - width / 2) / scale,
            y: -(((clientY - rect.top) - height / 2) / scale) // Invert Y and convert to simulation units
        };
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const mouseSimCoords = getEventCoordinates(e); // Use e directly as getEventCoordinates handles nativeEvent
        const isInside = checkPointInCurrentShape(mouseSimCoords, selectedShapeType, currentShape, shapeOffset, userImage);

        if (isInside) {
            dragStateRef.current.isDraggingShape = true;
            dragStateRef.current.dragStartOffset = {
                x: mouseSimCoords.x - shapeOffset.x,
                y: mouseSimCoords.y - shapeOffset.y
            };
            (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
        }
    }; // No need for useCallback here as it's only called once per drag start

    const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
        if (!dragStateRef.current.isDraggingShape) return;
        e.preventDefault();
        const mouseSimCoords = getEventCoordinates(e);
        const newShapeOffsetX = mouseSimCoords.x - dragStateRef.current.dragStartOffset.x;
        const newShapeOffsetY = mouseSimCoords.y - dragStateRef.current.dragStartOffset.y;
        setShapeOffset({ x: newShapeOffsetX, y: newShapeOffsetY });
    }, []);

    const handleDragEnd = useCallback(() => {
        dragStateRef.current.isDraggingShape = false;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    }, []);

    const handleCursorUpdate = useCallback((e: React.MouseEvent) => {
        if (dragStateRef.current.isDraggingShape) return;
        const mouseSimCoords = getEventCoordinates(e);
        const isInside = checkPointInCurrentShape(mouseSimCoords, selectedShapeType, currentShape, shapeOffset, userImage);
        if (isInside) {
            (e.currentTarget as HTMLElement).style.cursor = 'grab';
        } else {
            (e.currentTarget as HTMLElement).style.cursor = 'default';
        }
    }, [selectedShapeType, currentShape, shapeOffset, userImage]);

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

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            canvas={(ref) => {
                (canvasRef as MutableRefObject<HTMLCanvasElement | null>).current = ref.current;
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
            tools={
                <>
                    <h3 className="simulationCardTitle" style={{ marginBottom: 0 }}>Transformation Matrix</h3>
                    <div className="sim-controls-container" style={{ gridTemplateColumns: '1fr 1fr', background: 'none', padding: 0, marginTop: '1rem' }}>
                        {/* New dropdown for shape selection */}
                        <div className="sim-slider-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="shape-select">Select Shape:</label>
                            <select
                                id="shape-select"
                                value={selectedShapeType}
                                onChange={(e) => setSelectedShapeType(e.target.value as ShapeType | 'image')}
                                className="sim-select"
                            >
                                {Object.keys(shapes).map((shapeKey) => (
                                    <option key={shapeKey} value={shapeKey}>{shapeKey.charAt(0).toUpperCase() + shapeKey.slice(1)}</option>
                                ))}
                                <option value="image">Uploaded Image</option>
                            </select>
                        </div>
                        <div className="sim-slider-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="image-upload">Upload Image:</label>
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="form-group"
                            />
                        </div>
                        <div className="sim-slider-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="m00">a (x-scale): {matrix[0][0].toFixed(1)}</label>
                            <input id="m00" type="range" min="-2" max="2" step="0.1" value={matrix[0][0]} onChange={e => handleMatrixChange(0, 0, e.target.value)} className="form-group" />
                        </div>
                        <div className="sim-slider-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="m01">b (y-shear): {matrix[0][1].toFixed(1)}</label>
                            <input id="m01" type="range" min="-2" max="2" step="0.1" value={matrix[0][1]} onChange={e => handleMatrixChange(0, 1, e.target.value)} className="form-group" />
                        </div>
                        <div className="sim-slider-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="m10">c (x-shear): {matrix[1][0].toFixed(1)}</label>
                            <input id="m10" type="range" min="-2" max="2" step="0.1" value={matrix[1][0]} onChange={e => handleMatrixChange(1, 0, e.target.value)} className="form-group" />
                        </div>
                        <div className="sim-slider-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="m11">d (y-scale): {matrix[1][1].toFixed(1)}</label>
                            <input id="m11" type="range" min="-2" max="2" step="0.1" value={matrix[1][1]} onChange={e => handleMatrixChange(1, 1, e.target.value)} className="form-group" />
                        </div>
                    </div>
                </>
            }
            infoText="Adjust the matrix values to see how the purple square is transformed. The blue square is the original shape."
        />
    );
};