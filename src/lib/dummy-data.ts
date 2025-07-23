
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
// Aggregate fields like totalLimit, usedLimit, etc., are removed.
// They will be calculated at runtime based on dealerProgramLimits and invoices.
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

// --- DUMMY DEALER-PROGRAM LIMIT MAPPING ---
// This collection is crucial for calculating program and dealer aggregates.
export const dummyDealerProgramLimits = [
  { "id": "DPL001", "dealerId": "DLR001", "programId": "PROG001", "creditLimit": 2000000, "usedLimit": 750000 },
  { "id": "DPL002", "dealerId": "DLR002", "programId": "PROG001", "creditLimit": 1000000, "usedLimit": 500000 },
  { "id": "DPL003", "dealerId": "DLR002", "programId": "PROG002", "creditLimit": 2000000, "usedLimit": 0 },
  { "id": "DPL004", "dealerId": "DLR003", "programId": "PROG002", "creditLimit": 5000000, "usedLimit": 4500000 },
  { "id": "DPL005", "dealerId": "DLR004", "programId": "PROG003", "creditLimit": 3000000, "usedLimit": 750000 },
  { "id": "DPL006", "dealerId": "DLR004", "programId": "PROG002", "creditLimit": 1000000, "usedLimit": 100000 },
];

// --- DUMMY DEALERS ---
// Aggregate fields are removed. Lenders are derived from their program participation.
export const dummyDealers = [
  {
    "dealerId": "DLR001",
    "programId": "PROG001",
    "lenderName": "Supermoney Finance",
    "product": "SCF",
    "tradeName": "Star Electronics",
    "anchorId": "ANC001",
    "status": "Active",
    "name": "Star Electronics",
    "id": "DLR001"
  },
  {
    "dealerId": "DLR002",
    "programId": "PROG001",
    "lenderName": "Supermoney Finance",
    "product": "SCF",
    "tradeName": "Future Gadgets",
    "anchorId": "ANC001",
    "status": "Active",
    "name": "Future Gadgets",
    "id": "DLR002"
  },
  {
    "dealerId": "DLR003",
    "programId": "PROG002",
    "lenderName": "CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LIMITED",
    "product": "Term Loan",
    "tradeName": "Innovative Tech",
    "anchorId": "ANC001",
    "status": "Inactive",
    "name": "Innovative Tech",
    "id": "DLR003"
  },
  {
    "dealerId": "DLR004",
    "programId": "PROG003",
    "lenderName": "ADITYA BIRLA CAPITAL LTD",
    "product": "SCF",
    "tradeName": "Gotham Goods",
    "anchorId": "ANC002",
    "status": "Active",
    "name": "Gotham Goods",
    "id": "DLR004"
  }
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
    "eWayBillNumber": "EWB112233",
    "utrNumber": "UTR123456789012",
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
    "eWayBillNumber": "EWB112234",
    "utrNumber": "UTR123456789013",
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
    "eWayBillNumber": "EWB223344",
    "utrNumber": "UTR234567890123",
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
    "eWayBillNumber": "EWB334455",
    "utrNumber": "UTR345678901235",
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
    "eWayBillNumber": "EWB334456",
    "utrNumber": "UTR345678901234",
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
    "eWayBillNumber": "EWB334457",
    "utrNumber": "UTR345678901236",
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
        dealerId: "DLR_SAMPLE_1",
        programId: "PROG_SAMPLE_1",
        lenderName: "Sample Finance Inc.",
        product: "SCF",
        tradeName: "Sample Dealer Electronics",
        anchorId: "ANC001",
        status: "Active"
    }
];

export const sampleDealerLimits = [
    {
        id: "DPL_SAMPLE_1",
        dealerId: "DLR_SAMPLE_1",
        programId: "PROG_SAMPLE_1",
        creditLimit: 500000,
        usedLimit: 0,
    }
];

export const sampleInvoices = [
    {
        id: "INV_SAMPLE_1",
        dealerId: "DLR_SAMPLE_1",
        anchorId: "ANC001",
        programId: "PROG_SAMPLE_1",
        invoiceNumber: "SAMPLE-2024-001",
        dealerName: "Sample Dealer Electronics",
        amount: 50000,
        date: "2024-01-01",
        dueDate: "2024-02-01",
        eWayBillNumber: "EWB_SAMPLE_123",
        utrNumber: "UTR_SAMPLE_123",
        status: "Initiated",
        lender: "Sample Finance Inc.",
        overdueAmount: 0,
    }
];

export const sampleMomentumLeads = [
    {
        name: "Sample Lead Inc.",
        city: "Mumbai",
        zone: "West",
        state: "Maharashtra",
        leadSource: "Website",
        leadType: "Fresh",
        product: "Supply Chain Finance",
        dealValue: 1.5,
        status: "New",
        spoc: "John Doe",
    }
];
    
