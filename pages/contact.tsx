import Head from 'next/head'
import Layout from '@/components/Layout'
import styles from '@/styles/index.module.css'

export default function ContactPage() {
    return (
        <>
            <Head>
                <title>Contact Us | SimBox</title>
                <meta name="description" content="Get in touch with the SimBox team." />
            </Head>

            <Layout>
                <div className={styles.sectionHeader} style={{ padding: 'var(--space-lg)', paddingBottom: 0 }}>
                    <h1 className={styles.sectionTitle}>Contact Us</h1>
                </div>

                <div className={styles.simulationWrapper}>
                    <p className={styles.simulationDesc} style={{ marginTop: 0 }}>We&rsquo;d love to hear from you!</p>
                    <p className={styles.simulationDesc}>
                        Have a question, feedback, or a suggestion for a new simulation? Reach out to us.
                    </p>
                    <p className={styles.simulationDesc}>Email us at: <a href="mailto:hello@SimBox.app" className={styles.copyLinkButton} style={{ paddingLeft: 0 }}>hello@SimBox.app</a></p>
                </div>
            </Layout>
        </>
    )
}