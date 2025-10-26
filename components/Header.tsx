import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Header.module.css';
import { curriculum } from '@/data';

// No props needed anymore

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const simIcons = [
        { emoji: '⚛️', label: 'Physics' },
        { emoji: '🧮', label: 'Math' },
        { emoji: '🧪', label: 'Chemistry' },
    ]

    return (
        <>
            <header className={styles.header} id="top">
                <div className={styles.headerMain}>
                    <Link href="/" className={styles.logoLink}>
                        <span className={styles.logoEmoji} role="img" aria-label="Atom Emoji">
                            ⚛️
                        </span>
                        <span className={styles.logoText}>SimBox</span>
                    </Link>

                    <div className={styles.floatingIcons}>
                        {simIcons.map((icon, index) => (
                            <div key={index} className={styles.floatingIcon} style={{
                                '--delay': `${index * 2}s`,
                                '--distance': `${20 + Math.random() * 40}px`
                            } as React.CSSProperties}>
                                <span className={styles.iconEmoji} role="img" aria-label={icon.label}>
                                    {icon.emoji}
                                </span>
                                <span className={styles.iconLabel}>{icon.label}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        id="mobile-hamburger"
                        className={`${styles.mobileHamburger} ${isMenuOpen ? styles.active : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Open menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </header>
        </>
    )
}
