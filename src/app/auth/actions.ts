
'use server';

import bcrypt from "bcryptjs";
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getUserByEmail, clearUserAuthToken } from '@/lib/data';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import type { User, UserRole } from '@/types';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db1 } from '@/lib/firebase';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  let userRole: UserRole | undefined;
  let isBiuUser = false;

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

    const isBcryptHash = user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$') || user.password?.startsWith('$2y$');

    let passwordsMatch = false;
    if (isBcryptHash) {
      passwordsMatch = await bcrypt.compare(password, user.password!);
    } else {
      passwordsMatch = password === user.password;
      if (passwordsMatch) {
        // Transparent migration: re-hash legacy plaintext password
        const hashed = await bcrypt.hash(password, 12);
        await updateDoc(doc(db1, 'users', user.id), { password: hashed });
      }
    }

    if (!passwordsMatch) {
        return 'Invalid email or password.';
    }
    
    const session = await getIronSession<User>(await cookies(), sessionOptions);
    session.id = user.id; 
    session.userName = user.userName;
    session.roleType = user.roleType;
    session.emailAddress = user.emailAddress;
    session.externalId = user.externalId;
    session.userSubRole = user.userSubRole;
    session.leadExternalId = user.leadExternalId;
    session.logoImage = user.logoImage;
    session.region = user.region;
    await session.save();

    userRole = user.roleType;

    if (user.emailAddress === 'biu@supermoney.in') {
      isBiuUser = true;
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return 'Invalid email or password format.';
    }
    console.error('Authentication Error:', error);
    return 'An unexpected error occurred.';
  }

  if (isBiuUser) {
    redirect('/select-anchor');
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
  const session = await getIronSession<User>(await cookies(), sessionOptions);
  
  if (session.id) {
      await clearUserAuthToken(session.id);
  }
  
  session.destroy();
  redirect('/');
}

const resetPasswordSchema = z.object({
    email: z.string().email(),
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export async function resetPassword(input: ResetPasswordInput): Promise<{ message?: string; error?: string }> {
    const validated = resetPasswordSchema.safeParse(input);

    if (!validated.success) {
        return { error: 'Invalid data provided.' };
    }

    const { email, newPassword } = validated.data;

    try {
        const usersRef = collection(db1, 'users');
        const q = query(usersRef, where('emailAddress', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { error: 'User with this email address not found.' };
        }

        const userDoc = querySnapshot.docs[0];
        const hashed = await bcrypt.hash(newPassword, 12);
        await updateDoc(userDoc.ref, { password: hashed });

        return { message: 'Password has been reset successfully.' };

    } catch (e) {
        console.error('Error resetting password:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { error: `Failed to reset password: ${errorMessage}` };
    }
}


export async function checkUserExists(email: string): Promise<{ exists: boolean; error?: string }> {
    if (!email) {
        return { exists: false, error: 'Email is required.' };
    }
    try {
        const user = await getUserByEmail(email);
        return { exists: !!user };
    } catch (e) {
        console.error('Error checking user existence:', e);
        return { exists: false, error: 'An error occurred while verifying the email.' };
    }
}
