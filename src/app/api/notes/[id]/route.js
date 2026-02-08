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

// PATCH update note
export async function PATCH(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { title, content, tags } = await request.json();

        const updates = {
            updatedAt: serverTimestamp()
        };

        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (tags !== undefined) updates.tags = tags;

        const docRef = doc(db, 'notes', id);
        await updateDoc(docRef, updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH note error:', error);
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}

// DELETE note
export async function DELETE(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await deleteDoc(doc(db, 'notes', id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE note error:', error);
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}
