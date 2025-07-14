
/**
 * ==================================================================
 * HOW TO IMPORT THIS DATA INTO FIRESTORE
 * ==================================================================
 *
 * 1.  Go to your Firebase Console: https://console.firebase.google.com/
 * 2.  Select your project.
 * 3.  In the left-hand menu, go to "Build" > "Firestore Database".
 *
 * 4.  For each collection (users, programs, dealers, invoices):
 *     a. Click "+ Start collection".
 *     b. For the "Collection ID", enter the name (e.g., "users").
 *     c. Instead of adding documents one by one, Firestore will create the first one for you. Click "Next".
 *     d. For "Document ID", click "Auto-ID".
 *     e. Now, copy one of the JSON objects from the corresponding array below (e.g., the first user object from `dummyUsers`).
 *     f. In the Firestore UI, you will see fields like 'field' and 'value'.
 *        - For each key-value pair in the JSON object (like "id": "USR001"), enter the key (e.g., 'id') as the field name and the value (e.g., 'USR001') as the field value.
 *        - Make sure to select the correct data type (String, Number, etc.).
 *        - For arrays (like `anchorIds`), set the data type to 'array'. Then you can add each string value to the array.
 *     g. Click "Save" to create the first document.
 *
 * 5.  To add the rest of the documents for that collection:
 *     a. Click "+ Add document" just below the collection name.
 *     b. Repeat step 4d-4g for each remaining item in the array.
 *
 * This manual process is great for getting started with a small amount of data.
 * For larger datasets, you would typically use the Firebase Admin SDK in a script.
 *
 */

// --- DUMMY USERS (Anchors & Admins) ---
export const dummyUsers = [
  {
    id: 'USR001',
    externalId: 'ANC001',
    userName: 'Stark Industries',
    password: 'password',
    phoneNumber: '9876543210',
    emailAddress: 'anchor@supermoney.in',
    roleType: 'Anchor',
    lastLoginTime: '2024-07-22T10:00:00Z',
    lastLoginIp: '192.168.1.1',
  },
  {
    id: 'USR002',
    externalId: 'ANC002',
    userName: 'Wayne Enterprises',
    password: 'password',
    phoneNumber: '9876543211',
    emailAddress: 'wayne@example.com',
    roleType: 'Anchor',
    lastLoginTime: '2024-07-22T11:00:00Z',
    lastLoginIp: '192.168.1.2',
  },
   {
    id: 'USR003',
    externalId: 'ADMIN001',
    userName: 'Supermoney Admin',
    password: 'password',
    phoneNumber: '9999999999',
    emailAddress: 'admin@supermoney.in',
    roleType: 'Admin',
    lastLoginTime: '2024-07-22T12:00:00Z',
    lastLoginIp: '127.0.0.1',
  }
];

// --- DUMMY PROGRAMS ---
// Each program is linked to one or more anchors via `anchorIds`.
export const dummyPrograms = [
  {
    id: 'PROG001',
    anchorIds: ['ANC001'], // Linked to Stark Industries
    lenderName: 'Supermoney Finance',
    lenderType: 'Supermoney',
    totalLimit: 5000000,
    usedLimit: 1250000,
    invoicesCount: 10,
    disbursedAmount: 1250000,
    totalDealers: 2,
    overdueCount: 1,
    pendingInvoicesCount: 3,
  },
  {
    id: 'PROG002',
    anchorIds: ['ANC001', 'ANC002'], // Linked to Stark Industries AND Wayne Enterprises
    lenderName: 'CHOLAMANDALAM INVEST...',
    lenderType: 'External',
    totalLimit: 10000000,
    usedLimit: 4500000,
    invoicesCount: 15,
    disbursedAmount: 4500000,
    totalDealers: 1,
    overdueCount: 0,
    pendingInvoicesCount: 5,
  },
  {
    id: 'PROG003',
    anchorIds: ['ANC002'], // Linked to Wayne Enterprises
    lenderName: 'ADITYA BIRLA CAPITAL LTD',
    lenderType: 'External',
    totalLimit: 7500000,
    usedLimit: 2000000,
    invoicesCount: 8,
    disbursedAmount: 2000000,
    totalDealers: 1,
    overdueCount: 2,
    pendingInvoicesCount: 2,
  },
];

