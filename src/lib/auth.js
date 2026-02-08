import { cookies } from 'next/headers';

// User configuration
export const USERS = {
    shiv: {
        id: 'shiv',
        name: 'Shiv',
        emoji: '💙',
        email: 'useiteverywhereboy@gmail.com'
    },
    vaishnavi: {
        id: 'vaishnavi',
        name: 'Vaishnavi',
        emoji: '💜',
        email: '' // Can be set later
    }
};

// Get current user from session
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('rashii_session');

    if (!session) return null;

    try {
        const userData = JSON.parse(session.value);
        return USERS[userData.userId] || null;
    } catch {
        return null;
    }
}

// Create session cookie
export function createSessionCookie(userId) {
    return {
        name: 'rashii_session',
        value: JSON.stringify({ userId, loginTime: Date.now() }),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0 // Session cookie - expires when browser closes
    };
}
