'use client';

import { useMemo, useEffect, useRef } from 'react';
import styles from './credits.module.css';
import { triggerHeartRain } from '@/lib/celebrations';

export default function TugOfWar({ credits }) {
    const hasTriggeredRef = useRef(false);

    // Calculate balance: positive = Shiv owes more, negative = Vaishnavi owes more
    const balance = useMemo(() => {
        const pendingCredits = credits.filter(c => c.status === 'pending');
        const shivOwes = pendingCredits.filter(c => c.owedBy === 'shiv').length;
        const vaishnaviOwes = pendingCredits.filter(c => c.owedBy === 'vaishnavi').length;

        return {
            shivOwes,
            vaishnaviOwes,
            difference: shivOwes - vaishnaviOwes,
            total: shivOwes + vaishnaviOwes
        };
    }, [credits]);

    // Trigger heart rain when balance reaches zero
    useEffect(() => {
        if (balance.total === 0 && credits.length > 0 && !hasTriggeredRef.current) {
            triggerHeartRain();
            hasTriggeredRef.current = true;
        } else if (balance.total > 0) {
            hasTriggeredRef.current = false;
        }
    }, [balance.total, credits.length]);

    // Calculate position (0-100, 50 is center)
    // If Shiv owes more, knot moves toward Vaishnavi (right)
    // If Vaishnavi owes more, knot moves toward Shiv (left)
    const calculatePosition = () => {
        if (balance.total === 0) return 50;

        // Max swing is 40% from center (so range is 10-90)
        const maxSwing = 40;
        const ratio = balance.difference / Math.max(balance.total, 1);
        return 50 + (ratio * maxSwing);
    };

    const position = calculatePosition();

    const getStatusMessage = () => {
        if (balance.difference === 0) {
            return balance.total === 0
                ? "✨ All balanced! No credits pending"
                : "⚖️ Perfectly balanced!";
        }
        if (balance.difference > 0) {
            return `💙 Shiv owes ${balance.shivOwes} credit${balance.shivOwes > 1 ? 's' : ''}`;
        }
        return `💜 Vaishnavi owes ${balance.vaishnaviOwes} credit${balance.vaishnaviOwes > 1 ? 's' : ''}`;
    };

    const getStatusClass = () => {
        if (balance.difference === 0) return styles.balanced;
        if (balance.difference > 0) return styles.shivOwes;
        return styles.vaishnaviOwes;
    };

    const getTooltip = () => {
        if (balance.difference === 0) return "Balanced!";
        const diff = Math.abs(balance.difference);
        if (balance.difference > 0) return `Shiv owes ${diff} more`;
        return `Vaishnavi owes ${diff} more`;
    };

    return (
        <div className={styles.tugOfWar}>
            <div className={styles.tugOfWarTitle}>Credit Balance</div>

            {/* Players */}
            <div className={styles.playersRow}>
                <div className={`${styles.player} ${styles.playerShiv} ${balance.difference < 0 ? styles.winning : ''}`}>
                    <div className={styles.playerAvatar}>💙</div>
                    <span className={styles.playerName}>Shiv</span>
                    <span className={styles.playerScore}>owes {balance.shivOwes}</span>
                </div>

                <div className={`${styles.player} ${styles.playerVaishnavi} ${balance.difference > 0 ? styles.winning : ''}`}>
                    <div className={styles.playerAvatar}>💜</div>
                    <span className={styles.playerName}>Vaishnavi</span>
                    <span className={styles.playerScore}>owes {balance.vaishnaviOwes}</span>
                </div>
            </div>

            {/* Rope */}
            <div className={styles.ropeContainer}>
                <div className={styles.ropeTrack}>
                    <div
                        className={styles.shivFill}
                        style={{ width: `${Math.max(0, 50 - (position - 50))}%` }}
                    />
                    <div
                        className={styles.vaishnaviFill}
                        style={{ width: `${Math.max(0, position - 50)}%` }}
                    />
                </div>
                <div className={styles.rope} />
                <div className={styles.centerLine} />
                <div className={styles.centerDot} />
                <div
                    className={styles.tugIndicator}
                    style={{ left: `${position}%` }}
                    data-tooltip={getTooltip()}
                />
            </div>

            {/* Status */}
            <div className={`${styles.balanceStatus} ${getStatusClass()}`}>
                {getStatusMessage()}
            </div>
        </div>
    );
}
