
import { getUsers } from '@/lib/data';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import SelectAnchorClient from './client-page';

export default async function SelectAnchorPage() {
    const session = await getSession();
    
    if (!session || session.emailAddress !== 'biu@supermoney.in') {
        redirect('/');
    }

    if (session.originalUser) {
        redirect('/dashboard');
    }

    const allUsers = await getUsers();
    const anchors = allUsers.filter(u => u.roleType === 'Anchor');

    return <SelectAnchorClient anchors={anchors} />;
}
