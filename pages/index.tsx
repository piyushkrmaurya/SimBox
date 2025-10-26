import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import InteractiveHero from '@/components/InteractiveHero';
import styles from '@/styles/index.module.css';
import { simulations as allSimulations, curriculum } from '@/data';
import type { Simulation } from '@/data';

export default function HomePage() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const liveSimulations = useMemo(() => allSimulations.filter(sim => sim.status === 'live'), []);

  const filteredSimulationsByChapter = useMemo(() => {
    if (selectedClass === 'all') {
      // When no class is selected, group by category
      const groupedByCategory = liveSimulations.reduce((acc, sim) => {
        if (!acc[sim.category]) {
          acc[sim.category] = {
            title: sim.category,
            simulations: []
          };
        }
        acc[sim.category].simulations.push(sim);
        return acc;
      }, {} as Record<string, { title: string; simulations: Simulation[] }>);

      return Object.values(groupedByCategory);
    }

    const classData = curriculum[selectedClass as keyof typeof curriculum];
    if (!classData) return [];

    if (selectedSubject === 'all') {
      // Group all simulations by their respective chapters across subjects
      return Object.values(classData.subjects).flatMap(subject =>
        subject.chapters.map(chapter => {
          const chapterSims = liveSimulations.filter(sim =>
            chapter.simulationSlugs.includes(sim.slug)
          );
          return {
            title: chapter.title,
            simulations: chapterSims
          };
        }).filter(group => group.simulations.length > 0)
      );
    } else {
      const subjectData = classData.subjects[selectedSubject as keyof typeof classData.subjects];
      if (!subjectData) return [];

      // Group simulations by chapters within the selected subject
      return subjectData.chapters.map(chapter => {
        const chapterSims = liveSimulations.filter(sim =>
          chapter.simulationSlugs.includes(sim.slug)
        );
        return {
          title: chapter.title,
          simulations: chapterSims
        };
      }).filter(group => group.simulations.length > 0);
    }
  }, [selectedClass, selectedSubject, liveSimulations]);

  // Get available subjects for the selected class to dynamically populate the subject filter
  const availableSubjects = selectedClass !== 'all'
    ? Object.keys(curriculum[selectedClass as keyof typeof curriculum].subjects)
    : [];

  return (
    <>
      <Head>
        <title>SimBox | Interactive Simulations: Stop memorizing, Start Understanding</title>
        <meta name="description" content="Engage with complex concepts through hands-on, mobile-first educational simulations. Learn by doing with SimBox." />
      </Head>

      <Layout>
        <InteractiveHero />

        {/* --- Filters --- */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Find a Simulation</h2>
          <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
              <label htmlFor="class-filter">Class</label>
              <select id="class-filter" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject('all'); }} className={styles.filterSelect}>
                <option value="all">All Classes</option>
                {Object.keys(curriculum).map(classKey => (
                  <option key={classKey} value={classKey}>{curriculum[classKey as keyof typeof curriculum].title}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="subject-filter">Subject</label>
              <select id="subject-filter" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={styles.filterSelect} disabled={selectedClass === 'all'}>
                <option value="all">All Subjects</option>
                {availableSubjects.map(subjectKey => (
                  <option key={subjectKey} value={subjectKey}>
                    {curriculum[selectedClass as keyof typeof curriculum].subjects[subjectKey as keyof typeof curriculum[keyof typeof curriculum]['subjects']].title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* --- Filtered Simulations Grid --- */}
        <section className={styles.section}>
          {filteredSimulationsByChapter.length > 0 ? (
            filteredSimulationsByChapter.map((chapter, index) => (
              <div key={index} className={styles.chapterSection}>
                <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                <div className={styles.simulationGrid}>
                  {chapter.simulations.map(sim => (
                    <Link href={`/simulations/${sim.slug}`} key={sim.slug} className={styles.simulationCard}>
                      <div className={`${styles.simulationCardIcon} ${styles[`icon${sim.category}`]}`}>{sim.icon}</div>
                      <div className={styles.simulationCardContent}>
                        <h3 className={styles.simulationCardTitle}>{sim.title}</h3>
                        <p className={styles.simulationCardDesc}>{sim.shortDescription}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className={styles.welcomeSubtitle}>No simulations found for the selected filters.</p>
          )}
        </section>
      </Layout>
    </>
  )
}