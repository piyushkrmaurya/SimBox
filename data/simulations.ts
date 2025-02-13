import React, { ComponentType } from 'react';
import { CyclicQuadrilateral } from '@/components/CyclicQuadrilateral';
import { PythagoreanExplorer } from '@/components/PythagoreanExplorer';
import { UnitCircleExplorer } from '@/components/UnitCircleExplorer';
import { ProjectileMotionExplorer } from '@/components/ProjectileMotionExplorer';
import { GravityExplorer } from '@/components/GravityExplorer';
import { LensExplorer } from '@/components/LensExplorer';
import { PendulumExplorer } from '@/components/PendulumExplorer';
import { DoubleSlitExplorer } from '@/components/DoubleSlitExplorer';
import { GasLawsExplorer } from '@/components/GasLawsExplorer';
import { WaveMotionExplorer } from '@/components/WaveMotionExplorer';
import { LinearTransformationsExplorer } from '@/components/LinearTransformationsExplorer';

export type Simulation = {
    slug: string;
    title: string;
    description: string;
    shortDescription: string;
    component: ComponentType;
    icon: string;
    category: 'Math' | 'Physics' | 'Chemistry';
    status: 'live' | 'coming-soon';
};

export const simulations: Simulation[] = [
    {
        slug: 'cyclic-quadrilateral',
        title: 'Cyclic Quadrilateral Theorem',
        description: 'Explore the properties of a cyclic quadrilateral. Drag the vertices and the chord to see how the angles change. Discover the relationship between the angle at the center and the angle at the circumference.',
        shortDescription: 'Explore angles in a circle.',
        component: CyclicQuadrilateral,
        icon: '📐',
        category: 'Math',
        status: 'live',
    },
    {
        slug: 'pythagorean-theorem',
        title: 'Pythagorean Theorem Explorer',
        description: "Drag the orange vertices of the right-angled triangle to change the lengths of sides 'a' and 'b'. Observe how the areas of the squares change and how a² + b² always equals c².",
        shortDescription: 'Visualize a² + b² = c².',
        component: PythagoreanExplorer,
        icon: '📏',
        category: 'Math',
        status: 'live',
    },
    {
        slug: 'unit-circle',
        title: 'Unit Circle Explorer',
        description: 'Drag the point around the circle to change the angle (θ). Observe how the values for cosine (orange), sine (purple), and tangent (blue) change in real-time.',
        shortDescription: 'Explore sin, cos, and tan.',
        component: UnitCircleExplorer,
        icon: '⭕',
        category: 'Math',
        status: 'live',
    },
    {
        slug: 'projectile-motion',
        title: 'Projectile Motion Simulator',
        description: "Adjust the initial velocity and launch angle using the sliders, then press \"Launch\" to see the projectile's trajectory. The simulation will calculate the maximum height, range, and total flight time.",
        shortDescription: 'Simulate cannonball trajectories.',
        component: ProjectileMotionExplorer,
        icon: '⚛️',
        category: 'Physics',
        status: 'live',
    },
    {
        slug: 'gravity-simulation',
        title: 'Gravity Simulation',
        description: 'Explore the laws of universal gravitation. Adjust the mass and radius of two celestial bodies and observe their orbital mechanics in real-time. Reset the simulation to see the effect of your changes.',
        shortDescription: 'Simulate gravitational orbits.',
        component: GravityExplorer,
        icon: '🪐',
        category: 'Physics',
        status: 'live',
    },
    {
        slug: 'lens-ray-diagram',
        title: 'Lens & Ray Diagram Explorer',
        description: 'Explore how convex and concave lenses form images. Drag the object to see how the image position and size change. Adjust the focal length and lens type to understand the principles of optics.',
        shortDescription: 'Explore convex & concave lenses.',
        component: LensExplorer,
        icon: '🔬',
        category: 'Physics',
        status: 'live',
    },
    {
        slug: 'pendulum-simulation',
        title: 'Pendulum Simulator',
        description: 'Explore the physics of a simple pendulum. Adjust the length of the string and the force of gravity to see how they affect the period of oscillation. Reset the simulation to apply your changes.',
        shortDescription: 'Simulate a simple pendulum.',
        component: PendulumExplorer,
        icon: '🕰️',
        category: 'Physics',
        status: 'live',
    },
    {
        slug: 'double-slit-experiment',
        title: 'Double-Slit Experiment',
        description: 'Visualize the wave interference pattern from Young\'s double-slit experiment. Adjust the wavelength of light, the distance between the slits, and the width of the slits to see how the interference fringes change.',
        shortDescription: 'Visualize wave interference.',
        component: DoubleSlitExplorer,
        icon: '〰️',
        category: 'Physics',
        status: 'live',
    },
    {
        slug: 'gas-laws-simulator',
        title: 'Gas Laws Simulator',
        description: 'Explore the relationships between pressure, volume, and temperature of an ideal gas. Adjust the parameters using the sliders and observe how the gas behaves according to Boyle\'s Law, Charles\' Law, and Avogadro\'s Law.',
        shortDescription: 'Explore the ideal gas laws.',
        component: GasLawsExplorer,
        icon: '⚗️',
        category: 'Chemistry',
        status: 'live',
    },
    {
        slug: 'wave-motion',
        title: 'Wave Motion Explorer',
        description: 'Explore the properties of sine waves. Adjust the amplitude, frequency, phase shift, and speed to understand how each parameter affects the wave\'s shape and movement.',
        shortDescription: 'Explore wave properties.',
        component: WaveMotionExplorer,
        icon: '🌊',
        category: 'Physics',
        status: 'live',
    },
    {
        slug: 'molecules',
        title: 'Molecules',
        description: 'Coming soon! Explore the structure and bonding of various molecules.',
        shortDescription: 'Coming soon!',
        component: () => React.createElement('div', null, 'Coming Soon!'),
        icon: '⚛️',
        category: 'Chemistry',
        status: 'coming-soon',
    },
    {
        slug: 'linear-transformations',
        title: 'Linear Transformations Explorer',
        description: 'See how a matrix transforms shapes in a 2D plane. Adjust the matrix values and watch how a shape is scaled, rotated, sheared, or reflected. Animate the continuous morphing from the original shape to its transformed version.',
        shortDescription: 'Visualize 2D matrix transformations.',
        component: LinearTransformationsExplorer,
        icon: '🪄',
        category: 'Math',
        status: 'live',
    }
];
