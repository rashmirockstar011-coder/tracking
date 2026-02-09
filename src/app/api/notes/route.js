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

// GET all notes
export async function GET() {
    try {
        const notesRef = collection(db, 'notes');
        const q = query(notesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
            targetDate: doc.data().targetDate || null // Ensure targetDate is returned
        }));

        return NextResponse.json(notes);
    } catch (error) {
        console.error('GET notes error:', error);
        return NextResponse.json([]);
    }
}

// POST new note
export async function POST(request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content, tags, type, targetDate, completed } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const noteData = {
            title: title || 'Untitled', // Title optional for quick to-dos
            content,
            tags: tags || [],
            type: type || 'note', // 'note' or 'todo'
            targetDate: targetDate || null, // YYYY-MM-DD string for calendar items
            completed: completed || false,
            createdBy: user.userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'notes'), noteData);

        return NextResponse.json({ id: docRef.id, ...noteData });
    } catch (error) {
        console.error('POST note error:', error);
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}
