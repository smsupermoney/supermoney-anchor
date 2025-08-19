
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

// Define the schema for the incoming request body
const getDealerIdSchema = z.object({
  customerId: z.string().min(1, 'customerId is required.'),
  dealerName: z.string().min(1, 'dealerName is required.'),
  anchorName: z.string().min(1, 'anchorName is required.'),
});

export async function POST(request: Request) {
  // 1. Secure the endpoint with an API key
  const authHeader = request.headers.get('Authorization');
  const expectedApiKey = process.env.DEALER_API_SECRET_KEY;

  if (!expectedApiKey) {
    console.error('DEALER_API_SECRET_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedApiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate the request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validated = getDealerIdSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body.', details: validated.error.flatten() }, { status: 400 });
  }

  const { customerId, dealerName, anchorName } = validated.data;

  try {
    // 3. Find the anchorId from the anchorName
    const usersRef = collection(db1, 'users');
    const anchorQuery = query(
      usersRef,
      where('roleType', '==', 'Anchor'),
      where('userName', '==', anchorName),
      limit(1)
    );
    const anchorSnapshot = await getDocs(anchorQuery);

    if (anchorSnapshot.empty) {
      return NextResponse.json({ error: `Anchor with name "${anchorName}" not found.` }, { status: 404 });
    }
    const anchorId = anchorSnapshot.docs[0].data().externalId;

    // 4. Find the dealer using customerId, dealerName_lowercase, and the retrieved anchorId
    const dealersRef = collection(db1, 'dealers');
    const dealerQuery = query(
      dealersRef,
      where('customerId', '==', customerId),
      where('dealerName_lowercase', '==', dealerName.toLowerCase()),
      where('anchorId', '==', anchorId),
      limit(1)
    );
    const dealerSnapshot = await getDocs(dealerQuery);

    if (dealerSnapshot.empty) {
      return NextResponse.json({ error: 'Dealer not found with the specified criteria.' }, { status: 404 });
    }

    const dealerData = dealerSnapshot.docs[0].data();
    
    // 5. Return the entire dealer object
    return NextResponse.json(dealerData, { status: 200 });

  } catch (error) {
    console.error('Error fetching dealer ID:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: 'Failed to retrieve dealer ID.', details: errorMessage }, { status: 500 });
  }
}
