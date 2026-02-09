'use client';

import styles from '../notes.module.css';

export default function ModeToggle({ mode, onModeChange }) {
    return (
        <div className={styles.modeToggle}>
            <button
                className={`${styles.modeBtn} ${mode === 'notes' ? styles.active : ''}`}
                onClick={() => onModeChange('notes')}
            >
                <span className={styles.modeIcon}>📝</span>
                Notes
            </button>
            <button
                className={`${styles.modeBtn} ${mode === 'rewind' ? styles.active : ''}`}
                onClick={() => onModeChange('rewind')}
            >
                <span className={styles.modeIcon}>🔮</span>
                Rewind
            </button>
        </div>
    );
}
