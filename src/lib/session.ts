
import { unsealData } from 'iron-session';
import { cookies } from 'next/headers';
import type { IronSessionOptions } from 'iron-session';
import type { User } from '@/types';
import { unstable_noStore as noStore } from 'next/cache';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'supermoney-anchor-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession(): Promise<User | null> {
  noStore();
  const cookieStore = cookies();
  const encryptedSession = cookieStore.get(sessionOptions.cookieName)?.value;

  if (!encryptedSession) {
    return null;
  }

  try {
    const sessionData = await unsealData<User>(encryptedSession, {
      password: sessionOptions.password,
    });
    
    if (!sessionData || !sessionData.id) {
        return null;
    }

    // Return a plain object, not the session instance
    return {
      id: sessionData.id,
      externalId: sessionData.externalId,
      userName: sessionData.userName,
      emailAddress: sessionData.emailAddress,
      roleType: sessionData.roleType,
      userSubRole: sessionData.userSubRole, // Include sub-role
      phoneNumber: sessionData.phoneNumber,
      lastLoginIp: sessionData.lastLoginIp,
      lastLoginTime: sessionData.lastLoginTime
    };

  } catch (error) {
    console.error('Failed to unseal session:', error);
    return null;
  }
}
