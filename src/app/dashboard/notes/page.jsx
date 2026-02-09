'use client';

import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import noteStyles from './notes.module.css';

// Components
import ModeToggle from './components/ModeToggle';
import NotesList from './components/NotesList';
import CalendarGrid from './components/CalendarGrid';
import NoteViewer from './components/NoteViewer';
import CreateNoteModal from './components/CreateNoteModal';

export default function NotesPage() {
    // Mode state: 'notes' (default) or 'rewind'
    const [mode, setMode] = useState('notes');

    // Notes data (shared by both modes)
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Notes Mode state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState('all');

    // Rewind Mode state
    const [viewerNotes, setViewerNotes] = useState(null);
    const [viewerDateKey, setViewerDateKey] = useState(null);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    // Fetch notes on mount
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

    // Create or update note
    const handleSaveNote = async (noteData) => {
        try {
            const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes';
            const method = editingNote ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });

            if (res.ok) {
                fetchNotes();
                setShowCreateModal(false);
                setEditingNote(null);
            }
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    };

    // Delete note
    const handleDeleteNote = async (id) => {
        if (!confirm('Delete this memory?')) return;
        try {
            await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            fetchNotes();
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    // Open note for editing (Notes Mode)
    const handleNoteClick = (note) => {
        setEditingNote(note);
        setShowCreateModal(true);
    };

    // Open notes in viewer (Rewind Mode)
    const handleDateClick = (dayNotes, dateKey) => {
        setViewerNotes(dayNotes);
        setViewerDateKey(dateKey);
    };

    // Close viewer
    const closeViewer = () => {
        setViewerNotes(null);
        setViewerDateKey(null);
    };

    // Open create modal
    const openCreateModal = () => {
        setEditingNote(null);
        setShowCreateModal(true);
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    {mode === 'notes' ? '📝 Notes' : '🔮 Rewind'}
                </h1>
                {mode === 'notes' && (
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        + New Note
                    </button>
                )}
            </div>

            {/* Mode Toggle */}
            <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', justifyContent: 'center' }}>
                <ModeToggle mode={mode} onModeChange={setMode} />
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💫</div>
                    <p>Loading memories...</p>
                </div>
            ) : (
                <>
                    {/* Notes Mode */}
                    {mode === 'notes' && (
                        <NotesList
                            notes={notes}
                            onNoteClick={handleNoteClick}
                            onDeleteNote={handleDeleteNote}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            filterTag={filterTag}
                            onFilterChange={setFilterTag}
                        />
                    )}

                    {/* Rewind Mode */}
                    {mode === 'rewind' && (
                        <CalendarGrid
                            notes={notes}
                            onDateClick={handleDateClick}
                        />
                    )}
                </>
            )}

            {/* Floating Action Button (Notes Mode only) */}
            {mode === 'notes' && (
                <button
                    className="fab"
                    onClick={openCreateModal}
                    title="New Note"
                >
                    ✏️
                </button>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <CreateNoteModal
                    editingNote={editingNote}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingNote(null);
                    }}
                    onSave={handleSaveNote}
                />
            )}

            {/* Note Viewer (Rewind Mode) */}
            {viewerNotes && (
                <NoteViewer
                    notes={viewerNotes}
                    dateKey={viewerDateKey}
                    onClose={closeViewer}
                />
            )}
        </div>
    );
}
