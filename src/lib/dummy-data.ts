
/**
 * ==================================================================
 * HOW TO IMPORT THIS DATA INTO FIRESTORE
 * ==================================================================
 *
 * 1.  Go to your Firebase Console: https://console.firebase.google.com/
 * 2.  Select your project.
 * 3.  In the left-hand menu, go to "Build" > "Firestore Database".
 *
 * 4.  For each collection (users, programs, dealers, invoices, dealerLimits):
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
    "id": "USR001",
    "externalId": "ANC001",
    "userName": "Stark Industries",
    "password": "password",
    "phoneNumber": "9876543210",
    "emailAddress": "anchor@supermoney.in",
    "roleType": "Anchor",
    "userSubRole": "Not Subscribed",
    "lastLoginTime": "",
    "lastLoginIp": "",
    "authToken": "",
    "expiryTime": 0
  },
  {
    "id": "USR007",
    "externalId": "ANC002",
    "userName": "Wayne Enterprises",
    "password": "password",
    "phoneNumber": "9876543211",
    "emailAddress": "wayne@example.com",
    "roleType": "Anchor",
    "userSubRole": "Executive",
    "lastLoginTime": "",
    "lastLoginIp": "",
    "authToken": "",
    "expiryTime": 0
  },
   {
    "id": "USR008",
    "externalId": "ADMIN001",
    "userName": "Supermoney Admin",
    "password": "password",
    "phoneNumber": "9999999999",
    "emailAddress": "admin@supermoney.in",
    "roleType": "Admin",
    "userSubRole": "Super Admin",
    "lastLoginTime": "",
    "lastLoginIp": "",
    "authToken": "",
    "expiryTime": 0
  },
  // Onboarding Roles
  {
    "id": "USR009",
    "externalId": "ENT001",
    "userName": "Sales Person",
    "password": "password",
    "phoneNumber": "9876543212",
    "emailAddress": "sales_person@enterprise.in",
    "roleType": "Anchor",
    "userSubRole": "sales_person",
    "lastLoginTime": "", "lastLoginIp": "", "authToken": "", "expiryTime": 0
  },
  {
    "id": "USR010",
    "externalId": "ENT001",
    "userName": "Sales Manager",
    "password": "password",
    "phoneNumber": "9876543213",
    "emailAddress": "sales_manager@enterprise.in",
    "roleType": "Anchor",
    "userSubRole": "sales_manager",
    "lastLoginTime": "", "lastLoginIp": "", "authToken": "", "expiryTime": 0
  },
  {
    "id": "USR011",
    "externalId": "ENT001",
    "userName": "Onboarding Ops",
    "password": "password",
    "phoneNumber": "9876543214",
    "emailAddress": "onboarding_ops@enterprise.in",
    "roleType": "Anchor",
    "userSubRole": "onboarding_ops",
    "lastLoginTime": "", "lastLoginIp": "", "authToken": "", "expiryTime": 0
  },
  {
    "id": "USR012",
    "externalId": "ENT001",
    "userName": "Field Inspector",
    "password": "password",
    "phoneNumber": "9876543215",
    "emailAddress": "field_inspector@enterprise.in",
    "roleType": "Anchor",
    "userSubRole": "field_inspector",
    "lastLoginTime": "", "lastLoginIp": "", "authToken": "", "expiryTime": 0
  },
  {
    "id": "USR013",
    "externalId": "ENT001",
    "userName": "Legal Compliance",
    "password": "password",
    "phoneNumber": "9876543216",
    "emailAddress": "legal_compliance@enterprise.in",
    "roleType": "Anchor",
    "userSubRole": "legal_compliance",
    "lastLoginTime": "", "lastLoginIp": "", "authToken": "", "expiryTime": 0
  },
  {
    "id": "USR014",
    "externalId": "ENT001",
    "userName": "Regional Manager",
    "password": "password",
    "phoneNumber": "9876543217",
    "emailAddress": "regional_manager@enterprise.in",
    "roleType": "Anchor",
    "userSubRole": "regional_manager",
    "lastLoginTime": "", "lastLoginIp": "", "authToken": "", "expiryTime": 0
  },
  {
    "id": "USR015",
    "externalId": "ENT001",
    "userName": "Dealer Admin",
    "password": "password",
    "phoneNumber": "9876543218",
    "emailAddress": "dealer_admin@enterprise.in",
    "roleType": "Anchor",
    "userSubRole": "dealer_admin",
    "lastLoginTime": "", "lastLoginIp": "", "authToken": "", "expiryTime": 0
  }
];

// --- DUMMY PROGRAMS ---
export const dummyPrograms = [
  {
    "id": "PROG001",
    "programId": "PROG001",
    "lenderName": "Supermoney Finance",
    "lenderType": "Supermoney",
  },
  {
    "id": "PROG002",
    "programId": "PROG002",
    "lenderName": "CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED",
    "lenderType": "External",
  },
  {
    "id": "PROG003",
    "programId": "PROG003",
    "lenderName": "ADITYA BIRLA CAPITAL LTD",
    "lenderType": "External",
  },
];

// --- DUMMY DEALER-LIMIT MAPPING ---
// This collection `dealerLimits` is crucial for calculating program and dealer aggregates.
// The document ID should be the `applicationId`.
export const dummyDealerLimits = [
  { "id": "APP001", "applicationId": "APP001", "limitAmount": 2000000, "utilisationAmount": 750000, "availableAmount": 1250000, "principalOverdue": 150000 },
  { "id": "APP002", "applicationId": "APP002", "limitAmount": 1000000, "utilisationAmount": 500000, "availableAmount": 500000, "principalOverdue": 0 },
  { "id": "APP003", "applicationId": "APP003", "limitAmount": 2000000, "utilisationAmount": 0, "availableAmount": 2000000, "principalOverdue": 0 },
  { "id": "APP004", "applicationId": "APP004", "limitAmount": 5000000, "utilisationAmount": 4500000, "availableAmount": 500000, "principalOverdue": 0 },
  { "id": "APP005", "applicationId": "APP005", "limitAmount": 3000000, "utilisationAmount": 750000, "availableAmount": 2250000, "principalOverdue": 250000 },
  { "id": "APP006", "applicationId": "APP006", "limitAmount": 1000000, "utilisationAmount": 100000, "availableAmount": 900000, "principalOverdue": 0 },
];

// --- DUMMY DEALERS ---
// This collection `dealers` holds dealer identity info. 
// The document ID should be the `customerId`.
export const dummyDealersData = [
  { "id": "DLR001", "dealerId": "DLR001", "applicationId": "APP001", "programId": "PROG001", "anchorId": "ANC001", "dealerName": "Star Electronics", "status": "Active", "emailAddress":"dummy@gmail.com" },
  { "id": "DLR002", "dealerId": "DLR002", "applicationId": "APP002", "programId": "PROG001", "anchorId": "ANC001", "dealerName": "Future Gadgets", "status": "Active", "emailAddress":"dummy@gmail.com" },
  { "id": "DLR002", "dealerId": "DLR002", "applicationId": "APP003", "programId": "PROG002", "anchorId": "ANC001", "dealerName": "Future Gadgets", "status": "Active", "emailAddress":"dummy@gmail.com" },
  { "id": "DLR003", "dealerId": "DLR003", "applicationId": "APP004", "programId": "PROG002", "anchorId": "ANC001", "dealerName": "Innovative Tech", "status": "Pending", "emailAddress":"dummy@gmail.com" },
  { "id": "DLR004", "dealerId": "DLR004", "applicationId": "APP005", "programId": "PROG003", "anchorId": "ANC002", "dealerName": "Gotham Goods", "status": "Inactive", "emailAddress":"dummy@gmail.com" },
  { "id": "DLR004", "dealerId": "DLR004", "applicationId": "APP006", "programId": "PROG002", "anchorId": "ANC002", "dealerName": "Gotham Goods", "status": "Active", "emailAddress":"dummy@gmail.com" }
];



// --- DUMMY INVOICES ---
// Each invoice links to a dealer, anchor, and program. This is the source for all financial calculations.
export const dummyInvoices = [
  {
    "id": "INV001",
    "dealerId": "DLR001",
    "anchorId": "ANC001",
    "programId": "PROG001",
    "invoiceNumber": "SE-2024-001",
    "dealerName": "Star Electronics",
    "amount": 150000,
    "date": "2024-07-01",
    "dueDate": "2024-07-15",
    "utrNo": "UTR123456789012",
    "status": "Disbursed",
    "lender": "Supermoney Finance",
    "overdueAmount": 150000,
  },
  {
    "id": "INV002",
    "dealerId": "DLR001",
    "anchorId": "ANC001",
    "programId": "PROG001",
    "invoiceNumber": "SE-2024-002",
    "dealerName": "Star Electronics",
    "amount": 250000,
    "date": "2024-07-05",
    "dueDate": "2024-08-04",
    "utrNo": "UTR123456789013",
    "status": "Approved",
    "lender": "Supermoney Finance",
    "overdueAmount": 0,
  },
  {
    "id": "INV003",
    "dealerId": "DLR002",
    "anchorId": "ANC001",
    "programId": "PROG002",
    "invoiceNumber": "FG-2024-001",
    "dealerName": "Future Gadgets",
    "amount": 300000,
    "date": "2024-07-10",
    "dueDate": "2024-08-09",
    "utrNo": "UTR234567890123",
    "status": "Sent to Lender",
    "lender": "CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED",
    "overdueAmount": 0,
  },
  {
    "id": "INV004",
    "dealerId": "DLR004",
    "anchorId": "ANC002",
    "programId": "PROG003",
    "invoiceNumber": "GG-2024-001",
    "dealerName": "Gotham Goods",
    "amount": 500000,
    "date": "2024-06-20",
    "dueDate": "2024-07-20",
    "utrNo": "UTR345678901235",
    "status": "Disbursed",
    "lender": "ADITYA BIRLA CAPITAL LTD",
    "overdueAmount": 0,
  },
  {
    "id": "INV005",
    "dealerId": "DLR004",
    "anchorId": "ANC002",
    "programId": "PROG003",
    "invoiceNumber": "GG-2024-002",
    "dealerName": "Gotham Goods",
    "amount": 250000,
    "date": "2024-06-25",
    "dueDate": "2024-07-10",
    "utrNo": "UTR345678901234",
    "status": "Disbursed",
    "lender": "ADITYA BIRLA CAPITAL LTD",
    "overdueAmount": 250000,
  },
  {
    "id": "INV006",
    "dealerId": "DLR004",
    "anchorId": "ANC002",
    "programId": "PROG002",
    "invoiceNumber": "GG-2024-003",
    "dealerName": "Gotham Goods",
    "amount": 100000,
    "date": "2024-07-18",
    "dueDate": "2024-08-17",
    "utrNo": "UTR345678901236",
    "status": "Initiated",
    "lender": "CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED",
    "overdueAmount": 0,
  },
];

// --- SAMPLE DATA FOR EXCEL DOWNLOADS ---

export const samplePrograms = [
    {
        programId: "PROG_SAMPLE_1",
        lenderName: "Sample Finance Inc.",
        lenderType: "External",
    }
];

export const sampleDealers = [
    {
        applicationId: "DEALER_001",
        customerId: "CUST_001",
        programId: "PROG_SAMPLE_1",
        anchorId: "ANC001",
        dealerName: "Sample Electronics",
        emailAddress: "contact@sampleelectronics.com",
        phoneNumber: "9988776655",
        status: "Active",
        limitAmount: 500000,
        utilisationAmount: 100000,
        availableAmount: 400000,
        principalOverdue: 0
    }
];

export const sampleInvoices = [
    {
        invoiceNumber: "SAMPLE-2024-001",
        programId: "PROG_SAMPLE_1",
        anchorId: "ANC001",
        dealerId: "DEALER_001",
        date: "2024-01-01",
        dueDate: "2024-02-01",
        disburseDate: "2024-01-05",
        invoiceAmount: 50000,
        disbursementSentAmount: 48000,
        status: "Initiated",
        remarks: "Sample remark",
        utrNo: "UTR_SAMPLE_123",
    }
];

export const sampleMomentumLeads = [
    {
        "Name": "Prime Auto",
        "Lead Category": "Dealer",
        "Contact Number": "9881234567",
        "Email": "contact@primeauto.com",
        "City": "Mumbai",
        "State": "Maharashtra",
        "Zone": "West",
        "Anchor Name": "Reliance Retail",
        "Product": "Primary",
        "Lead Source": "Connector",
        "Lead Type": "New",
        "Priority": "Medium",
        "Deal Value (Lacs)": 0.5,
        "Lender": "Kotak",
        "Remarks": "New Lead. Need follow-up",
        "SPOC": "Ramesh Patel"
    }
];

export const sampleBulkInvoices = [
    {
        'Invoice Number': 'BULK-001',
        'Dealer Name': 'Star Electronics',
        'Invoice Amount': 75000,
        'Disburse Amount': 75000,
        'Invoice Date': '2024-08-01',
        'Due Date': '2024-09-01',
        'Disburse Date': '2024-08-05'
    },
    {
        'Invoice Number': 'BULK-002',
        'Dealer Name': 'Future Gadgets',
        'Invoice Amount': 125000,
        'Disburse Amount': 120000,
        'Invoice Date': '2024-08-15',
        'Due Date': '2024-09-15',
        'Disburse Date': '2024-08-20'
    }
];
