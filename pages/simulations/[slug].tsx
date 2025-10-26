import Head from 'next/head';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Layout from '@/components/Layout';
import { NotFound } from '@/components/NotFound';
import styles from '@/styles/simulation.module.css';
import { simulations } from '@/data';
import type { Simulation } from '@/data/types';

// We only pass the serializable parts of the Simulation object from getStaticProps
type SerializableSimulation = Omit<Simulation, 'component'>;

type SimulationPageProps = {
    simulation: SerializableSimulation | null;
};

const SimulationPage: NextPage<SimulationPageProps> = ({ simulation }) => {
    if (!simulation) {
        return <NotFound />;
    }

    // Find the full simulation object (including the component) on the client side
    const fullSimulation = simulations.find(s => s.slug === simulation.slug);
    const ExplorerComponent = fullSimulation?.component;

    return (
        <>
            <Head>
                <title>{simulation.title} | SimBox</title>
                <meta name="description" content={simulation.description} />
            </Head>

            <Layout>
                {ExplorerComponent && <ExplorerComponent />}
            </Layout>
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = simulations.filter(s => s.status === 'live').map(sim => ({
        params: { slug: sim.slug },
    }));
    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const slug = params?.slug;
    const simulationData = simulations.find(sim => sim.slug === slug);

    if (!simulationData) {
        return { props: { simulation: null } };
    }

    // Omit the non-serializable 'component' property
    const { component, ...simulation } = simulationData;

    return { props: { simulation } };
};

export default SimulationPage;