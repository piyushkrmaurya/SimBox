"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ControlsContainer } from "./controls/ControlsContainer";
import { ControlsConfig, ControlValue } from "../types/controls";
import { SimulationLayout } from "./SimulationLayout";

const controls: ControlsConfig = {
    wavelength: {
        type: 'range', id: 'wavelength', label: 'Wavelength (λ)',
        min: 5, max: 20, step: 0.5, unit: ' nm', defaultValue: 10
    },
    slitSeparation: {
        type: 'range', id: 'slit-separation', label: 'Slit Separation (d)',
        min: 20, max: 100, step: 1, unit: ' px', defaultValue: 50
    },
    slitWidth: {
        type: 'range', id: 'slit-width', label: 'Slit Width (a)',
        min: 2, max: 20, step: 1, unit: ' px', defaultValue: 10
    }
};

export function DoubleSlitExplorer() {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSizeRef = useRef({ width: 0, height: 0 });

    const [values, setValues] = useState<{ [key: string]: ControlValue }>({
        wavelength: controls.wavelength.defaultValue,
        slitSeparation: controls.slitSeparation.defaultValue,
        slitWidth: controls.slitWidth.defaultValue,
    });

    const { wavelength, slitSeparation, slitWidth } = values as {
        wavelength: number;
        slitSeparation: number;
        slitWidth: number;
    };

    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        const { width, height } = canvasSizeRef.current;
        if (!ctx || !width || !height) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(0, 0, width, height);

        // --- Simulation Parameters ---
        const slitX = width * 0.2; // X position of the slits
        const screenX = width * 0.8; // X position of the screen
        const screenWidth = width * 0.15;
        const d = screenX - slitX; // Distance from slits to screen
        const A = 255; // Amplitude of the light
        const I_max = A ** 2;

        // --- Draw the Slit Barrier ---
        ctx.fillStyle = "white";
        const barrierWidth = 8;
        // Center of the two slits
        const centerY = height / 2;
        // Slit 1 is centered at centerY - slitSeparation / 2
        // Slit 2 is centered at centerY + slitSeparation / 2
        const slit1_top = centerY - slitSeparation / 2 - slitWidth / 2;
        const slit1_bottom = centerY - slitSeparation / 2 + slitWidth / 2;
        const slit2_top = centerY + slitSeparation / 2 - slitWidth / 2;
        const slit2_bottom = centerY + slitSeparation / 2 + slitWidth / 2;

        // Draw the barrier parts
        ctx.fillRect(slitX - barrierWidth / 2, 0, barrierWidth, slit1_top); // Top part
        ctx.fillRect(slitX - barrierWidth / 2, slit1_bottom, barrierWidth, slit2_top - slit1_bottom); // Middle part
        ctx.fillRect(slitX - barrierWidth / 2, slit2_bottom, barrierWidth, height - slit2_bottom); // Bottom part

        // --- Draw the Interference Pattern ---
        for (let y = 0; y < height; y++) {
            // Path from slit 1 to point y on the screen
            const dy1 = y - (slit1_top + slitWidth / 2);
            const path1 = Math.sqrt(d * d + dy1 * dy1);

            // Path from slit 2 to point y on the screen
            const dy2 = y - (slit2_top + slitWidth / 2);
            const path2 = Math.sqrt(d * d + dy2 * dy2);

            const path_diff = Math.abs(path1 - path2);
            const phase_diff = (2 * Math.PI * path_diff) / wavelength;

            // Calculate the intensity using the interference formula
            const I = I_max * Math.pow(Math.cos(phase_diff / 2), 2);

            // Set the color and alpha based on intensity and wavelength
            const intensityFactor = I / I_max;
            ctx.fillStyle = `hsl(${380 + wavelength * 2}, 100%, 50%)`; // Color changes with wavelength
            ctx.globalAlpha = intensityFactor;

            // Draw a line for the fringe
            ctx.fillRect(screenX, y, screenWidth, 1);
        }
        ctx.globalAlpha = 1.0; // Reset alpha

    }, [slitSeparation, slitWidth, wavelength]);

    const handleCanvasSetup = useCallback(({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => {
        ctxRef.current = ctx;
        canvasSizeRef.current = { width, height };
        draw(); // Draw on setup
    }, [draw]);

    useEffect(() => {
        // This useEffect is to re-draw when parameters change,
        // but not for animation. The initial draw is in handleCanvasSetup.
        // The animation loop is not needed here as it's not an animated simulation.
        const timeoutId = setTimeout(() => {
            if (ctxRef.current) draw();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [draw]);

    return (
        <SimulationLayout
            setup={handleCanvasSetup}
            canvasHeight={500}
            tools={
                <ControlsContainer config={controls} values={values} onChange={(key, value) => setValues(prev => ({ ...prev, [key]: value }))} columns={3} />
            }
            canvas={
                (ref) => <canvas ref={ref} />
            }
            infoText="This simulation shows the interference pattern created by light passing through two slits. Adjust the parameters to see how the pattern changes."
        />
    );
}