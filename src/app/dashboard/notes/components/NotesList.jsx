'use client';

import { useState } from 'react';
import styles from '../notes.module.css';

const TAG_COLORS = {
    love: { bg: 'var(--pink-100)', color: 'var(--pink-600)' },
    date: { bg: 'var(--lavender-100)', color: 'var(--lavender-500)' },
    todo: { bg: '#fef3c7', color: '#d97706' },
    idea: { bg: '#d1fae5', color: '#059669' },
    memory: { bg: '#e0e7ff', color: '#4f46e5' },
    promise: { bg: '#fce7f3', color: '#db2777' },
};

export default function NotesList({
    notes,
    onNoteClick,
    onDeleteNote,
    searchQuery,
    onSearchChange,
    filterTag,
    onFilterChange
}) {
    const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

    // Filter notes based on search and tag
    const filteredNotes = notes.filter(note => {
        const matchesSearch = !searchQuery ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTag = filterTag === 'all' || (note.tags || []).includes(filterTag);

        return matchesSearch && matchesTag;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getTagStyle = (tag) => {
        const colors = TAG_COLORS[tag] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
        return { background: colors.bg, color: colors.color };
    };

    return (
        <div className={styles.notesContainer}>
            {/* Search Bar */}
            <div className={styles.searchBar}>
                <div className={styles.searchWrapper}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
                <div className={styles.filterBar}>
                    <button
                        className={`${styles.filterBtn} ${filterTag === 'all' ? styles.active : ''}`}
                        onClick={() => onFilterChange('all')}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            className={`${styles.filterBtn} ${filterTag === tag ? styles.active : ''}`}
                            onClick={() => onFilterChange(tag)}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Notes List */}
            {filteredNotes.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📝</div>
                    <p className={styles.emptyText}>
                        {searchQuery || filterTag !== 'all'
                            ? 'No notes match your search'
                            : 'No notes yet'}
                    </p>
                    <p className={styles.emptySubtext}>
                        {searchQuery || filterTag !== 'all'
                            ? 'Try a different search or filter'
                            : 'Start writing your first memory together'}
                    </p>
                </div>
            ) : (
                <div>
                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            className={styles.noteCard}
                            onClick={() => onNoteClick(note)}
                        >
                            <div className={styles.noteHeader}>
                                <h3 className={styles.noteTitle}>{note.title}</h3>
                                <div className={styles.noteActions}>
                                    <button
                                        className={`${styles.actionBtn} ${styles.delete}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteNote(note.id);
                                        }}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <p className={styles.notePreview}>{note.content}</p>
                            <div className={styles.noteFooter}>
                                <div className={styles.noteTags}>
                                    {(note.tags || []).map(tag => (
                                        <span
                                            key={tag}
                                            className={styles.noteTag}
                                            style={getTagStyle(tag)}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <div className={styles.noteMeta}>
                                    <span>{note.createdBy === 'shiv' ? '💙' : '💜'}</span>
                                    <span>{formatDate(note.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
