'use client';

import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';

export default function RemindersPage() {
    const [reminders, setReminders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        datetime: '',
        recurrence: 'none',
        emailNotify: true
    });

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await fetch('/api/reminders');
            if (res.ok) {
                const data = await res.json();
                setReminders(data);
            }
        } catch (error) {
            console.error('Failed to fetch reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', datetime: '', recurrence: 'none', emailNotify: true });
                fetchReminders();
            }
        } catch (error) {
            console.error('Failed to create reminder:', error);
        }
    };

    const toggleComplete = async (id, completed) => {
        try {
            await fetch(`/api/reminders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !completed })
            });
            fetchReminders();
        } catch (error) {
            console.error('Failed to update reminder:', error);
        }
    };

    const deleteReminder = async (id) => {
        if (!confirm('Delete this reminder?')) return;
        try {
            await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
            fetchReminders();
        } catch (error) {
            console.error('Failed to delete reminder:', error);
        }
    };

    const getTimeStatus = (datetime) => {
        const d = new Date(datetime);
        const now = new Date();
        const diff = d - now;

        if (diff < 0) return { label: 'Overdue', class: 'tag-error' };
        if (diff < 86400000) return { label: 'Today', class: 'tag-warning' };
        if (diff < 172800000) return { label: 'Tomorrow', class: '' };
        return { label: d.toLocaleDateString(), class: '' };
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>⏰ Reminders</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Reminder
                </button>
            </div>

            {/* Reminders List */}
            {loading ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💫</div>
                    <p>Loading reminders...</p>
                </div>
            ) : reminders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">⏰</div>
                    <p>No reminders yet. Set one up!</p>
                </div>
            ) : (
                <div className={styles.itemList}>
                    {reminders.map((reminder) => {
                        const status = getTimeStatus(reminder.datetime);
                        return (
                            <div
                                key={reminder.id}
                                className={styles.listItem}
                                style={{ opacity: reminder.completed ? 0.6 : 1 }}
                            >
                                <button
                                    className={styles.listItemIcon}
                                    onClick={() => toggleComplete(reminder.id, reminder.completed)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    {reminder.completed ? '✅' : '⏰'}
                                </button>
                                <div className={styles.listItemContent}>
                                    <h3
                                        className={styles.listItemTitle}
                                        style={{ textDecoration: reminder.completed ? 'line-through' : 'none' }}
                                    >
                                        {reminder.title}
                                    </h3>
                                    <div className={styles.listItemMeta}>
                                        <span className={`tag ${status.class}`}>{status.label}</span>
                                        <span>🕐 {new Date(reminder.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {reminder.recurrence !== 'none' && (
                                            <span>🔄 {reminder.recurrence}</span>
                                        )}
                                        {reminder.emailNotify && <span>📧</span>}
                                        <span>by {reminder.createdBy === 'shiv' ? '💙 Shiv' : '💜 Vaishnavi'}</span>
                                    </div>
                                </div>
                                <div className={styles.listItemActions}>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => deleteReminder(reminder.id)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Reminder 📅</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">What to remember?</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Remember to..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">When?</label>
                                <input
                                    type="datetime-local"
                                    className="input"
                                    value={formData.datetime}
                                    onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Repeat</label>
                                <select
                                    className="select"
                                    value={formData.recurrence}
                                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                                >
                                    <option value="none">Don't repeat</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.emailNotify}
                                        onChange={(e) => setFormData({ ...formData, emailNotify: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem' }}
                                    />
                                    📧 Send email reminder
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                ⏰ Set Reminder
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
