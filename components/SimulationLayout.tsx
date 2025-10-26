import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import styles from '../styles/simulation.module.css';

type CanvasSetupPayload = {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
};

type SimulationLayoutProps = {
    canvas: (ref: React.RefObject<HTMLCanvasElement>) => React.ReactNode;
    setup: (payload: CanvasSetupPayload) => void;
    tools?: React.ReactNode;
    info?: React.ReactNode;
    infoText?: string;
    canvasHeight?: number;
    className?: string;
};

export function SimulationLayout({ canvas, setup, tools, info, infoText, canvasHeight, className }: SimulationLayoutProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const layoutRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            layoutRef.current?.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const setupCanvas = useCallback(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;

        const container = canvasEl.parentElement as HTMLElement;
        if (!container) return;

        let height;
        if (canvasHeight === -1) {
            height = container.clientWidth; // Square canvas
        } else if (canvasHeight) {
            height = canvasHeight; // Fixed height
        } else {
            height = container.clientWidth * (9 / 16); // Default to 16:9 aspect ratio
        }

        const size = {
            width: container.clientWidth,
            height: height,
        };
        const dpr = window.devicePixelRatio || 1;

        canvasEl.width = size.width * dpr;
        canvasEl.height = size.height * dpr;
        canvasEl.style.width = `${size.width}px`;
        canvasEl.style.height = `${size.height}px`;

        const ctx = canvasEl.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);
        setup({ ctx, width: size.width, height: size.height });
    }, [setup, canvasHeight]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        const container = canvasEl?.parentElement;
        if (!container) return;

        // Use ResizeObserver for more efficient resize handling
        const resizeObserver = new ResizeObserver(() => {
            setupCanvas();
        });
        resizeObserver.observe(container);

        // Initial setup
        setupCanvas();

        return () => resizeObserver.disconnect();
    }, [setupCanvas]);

    return (
        <div ref={layoutRef} className={`${styles.simLayoutWrapper} ${isFullscreen ? styles.simLayoutWrapperFullscreen : ''} ${className || ''}`}>
            <div className={styles.simMainContent}>
                <div className={styles.simCanvasContainer}>
                    {canvas(canvasRef)}
                    <button onClick={toggleFullscreen} className={styles.simFullscreenButton} title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>
            <div className={`${styles.simSidebar} ${isFullscreen ? styles.simSidebarFullscreen : ''}`}>
                {tools && <div className={styles.simControlsContainer}>{tools}</div>}
                {info && <div className={styles.simResultsContainer}>{info}</div>}
                {infoText && <p className={styles.simInfoText}>{infoText}</p>}
            </div>
        </div>
    );
}