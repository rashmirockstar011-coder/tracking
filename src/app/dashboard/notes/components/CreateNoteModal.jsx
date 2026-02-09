'use client';

import { useState } from 'react';
import styles from '../notes.module.css';

const EMOJIS = ['💕', '💝', '🥰', '✨', '🌸', '💫', '🦋', '🌙'];
const TAGS = ['love', 'promise', 'date', 'memory', 'idea', 'todo'];

const TAG_COLORS = {
    love: { bg: 'var(--pink-100)', color: 'var(--pink-600)' },
    promise: { bg: '#fce7f3', color: '#db2777' },
    date: { bg: 'var(--lavender-100)', color: 'var(--lavender-500)' },
    memory: { bg: '#e0e7ff', color: '#4f46e5' },
    idea: { bg: '#d1fae5', color: '#059669' },
    todo: { bg: '#fef3c7', color: '#d97706' },
};

export default function CreateNoteModal({ onClose, onSave, editingNote, defaultType = 'note' }) {
    const [title, setTitle] = useState(editingNote?.title || '');
    const [content, setContent] = useState(editingNote?.content || '');
    const [selectedEmoji, setSelectedEmoji] = useState(editingNote?.emoji || null);
    const [selectedTags, setSelectedTags] = useState(editingNote?.tags || []);
    const [saving, setSaving] = useState(false);

    const isTodo = (editingNote?.type || defaultType) === 'todo';

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setSaving(true);
        try {
            await onSave({
                title: title.trim(),
                content: content.trim(),
                emoji: selectedEmoji,
                tags: selectedTags,
                type: editingNote?.type || defaultType
            });
            onClose();
        } catch (error) {
            console.error('Failed to save note:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={styles.createModal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {editingNote ? '✏️ Edit ' + (isTodo ? 'Task' : 'Memory') : (isTodo ? '✅ New Task' : '💝 New Memory')}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Title</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder={isTodo ? "Task Name" : "A moment to remember..."}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Content */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>{isTodo ? 'Details' : 'Your thoughts'}</label>
                        <textarea
                            className={`${styles.formInput} ${styles.formTextarea}`}
                            placeholder={isTodo ? "What requires your attention?" : "Write what's on your heart..."}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>

                    {/* Emoji Picker - Only for Notes? Or both? Keep for both for fun */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Mood (optional)</label>
                        <div className={styles.emojiPicker}>
                            {EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`${styles.emojiBtn} ${selectedEmoji === emoji ? styles.selected : ''}`}
                                    onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tag Picker */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Tags (optional)</label>
                        <div className={styles.tagPicker}>
                            {TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`${styles.tagBtn} ${selectedTags.includes(tag) ? styles.selected : ''}`}
                                    onClick={() => toggleTag(tag)}
                                    style={selectedTags.includes(tag) ? {
                                        background: TAG_COLORS[tag].bg,
                                        color: TAG_COLORS[tag].color,
                                        borderColor: TAG_COLORS[tag].color
                                    } : {}}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={saving || !title.trim() || !content.trim()}
                    >
                        {saving ? '💫 Saving...' : (editingNote ? '💖 Save Changes' : (isTodo ? '✅ Add Task' : '💖 Create Memory'))}
                    </button>
                </form>
            </div>
        </div>
    );
}
