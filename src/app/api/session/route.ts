
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { NextResponse } from 'next/server';
import { User } from '@/types';

export async function GET() {
  const session = await getIronSession<User>(cookies(), sessionOptions);
  
  if (!session.id) {
    return NextResponse.json({ message: 'Not logged in' }, { status: 401 });
  }

  return NextResponse.json(session);
}
