import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from './DashboardLayout';

export const metadata = {
    title: 'Dashboard - Rashii 💕',
};

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

export default async function Layout({ children }) {
    const user = await getUser();

    if (!user) {
        redirect('/');
    }

    return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
