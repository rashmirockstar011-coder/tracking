'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

const NAV_CARDS = [
    {
        href: '/dashboard/promises',
        icon: '🤝',
        title: 'Promises',
        desc: 'Track our commitments'
    },
    {
        href: '/dashboard/reminders',
        icon: '⏰',
        title: 'Reminders',
        desc: 'Never forget important dates'
    },
    {
        href: '/dashboard/credits',
        icon: '💝',
        title: 'Credits',
        desc: 'Our IOUs and favors'
    },
    {
        href: '/dashboard/notes',
        icon: '📝',
        title: 'Notes',
        desc: 'Shared thoughts & ideas'
    },
];

export default function DashboardHome() {
    const [stats, setStats] = useState({
        promises: 0,
        reminders: 0,
        credits: 0,
        notes: 0
    });

    useEffect(() => {
        // Fetch stats from API
        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className={styles.pageContainer}>
            {/* Welcome Section */}
            <div className={styles.welcome}>
                <h1 className={styles.welcomeTitle}>
                    Welcome Back! 💕
                </h1>
                <p className={styles.welcomeSubtitle}>
                    What would you like to do today?
                </p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🤝</div>
                    <div className={styles.statValue}>{stats.promises}</div>
                    <div className={styles.statLabel}>Active Promises</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⏰</div>
                    <div className={styles.statValue}>{stats.reminders}</div>
                    <div className={styles.statLabel}>Upcoming Reminders</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💝</div>
                    <div className={styles.statValue}>{stats.credits}</div>
                    <div className={styles.statLabel}>Open Credits</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📝</div>
                    <div className={styles.statValue}>{stats.notes}</div>
                    <div className={styles.statLabel}>Shared Notes</div>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className={styles.navGrid}>
                {NAV_CARDS.map((card) => (
                    <Link key={card.href} href={card.href} className={styles.navCard}>
                        <span className={styles.navCardIcon}>{card.icon}</span>
                        <span className={styles.navCardTitle}>{card.title}</span>
                        <span className={styles.navCardDesc}>{card.desc}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
