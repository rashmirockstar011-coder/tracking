'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Bell, Wallet, FileText, Sparkles } from 'lucide-react';
import styles from './dashboard.module.css';
import quotes from '@/data/quotes.json';

const NAV_CARDS = [
    {
        href: '/dashboard/promises',
        icon: Heart,
        title: 'Promises',
        desc: 'Track our commitments',
        gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
    },
    {
        href: '/dashboard/reminders',
        icon: Bell,
        title: 'Reminders',
        desc: 'Never forget important dates',
        gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
    },
    {
        href: '/dashboard/credits',
        icon: Wallet,
        title: 'Credits',
        desc: 'Our IOUs and favors',
        gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)'
    },
    {
        href: '/dashboard/notes',
        icon: FileText,
        title: 'Notes',
        desc: 'Shared thoughts & ideas',
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    },
];

export default function DashboardHome() {
    const [stats, setStats] = useState({
        promises: 0,
        reminders: 0,
        credits: 0,
        notes: 0
    });
    const [activities, setActivities] = useState([]);

    // Get daily quote (rotates based on day of year)
    const dailyQuote = useMemo(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return quotes[dayOfYear % quotes.length];
    }, []);

    useEffect(() => {
        fetchStats();
        fetchRecentActivity();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            // Fetch recent items from all endpoints
            const [promises, notes, credits, reminders] = await Promise.all([
                fetch('/api/promises').then(r => r.ok ? r.json() : []),
                fetch('/api/notes').then(r => r.ok ? r.json() : []),
                fetch('/api/credits').then(r => r.ok ? r.json() : []),
                fetch('/api/reminders').then(r => r.ok ? r.json() : [])
            ]);

            // Combine and sort by creation date
            const allActivities = [
                ...promises.map(p => ({ ...p, type: 'promise', icon: '🤝' })),
                ...notes.map(n => ({ ...n, type: 'note', icon: '📝' })),
                ...credits.map(c => ({ ...c, type: 'credit', icon: '💝' })),
                ...reminders.map(r => ({ ...r, type: 'reminder', icon: '⏰' }))
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setActivities(allActivities);
        } catch (error) {
            console.error('Failed to fetch activity:', error);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className={styles.pageContainer}>
            {/* Love Quote Widget */}
            <div className={styles.quoteWidget}>
                <Sparkles size={20} className={styles.quoteIcon} />
                <p className={styles.quoteText}>{dailyQuote}</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statPromises}`}>
                    <div className={styles.statIconWrapper}>
                        <Heart size={24} strokeWidth={2} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.promises}</div>
                        <div className={styles.statLabel}>Active Promises</div>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statReminders}`}>
                    <div className={styles.statIconWrapper}>
                        <Bell size={24} strokeWidth={2} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.reminders}</div>
                        <div className={styles.statLabel}>Upcoming Reminders</div>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statCredits}`}>
                    <div className={styles.statIconWrapper}>
                        <Wallet size={24} strokeWidth={2} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.credits}</div>
                        <div className={styles.statLabel}>Open Credits</div>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statNotes}`}>
                    <div className={styles.statIconWrapper}>
                        <FileText size={24} strokeWidth={2} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.notes}</div>
                        <div className={styles.statLabel}>Shared Notes</div>
                    </div>
                </div>
            </div>

            {/* Activity Feed */}
            {activities.length > 0 && (
                <div className={styles.activityFeed}>
                    <h3 className={styles.activityTitle}>Recent Activity</h3>
                    <div className={styles.activityList}>
                        {activities.map((activity, index) => (
                            <div key={`${activity.type}-${activity.id}-${index}`} className={styles.activityItem}>
                                <span className={styles.activityIcon}>{activity.icon}</span>
                                <div className={styles.activityContent}>
                                    <p className={styles.activityText}>
                                        <span className={styles.activityUser}>
                                            {activity.createdBy === 'shiv' ? '💙 Shiv' : '💜 Vaishnavi'}
                                        </span>
                                        {' '}added a {activity.type}
                                        {activity.title && <span className={styles.activityTitle}> "{activity.title}"</span>}
                                    </p>
                                    <span className={styles.activityTime}>{getTimeAgo(activity.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Cards */}
            <div className={styles.navGrid}>
                {NAV_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link key={card.href} href={card.href} className={styles.navCard}>
                            <div className={styles.navCardIcon} style={{ background: card.gradient }}>
                                <Icon size={28} strokeWidth={2} />
                            </div>
                            <span className={styles.navCardTitle}>{card.title}</span>
                            <span className={styles.navCardDesc}>{card.desc}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