// --- DUMMY DEALERS ---
// Each dealer is linked to an anchor and one or more programs.
export const dummyDealers = [
  {
    id: 'DLR001',
    anchorId: 'ANC001',
    programIds: ['PROG001'],
    name: 'Star Electronics',
    status: 'Active',
    creditAssigned: 2000000,
    invoicesSubmitted: 5,
    amountDisbursed: 750000,
    overdueCount: 1,
    overdueAmount: 150000,
    lenders: ['Supermoney Finance'],
  },
  {
    id: 'DLR002',
    anchorId: 'ANC001',
    programIds: ['PROG001', 'PROG002'],
    name: 'Future Gadgets',
    status: 'Active',
    creditAssigned: 3000000,
    invoicesSubmitted: 5,
    amountDisbursed: 500000,
    overdueCount: 0,
    overdueAmount: 0,
    lenders: ['Supermoney Finance', 'CHOLAMANDALAM INVEST...'],
  },
  {
    id: 'DLR003',
    anchorId: 'ANC001',
    programIds: ['PROG002'],
    name: 'Innovative Tech',
    status: 'Inactive',
    creditAssigned: 5000000,
    invoicesSubmitted: 15,
    amountDisbursed: 4500000,
    overdueCount: 0,
    overdueAmount: 0,
    lenders: ['CHOLAMANDALAM INVEST...'],
  },
  {
    id: 'DLR004',
    anchorId: 'ANC002',
    programIds: ['PROG003', 'PROG002'],
    name: 'Gotham Goods',
    status: 'Active',
    creditAssigned: 4000000,
    invoicesSubmitted: 8,
    amountDisbursed: 2000000,
    overdueCount: 2,
    overdueAmount: 250000,
    lenders: ['ADITYA BIRLA CAPITAL LTD'],
  },
];

// --- DUMMY INVOICES ---
// Each invoice is linked to a dealer, an anchor, and a program.
export const dummyInvoices = [
  // Invoices for Star Electronics (DLR001) under Stark (ANC001) in Program PROG001
  {
    id: 'INV001',
    dealerId: 'DLR001',
    anchorId: 'ANC001',
    programId: 'PROG001',
    invoiceNumber: 'SE-2024-001',
    dealerName: 'Star Electronics',
    amount: 150000,
    date: '2024-07-01',
    dueDate: '2024-07-15',
    eWayBillNumber: 'EWB112233',
    status: 'Disbursed',
    lender: 'Supermoney Finance',
    overdueAmount: 150000,
  },
  {
    id: 'INV002',
    dealerId: 'DLR001',
    anchorId: 'ANC001',
    programId: 'PROG001',
    invoiceNumber: 'SE-2024-002',
    dealerName: 'Star Electronics',
    amount: 250000,
    date: '2024-07-05',
    dueDate: '2024-08-04',
    eWayBillNumber: 'EWB112234',
    status: 'Approved',
    lender: 'Supermoney Finance',
    overdueAmount: 0,
  },
  // Invoices for Future Gadgets (DLR002) under Stark (ANC001) in Program PROG002
  {
    id: 'INV003',
    dealerId: 'DLR002',
    anchorId: 'ANC001',
    programId: 'PROG002',
    invoiceNumber: 'FG-2024-001',
    dealerName: 'Future Gadgets',
    amount: 300000,
    date: '2024-07-10',
    dueDate: '2024-08-09',
    eWayBillNumber: 'EWB223344',
    status: 'Sent to Lender',
    lender: 'CHOLAMANDALAM INVEST...',
    overdueAmount: 0,
  },
  // Invoices for Gotham Goods (DLR004) under Wayne (ANC002) in Program PROG003
  {
    id: 'INV004',
    dealerId: 'DLR004',
    anchorId: 'ANC002',
    programId: 'PROG003',
    invoiceNumber: 'GG-2024-001',
    dealerName: 'Gotham Goods',
    amount: 500000,
    date: '2024-06-20',
    dueDate: '2024-07-20',
    eWayBillNumber: 'EWB334455',
    status: 'Disbursed',
    lender: 'ADITYA BIRLA CAPITAL LTD',
    overdueAmount: 0,
  },
  {
    id: 'INV005',
    dealerId: 'DLR004',
    anchorId: 'ANC002',
    programId: 'PROG003',
    invoiceNumber: 'GG-2024-002',
    dealerName: 'Gotham Goods',
    amount: 250000,
    date: '2024-06-25',
    dueDate: '2024-07-10',
    eWayBillNumber: 'EWB334456',
    status: 'Disbursed',
    lender: 'ADITYA BIRLA CAPITAL LTD',
    overdueAmount: 250000,
  },
  // Invoice for Gotham Goods (DLR004) under Wayne (ANC002) but in the shared Program PROG002
  {
    id: 'INV006',
    dealerId: 'DLR004',
    anchorId: 'ANC002',
    programId: 'PROG002',
    invoiceNumber: 'GG-2024-003',
    dealerName: 'Gotham Goods',
    amount: 100000,
    date: '2024-07-18',
    dueDate: '2024-08-17',
    eWayBillNumber: 'EWB334457',
    status: 'Initiated',
    lender: 'CHOLAMANDALAM INVEST...',
    overdueAmount: 0,
  },
];
