'use client';

import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import creditStyles from './credits.module.css';

const COLUMNS = [
    { id: 'owed-to-me', title: '💝 Owed to Me' },
    { id: 'i-owe', title: '💸 I Owe' },
    { id: 'redeemed', title: '✨ Redeemed' }
];

export default function CreditsPage() {
    const [credits, setCredits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        owedBy: ''
    });

    useEffect(() => {
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        try {
            const res = await fetch('/api/credits');
            if (res.ok) {
                const data = await res.json();
                setCredits(data);
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', description: '', owedBy: '' });
                fetchCredits();
            }
        } catch (error) {
            console.error('Failed to create credit:', error);
        }
    };

    const redeemCredit = async (id) => {
        try {
            await fetch(`/api/credits/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'redeemed' })
            });
            fetchCredits();
        } catch (error) {
            console.error('Failed to redeem credit:', error);
        }
    };

    const deleteCredit = async (id) => {
        if (!confirm('Delete this credit?')) return;
        try {
            await fetch(`/api/credits/${id}`, { method: 'DELETE' });
            fetchCredits();
        } catch (error) {
            console.error('Failed to delete credit:', error);
        }
    };

    // Get current user from session (simplified - in real app, get from context)
    const currentUser = typeof window !== 'undefined'
        ? document.cookie.includes('shiv') ? 'shiv' : 'vaishnavi'
        : 'shiv';

    const getCreditsForColumn = (columnId) => {
        return credits.filter(credit => {
            if (columnId === 'redeemed') return credit.status === 'redeemed';
            if (columnId === 'owed-to-me') return credit.status === 'pending' && credit.owedBy !== currentUser;
            if (columnId === 'i-owe') return credit.status === 'pending' && credit.owedBy === currentUser;
            return false;
        });
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>💝 Credits (IOUs)</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Credit
                </button>
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💫</div>
                    <p>Loading credits...</p>
                </div>
            ) : (
                <div className="kanban">
                    {COLUMNS.map((column) => (
                        <div key={column.id} className="kanban-column">
                            <div className="kanban-column-header">
                                <h3>{column.title}</h3>
                                <span className="tag">{getCreditsForColumn(column.id).length}</span>
                            </div>
                            {getCreditsForColumn(column.id).length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 'var(--space-md)' }}>
                                    No credits here
                                </p>
                            ) : (
                                getCreditsForColumn(column.id).map((credit) => (
                                    <div key={credit.id} className="kanban-card">
                                        <h4 style={{ marginBottom: 'var(--space-xs)' }}>{credit.title}</h4>
                                        {credit.description && (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-sm)' }}>
                                                {credit.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                {credit.owedBy === 'shiv' ? '💙 Shiv owes' : '💜 Vaishnavi owes'}
                                            </span>
                                            <div>
                                                {column.id !== 'redeemed' && (
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => redeemCredit(credit.id)}
                                                        title="Redeem"
                                                        style={{ fontSize: '1rem' }}
                                                    >
                                                        ✨
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => deleteCredit(credit.id)}
                                                    title="Delete"
                                                    style={{ fontSize: '1rem' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create Credit 💝</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">What's the favor?</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., A massage, Movie pick..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Details (optional)</label>
                                <textarea
                                    className="input"
                                    placeholder="Any additional details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Who owes this?</label>
                                <select
                                    className="select"
                                    value={formData.owedBy}
                                    onChange={(e) => setFormData({ ...formData, owedBy: e.target.value })}
                                    required
                                >
                                    <option value="">Select person...</option>
                                    <option value="shiv">💙 Shiv owes</option>
                                    <option value="vaishnavi">💜 Vaishnavi owes</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                💝 Create Credit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
