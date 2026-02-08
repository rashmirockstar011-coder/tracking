import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

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

// GET all promises
export async function GET() {
    try {
        const promisesRef = collection(db, 'promises');
        const q = query(promisesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const promises = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            dueDate: doc.data().dueDate || null
        }));

        return NextResponse.json(promises);
    } catch (error) {
        console.error('GET promises error:', error);
        return NextResponse.json([]);
    }
}

// POST new promise
export async function POST(request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, dueDate } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const promiseData = {
            title,
            description: description || '',
            dueDate: dueDate || null,
            status: 'pending',
            createdBy: user.userId,
            createdAt: serverTimestamp(),
            history: [{
                action: 'created',
                by: user.userId,
                date: new Date().toISOString()
            }]
        };

        const docRef = await addDoc(collection(db, 'promises'), promiseData);

        return NextResponse.json({ id: docRef.id, ...promiseData });
    } catch (error) {
        console.error('POST promise error:', error);
        return NextResponse.json({ error: 'Failed to create promise' }, { status: 500 });
    }
}
