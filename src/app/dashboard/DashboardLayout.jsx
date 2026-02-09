'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Heart, Bell, Wallet, FileText, LogOut } from 'lucide-react';
import styles from './dashboard.module.css';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/promises', label: 'Promises', icon: Heart },
    { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
    { href: '/dashboard/credits', label: 'Credits', icon: Wallet },
    { href: '/dashboard/notes', label: 'Notes', icon: FileText },
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
                            <LogOut size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={`${styles.main} page-enter`}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 1.5}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
