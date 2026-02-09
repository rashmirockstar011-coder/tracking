'use client';

import { useState, useEffect } from 'react';
import { Heart, Calendar, Trash2, Check, X } from 'lucide-react';
import styles from '../dashboard.module.css';
import promiseStyles from './promises.module.css';
import { triggerConfetti } from '@/lib/celebrations';

const STATUS_FILTERS = ['all', 'pending', 'fulfilled', 'broken'];
const STATUS_ICONS = {
    pending: '⏳',
    fulfilled: '✅',
    broken: '💔'
};

export default function PromisesPage() {
    const [promises, setPromises] = useState([]);
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [flippedCards, setFlippedCards] = useState(new Set());
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: ''
    });

    useEffect(() => {
        fetchPromises();
    }, []);

    const fetchPromises = async () => {
        try {
            const res = await fetch('/api/promises');
            if (res.ok) {
                const data = await res.json();
                setPromises(data);
            }
        } catch (error) {
            console.error('Failed to fetch promises:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/promises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', description: '', dueDate: '' });
                fetchPromises();
            }
        } catch (error) {
            console.error('Failed to create promise:', error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await fetch(`/api/promises/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            // Trigger confetti when promise is fulfilled
            if (status === 'fulfilled') {
                triggerConfetti();
            }

            fetchPromises();
        } catch (error) {
            console.error('Failed to update promise:', error);
        }
    };

    const deletePromise = async (id) => {
        if (!confirm('Are you sure you want to delete this promise?')) return;
        try {
            await fetch(`/api/promises/${id}`, { method: 'DELETE' });
            fetchPromises();
        } catch (error) {
            console.error('Failed to delete promise:', error);
        }
    };

    const toggleFlip = (id) => {
        setFlippedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const filteredPromises = filter === 'all'
        ? promises
        : promises.filter(p => p.status === filter);

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    <Heart size={32} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                    Promises
                </h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Promise
                </button>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
                {STATUS_FILTERS.map((status) => (
                    <button
                        key={status}
                        className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Promises Grid */}
            {loading ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💫</div>
                    <p>Loading promises...</p>
                </div>
            ) : filteredPromises.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🤝</div>
                    <p>No promises yet. Make one to each other!</p>
                </div>
            ) : (
                <div className={promiseStyles.promiseGrid}>
                    {filteredPromises.map((promise) => (
                        <div
                            key={promise.id}
                            className={`${promiseStyles.promiseCard} ${flippedCards.has(promise.id) ? promiseStyles.flipped : ''}`}
                            onClick={() => toggleFlip(promise.id)}
                        >
                            <div className={promiseStyles.promiseCardInner}>
                                {/* Front of Card */}
                                <div className={promiseStyles.promiseCardFront}>
                                    <div className={promiseStyles.promiseCardTitle}>{promise.title}</div>
                                    {promise.description && (
                                        <div className={promiseStyles.promiseCardDescription}>
                                            {promise.description}
                                        </div>
                                    )}
                                    <div className={promiseStyles.promiseCardFooter}>
                                        <div className={promiseStyles.promiseCardMeta}>
                                            {promise.createdBy === 'shiv' ? '💙 Shiv' : '💜 Vaishnavi'}
                                        </div>
                                        <div className={promiseStyles.promiseCardStatus}>
                                            {STATUS_ICONS[promise.status]}
                                        </div>
                                    </div>
                                </div>

                                {/* Back of Card */}
                                <div className={promiseStyles.promiseCardBack}>
                                    <div className={promiseStyles.promiseCardBackContent}>
                                        <div className={promiseStyles.promiseCardBackStatus}>
                                            {STATUS_ICONS[promise.status]}
                                        </div>
                                        <div className={promiseStyles.promiseCardBackText}>
                                            {promise.status === 'fulfilled' ? 'Promise Kept!' :
                                                promise.status === 'broken' ? 'Promise Broken' :
                                                    'Pending Promise'}
                                        </div>
                                        {promise.dueDate && (
                                            <div className={promiseStyles.promiseCardBackDate}>
                                                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                                {new Date(promise.dueDate).toLocaleDateString()}
                                            </div>
                                        )}
                                        <div className={promiseStyles.promiseCardActions} onClick={(e) => e.stopPropagation()}>
                                            {promise.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => updateStatus(promise.id, 'fulfilled')}
                                                        title="Mark as fulfilled"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => updateStatus(promise.id, 'broken')}
                                                        title="Mark as broken"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => deletePromise(promise.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Make a Promise 💕</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Promise Title</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="I promise to..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Description (optional)</label>
                                <textarea
                                    className="input"
                                    placeholder="More details about this promise..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Due Date (optional)</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                💖 Make this Promise
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
