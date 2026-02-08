'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const USERS = [
    { id: 'shiv', name: 'Shiv', emoji: '💙' },
    { id: 'vaishnavi', name: 'Vaishnavi', emoji: '💜' }
];

export default function LoginPage() {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePinChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);
        setError('');

        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!selectedUser) {
            setError('Please select who you are 💭');
            return;
        }

        const pinCode = pin.join('');
        if (pinCode.length !== 4) {
            setError('Please enter your 4-digit PIN 🔐');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser, pin: pinCode })
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Wrong PIN, try again! 💔');
                setPin(['', '', '', '']);
                document.getElementById('pin-0')?.focus();
            }
        } catch (err) {
            setError('Something went wrong, please try again 🥺');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.loginCard}>
                {/* Logo & Title */}
                <div className={styles.header}>
                    <div className={styles.logo}>💕</div>
                    <h1 className={styles.title}>
                        <span className="accent-text">Rashii</span>
                    </h1>
                    <p className={styles.subtitle}>For Shiv & Vaishnavi</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className={styles.form}>
                    {/* User Selection */}
                    <div className={styles.userSelection}>
                        <label className="input-label">Who's logging in?</label>
                        <div className={styles.userButtons}>
                            {USERS.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    className={`${styles.userButton} ${selectedUser === user.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedUser(user.id)}
                                >
                                    <span className={styles.userEmoji}>{user.emoji}</span>
                                    <span>{user.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PIN Input */}
                    <div className={styles.pinSection}>
                        <label className="input-label">Enter your PIN</label>
                        <div className="pin-input">
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`pin-${index}`}
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="pin-digit"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className={styles.error}>{error}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? '💫 Logging in...' : '💖 Enter Our Space'}
                    </button>
                </form>

                {/* Footer */}
                <p className={styles.footer}>
                    Made with 💕 for us
                </p>
            </div>
        </main>
    );
}
