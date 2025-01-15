import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import styles from '@/styles/index.module.css'
import { simulations, Simulation } from '@/data/simulations'

export default function HomePage() {
  // Group simulations by category
  const groupedSimulations = simulations.reduce((acc, sim) => {
    if (sim.status === 'live') {
      (acc[sim.category] = acc[sim.category] || []).push(sim);
    }
    return acc;
  }, {} as Record<Simulation['category'], Simulation[]>);

  const categories = Object.keys(groupedSimulations) as Simulation['category'][];

  return (
    <>
      <Head>
        <title>SimBox | Interactive Simulations: Stop memorizing, Start Understanding</title>
        <meta name="description" content="Engage with complex concepts through hands-on, mobile-first educational simulations. Learn by doing with SimBox." />
      </Head>

      <Layout>
        <div className={styles.welcomeHeader}>
          <h1 className={styles.welcomeTitle}>Interactive Simulations</h1>
          <p className={styles.welcomeSubtitle}>
            Stop memorizing, Start Understanding!
          </p>
          <h1 className={styles.welcomeEmoji} role="img" aria-label="Waving Hand Emoji">👋
          </h1>
        </div>

        {categories.map(category => (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>{category}</h2>
            <div className={styles.simulationGrid}>
              {groupedSimulations[category].map(sim => (
                <Link href={`/simulations/${sim.slug}`} key={sim.slug} className={styles.simulationCard}>
                  <div className={`${styles.simulationCardIcon} ${styles[`icon${category}`]}`}>{sim.icon}</div>
                  <div className={styles.simulationCardContent}>
                    <h3 className={styles.simulationCardTitle}>{sim.title}</h3>
                    <p className={styles.simulationCardDesc}>{sim.shortDescription}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </Layout>
    </>
  )
}