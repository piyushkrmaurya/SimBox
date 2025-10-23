import Head from 'next/head'
import Layout from '@/components/Layout'
import styles from '@/styles/index.module.css'

export default function AboutPage() {
    return (
        <>
            <Head>
                <title>About Us | SimBox</title>
                <meta name="description" content="Learn about SimBox's mission to make education interactive and engaging." />
            </Head>

            <Layout>
                <div className={styles.sectionHeader} style={{ padding: 'var(--space-lg)', paddingBottom: 0 }}>
                    <h1 className={styles.sectionTitle}>About SimBox</h1>
                </div>

                <div className={styles.simulationWrapper}>
                    <p className={styles.simulationDesc} style={{ marginTop: 0 }}>
                        Welcome to SimBox, where we believe in the power of interactive learning. Our mission is to transform complex educational concepts into engaging, hands-on simulations that are accessible to everyone, everywhere.
                    </p>
                    <p className={styles.simulationDesc}>
                        We are a passionate team of educators, developers, and designers dedicated to creating high-quality learning tools. We aim to spark curiosity and foster a deeper understanding by allowing learners to &ldquo;learn by doing.&rdquo;
                    </p>
                </div>
            </Layout>
        </>
    )
}