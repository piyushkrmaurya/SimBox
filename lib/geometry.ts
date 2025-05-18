export type Point = { x: number; y: number };

export function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function calculateAngle(p_vertex: Point, p1: Point, p2: Point): number {
    const a = distance(p1, p2);
    const b = distance(p_vertex, p2);
    const c = distance(p_vertex, p1);
    if (2 * b * c === 0) return 0;
    const cosAngle = (b * b + c * c - a * a) / (2 * b * c);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    return angleRad * (180 / Math.PI);
}