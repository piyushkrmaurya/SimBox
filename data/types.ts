import { ComponentType } from 'react';

/**
 * Defines the category for a single simulation.
 */
export type SimulationCategory = 'Math' | 'Physics' | 'Chemistry' | 'Biology';

/**
 * Represents a single, self-contained simulation in the master list.
 * The 'slug' is its unique ID.
 */
export type Simulation = {
    slug: string;
    title: string;
    description: string;
    shortDescription: string;
    component: ComponentType;
    icon: string;
    category: SimulationCategory;
    status: 'live' | 'coming-soon';
};

/**
 * Represents a chapter within a subject.
 * It links to simulations using their 'slug' from the master list.
 */
export type CurriculumChapter = {
    title: string;
    slug: string;
    simulationSlugs: string[];
};

/**
 * Represents a subject within a grade.
 */
export type CurriculumSubject = {
    title: string;
    chapters: CurriculumChapter[];
};

/**
 * Represents a full curriculum for a single grade.
 */
export type CurriculumGrade = {
    title: string;
    subjects: {
        science: CurriculumSubject;
        math: CurriculumSubject;
    };
};

/**
 * The top-level object containing all curriculum data.
 */
export type Curriculum = {
    class6: CurriculumGrade;
};