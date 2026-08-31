# Lead Management & CRM Synchronization Flow

This document explains the technical implementation of how leads shared by Anchors are synced with the CRM and how their status is reflected back in the Anchor Portal.

## 1. Architectural Foundation: Dual-Database Strategy
The platform utilizes two distinct Firestore instances initialized in `src/lib/firebase.ts`:
- **db1 (Core SCF):** Stores users, programs, retailers, and invoices.
- **db2 (Momentum Leads):** Dedicated to sales pipeline management. This is the shared interface with the CRM.

## 2. The Data Lifecycle

### Phase 1: Lead Initiation (Portal to CRM)
1. **User Input:** An Anchor user fills out the "Add Lead" form (`src/app/add-lead/add-lead-form.tsx`).
2. **Write Path:** The `addSingleLead` server action (`src/app/add-lead/actions.ts`) targets `db2`.
3. **Scoping:** The portal injects `anchorId` (from the user's session) into the document. This is critical for multi-tenancy; Anchors can only see leads where the `anchorId` matches their `leadExternalId`.

### Phase 2: CRM Processing (External)
The CRM system interacts with `db2` as its primary data source for the "Momentum" pipeline. 
- It updates the `status` field using the canonical values defined in `spokeStatuses` (`src/lib/data.ts`).
- It appends history to the `remarks` field.

### Phase 3: Status Reflection (CRM to Portal)
The Anchor Portal acts as a real-time viewer for the CRM data stored in `db2`.
1. **Data Fetching:** `getMomentumDealerLeads` (`src/lib/data.ts`) queries `db2` filtered by the logged-in Anchor's ID.
2. **Resilient Parsing:** Because different CRM modules might write data differently, the portal uses `processDocumentDates` to recursively convert native Firestore Timestamps to ISO strings, ensuring compatibility with Next.js Server Components.
3. **Remark Handling:** The portal supports two formats for the `remarks` field:
   - **Legacy:** Array of objects.
   - **Current CRM:** Map of maps (keyed by timestamp or ID).
   The logic in `LeadsClientPage` and `LeadDetailClientPage` dynamically normalizes these into a sorted list for display.

## 3. Key Integration Files
- `src/lib/firebase.ts`: Initialization of the two database instances.
- `src/app/add-lead/actions.ts`: The entry point for data entering the CRM pipeline.
- `src/lib/data.ts`: The normalization layer that handles timestamp serialization and multi-tenant filtering.
- `src/components/shared/status-badge.tsx`: Maps CRM status strings to the visual design system.

## 4. Troubleshooting Data Inconsistency
If remarks or statuses are missing:
1. **Check Scoping:** Verify the document in `db2` has an `anchorId` matching the Anchor's session.
2. **Check Field Names:** The portal expects remarks to contain keys like `remark`, `text`, or `comment`.
3. **Check Types:** Native Firestore `Timestamp` objects must be processed by the server before being passed to client components to prevent serialization errors.