import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/index.module.css';

export const NotFound = () => {
    return (
        <Layout>
            <div className={styles.section} style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 className={styles.sectionTitle}>404 - Not Found</h1>
                <p className={styles.simulationDesc}>
                    Sorry, the page you are looking for does not exist.
                </p>
                <div style={{ marginTop: 'var(--space-md)' }}>
                    <Link href="/simulations" className={styles.ctaButton}>
                        Back to All Simulations
                    </Link>
                </div>
            </div>
        </Layout>
    );
};