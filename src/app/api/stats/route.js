import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET() {
    try {
        // Get counts from Firestore
        const promisesQuery = query(
            collection(db, 'promises'),
            where('status', '==', 'pending')
        );
        const remindersQuery = query(
            collection(db, 'reminders'),
            where('completed', '==', false)
        );
        const creditsQuery = query(
            collection(db, 'credits'),
            where('status', '==', 'pending')
        );
        const notesRef = collection(db, 'notes');

        const [promisesSnap, remindersSnap, creditsSnap, notesSnap] = await Promise.all([
            getDocs(promisesQuery),
            getDocs(remindersQuery),
            getDocs(creditsQuery),
            getDocs(notesRef)
        ]);

        return NextResponse.json({
            promises: promisesSnap.size,
            reminders: remindersSnap.size,
            credits: creditsSnap.size,
            notes: notesSnap.size
        });
    } catch (error) {
        console.error('Stats error:', error);
        // Return zeros if Firebase isn't configured yet
        return NextResponse.json({
            promises: 0,
            reminders: 0,
            credits: 0,
            notes: 0
        });
    }
}
