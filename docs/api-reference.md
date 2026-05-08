# API Reference

All external APIs are secured via Bearer token authentication. The Create Dealer endpoint uses `CREATE_DEALER_API_SECRET_KEY`. All other endpoints use `DEALER_API_SECRET_KEY`. The session endpoint is internal (cookie-based).

---

## 1. Create Dealer

```http
POST /api/create-dealer
Authorization: Bearer <CREATE_DEALER_API_SECRET_KEY>
Content-Type: application/json
```

Creates a new dealer and initializes their credit limits to zero. Called by SmartDash to push customer details.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerId` | string | Yes | Customer identifier from SmartDash |
| `applicationId` | string | Yes | Also used as `dealerId` internally |
| `dealerName` | string | Yes | Trade name of the dealer |
| `gst` | string | Yes | 15-character alphanumeric GST number |
| `emailAddress` | string | No | Dealer's email |
| `city` | string | Yes | For zone resolution |
| `state` | string | Yes | For zone resolution |
| `programName` | string | No | Display name of the financing program |
| `lender` | string | Yes | Matches `SmartdashLender` field in programs collection |
| `company` | string | Yes | Matches `SmartdashCompanyName` field in users collection |

```json
{
  "customerId": "CUST001",
  "applicationId": "APP001",
  "dealerName": "ABC Traders",
  "gst": "27AABCG1931G1ZV",
  "emailAddress": "abc@example.com",
  "city": "Mumbai",
  "state": "Maharashtra",
  "programName": "Supply Chain Finance",
  "lender": "SBI_CHANNEL_FINANCE",
  "company": "STARK_GLOBAL"
}
```

**Response 201** — Created

```json
{
  "message": "Dealer created successfully.",
  "dealer": {
    "dealerId": "APP001",
    "customerId": "CUST001",
    "applicationId": "APP001",
    "programId": "PROG001",
    "anchorId": "ANC001",
    "dealerName": "ABC Traders",
    "dealerName_lowercase": "abc traders",
    "status": "Pending",
    "GST": "27AABCG1931G1ZV",
    "region": "West",
    "emailAddress": "abc@example.com"
  }
}
```

**Error Responses**

| Code | Condition |
|------|-----------|
| 400 | Invalid JSON, validation failure, or zone not found |
| 401 | Missing or invalid Bearer token |
| 404 | Anchor company or lender program not found |
| 409 | Dealer with same anchorId + GST already exists |
| 500 | Firestore write failure |

---

## 2. Update Dealer Limit

```http
POST /api/update-dealer-limit
Authorization: Bearer <DEALER_API_SECRET_KEY>
Content-Type: application/json
```

Upserts a dealer's credit limit record. Creates the document if it doesn't exist.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dealerId` | string | Yes | Matches the dealer's `applicationId` |
| `limitAmount` | number | Yes | Total credit limit |
| `principalOverdue` | number | Yes | Principal amount overdue |
| `utilisationAmount` | number | Yes | Amount currently utilised |
| `availableAmount` | number | Yes | Available credit |
| `principalDPD` | number | No | Days past due on principal |

```json
{
  "dealerId": "APP001",
  "limitAmount": 5000000,
  "principalOverdue": 250000,
  "utilisationAmount": 2000000,
  "availableAmount": 3000000,
  "principalDPD": 15
}
```

**Response 200** — Updated

```json
{
  "message": "Successfully updated limits for dealer APP001."
}
```

**Response 201** — Created (new dealer)

```json
{
  "message": "Successfully created limits for new dealer APP001."
}
```

**Error Responses**

| Code | Condition |
|------|-----------|
| 400 | Invalid JSON or validation failure |
| 401 | Missing or invalid Bearer token |
| 500 | Firestore error or server configuration error |

---

## 3. Upsert Invoice

```http
POST /api/upsert-invoice
Authorization: Bearer <DEALER_API_SECRET_KEY>
Content-Type: application/json
```

