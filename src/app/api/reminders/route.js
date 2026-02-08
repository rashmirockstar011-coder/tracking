import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

async function getUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('rashii_session');
    if (!session) return null;
    try {
        return JSON.parse(session.value);
    } catch {
        return null;
    }
}

// GET all reminders
export async function GET() {
    try {
        const remindersRef = collection(db, 'reminders');
        const q = query(remindersRef, orderBy('datetime', 'asc'));
        const snapshot = await getDocs(q);

        const reminders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
        }));

        return NextResponse.json(reminders);
    } catch (error) {
        console.error('GET reminders error:', error);
        return NextResponse.json([]);
    }
}

// POST new reminder
export async function POST(request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, datetime, recurrence, emailNotify } = await request.json();

        if (!title || !datetime) {
            return NextResponse.json({ error: 'Title and datetime are required' }, { status: 400 });
        }

        const reminderData = {
            title,
            datetime,
            recurrence: recurrence || 'none',
            emailNotify: emailNotify ?? true,
            completed: false,
            emailSentAt: null,
            createdBy: user.userId,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'reminders'), reminderData);

        return NextResponse.json({ id: docRef.id, ...reminderData });
    } catch (error) {
        console.error('POST reminder error:', error);
        return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
    }
}
