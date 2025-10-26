import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './InteractiveHero.module.css';
import { simulations } from '@/data';
import { curriculum } from '@/data';
import type { Simulation } from '@/data/types';
import Header from './Header';

interface SimIcon {
    x: number;
    y: number;
    vx: number;
    vy: number;
    scale: number;
    icon: string;
    title: string;
    slug: string;
    baseScale: number;
    glowIntensity: number;
    pulseOffset: number;
    speed: number;
    category: string;
}

export default function InteractiveHero() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const iconsRef = useRef<SimIcon[]>([]);
    const mousePosRef = useRef({ x: 0, y: 0 });
    const isMouseDownRef = useRef(false);
    const rafRef = useRef<number>();
    const resizeTimeoutRef = useRef<NodeJS.Timeout>();
    const hoveredIconRef = useRef<SimIcon | null>(null);
    const [classFilter, setClassFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');

    const initIcons = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scale = window.devicePixelRatio;
        const filteredSimulations = simulations.filter((sim: Simulation) => {
            if (sim.status !== 'live') return false;

            if (classFilter === 'all') return true;

            // Check if the simulation appears in the selected class curriculum
            const selectedGrade = curriculum[classFilter as keyof typeof curriculum];
            if (!selectedGrade) return false;

            if (subjectFilter === 'all') {
                // Check if simulation appears in any subject of the selected class
                return Object.values(selectedGrade.subjects).some(subject =>
                    subject.chapters.some(chapter =>
                        chapter.simulationSlugs.includes(sim.slug)
                    )
                );
            }

            // Check if simulation appears in the selected subject
            const selectedSubjectData = selectedGrade.subjects[subjectFilter as keyof typeof selectedGrade.subjects];
            return selectedSubjectData.chapters.some(chapter =>
                chapter.simulationSlugs.includes(sim.slug)
            );
        });

        iconsRef.current = filteredSimulations.map((sim: Simulation, index: number) => {
            // Random starting positions in bottom 75% of canvas
            const x = Math.random() * (canvas.width / scale);
            const y = (canvas.height / scale * 0.25) + (Math.random() * (canvas.height / scale * 0.75));

            return {
                x,
                y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                scale: 1,
                baseScale: 1,
                icon: sim.icon,
                title: sim.title,
                slug: sim.slug,
                glowIntensity: 0.8,
                pulseOffset: Math.random() * Math.PI * 2,
                speed: 0.8,
                category: sim.category
            };
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        ctxRef.current = canvas.getContext('2d');
        const ctx = ctxRef.current;
        if (!ctx) return;

        const resizeCanvas = () => {
            const scale = window.devicePixelRatio;
            canvas.width = canvas.offsetWidth * scale;
            canvas.height = canvas.offsetHeight * scale;
            ctx.scale(scale, scale);
            initIcons();
        };

        const render = () => {
            if (!canvas || !ctx) return;

            const scale = window.devicePixelRatio;
            ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);

            const icons = iconsRef.current;
            const mousePos = mousePosRef.current;

            // Draw connections first
            for (const icon of icons) {
                for (const other of icons) {
                    if (icon === other) continue;
                    const dx = icon.x - other.x;
                    const dy = icon.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 200) {
                        ctx.beginPath();
                        ctx.moveTo(icon.x, icon.y);
                        ctx.lineTo(other.x, other.y);
                        const gradient = ctx.createLinearGradient(icon.x, icon.y, other.x, other.y);
                        const alpha = 0.15 * (1 - distance / 200);
                        gradient.addColorStop(0, `rgba(122, 162, 247, ${alpha})`);
                        gradient.addColorStop(1, `rgba(187, 154, 247, ${alpha})`);
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
            }

            // Update and draw icons
            for (const icon of icons) {
                const time = Date.now() / 1000;
                const dx = icon.x - mousePos.x;
                const dy = icon.y - mousePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Check if icon is being hovered
                if (distance < 40) {
                    icon.scale = Math.min(1.5, icon.scale + 0.1);
                    icon.glowIntensity = Math.min(1.5, icon.glowIntensity + 0.1);
                    hoveredIconRef.current = icon;
                } else {
                    icon.scale = Math.max(1, icon.scale - 0.1);
                    icon.glowIntensity = Math.max(0.8, icon.glowIntensity - 0.05);
                    if (hoveredIconRef.current === icon) {
                        hoveredIconRef.current = null;
                    }
                }

                // Add natural movement
                const noiseX = Math.sin(time + icon.x * 0.01) * 0.2;
                const noiseY = Math.cos(time + icon.y * 0.01) * 0.2;

                // Update position with velocity
                icon.x += icon.vx + noiseX;
                icon.y += icon.vy + noiseY;

                // Bounce off bounds with slight dampening
                if (icon.x < 50 || icon.x > canvas.width / scale - 50) {
                    icon.vx *= -0.9;
                    icon.x = Math.max(50, Math.min(canvas.width / scale - 50, icon.x));
                }
                // Keep in bottom 75% of screen
                const minY = (canvas.height / scale) * 0.25 + 50;
                const maxY = canvas.height / scale - 50;
                if (icon.y < minY || icon.y > maxY) {
                    icon.vy *= -0.9;
                    icon.y = Math.max(minY, Math.min(maxY, icon.y));
                }

                // Draw icon with glow
                const fontSize = 32 * icon.scale;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Draw glow
                const glowSize = 20 * icon.glowIntensity;
                ctx.shadowColor = '#7aa2f7';
                ctx.shadowBlur = glowSize;
                ctx.fillText(icon.icon, icon.x, icon.y);
                ctx.shadowBlur = 0;

                // Draw icon
                ctx.fillStyle = '#ffffff';
                ctx.fillText(icon.icon, icon.x, icon.y);
            }

            // Draw hover label
            if (hoveredIconRef.current) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(hoveredIconRef.current.title, hoveredIconRef.current.x, hoveredIconRef.current.y - 45);
            }

            rafRef.current = requestAnimationFrame(render);
        };

        const handleResize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(resizeCanvas, 250);
        };

        window.addEventListener('resize', handleResize);
        resizeCanvas();
        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [classFilter, subjectFilter]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        mousePosRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mousePosRef.current = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        isMouseDownRef.current = true;
        handleTouchMove(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if we clicked on an icon
        for (const icon of iconsRef.current) {
            const dx = icon.x - clickX;
            const dy = icon.y - clickY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 40) {
                router.push(`/simulations/${icon.slug}`);
                break;
            }
        }
    };

    const handleFilterChange = (newClassFilter: string, newSubjectFilter: string) => {
        setClassFilter(newClassFilter);
        setSubjectFilter(newSubjectFilter);
        initIcons();
    };

    return (
        <div className={styles.heroWrapper}>
            <canvas
                ref={canvasRef}
                className={styles.heroCanvas}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                onMouseDown={() => isMouseDownRef.current = true}
                onMouseUp={() => isMouseDownRef.current = false}
                onMouseLeave={() => isMouseDownRef.current = false}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => isMouseDownRef.current = false}
                onTouchCancel={() => isMouseDownRef.current = false}
            />
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>Interactive Simulations</h1>
                <p className={styles.heroSubtitle}>
                    Stop memorizing, Start Understanding!
                </p>
                <div className={styles.heroLogo} aria-label="Atom Logo">
                    <span className={styles.atomEmoji} role="img" aria-label="Atom Emoji">⚛️</span>
                </div>
            </div>
        </div>
    );
}