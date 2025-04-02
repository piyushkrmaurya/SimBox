import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import styles from '@/styles/index.module.css'
import { simulations } from '@/data'

export default function SimulationsPage() {
    return (
        <>
            <Head>
                <title>Simulations | SimBox</title>
                <meta name="description" content="Browse all interactive educational simulations from SimBox." />
            </Head>

            <Layout>
                <div className={styles.welcomeHeader}>
                    <h1 className={styles.welcomeTitle}>All Simulations</h1>
                    <p className={styles.welcomeSubtitle}>Choose a simulation to start your learning journey.</p>
                </div>

                <div className={styles.simulationPath}>
                    {simulations.map((sim, index) => {
                        const isLive = sim.status === 'live';
                        const checkpointClass = `${styles.checkpoint} ${isLive ? styles.unlocked : styles.locked}`;
                        const iconClass = `${styles.checkpointIcon} ${sim.category === 'Math' ? styles.iconMath : sim.category === 'Physics' ? styles.iconPhysics : styles.iconChemistry}`;

                        const content = (
                            <>
                                <div className={iconClass}>
                                    {sim.icon}
                                </div>
                                <div className={styles.checkpointContent}>
                                    <h3 className={styles.checkpointTitle}>{sim.title}</h3>
                                    <p className={styles.checkpointDesc}>{sim.shortDescription}</p>
                                </div>
                            </>
                        );

                        return isLive ? (
                            <Link href={`/simulations/${sim.slug}`} key={sim.slug} className={checkpointClass}>
                                {content}
                            </Link>
                        ) : (
                            <div key={sim.slug} className={checkpointClass}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            </Layout>
        </>
    )
}
