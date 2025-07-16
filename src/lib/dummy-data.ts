
/**
 * ==================================================================
 * HOW TO IMPORT THIS DATA INTO FIRESTORE
 * ==================================================================
 *
 * 1.  Go to your Firebase Console: https://console.firebase.google.com/
 * 2.  Select your project.
 * 3.  In the left-hand menu, go to "Build" > "Firestore Database".
 *
 * 4.  For each collection (users, programs, dealers, invoices, dealerProgramLimits):
 *     a. Click "+ Start collection".
 *     b. For the "Collection ID", enter the name (e.g., "users").
 *     c. Instead of adding documents one by one, Firestore will create the first one for you. Click "Next".
 *     d. For "Document ID", you can click "Auto-ID" or specify your own (like USR001). For this data, it's easier to specify the ID from the `id` field in the objects below.
 *     e. Now, copy the fields from one of the JSON objects below.
 *     f. In the Firestore UI, for each key-value pair in the object (like "userName": "Stark Industries"), enter the key (e.g., 'userName') as the field name and the value (e.g., 'Stark Industries') as the field value.
 *     g. Make sure to select the correct data type (String, Number, Array, etc.).
 *     h. Click "Save" to create the document.
 *
 * 5.  To add the rest of the documents for that collection:
 *     a. Click "+ Add document" just below the collection name.
 *     b. Repeat steps 4d-4h for each remaining item in the array.
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
    userSubRole: 'Field Sales',
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0
  },
  {
    id: 'USR002',
    externalId: 'ANC001',
    userName: 'Stark Industries',
    password: 'password',
    phoneNumber: '9876543210',
    emailAddress: 'sunita.sharma@example.com',
    roleType: 'Anchor',
    userSubRole: 'AP/AR Approver',
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0
  },
  {
    id: 'USR003',
    externalId: 'ANC001',
    userName: 'Stark Industries',
    password: 'password',
    phoneNumber: '9876543210',
    emailAddress: 'prakash.rao@example.com',
    roleType: 'Anchor',
    userSubRole: 'Executive',
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0
  },
  {
    id: 'USR004',
    externalId: 'ANC001',
    userName: 'Stark Industries',
    password: 'password',
    phoneNumber: '9876543210',
    emailAddress: 'ankit.desai@example.com',
    roleType: 'Anchor',
    userSubRole: 'Business Lead',
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0
  },
  {
    id: 'USR005',
    externalId: 'ANC001',
    userName: 'Stark Industries',
    password: 'password',
    phoneNumber: '9876543210',
    emailAddress: 'priya.singh@example.com',
    roleType: 'Anchor',
    userSubRole: 'Regional Manager',
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0
  },
  {
    id: 'USR006',
    externalId: 'ANC001',
    userName: 'Stark Industries',
    password: 'password',
    phoneNumber: '9876543210',
    emailAddress: 'vijay.sharma@example.com',
    roleType: 'Anchor',
    userSubRole: 'Auditor',
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0
  },
  {
    id: 'USR007',
    externalId: 'ANC002',
    userName: 'Wayne Enterprises',
    password: 'password',
    phoneNumber: '9876543211',
    emailAddress: 'wayne@example.com',
    roleType: 'Anchor',
    userSubRole: 'Executive',
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0
  },
   {
    id: 'USR008',
    externalId: 'ADMIN001',
    userName: 'Supermoney Admin',
    password: 'password',
    phoneNumber: '9999999999',
    emailAddress: 'admin@supermoney.in',
    roleType: 'Admin',
    userSubRole: 'Super Admin',
    lastLoginTime: '',
    lastLoginIp: '',
    authToken: '',
    expiryTime: 0
  }
];

// --- DUMMY PROGRAMS ---
// Aggregate fields like totalLimit, usedLimit, etc., are removed.
// They will be calculated at runtime based on dealerProgramLimits and invoices.
export const dummyPrograms = [
  {
    id: 'PROG001',
    anchorIds: ['ANC001'],
    lenderName: 'Supermoney Finance',
    lenderType: 'Supermoney',
  },
  {
    id: 'PROG002',
    anchorIds: ['ANC001', 'ANC002'],
    lenderName: 'CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED',
    lenderType: 'External',
  },
  {
    id: 'PROG003',
    anchorIds: ['ANC002'],
    lenderName: 'ADITYA BIRLA CAPITAL LTD',
    lenderType: 'External',
  },
];

// --- DUMMY DEALER-PROGRAM LIMIT MAPPING ---
// This collection is crucial for calculating program and dealer aggregates.
export const dummyDealerProgramLimits = [
  { id: 'DPL001', dealerId: 'DLR001', programId: 'PROG001', creditLimit: 2000000, usedLimit: 750000 },
  { id: 'DPL002', dealerId: 'DLR002', programId: 'PROG001', creditLimit: 1000000, usedLimit: 500000 },
  { id: 'DPL003', dealerId: 'DLR002', programId: 'PROG002', creditLimit: 2000000, usedLimit: 0 },
  { id: 'DPL004', dealerId: 'DLR003', programId: 'PROG002', creditLimit: 5000000, usedLimit: 4500000 },
  { id: 'DPL005', dealerId: 'DLR004', programId: 'PROG003', creditLimit: 3000000, usedLimit: 750000 },
  { id: 'DPL006', dealerId: 'DLR004', programId: 'PROG002', creditLimit: 1000000, usedLimit: 100000 },
];

// --- DUMMY DEALERS ---
// Aggregate fields are removed. Lenders are derived from their program participation.
export const dummyDealers = [
  {
    id: 'DLR001',
    anchorId: 'ANC001',
    name: 'Star Electronics',
    status: 'Active',
  },
  {
    id: 'DLR002',
    anchorId: 'ANC001',
    name: 'Future Gadgets',
    status: 'Active',
  },
  {
    id: 'DLR003',
    anchorId: 'ANC001',
    name: 'Innovative Tech',
    status: 'Inactive',
  },
  {
    id: 'DLR004',
    anchorId: 'ANC002',
    name: 'Gotham Goods',
    status: 'Active',
  },
];


// --- DUMMY INVOICES ---
// Each invoice links to a dealer, anchor, and program. This is the source for all financial calculations.
export const dummyInvoices = [
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
    lender: 'CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED',
    overdueAmount: 0,
  },
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
    lender: 'CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED',
    overdueAmount: 0,
  },
];

    