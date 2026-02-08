import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

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

// PATCH update reminder
export async function PATCH(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const updates = await request.json();

        const docRef = doc(db, 'reminders', id);
        await updateDoc(docRef, updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH reminder error:', error);
        return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
    }
}

// DELETE reminder
export async function DELETE(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await deleteDoc(doc(db, 'reminders', id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE reminder error:', error);
        return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
    }
}
