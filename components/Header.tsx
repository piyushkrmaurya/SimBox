import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.css';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navigation = [
        { href: '/', label: 'Home' },
        { href: '/simulations', label: 'Simulations' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <>
            <header className={styles.header} id="top">
                <Link href="/" className={styles.logoLink}>
                    <span className={styles.logoEmoji} role="img" aria-label="Atom Emoji">
                        ⚛️
                    </span>
                    <span className={styles.logoText}>SimBox</span>
                </Link>

                <button
                    id="mobile-hamburger"
                    className={`${styles.mobileHamburger} ${isMenuOpen ? styles.active : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Open menu"
                >
                    <span /><span /><span />
                </button>

                <nav
                    id="mobile-menu"
                    className={`${styles.mobileMenu} ${isMenuOpen ? styles.active : ''}`}
                >
                    <ul>
                        {navigation.map((item, index) => (
                            <li key={index} onClick={() => setIsMenuOpen(false)}>
                                <Link href={item.href}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>
        </>
    )
}
