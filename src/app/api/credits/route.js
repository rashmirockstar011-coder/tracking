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

// GET all credits
export async function GET() {
    try {
        const creditsRef = collection(db, 'credits');
        const q = query(creditsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const credits = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
        }));

        return NextResponse.json(credits);
    } catch (error) {
        console.error('GET credits error:', error);
        return NextResponse.json([]);
    }
}

// POST new credit
export async function POST(request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, owedBy } = await request.json();

        if (!title || !owedBy) {
            return NextResponse.json({ error: 'Title and owedBy are required' }, { status: 400 });
        }

        const creditData = {
            title,
            description: description || '',
            owedBy,
            owedTo: owedBy === 'shiv' ? 'vaishnavi' : 'shiv',
            status: 'pending',
            createdBy: user.userId,
            createdAt: serverTimestamp(),
            redeemedAt: null
        };

        const docRef = await addDoc(collection(db, 'credits'), creditData);

        return NextResponse.json({ id: docRef.id, ...creditData });
    } catch (error) {
        console.error('POST credit error:', error);
        return NextResponse.json({ error: 'Failed to create credit' }, { status: 500 });
    }
}
