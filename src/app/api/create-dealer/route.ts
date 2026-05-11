import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { lookupZone } from '@/lib/region-mapping';

const createDealerSchema = z.object({
  customerId: z.string().min(1, 'customerId is required.'),
  applicationId: z.string().min(1, 'applicationId is required.'),
  dealerName: z.string().min(1, 'dealerName is required.'),
  gst: z.string().regex(/^[a-zA-Z0-9]{15}$/, 'GST must be a valid 15-character alphanumeric string.'),
  emailAddress: z.string().email('Invalid email address.').optional().or(z.literal('')),
  city: z.string().min(1, 'city is required.'),
  state: z.string().min(1, 'state is required.'),
  programName: z.string().optional(),
  lender: z.string().min(1, 'lender is required.'),
  company: z.string().min(1, 'company is required.'),
});

export async function POST(request: Request) {
  // 1. Auth — dedicated key for this endpoint
  const authHeader = request.headers.get('Authorization');
  const expectedApiKey = process.env.CREATE_DEALER_API_SECRET_KEY;

  if (!expectedApiKey) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedApiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validated = createDealerSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body.', details: validated.error.flatten() }, { status: 400 });
  }

  const { customerId, applicationId, dealerName, gst, emailAddress, city, state, programName, lender, company } = validated.data;

  try {
    // 3. Zone lookup — Firestore regionMapping first, then static fallback
    let zone: string | null = null;

    const stateKey = state.toLowerCase().replace(/\s+/g, '-');
    const regionDoc = await getDoc(doc(db1, 'regionMapping', stateKey));
    if (regionDoc.exists()) {
      zone = regionDoc.data().region;
    }

    if (!zone) {
      zone = lookupZone(city, state);
    }

    if (!zone) {
      return NextResponse.json({ error: `Zone not found for state "${state}" and city "${city}".` }, { status: 400 });
    }

    // 4. Anchor lookup — find externalId from users by SmartdashCompanyName
    const usersRef = collection(db1, 'users');
    const anchorQuery = query(
      usersRef,
      where('roleType', '==', 'Anchor'),
      where('SmartdashCompanyName', '==', company),
      limit(1)
    );
    const anchorSnap = await getDocs(anchorQuery);

    if (anchorSnap.empty) {
      return NextResponse.json({ error: `Anchor not found for company "${company}".` }, { status: 404 });
    }

    const anchorUser = anchorSnap.docs[0].data();
    const anchorId = anchorUser.externalId;

    if (!anchorId) {
      return NextResponse.json({ error: `Anchor user for company "${company}" has no externalId.` }, { status: 404 });
    }

    // 5. Program lookup — find programId from programs by SmartdashLender
    const programsRef = collection(db1, 'programs');
    const programQuery = query(
      programsRef,
      where('SmartdashLender', '==', lender),
      limit(1)
    );
    const programSnap = await getDocs(programQuery);

    if (programSnap.empty) {
      return NextResponse.json({ error: `Program not found for lender "${lender}".` }, { status: 404 });
    }

    const programData = programSnap.docs[0].data();
    const programId = programSnap.docs[0].id;

    // 6. Duplicate check — anchorId + GST combo must be unique
    const dealersRef = collection(db1, 'dealers');
    const dupQuery = query(
      dealersRef,
      where('anchorId', '==', anchorId),
      where('GST', '==', gst),
      limit(1)
    );
    const dupSnap = await getDocs(dupQuery);

    if (!dupSnap.empty) {
      return NextResponse.json({
        error: `Dealer with GST "${gst}" already exists for this anchor.`,
        existingDealerId: dupSnap.docs[0].id,
      }, { status: 409 });
    }

    // 7. Write dealer document
    const dealerRef = doc(db1, 'dealers', applicationId);
    const dealerNameLower = dealerName.toLowerCase();
    const dealerData = {
      dealerId: applicationId,
      customerId,
      applicationId,
      programId,
      anchorId,
      dealerName,
      dealerName_lowercase: dealerNameLower,
      status: 'Pending',
      GST: gst,
      region: zone,
      emailAddress: emailAddress || '',
      branchName: '',
      branchEmailId: '',
    };

    await setDoc(dealerRef, dealerData);

    // 8. Write dealerLimits document with default 0 values
    const limitRef = doc(db1, 'dealerLimits', applicationId);
    const limitData = {
      dealerId: applicationId,
      applicationId,
      limitAmount: 0,
      utilisationAmount: 0,
      availableAmount: 0,
      principalOverdue: 0,
    };

    await setDoc(limitRef, limitData);

    return NextResponse.json({
      message: 'Dealer created successfully.',
      dealer: dealerData,
    }, { status: 201 });

  } catch (error) {
    console.error('Create dealer error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: 'Failed to create dealer.', details: errorMessage }, { status: 500 });
  }
}
