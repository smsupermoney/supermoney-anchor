
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getUserByEmail } from '@/lib/data';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import type { User } from '@/types';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  let userRole: "Admin" | "Anchor" | "Dealer" | undefined;
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
  } else {
    redirect('/dashboard');
  }
}

export async function logout() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  session.destroy();
  redirect('/');
}
