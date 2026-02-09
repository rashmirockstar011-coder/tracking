'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, FileText, CheckSquare } from 'lucide-react';
import styles from '../notes.module.css';

export default function DailyNoteList({ date, notes, onAddNote, onDeleteNote, onToggleComplete, forcedType }) {
    const [newItemType, setNewItemType] = useState(forcedType || 'note'); // 'note' or 'todo'
    const [newItemContent, setNewItemContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItemContent.trim()) return;

        onAddNote({
            content: newItemContent,
            type: forcedType || newItemType,
            date: date,
            completed: false
        });

        setNewItemContent('');
        setIsAdding(false);
    };

    return (
        <div className={styles.dailyListContainer}>
            <div className={styles.dailyHeader}>
                <h3 className={styles.dailyDate}>{formattedDate}</h3>
                <span className={styles.dailyCount}>{notes.length} items</span>
            </div>

            <div className={styles.dailyItems}>
                {notes.length === 0 ? (
                    <div className={styles.dailyEmpty}>
                        <p>No plans for this day yet.</p>
                        <button
                            className={styles.addFirstBtn}
                            onClick={() => setIsAdding(true)}
                        >
                            + Add Item
                        </button>
                    </div>
                ) : (
                    notes.map(note => (
                        <div key={note.id} className={`${styles.dailyItem} ${note.completed ? styles.completed : ''}`}>
                            <button
                                className={styles.itemCheck}
                                onClick={() => onToggleComplete(note.id, !note.completed)}
                            >
                                {note.type === 'todo' && (
                                    note.completed ? <Check size={14} /> : null
                                )}
                                {(note.type === 'note' || note.type === 'text') && <div className={styles.textDot} />}
                            </button>

                            <span className={styles.itemContent}>{note.content}</span>

                            <button
                                className={styles.itemDelete}
                                onClick={() => onDeleteNote(note.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {isAdding ? (
                <form onSubmit={handleAdd} className={styles.addItemForm}>
                    {!forcedType && (
                        <div className={styles.typeToggle}>
                            <button
                                type="button"
                                className={`${styles.typeBtn} ${newItemType === 'note' ? styles.active : ''}`}
                                onClick={() => setNewItemType('note')}
                            >
                                <FileText size={14} /> Note
                            </button>
                            <button
                                type="button"
                                className={`${styles.typeBtn} ${newItemType === 'todo' ? styles.active : ''}`}
                                onClick={() => setNewItemType('todo')}
                            >
                                <CheckSquare size={14} /> To-Do
                            </button>
                        </div>
                    )}
                    <input
                        type="text"
                        className={styles.addItemInput}
                        placeholder={newItemType === 'todo' ? "What needs to be done?" : "Write a memory..."}
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                        autoFocus
                    />
                    <div className={styles.addItemActions}>
                        <button type="button" className={styles.cancelBtn} onClick={() => setIsAdding(false)}>Cancel</button>
                        <button type="submit" className={styles.saveBtn}>Add</button>
                    </div>
                </form>
            ) : (
                notes.length > 0 && (
                    <button
                        className={styles.addItemBtn}
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus size={18} /> Add Item
                    </button>
                )
            )}
        </div>
    );
}
