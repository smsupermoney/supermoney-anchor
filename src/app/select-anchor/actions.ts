
'use server';

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import type { User } from '@/types';
import { redirect } from 'next/navigation';

export async function setImpersonation(anchorData: { externalId: string, leadExternalId?: string, userName: string, logoImage?: string, region?: string }) {
    const session = await getIronSession<User>(cookies(), sessionOptions);

    if (!session.id || session.emailAddress !== 'biu@supermoney.in') {
        throw new Error('Unauthorized to perform this action.');
    }

    if (!session.originalUser) {
        session.originalUser = {
            id: session.id,
            userName: session.userName,
            emailAddress: session.emailAddress,
            roleType: session.roleType,
            externalId: session.externalId,
            leadExternalId: session.leadExternalId,
        };
    }
    
    session.externalId = anchorData.externalId;
    session.leadExternalId = anchorData.leadExternalId || anchorData.externalId;
    session.userName = anchorData.userName;
    session.logoImage = anchorData.logoImage;
    session.region = anchorData.region;
    
    session.roleType = 'Anchor';
    
    await session.save();

    redirect('/dashboard');
}

export async function clearImpersonation() {
    const session = await getIronSession<User>(cookies(), sessionOptions);

    if (!session.id || !session.originalUser) {
        redirect(session.id ? '/dashboard' : '/');
        return;
    }
    
    const originalUser = session.originalUser;
    
    session.userName = originalUser.userName;
    session.emailAddress = originalUser.emailAddress;
    session.roleType = originalUser.roleType;
    session.externalId = originalUser.externalId;
    session.leadExternalId = originalUser.leadExternalId;
    
    session.logoImage = undefined;
    session.region = undefined;
    session.originalUser = undefined;

    await session.save();

    redirect('/select-anchor');
}
