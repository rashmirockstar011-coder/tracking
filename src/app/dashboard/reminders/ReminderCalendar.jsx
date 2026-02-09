'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './reminders.module.css';

export default function ReminderCalendar({ reminders }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthYear = useMemo(() => {
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [currentDate]);

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= lastDate; day++) {
            days.push(day);
        }

        return days;
    }, [currentDate]);

    const getRemindersForDate = (day) => {
        if (!day) return [];

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];

        return reminders.filter(r => r.date?.startsWith(dateStr));
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className={styles.calendar}>
            {/* Calendar Header */}
            <div className={styles.calendarHeader}>
                <button className="btn btn-ghost btn-icon" onClick={goToPreviousMonth}>
                    <ChevronLeft size={20} />
                </button>
                <div className={styles.calendarTitle}>
                    {monthYear}
                </div>
                <button className="btn btn-ghost btn-icon" onClick={goToNextMonth}>
                    <ChevronRight size={20} />
                </button>
            </div>

            <button className="btn btn-ghost" onClick={goToToday} style={{ marginBottom: 'var(--space-md)', width: '100%' }}>
                Today
            </button>

            {/* Weekday Headers */}
            <div className={styles.calendarGrid}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={styles.weekdayHeader}>
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {daysInMonth.map((day, index) => {
                    const dayReminders = getRemindersForDate(day);
                    const isToday = day &&
                        day === new Date().getDate() &&
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear();

                    return (
                        <div
                            key={index}
                            className={`${styles.calendarDay} ${!day ? styles.empty : ''} ${isToday ? styles.today : ''}`}
                        >
                            {day && (
                                <>
                                    <div className={styles.dayNumber}>{day}</div>
                                    {dayReminders.length > 0 && (
                                        <div className={styles.reminderIndicators}>
                                            {dayReminders.slice(0, 3).map((reminder, i) => (
                                                <div
                                                    key={reminder.id}
                                                    className={styles.reminderDot}
                                                    title={reminder.title}
                                                />
                                            ))}
                                            {dayReminders.length > 3 && (
                                                <div className={styles.reminderMore}>
                                                    +{dayReminders.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
