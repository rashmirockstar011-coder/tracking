'use client';

import { useState, useMemo } from 'react';
import styles from '../notes.module.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarGrid({ notes, onDateClick }) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    // Group notes by date string (YYYY-MM-DD)
    const notesByDate = useMemo(() => {
        const grouped = {};
        notes.forEach(note => {
            if (note.createdAt) {
                const date = new Date(note.createdAt);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(note);
            }
        });
        return grouped;
    }, [notes]);

    // Get calendar days for current month
    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ day: null, empty: true });
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const notesForDay = notesByDate[dateKey] || [];
            const isToday = day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

            days.push({
                day,
                dateKey,
                notes: notesForDay,
                hasNotes: notesForDay.length > 0,
                isToday,
                empty: false
            });
        }

        return days;
    }, [currentMonth, currentYear, notesByDate, today]);

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateClick = (dayData) => {
        if (!dayData.empty && dayData.hasNotes) {
            onDateClick(dayData.notes, dayData.dateKey);
        }
    };

    // Count total notes for this month
    const monthNoteCount = useMemo(() => {
        return calendarDays.reduce((sum, day) => sum + (day.notes?.length || 0), 0);
    }, [calendarDays]);

    return (
        <div className={styles.rewindContainer}>
            {/* Calendar Header */}
            <div className={styles.calendarHeader}>
                <div className={styles.calendarNav}>
                    <button className={styles.navBtn} onClick={goToPrevMonth}>
                        ←
                    </button>
                    <span className={styles.monthYear}>
                        {MONTHS[currentMonth]} {currentYear}
                    </span>
                    <button className={styles.navBtn} onClick={goToNextMonth}>
                        →
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className={styles.calendarGrid}>
                {/* Day Headers */}
                {DAYS.map(day => (
                    <div key={day} className={styles.dayHeader}>
                        {day}
                    </div>
                ))}

                {/* Date Cells */}
                {calendarDays.map((dayData, index) => (
                    <button
                        key={index}
                        className={`${styles.dayCell} 
                            ${dayData.empty ? styles.empty : ''} 
                            ${dayData.hasNotes ? styles.hasNotes : ''}
                            ${dayData.isToday ? styles.today : ''}`}
                        onClick={() => handleDateClick(dayData)}
                        disabled={dayData.empty}
                    >
                        {!dayData.empty && (
                            <>
                                <span className={styles.dayNumber}>{dayData.day}</span>
                                {dayData.hasNotes && (
                                    dayData.notes.length > 1 ? (
                                        <div className={styles.multiIndicator}>
                                            {[...Array(Math.min(dayData.notes.length, 3))].map((_, i) => (
                                                <span key={i} className={styles.multiDot} />
                                            ))}
                                        </div>
                                    ) : (
                                        <span className={styles.noteIndicator} />
                                    )
                                )}
                            </>
                        )}
                    </button>
                ))}
            </div>

            {/* Month Summary */}
            {monthNoteCount === 0 && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔮</div>
                    <p className={styles.emptyText}>No memories this month</p>
                    <p className={styles.emptySubtext}>
                        Navigate to find your moments together
                    </p>
                </div>
            )}
        </div>
    );
}
