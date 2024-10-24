import React, { useState, useRef, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

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

    useEffect(() => {
        const setupCanvas = () => {
            const canvasEl = canvasRef.current;
            if (!canvasEl) return;
            const container = canvasEl.parentElement as HTMLElement;
            const size = {
                width: container.clientWidth,
                height: canvasHeight === -1 ? container.clientWidth
                    : (canvasHeight || container.clientWidth * (window.innerHeight / window.innerWidth)),
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
        };

        setupCanvas();
        window.addEventListener("resize", setupCanvas);
        return () => window.removeEventListener("resize", setupCanvas);
    }, [setup, isFullscreen, canvasHeight]);

    return (
        <div ref={layoutRef} className={`sim-layout-wrapper ${isFullscreen ? 'sim-layout-wrapper--fullscreen' : ''} ${className || ''}`}>
            <div className="sim-main-content">
                <div className="sim-canvas-container">
                    {canvas(canvasRef)}
                    <button onClick={toggleFullscreen} className="sim-fullscreen-button" title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>
            <div className={`sim-sidebar ${isFullscreen ? 'sim-sidebar--fullscreen' : ''}`}>
                {tools && <div className="sim-controls-container">{tools}</div>}
                {info && <div className="sim-results-container">{info}</div>}
                {infoText && <p className="sim-info-text">{infoText}</p>}
            </div>
        </div>
    );
}