
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getUserByEmail, clearUserAuthToken } from '@/lib/data';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import type { User, UserRole } from '@/types';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  let userRole: UserRole | undefined;
  try {
    const { email, password } = z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
      })
      .parse(Object.fromEntries(formData.entries()));

    const user = await getUserByEmail(email);

    if (!user) {
      return 'Invalid email or password.';
    }

    const passwordsMatch = password === user.password;

    if (!passwordsMatch) {
        return 'Invalid email or password.';
    }
    
    const session = await getIronSession<User>(cookies(), sessionOptions);
    session.id = user.id;
    session.userName = user.userName;
    session.roleType = user.roleType;
    session.emailAddress = user.emailAddress;
    session.externalId = user.externalId;
    session.userSubRole = user.userSubRole;
    session.leadExternalId = user.leadExternalId;
    await session.save();

    userRole = user.roleType;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return 'Invalid email or password format.';
    }
    console.error('Authentication Error:', error);
    return 'An unexpected error occurred.';
  }

  if (userRole === 'Admin') {
    redirect('/add-program');
  } else if (userRole === 'SuperMoney User') {
    redirect('/add-invoice');
  } else {
    redirect('/dashboard');
  }
}

export async function logout() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  
  if (session.id) {
      await clearUserAuthToken(session.id);
  }
  
  session.destroy();
  redirect('/');
}