Creates or updates an invoice. If an invoice with the same `invoiceNumber` exists, it is updated; otherwise a new document is created.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceNumber` | string | Yes | Unique invoice identifier |
| `programId` | string | Yes | Program identifier |
| `anchorId` | string | Yes | Anchor identifier |
| `dealerId` | string | Yes | Dealer identifier |
| `date` | string | Yes | Invoice date (YYYY-MM-DD) |
| `dueDate` | string | No | Due date (YYYY-MM-DD) |
| `disbursementSentDate` | string | Yes | Disbursement sent date (YYYY-MM-DD) |
| `disburseDate` | string | No | Actual disburse date (YYYY-MM-DD) |
| `amount` | number | Yes | Invoice amount (positive) |
| `disbursementSentAmount` | number | Yes | Amount sent for disbursement (non-negative) |
| `status` | string | Yes | `Initiated` / `Approved` / `Sent to Lender` / `Disbursed` / `Rejected` / `Repaid` |
| `remarks` | string | No | Additional notes |
| `utrNo` | string | No | UTR number (max 200 chars) |

```json
{
  "invoiceNumber": "INV-2026-001",
  "programId": "PROG001",
  "anchorId": "ANC001",
  "dealerId": "APP001",
  "date": "2026-05-01",
  "dueDate": "2026-06-01",
  "disbursementSentDate": "2026-05-05",
  "amount": 250000,
  "disbursementSentAmount": 250000,
  "status": "Approved",
  "remarks": "Processed via SmartDash"
}
```

**Response 200** — Updated

```json
{
  "message": "Successfully updated invoice INV-2026-001."
}
```

**Response 201** — Created

```json
{
  "message": "Successfully created new invoice INV-2026-001."
}
```

**Error Responses**

| Code | Condition |
|------|-----------|
| 400 | Invalid JSON or validation failure |
| 401 | Missing or invalid Bearer token |
| 500 | Firestore error |

---

## 4. Upcoming Payments

```http
POST /api/upcoming-payments
Authorization: Bearer <DEALER_API_SECRET_KEY>
Content-Type: application/json
```

Batch-inserts upcoming payment records. Each entry creates/updates a dealer document and a loan subcollection document. Loans with `outstandingAmount` of 0 are deleted.

**Request Body**

```json
{
  "data": [
    {
      "dealerId": "APP001",
      "loanId": "LOAN-001",
      "dueDate": "2026-06-15",
      "outstandingAmount": 500000
    },
    {
      "dealerId": "APP002",
      "loanId": "LOAN-002",
      "dueDate": "2026-07-01",
      "outstandingAmount": 0
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data[].dealerId` | string | Yes | Dealer identifier |
| `data[].loanId` | string | Yes | Loan identifier |
| `data[].dueDate` | string | Yes | Due date (YYYY-MM-DD) |
| `data[].outstandingAmount` | number | Yes | Outstanding amount. If `0`, the loan document is **deleted** |

**Response 200**

```json
{
  "message": "Upcoming payments stored successfully"
}
```

**Error Responses**

| Code | Condition |
|------|-----------|
| 400 | Invalid JSON or validation failure |
| 401 | Missing or invalid Bearer token |
| 500 | Firestore write failure |

---

## 5. Get Dealer ID

```http
POST /api/get-dealer-id
Authorization: Bearer <DEALER_API_SECRET_KEY>
Content-Type: application/json
```

Looks up a dealer by customer details and anchor name. Also fires a side-effect call to an external invoice API (fire-and-forget).

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerId` | string | Yes | Customer ID |
| `dealerName` | string | Yes | Dealer name (case-insensitive match) |
| `anchorName` | string | Yes | Anchor user's display name |

```json
{
  "customerId": "CUST001",
  "dealerName": "ABC Traders",
  "anchorName": "Stark Industries"
}
```

**Response 200**

Returns the full dealer Firestore document.

```json
{
  "dealerId": "APP001",
  "customerId": "CUST001",
  "applicationId": "APP001",
  "programId": "PROG001",
  "anchorId": "ANC001",
  "dealerName": "ABC Traders",
  "dealerName_lowercase": "abc traders",
  "GST": "27AABCG1931G1ZV",
  "status": "Active"
}
```

**Error Responses**

| Code | Condition |
|------|-----------|
| 400 | Invalid JSON or validation failure |
| 401 | Missing or invalid Bearer token |
| 404 | Anchor or dealer not found |
| 500 | Server error |

---

## 6. Session (Internal)

```http
GET /api/session
```

Returns the current user's session data from the encrypted iron-session cookie. Used internally by the client-side `AuthProvider`.

**No authorization header required** — uses the session cookie.

**Response 200**

```json
{
  "id": "8eqZodWO89So7VApzCef",
  "externalId": "ANC001",
  "userName": "Stark Industries",
  "emailAddress": "anchor@supermoney.in",
  "roleType": "Anchor",
  "userSubRole": "regional_manager",
  "phoneNumber": "9876543210",
  "lastLoginIp": "192.168.1.1",
  "lastLoginTime": "2026-05-08T10:00:00.000Z",
  "leadExternalId": "ANC001",
  "logoImage": "https://example.com/logo.png",
  "region": "West"
}
```

**Response 401**

```json
{
  "message": "Not logged in"
}
```

---

## Authentication

### Create Dealer (endpoint 1)

```
Authorization: Bearer <CREATE_DEALER_API_SECRET_KEY>
```

### Endpoints 2–5

```
Authorization: Bearer <DEALER_API_SECRET_KEY>
```

Secrets are managed through Google Cloud Secret Manager in production (`apphosting.yaml`).

| Code | Meaning |
|------|---------|
| 401 | Token missing or doesn't match |
| 500 | `DEALER_API_SECRET_KEY` env var not configured on server |

---

## Firestore Collections Affected

| API | Collections Written | Collections Read |
|-----|---------------------|------------------|
| Create Dealer | `dealers`, `dealerLimits` | `regionMapping`, `users`, `programs`, `dealers` |
| Update Dealer Limit | `dealerLimits` | `dealerLimits` |
| Upsert Invoice | `invoices` | `invoices` |
| Upcoming Payments | `upcomingPayments`, `upcomingPayments/{id}/loans` | — |
| Get Dealer ID | — | `users`, `dealers`, `programs` |
| Session | — | — (cookie only) |
