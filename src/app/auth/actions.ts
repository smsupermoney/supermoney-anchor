'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getUserByEmail } from '@/lib/data';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  console.log("Comming Here");
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

    // For a real app, you MUST hash and compare passwords.
    // This is a temporary solution for the prototype.
    const passwordsMatch = password === user.password;

    if (!passwordsMatch) {
        return 'Invalid email or password.';
    }
    
    // If we reach here, the credentials are valid.
    // The redirect will happen outside the try...catch block.

  } catch (error) {
    if (error instanceof z.ZodError) {
      return 'Invalid email or password format.';
    }
    
    // Log the actual error for debugging, but return a generic message to the user.
    console.error('Authentication Error:', error);
    return JSON.stringify(error);
  }

  // Redirect only on successful authentication.
  // The redirect function throws an error, so it must be outside the `try` block.
  redirect('/dashboard');
}
