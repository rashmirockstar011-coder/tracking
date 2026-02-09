'use client';

import { useState } from 'react';
import { Check, CheckSquare, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import styles from '../notes.module.css';

export default function TodoList({
    todos,
    onToggleComplete,
    onDelete,
    onAdd,
    loading
}) {
    const [newItem, setNewItem] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        // Add for "Today" by default in list view
        const today = new Date().toISOString().split('T')[0];
        onAdd({
            content: newItem,
            type: 'todo',
            targetDate: today,
            completed: false
        });
        setNewItem('');
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={styles.notesContainer}>
            {/* Quick Add Bar */}
            <form onSubmit={handleAdd} className={styles.searchBar} style={{ padding: '0' }}>
                <div className={styles.searchWrapper}>
                    <span className={styles.searchIcon}><CheckSquare size={18} /></span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Add a new task..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={styles.addBtnAbs}
                        disabled={!newItem.trim()}
                    >
                        Add
                    </button>
                </div>
            </form>

            {/* Filter Tabs */}
            <div className={styles.filterBar}>
                {['all', 'active', 'completed'].map(f => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className={styles.loadingState}>Loading tasks...</div>
            ) : filteredTodos.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>✓</div>
                    <p className={styles.emptyText}>No {filter} tasks</p>
                </div>
            ) : (
                <div className={styles.dailyItems}> {/* Reuse styling */}
                    {filteredTodos.map(todo => (
                        <div key={todo.id} className={`${styles.dailyItem} ${todo.completed ? styles.completed : ''}`}>
                            <button
                                className={styles.itemCheck}
                                onClick={() => onToggleComplete(todo.id, !todo.completed)}
                            >
                                {todo.completed && <Check size={14} />}
                            </button>

                            <div className={styles.itemContent}>
                                <span>{todo.content}</span>
                                {todo.targetDate && (
                                    <div className={styles.todoDate}>
                                        <CalendarIcon size={10} />
                                        {formatDate(todo.targetDate)}
                                    </div>
                                )}
                            </div>

                            <button
                                className={styles.itemDelete}
                                onClick={() => onDelete(todo.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
