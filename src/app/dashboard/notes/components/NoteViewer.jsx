'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../notes.module.css';

export default function NoteViewer({ notes, dateKey, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const formatDate = (dateKey) => {
        if (!dateKey) return '';
        const [year, month, day] = dateKey.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    const goToNext = useCallback(() => {
        if (currentIndex < notes.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Close viewer after last note
            onClose();
        }
    }, [currentIndex, notes.length, onClose]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrev();
            else if (e.key === 'ArrowRight') goToNext();
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrev, goToNext, onClose]);

    // Handle swipe gestures
    const [touchStart, setTouchStart] = useState(null);

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0) goToNext();
            else goToPrev();
        }
        setTouchStart(null);
    };

    const currentNote = notes[currentIndex];
    if (!currentNote) return null;

    return (
        <div className={styles.viewerOverlay} onClick={onClose}>
            <div
                className={styles.viewerContainer}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Header */}
                <div className={styles.viewerHeader}>
                    <span className={styles.viewerDate}>{formatDate(dateKey)}</span>
                    <button className={styles.viewerClose} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Progress Bars */}
                {notes.length > 1 && (
                    <div className={styles.viewerProgress}>
                        {notes.map((_, idx) => (
                            <div
                                key={idx}
                                className={`${styles.progressBar} 
                                    ${idx < currentIndex ? styles.viewed : ''} 
                                    ${idx === currentIndex ? styles.active : ''}`}
                            />
                        ))}
                    </div>
                )}

                {/* Note Content */}
                <div className={styles.viewerContent}>
                    {/* Click zones for navigation */}
                    <div
                        className={`${styles.viewerNav} ${styles.prev}`}
                        onClick={() => goToPrev()}
                    />
                    <div
                        className={`${styles.viewerNav} ${styles.next}`}
                        onClick={() => goToNext()}
                    />

                    <div className={styles.storyNote} key={currentNote.id}>
                        <h2 className={styles.storyTitle}>{currentNote.title}</h2>
                        <p className={styles.storyContent}>{currentNote.content}</p>

                        <div className={styles.storyMeta}>
                            <span className={styles.storyAuthor}>
                                {currentNote.createdBy === 'shiv' ? '💙 Shiv' : '💜 Vaishnavi'}
                            </span>
                            {currentNote.tags?.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span>{currentNote.tags.map(t => `#${t}`).join(' ')}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
