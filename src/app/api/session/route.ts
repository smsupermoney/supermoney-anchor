
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { NextResponse } from 'next/server';
import { User } from '@/types';

export async function GET() {
  const session = await getIronSession<User>(await cookies(), sessionOptions);
  
  if (!session.id) {
    return NextResponse.json({ message: 'Not logged in' }, { status: 401 });
  }

  // Explicitly return a plain data object to ensure correct JSON serialization
  return NextResponse.json({
    id: session.id,
    userName: session.userName,
    emailAddress: session.emailAddress,
    roleType: session.roleType,
    externalId: session.externalId,
    userSubRole: session.userSubRole,
    leadExternalId: session.leadExternalId,
    logoImage: session.logoImage,
    region: session.region,
    originalUser: session.originalUser
  });
}
