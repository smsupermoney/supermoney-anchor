import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    limit, 
    doc, 
    getDoc, 
    writeBatch 
} from 'firebase/firestore';

const createDealerSchema = z.object({
  customerId: z.string().min(1, 'customerId is required.'),
  applicationId: z.string().min(1, 'applicationId is required.'),
  dealerName: z.string().min(1, 'dealerName is required.'),
  gst: z.string().min(1, 'gst is required.'),
  emailAddress: z.string().email('Invalid email address.'),
  city: z.string().min(1, 'city is required.'),
  state: z.string().min(1, 'state is required.'),
  programName: z.string().min(1, 'programName is required.'),
  lender: z.string().min(1, 'lender is required.'), // This is the SmartdashLender value
  company: z.string().min(1, 'company is required.'), // This is the SmartdashCompanyName value
});

export async function POST(request: Request) {
  // 1. Secure the endpoint with an API key
  const authHeader = request.headers.get('Authorization');
  const expectedApiKey = process.env.CREATE_DEALER_API_SECRET_KEY;

  if (!expectedApiKey) {
    console.error('CREATE_DEALER_API_SECRET_KEY is not set in environment variables.');
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

  const validated = createDealerSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ 
        error: 'Invalid request body.', 
        details: validated.error.flatten() 
    }, { status: 400 });
  }

  const data = validated.data;

  try {
    // 3. Resolve anchorId from SmartdashCompanyName
    const usersRef = collection(db1, 'users');
    const anchorQuery = query(
      usersRef,
      where('SmartdashCompanyName', '==', data.company),
      limit(1)
    );
    const anchorSnapshot = await getDocs(anchorQuery);
    if (anchorSnapshot.empty) {
      return NextResponse.json({ error: `Anchor with Smartdash company name "${data.company}" not found.` }, { status: 404 });
    }
    const anchorId = anchorSnapshot.docs[0].data().externalId;

    // 4. Resolve programId from SmartdashLender
    const programsRef = collection(db1, 'programs');
    const programQuery = query(
      programsRef,
      where('SmartdashLender', '==', data.lender),
      limit(1)
    );
    const programSnapshot = await getDocs(programQuery);
    if (programSnapshot.empty) {
        return NextResponse.json({ error: `Program with Smartdash lender "${data.lender}" not found.` }, { status: 404 });
    }
    const programId = programSnapshot.docs[0].id;

    // 5. Resolve Zone from regionMapping
    // We check state first since city-level mapping was removed from the UI as per instructions
    const regionId = data.state.toLowerCase().trim().replace(/\s+/g, '-');
    const regionDoc = await getDoc(doc(db1, 'regionMapping', regionId));
    const zone = regionDoc.exists() ? regionDoc.data().region : 'Other';

    // 6. Create Dealer and Limits in a batch
    const batch = writeBatch(db1);
    const dealerRef = doc(db1, 'dealers', data.applicationId);
    const limitRef = doc(db1, 'dealerLimits', data.applicationId);

    const dealerPayload = {
      dealerId: data.applicationId,
      customerId: data.customerId,
      applicationId: data.applicationId,
      programId: programId,
      anchorId: anchorId,
      dealerName: data.dealerName,
      dealerName_lowercase: data.dealerName.toLowerCase(),
      status: 'Pending',
      GST: data.gst,
      emailAddress: data.emailAddress,
      city: data.city,
      state: data.state,
      region: zone,
      createdAt: new Date().toISOString(),
    };

    const limitPayload = {
      dealerId: data.applicationId,
      applicationId: data.applicationId,
      limitAmount: 0,
      utilisationAmount: 0,
      availableAmount: 0,
      principalOverdue: 0,
      principalDPD: 0,
    };

    batch.set(dealerRef, dealerPayload);
    batch.set(limitRef, limitPayload);

    await batch.commit();

    return NextResponse.json({ 
        message: 'Dealer created successfully.', 
        dealerId: data.applicationId,
        resolvedAnchorId: anchorId,
        resolvedProgramId: programId,
        resolvedZone: zone
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating dealer via API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: 'Failed to create dealer.', details: errorMessage }, { status: 500 });
  }
}
