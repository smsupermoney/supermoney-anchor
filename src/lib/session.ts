
import type { IronSessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { User } from '@/types';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'supermoney-anchor-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// This is the new, reliable way to get the session on the server
export async function getSession() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  
  // Using .get() on the session object will not return the session data.
  // The session object itself is the data. We check for a property like `id`
  // to see if the session is populated.
  if (!session.id) {
    return null;
  }
  return session;
}


declare module 'iron-session' {
  interface IronSessionData extends User {}
}
