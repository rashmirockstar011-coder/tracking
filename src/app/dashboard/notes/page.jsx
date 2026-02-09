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
import DailyNoteList from './components/DailyNoteList';

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
    // Set default selected date to today YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);

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

    // Quick add note for daily list
    const handleAddDailyItem = async (itemData) => {
        // itemData = { content, type, date, completed }
        await handleSaveNote(itemData);
    };

    // Toggle completion for daily list
    const handleToggleComplete = async (id, completed) => {
        try {
            await fetch(`/api/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
            fetchNotes(); // Refresh to show update
        } catch (error) {
            console.error('Failed to update note:', error);
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

    // Handle date selection in Rewind Mode
    const handleDateSelect = (dateKey) => {
        setSelectedDate(dateKey);
    };

    // Filter notes for selected date in Rewind mode
    const selectedDateNotes = notes.filter(note => {
        if (!note.createdAt) return false;
        const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
        return noteDate === selectedDate;
    });

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Notes & Memories 📝</h1>
                <ModeToggle mode={mode} setMode={setMode} />
            </div>

            <div className={styles.mainContent}>
                {mode === 'notes' ? (
                    <>
                        {/* Notes List */}
                        <NotesList
                            notes={notes}
                            loading={loading}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            filterTag={filterTag}
                            onFilterChange={setFilterTag}
                            onNoteClick={handleNoteClick}
                            onDeleteNote={handleDeleteNote}
                        />

                        {/* Floating Add Button */}
                        <button
                            className="btn-floating"
                            onClick={() => {
                                setEditingNote(null);
                                setShowCreateModal(true);
                            }}
                        >
                            +
                        </button>
                    </>
                ) : (
                    <>
                        {/* Rewind Mode: Calendar + Daily List */}
                        <div className={styles.rewindContainer}>
                            <CalendarGrid
                                notes={notes}
                                onDateClick={handleDateSelect}
                                selectedDate={selectedDate}
                            />

                            <DailyNoteList
                                date={selectedDate}
                                notes={selectedDateNotes}
                                onAddNote={handleAddDailyItem}
                                onDeleteNote={handleDeleteNote}
                                onToggleComplete={handleToggleComplete}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Create Note Modal (Shared) */}
            {showCreateModal && (
                <CreateNoteModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleSaveNote}
                    initialData={editingNote}
                />
            )}
        </div>
    );
}
