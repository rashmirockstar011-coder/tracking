import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';

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

// GET single promise
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const docRef = doc(db, 'promises', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        console.error('GET promise error:', error);
        return NextResponse.json({ error: 'Failed to get promise' }, { status: 500 });
    }
}

// PATCH update promise status
export async function PATCH(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await request.json();

        const docRef = doc(db, 'promises', id);
        await updateDoc(docRef, {
            status,
            history: arrayUnion({
                action: `marked as ${status}`,
                by: user.userId,
                date: new Date().toISOString()
            })
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH promise error:', error);
        return NextResponse.json({ error: 'Failed to update promise' }, { status: 500 });
    }
}

// DELETE promise
export async function DELETE(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await deleteDoc(doc(db, 'promises', id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE promise error:', error);
        return NextResponse.json({ error: 'Failed to delete promise' }, { status: 500 });
    }
}
