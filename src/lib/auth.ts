import { getSession } from "@/lib/session";

export type AuthResult = { error: string } | null;

export async function requireAdmin(): Promise<AuthResult> {
  const session = await getSession();
  if (!session || session.roleType !== 'Admin') {
    return { error: 'Unauthorized. Admin access required.' };
  }
  return null;
}

export async function requireAnchorOrAdmin(dealerAnchorId: string): Promise<AuthResult> {
  const session = await getSession();
  if (!session) {
    return { error: 'Authentication required.' };
  }
  if (session.roleType === 'Admin') {
    return null;
  }
  if (session.roleType === 'Anchor' && session.externalId === dealerAnchorId) {
    return null;
  }
  return { error: 'Unauthorized. You do not have access to this dealer.' };
}
