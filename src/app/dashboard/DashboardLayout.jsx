'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/dashboard/promises', label: 'Promises', icon: '🤝' },
    { href: '/dashboard/reminders', label: 'Reminders', icon: '⏰' },
    { href: '/dashboard/credits', label: 'Credits', icon: '💝' },
    { href: '/dashboard/notes', label: 'Notes', icon: '📝' },
];

export default function DashboardLayout({ children, user }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' });
        router.push('/');
    };

    const userEmoji = user.userId === 'shiv' ? '💙' : '💜';

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <Link href="/dashboard" className={styles.logo}>
                        <span className="accent-text">Rashii</span> 💕
                    </Link>
                    <div className={styles.userInfo}>
                        <span className={styles.greeting}>Hi, {user.name}! {userEmoji}</span>
                        <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Logout">
                            👋
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.main}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
