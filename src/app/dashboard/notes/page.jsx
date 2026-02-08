'use client';

import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';

const TAG_COLORS = [
    { name: 'love', color: 'var(--pink-100)', textColor: 'var(--pink-600)' },
    { name: 'date', color: 'var(--lavender-100)', textColor: 'var(--lavender-500)' },
    { name: 'todo', color: '#fef3c7', textColor: '#d97706' },
    { name: 'idea', color: '#d1fae5', textColor: '#059669' },
    { name: 'memory', color: '#e0e7ff', textColor: '#4f46e5' },
];

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterTag, setFilterTag] = useState('all');
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: []
    });

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch('/api/notes');
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes';
            const method = editingNote ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', content: '', tags: [] });
                setEditingNote(null);
                fetchNotes();
            }
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    };

    const openEditModal = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            tags: note.tags || []
        });
        setShowModal(true);
    };

    const deleteNote = async (id) => {
        if (!confirm('Delete this note?')) return;
        try {
            await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            fetchNotes();
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const toggleTag = (tagName) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagName)
                ? prev.tags.filter(t => t !== tagName)
                : [...prev.tags, tagName]
        }));
    };

    const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

    const filteredNotes = filterTag === 'all'
        ? notes
        : notes.filter(n => n.tags?.includes(filterTag));

    const getTagStyle = (tagName) => {
        const found = TAG_COLORS.find(t => t.name === tagName);
        return found
            ? { background: found.color, color: found.textColor }
            : { background: 'var(--gray-100)', color: 'var(--gray-600)' };
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>📝 Notes</h1>
                <button className="btn btn-primary" onClick={() => {
                    setEditingNote(null);
                    setFormData({ title: '', content: '', tags: [] });
                    setShowModal(true);
                }}>
                    + New Note
                </button>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
                <div className={styles.filterTabs}>
                    <button
                        className={`${styles.filterTab} ${filterTag === 'all' ? styles.active : ''}`}
                        onClick={() => setFilterTag('all')}
                    >
                        All
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            className={`${styles.filterTab} ${filterTag === tag ? styles.active : ''}`}
                            onClick={() => setFilterTag(tag)}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Notes Grid */}
            {loading ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💫</div>
                    <p>Loading notes...</p>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <p>No notes yet. Write one together!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                    {filteredNotes.map((note) => (
                        <div
                            key={note.id}
                            className="card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => openEditModal(note)}
                        >
                            <h3 style={{ marginBottom: 'var(--space-sm)' }}>{note.title}</h3>
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'var(--gray-600)',
                                marginBottom: 'var(--space-md)',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {note.content}
                            </p>
                            {note.tags?.length > 0 && (
                                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                                    {note.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="tag"
                                            style={getTagStyle(tag)}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                <span>by {note.createdBy === 'shiv' ? '💙 Shiv' : '💜 Vaishnavi'}</span>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                                    title="Delete"
                                    style={{ fontSize: '1rem' }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingNote ? 'Edit Note' : 'New Note'} 📝</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Title</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Note title..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Content</label>
                                <textarea
                                    className="input"
                                    placeholder="Write your thoughts..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={5}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Tags</label>
                                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                                    {TAG_COLORS.map((tag) => (
                                        <button
                                            key={tag.name}
                                            type="button"
                                            className="tag"
                                            style={{
                                                ...getTagStyle(tag.name),
                                                cursor: 'pointer',
                                                opacity: formData.tags.includes(tag.name) ? 1 : 0.5,
                                                border: formData.tags.includes(tag.name) ? '2px solid currentColor' : '2px solid transparent',
                                                padding: 'var(--space-sm) var(--space-md)'
                                            }}
                                            onClick={() => toggleTag(tag.name)}
                                        >
                                            #{tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                💖 {editingNote ? 'Save Changes' : 'Create Note'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
