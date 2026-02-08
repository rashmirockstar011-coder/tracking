import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// For now, we'll use environment variables for PIN storage
// In production, these would be stored in Firestore
const USERS = {
    shiv: {
        id: 'shiv',
        name: 'Shiv',
        // Default PIN is 1234 - user should change this
        pinHash: process.env.SHIV_PIN_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    },
    vaishnavi: {
        id: 'vaishnavi',
        name: 'Vaishnavi',
        // Default PIN is 1234 - user should change this
        pinHash: process.env.VAISHNAVI_PIN_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    }
};

export async function POST(request) {
    try {
        const { userId, pin } = await request.json();

        // Validate input
        if (!userId || !pin) {
            return NextResponse.json(
                { error: 'Missing credentials' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = USERS[userId];
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            );
        }

        // Verify PIN
        const isValid = await bcrypt.compare(pin, user.pinHash);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid PIN' },
                { status: 401 }
            );
        }

        // Create session cookie
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'rashii_session',
            value: JSON.stringify({
                userId: user.id,
                name: user.name,
                loginTime: Date.now()
            }),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name }
        });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

// Logout endpoint
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('rashii_session');
    return NextResponse.json({ success: true });
}
