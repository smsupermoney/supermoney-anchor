import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';

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
    
    // --- NEW LOGIC: Call External API ---

    // A. Fetch program to get lender name
    let lenderName = 'N/A';
    if (dealerData.programId) {
        const programRef = doc(db1, 'programs', dealerData.programId);
        const programSnap = await getDoc(programRef);
        if (programSnap.exists()) {
            lenderName = programSnap.data().lenderName || 'N/A';
        }
    }
    
    // B. Construct payload for the external API
    const externalApiPayload = {
      invoiceNumber: "INV-GAS-001", // Static value from user's example
      utrNumber: "UTR999888", // Static value from user's example
      dealer: dealerData.dealerName, // From fetched dealer data
      lender: lenderName, // From fetched program data
      date: new Date().toISOString().split('T')[0], // Using current date as a sensible default
      amount: 25000, // Static value from user's example
      status: "Pending", // Static value from user's example
      customerId: dealerData.customerId, // From fetched dealer data
      applicationId: dealerData.applicationId, // From fetched dealer data
      remarks: "Sent via Supermoney Platform API" // Updated remark
    };
    
    // C. Call external API (fire-and-forget)
    try {
      const externalApiUrl = 'https://app.supermoney.in/api/invoices/upsert';
      const apiKey = process.env.DEALER_API_SECRET_KEY;

      if (!apiKey) {
          console.error('DEALER_API_SECRET_KEY is not set. Cannot call external API.');
      } else {
        // We don't await this promise so it doesn't block the primary API response.
        fetch(externalApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(externalApiPayload)
        })
        .then(async (response) => {
          if (!response.ok) {
            const errorBody = await response.text();
            console.error(`External API Error (${response.status}): ${errorBody}`);
          } else {
            console.log('Successfully pushed data to external invoices API.');
          }
        })
        .catch(e => {
           console.error('Error during external API fetch call:', e);
        });
      }
    } catch (e) {
      console.error('Error preparing or initiating external API call:', e);
      // Log the error but do not fail the main request.
    }
    
    // --- END of NEW LOGIC ---

    // 5. Return the entire dealer object
    return NextResponse.json(dealerData, { status: 200 });

  } catch (error) {
    console.error('Error fetching dealer ID:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: 'Failed to retrieve dealer ID.', details: errorMessage }, { status: 500 });
  }
}
