import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

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

// PATCH update credit
export async function PATCH(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await request.json();

        const updates = { status };
        if (status === 'redeemed') {
            updates.redeemedAt = serverTimestamp();
        }

        const docRef = doc(db, 'credits', id);
        await updateDoc(docRef, updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH credit error:', error);
        return NextResponse.json({ error: 'Failed to update credit' }, { status: 500 });
    }
}

// DELETE credit
export async function DELETE(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await deleteDoc(doc(db, 'credits', id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE credit error:', error);
        return NextResponse.json({ error: 'Failed to delete credit' }, { status: 500 });
    }
}
