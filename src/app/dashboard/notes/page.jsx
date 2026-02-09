'use client';

import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import noteStyles from './notes.module.css';
import { List, Calendar, Plus, FileText, CheckSquare, Search } from 'lucide-react';

// Components
import NotesList from './components/NotesList';
import CalendarGrid from './components/CalendarGrid';
import DailyNoteList from './components/DailyNoteList';
import TodoList from './components/TodoList';
import CreateNoteModal from './components/CreateNoteModal';

export default function NotesPage() {
    // Top Level Tabs: 'notes' | 'todos'
    const [activeTab, setActiveTab] = useState('notes');

    // View Level: 'list' | 'calendar'
    const [viewMode, setViewMode] = useState('list');

    // Data
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter (Notes only)
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState('all');

    // Calendar Selection
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

    // Shared Save Handler
    const handleSaveNote = async (noteData) => {
        try {
            const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes';
            const method = editingNote ? 'PATCH' : 'POST';

            // Ensure type is set based on activeTab if new
            if (!noteData.type && !editingNote) {
                noteData.type = activeTab === 'todos' ? 'todo' : 'note';
            }

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
            console.error('Failed to save item:', error);
        }
    };

    // Toggle Completion (Todos)
    const handleToggleComplete = async (id, completed) => {
        try {
            await fetch(`/api/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
            fetchNotes();
        } catch (error) {
            console.error('Failed to update item:', error);
        }
    };

    // Delete Item
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            fetchNotes();
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    // --- Derived State ---
    const displayedNotes = notes.filter(n => {
        const typeMatch = activeTab === 'notes' ? (n.type === 'note' || !n.type) : n.type === 'todo';
        return typeMatch;
    });

    const calendarNotes = displayedNotes; // Calendar shows items of valid type

    const dailyListNotes = notes.filter(n => {
        const noteDate = n.targetDate || (n.createdAt ? n.createdAt.split('T')[0] : '');
        const typeMatch = activeTab === 'notes' ? (n.type === 'note' || !n.type) : n.type === 'todo';
        return noteDate === selectedDate && typeMatch;
    });

    return (
        <div className={noteStyles.pageContainer}>
            {/* Header */}
            <div className={noteStyles.pageHeader}>
                <h1 className={noteStyles.pageTitle}>Memory Lane 🌸</h1>

                {/* Add New Button */}
                <button
                    className={noteStyles.submitBtn}
                    onClick={() => {
                        setEditingNote(null);
                        setShowCreateModal(true);
                    }}
                >
                    <Plus size={16} /> New {activeTab === 'notes' ? 'Note' : 'Task'}
                </button>
            </div>

            {/* Segmented Control (Tabs) */}
            <div className={noteStyles.tabContainer}>
                <button
                    className={`${noteStyles.tabBtn} ${activeTab === 'notes' ? noteStyles.active : ''}`}
                    onClick={() => { setActiveTab('notes'); setViewMode('list'); }}
                >
                    Notes
                </button>
                <button
                    className={`${noteStyles.tabBtn} ${activeTab === 'todos' ? noteStyles.active : ''}`}
                    onClick={() => { setActiveTab('todos'); setViewMode('list'); }}
                >
                    To-Dos
                </button>
            </div>

            {/* View Toggle (Top Right) */}
            <div className={noteStyles.viewToggleContainer}>
                <div className={noteStyles.viewToggle}>
                    <button
                        className={`${noteStyles.viewBtn} ${viewMode === 'list' ? noteStyles.active : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        <List size={18} />
                    </button>
                    <button
                        className={`${noteStyles.viewBtn} ${viewMode === 'calendar' ? noteStyles.active : ''}`}
                        onClick={() => setViewMode('calendar')}
                        title="Calendar View"
                    >
                        <Calendar size={18} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className={noteStyles.mainContent}>

                {viewMode === 'list' && activeTab === 'notes' && (
                    <NotesList
                        notes={displayedNotes}
                        loading={loading}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filterTag={filterTag}
                        onFilterChange={setFilterTag}
                        onNoteClick={(note) => { setEditingNote(note); setShowCreateModal(true); }}
                        onDeleteNote={handleDelete}
                    />
                )}

                {viewMode === 'list' && activeTab === 'todos' && (
                    <TodoList
                        todos={displayedNotes}
                        loading={loading}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDelete}
                        onAdd={(data) => handleSaveNote({ ...data, type: 'todo' })}
                    />
                )}

                {viewMode === 'calendar' && (
                    <div className={noteStyles.rewindContainer}>
                        <CalendarGrid
                            notes={calendarNotes}
                            onDateClick={setSelectedDate}
                            selectedDate={selectedDate}
                        />

                        <DailyNoteList
                            date={selectedDate}
                            notes={dailyListNotes}
                            onAddNote={(data) => handleSaveNote({
                                ...data,
                                type: activeTab === 'todos' ? 'todo' : 'note',
                                targetDate: selectedDate
                            })}
                            onDeleteNote={handleDelete}
                            onToggleComplete={handleToggleComplete}
                            forcedType={activeTab === 'todos' ? 'todo' : 'note'}
                        />
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateNoteModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleSaveNote}
                    initialData={editingNote}
                    defaultType={activeTab === 'todos' ? 'todo' : 'note'}
                />
            )}
        </div>
    );
}
