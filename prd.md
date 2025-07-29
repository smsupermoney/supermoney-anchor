
# Product Requirements Document: Supermoney Anchor Platform

**Version:** 1.0  
**Date:** 2024-08-01  
**Status:** DRAFT  
**Author:** AI Product Manager, Firebase Studio

---

## 1. Executive Summary

### 1.1. Product Vision
To create the industry-leading, AI-powered supply chain finance (SCF) platform that seamlessly connects large corporations (Anchors), their network of dealers/vendors, and financial institutions. Our vision is to digitize and automate the entire SCF lifecycle, from dealer onboarding and invoice processing to risk management and collections, thereby unlocking liquidity and fostering stronger supply chain ecosystems.

### 1.2. Strategic Objectives
- **Automate & Accelerate:** Drastically reduce the time and manual effort required for dealer onboarding, invoice verification, and disbursal.
- **Enhance Visibility & Control:** Provide all stakeholders with real-time, role-based access to financial data, program performance, and operational workflows.
- **Mitigate Risk:** Leverage AI to provide intelligent risk assessment, proactive fraud detection, and data-driven credit decisions.
- **Improve Liquidity:** Enable faster invoice financing for dealers, improving their cash flow and strengthening the supply chain for the Anchor.

### 1.3. Key Stakeholder Benefits
- **For Anchors:** Enhanced control over their supply chain, improved dealer relationships, real-time visibility into program performance, and reduced operational overhead.
- **For Dealers/Vendors:** Faster access to working capital, a simplified invoice submission process, and transparent tracking of payment statuses.
- **For Internal Users (Admin/SuperMoney):** Centralized platform management, streamlined operations, powerful AI tools for decision-making, and scalable user/program administration.

### 1.4. Success Metrics Overview
- **User Adoption:** Monthly Active Users (MAU) per role, feature adoption rates (e.g., AI Invoice Reader usage).
- **Efficiency:** Reduction in average dealer onboarding time, decrease in invoice processing time.
- **Financial:** Total value of invoices processed, increase in program utilization rates.
- **User Satisfaction:** Net Promoter Score (NPS) or CSAT scores from user feedback.

---

## 2. Product Overview

### 2.1. Problem Statement
Large corporations (Anchors) struggle with the operational complexities of managing supply chain finance programs. The processes of onboarding new dealers, verifying thousands of invoices, managing credit limits, and handling collections are often manual, slow, and prone to error. This operational friction leads to delayed payments for dealers, strained relationships, and significant risk exposure for the Anchor and its financiers.

### 2.2. Market Opportunity
The global supply chain finance market is rapidly growing. There is a significant opportunity for a modern, enterprise-grade SaaS platform that replaces legacy systems and manual spreadsheets with an integrated, AI-driven solution. By providing a single source of truth and automating key workflows, the Supermoney Anchor Platform can capture significant market share.

### 2.3. Target User Segments & Personas

| **Role**            | **Persona**                                     | **Primary Goals**                                                                                               |
| ------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Admin**           | Platform Administrator                          | - Manage all users, programs, and system settings. <br>- Ensure data integrity through bulk uploads and oversight. |
| **Anchor User**     | Corporate Finance Manager                       | - Monitor overall program health and credit utilization. <br>- Track invoice lifecycle and manage financial risk.    |
| **Sales Manager**   | (Anchor Sub-Role)                               | - Validate new dealer leads submitted by the sales team. <br>- Track team performance and onboarding pipeline.      |
| **Sales Person**    | (Anchor Sub-Role)                               | - Add new dealer leads to the system. <br>- Manage initial document collection.                                 |
| **Onboarding Ops**  | (Anchor Sub-Role)                               | - Verify submitted documents. <br>- Manage the operational flow of onboarding.                                  |
| **Field Inspector** | (Anchor Sub-Role)                               | - Conduct and submit on-site verification reports for new dealers.                                              |
| **Legal/Compliance**| (Anchor Sub-Role)                               | - Perform final checks on documents and business viability. <br>- Approve dealers for credit assessment.         |
| **Regional Manager**| (Anchor Sub-Role)                               | - Conduct credit checks (AI-assisted). <br>- Approve final business and credit limits for dealers.              |
| **Dealer Admin**    | (Anchor Sub-Role)                               | - Perform the final activation of a dealer in the system. <br>- Generate unique dealer codes.                   |

---

## 3. User Stories & Use Cases

### 3.1. Anchor User Stories
- **As an Anchor Finance Manager, I want to see a dashboard overview of my total credit limit, utilization, and overdue amounts so that I can quickly assess the financial health of my program.**
- **As an Anchor Finance Manager, I want to use an AI assistant to ask questions like "How many invoices are overdue?" so that I can get quick answers without manually filtering tables.**
- **As an Anchor Finance Manager, I want to track the status of individual invoices from "Initiated" to "Disbursed" so that I have full visibility into the payment lifecycle.**

### 3.2. Onboarding Workflow User Stories (Sub-Roles)
- **As a Sales Person, I want to add a new dealer lead with their basic contact and business information so that I can start the onboarding process.**
- **As a Sales Manager, I want to receive and validate new leads so that I can ensure only qualified dealers enter the pipeline.**
- **As an Onboarding Ops user, I want to view all collected documents for a dealer in one place and verify their authenticity so that I can move the dealer to the next stage.**
- **As a Field Inspector, I want to submit a site visit report with notes and photos directly through the platform so that the information is immediately available to decision-makers.**
- **As a Regional Manager, I want to use an AI-powered tool to get a risk score for a dealer so that I can make an informed decision on their credit limit.**
- **As a Dealer Admin, I want to perform the final activation step and generate a unique dealer code so that the dealer can begin transacting on the platform.**

### 3.3. Admin User Stories
- **As an Admin, I want to bulk-upload a list of dealers and their credit limits from an Excel file so that I can set up new programs efficiently.**
- **As an Admin, I want to create and manage user accounts, assigning them specific roles and sub-roles so that I can maintain proper access control.**

### 3.4. Edge Cases & Error Handling
- **Use Case:** A user uploads an invoice document that the AI cannot read.
  - **System Response:** The system shall notify the user that AI extraction failed and allow them to enter the invoice details manually.
- **Use Case:** An Admin attempts to upload a bulk data file with duplicate IDs.
  - **System Response:** The system shall process the valid entries, skip the duplicates, and provide a summary report of successful and skipped entries.
- **Use Case:** A user's session expires while they are filling out a form.
  - **System Response:** The system shall redirect the user to the login page. Upon successful re-authentication, the system should ideally restore the form state (future enhancement).

---

## 4. Functional Requirements

### 4.1. Feature: Dashboard
- **4.1.1. Credit Overview:** Displays total, utilized, and available credit limits, broken down by Supermoney vs. External lenders.
- **4.1.2. Summary Cards:** Actionable cards for Overdue Summary, Upcoming Payments, and Invoice Summary (last 7 days). Clicking a card navigates to the relevant, pre-filtered table.
- **4.1.3. Lead Summary:** Displays key metrics from the dealer onboarding pipeline (Total, New, Onboarding, Disbursed, etc.).
- **4.1.4. Program Overview:** A horizontally scrollable view of all financing programs, showing utilization percentage and key stats for each.
- **4.1.5. Recent Invoices Table:** A paginated table showing the most recent invoices with key details.
- **Acceptance Criteria:** All data on the dashboard must be loaded in real-time and reflect the correct data scope based on the logged-in user's role and `externalId`.

### 4.2. Feature: Dealer Onboarding
- **4.2.1. Role-Based Dashboards:** Each onboarding sub-role has a dedicated dashboard showing only the leads and tasks relevant to them.
- **4.2.2. Progress Tracker:** A visual component displays the dealer's current stage in the onboarding pipeline (`Lead Created` -> `Dealer Activated`).
- **4.2.3. Document Management:** Ability to upload, view, and verify documents (e.g., GST, PAN). Status changes upon verification.
- **4.2.4. Site Visit Reporting:** A dialog allows Field Inspectors to submit notes and upload multiple images for their report.
- **4.2.5. Limit Approval:** A dialog allows Regional Managers to view AI-generated credit scores and approve a final business limit.
- **Acceptance Criteria:** A lead cannot proceed to the next stage until the current stage's requirements are met and approved by a user with the correct sub-role.

### 4.3. Feature: Data Management (Bulk Uploads)
- **4.3.1. Excel Upload:** Users can upload `.xlsx` files to bulk-add Programs, Dealers, and Invoices.
- **4.3.2. Sample Download:** Each bulk upload page provides a link to download a sample Excel template with the correct headers.
- **4.3.3. Duplicate Handling:** The system must check for existing document IDs (`programId`, `applicationId`, `invoiceNumber`) and skip duplicates to prevent data corruption.
- **Acceptance Criteria:** After an upload, the system must display a toast notification summarizing the number of successful and skipped records.

---

## 5. Technical Requirements

### 5.1. System Architecture
- **Frontend:** Next.js 15+ (App Router), React 18, TypeScript.
- **Styling:** Tailwind CSS with ShadCN UI components. CSS variables should be used for theming.
- **Backend/Database:** Firebase Firestore for all data storage. The application must support connecting to two separate Firestore projects (`db1` for core SCF data, `db2` for lead management data).
- **AI:** Google AI (Gemini) managed through the Genkit framework.
- **Authentication:** Iron Session for server-side session management.

### 5.2. Database Schema Requirements
- The Firestore database must be structured into the following collections: `users`, `programs`, `dealers`, `dealerLimits`, `invoices`.
- The `dealers` collection in `db2` is used for momentum leads.
- Data integrity must be maintained. For instance, `dealerLimits` and `dealers` collections use the `applicationId` as the document ID to link related data.
- See `src/types/index.ts` for detailed field specifications for each collection.

### 5.3. Security and Compliance
- Passwords must not be stored in plaintext. (Note: Current implementation stores passwords in plaintext and requires immediate remediation with a secure hashing mechanism like Bcrypt, integrated with Firebase Auth).
- All communication between the client and server must be over HTTPS.
- Firestore security rules must be implemented to enforce role-based access control at the database level.

### 5.4. Performance and Scalability
- Utilize Next.js Server Components by default to minimize client-side JavaScript.
- Leverage Firestore's indexing capabilities for efficient querying, especially on large datasets.
- Implement pagination for all data tables to ensure fast initial load times.
- Images must be optimized using the `next/image` component.

---

## 6. User Experience Requirements

### 6.1. UI/UX Specifications
- The UI must adhere to the style guidelines defined in `src/app/globals.css`, using the specified primary (#3498db), background (#ecf0f1), and accent (#2ecc71) colors.
- All interactive elements must have clear focus, hover, and active states.
- Card-based layouts should be used to organize information on dashboards.
- Forms should provide real-time validation feedback to the user.

### 6.2. Responsive Design
- The application must be fully responsive and functional on all major device types: desktop, tablet, and mobile.
- The sidebar navigation must collapse into an off-canvas menu on mobile devices.

### 6.3. Accessibility
- The application should strive for WCAG 2.1 AA compliance.
- All form inputs must have associated labels.
- Use semantic HTML and appropriate ARIA attributes where necessary.

---

## 7. AI Integration Specifications

### 7.1. AI Invoice Reader (`extract-invoice-data-flow.ts`)
- **Input:** A data URI of an image or PDF document.
- **Process:** The Genkit flow sends the document to the Gemini model with a prompt instructing it to extract key financial data.
- **Output:** A structured JSON object containing `invoiceNumber`, `dealerName`, `documentType`, `amount`, and `dueDate`.
- **Acceptance Criteria:** The AI must successfully extract data from at least 90% of standard, machine-readable invoice formats.

### 7.2. AI Risk Assessment (`risk-assessment.ts`)
- **Input:** `dealerName` and a string summary of their invoice history.
- **Process:** The Genkit flow prompts Gemini to act as a risk analyst, providing a score and rationale.
- **Output:** A structured JSON object with `riskScore` (0-100), `riskFactors` (string), and `recommendations` (string).
- **Acceptance Criteria:** The AI must provide a plausible risk score and justification based on the provided invoice data summary.

### 7.3. AI Assistant (`ask-ai-flow.ts`)
- **Input:** A natural language question from the user and the user's `anchorId`.
- **Process:** The Genkit flow uses a prompt that instructs the AI to act as the "Supermoney Assistant". It has access to three tools: `getProgramSummaryTool`, `getInvoiceSummaryTool`, and `getDealerSummaryTool`. The AI decides which tool to call based on the user's question.
- **Output:** A conversational, natural-language answer to the user's question, based on the real-time data returned by the tools.
- **Acceptance Criteria:** The assistant must use the provided tools to answer data summary questions and must correctly inform the user of its limitations (e.g., cannot look up specific invoice details).

---

## 8. Data Management Requirements

### 8.1. Data Model
- Refer to `src/types/index.ts` for the canonical data models for all entities.
- Relationships are managed through IDs (e.g., `programId` in an `invoice` document links it to the `programs` collection).

### 8.2. Import/Export
- The system must support bulk import of programs, dealers, and invoices via `.xlsx` files.
- Each upload page must provide a downloadable sample template to ensure data format consistency.

### 8.3. Audit Trail & Logging
- **(Future Requirement)** Implement a dedicated `audit_logs` collection in Firestore.
- Every significant write operation (e.g., user creation, status change, invoice submission) must create an audit log entry containing the user ID, timestamp, action taken, and data changed.

---

## 9. Security & Compliance

### 9.1. Authentication and Authorization
- User authentication is managed via email and password using Iron Session.
- **CRITICAL:** The current plaintext password storage must be replaced with a secure authentication provider (e.g., Firebase Authentication) immediately.
- Authorization is role-based. The user's role and sub-role, stored in their session, dictate which UI elements and navigation links are visible.

### 9.2. Data Encryption
- Data in transit is encrypted via HTTPS.
- Data at rest is encrypted by default by Firestore.

### 9.3. Regulatory Compliance
- As a financial services application, the platform must be designed with data privacy regulations (e.g., GDPR, local data protection laws) in mind.
- Sensitive personal identifiable information (PII) should be handled with care and access should be strictly limited.

---

## 10. Integration Requirements

### 10.1. Third-Party Systems
- **Nodemailer:** The platform integrates with an SMTP service via Nodemailer for sending transactional emails (e.g., limit requests, invoice submissions).
- **(Future Requirement)** Plan for API-based integrations with common enterprise systems like SAP, Oracle (for ERP), and Salesforce (for CRM).

### 10.2. API Specifications
- **(Future Requirement)** A secure, versioned REST or GraphQL API should be developed to allow Anchors and third-party systems to interact with the platform programmatically.
- The API must use a standard authentication method like OAuth 2.0.

---

## 11. Deployment & Infrastructure

### 11.1. Hosting
- The Next.js application is configured for deployment on Firebase App Hosting, as specified in `apphosting.yaml`.
- The Genkit AI flows are deployed alongside the Next.js application.

### 11.2. Database
- The platform utilizes two Firestore databases. Configuration must be managed via environment variables.
- A backup and recovery strategy for Firestore data must be established, using Firebase's built-in tools.

### 11.3. Environment Variables
- The application relies on a `.env` file for all credentials (Firebase, Gemini, SMTP, Session Secret). This file must be securely managed and never committed to version control. Refer to `README.md` for the required structure.

---

## 12. Testing Strategy

### 12.1. Unit Testing
- All utility functions, data transformation logic, and individual React components should have unit tests (e.g., using Jest/RTL).

### 12.2. Integration Testing
- Test the integration between components and server actions.
- Test the full lifecycle of AI flows, ensuring tools are called correctly and data is returned as expected.

### 12.3. User Acceptance Testing (UAT)
- UAT must be performed by stakeholders for each major user flow, particularly the end-to-end dealer onboarding process, to ensure it meets business requirements.

---

## 13. Success Metrics & KPIs

### 13.1. User Adoption
- **MAU/WAU:** Track active users broken down by role.
- **Feature Engagement:** Measure the usage of key features like AI Invoice Reader, Bulk Upload, and AI Assistant.

### 13.2. Performance Benchmarks
- **Page Load Time:** Average LCP (Largest Contentful Paint) for key pages like the Dashboard and Invoices table should be < 2.5s.
- **API Response Time:** P95 latency for all server actions and AI flow executions should be < 2000ms.

### 13.3. Business Impact
- **Time-to-Value:** Average time from "Lead Created" to "Dealer Activated".
- **Transaction Volume:** Total value (in INR) of invoices processed through the platform per month.
- **Operational Efficiency:** Reduction in support tickets related to invoice status or dealer onboarding.

---

## 14. Risk Assessment & Mitigation

### 14.1. Technical Risks
- **Risk:** Vendor lock-in with Firebase and Google AI.
  - **Mitigation:** Adhere to modular architecture principles. Encapsulate data access logic (`lib/data.ts`) and AI logic (`ai/flows`) to simplify potential future migrations.
- **Risk:** Performance degradation as data grows.
  - **Mitigation:** Proactively implement Firestore indexing, use pagination everywhere, and leverage Next.js caching strategies.

### 14.2. Business Risks
- **Risk:** Low user adoption due to complexity.
  - **Mitigation:** Prioritize UI/UX simplicity. Conduct regular user feedback sessions and iterate on workflows based on findings.
- **Risk:** Inaccurate AI outputs leading to incorrect business decisions.
  - **Mitigation:** Implement human-in-the-loop workflows where AI suggestions can be reviewed and overridden by a user (e.g., invoice data extraction, risk scores).

### 14.3. Security Risks
- **Risk:** Data breach due to improper access control.
  - **Mitigation:** Implement robust Firestore Security Rules. Conduct regular security audits. Replace plaintext password storage with Firebase Auth immediately.

---

## 15. Timeline & Milestones

### 15.1. MVP Definition
The current state of the application represents the Minimum Viable Product (MVP). It validates the core workflows for user management, dealer onboarding, invoice processing, and AI-powered assistance.

### 15.2. Post-MVP Roadmap
- **Phase 1 (Security & Refinement):**
  - Implement Firebase Authentication to replace plaintext passwords.
  - Implement comprehensive Firestore Security Rules.
  - Refine UI/UX based on initial user feedback.
- **Phase 2 (Automation & Reporting):**
  - Develop advanced reporting and analytics dashboards.
  - Implement automated email notifications for key events (e.g., status changes).
  - Add an audit trail for all critical actions.
- **Phase 3 (Expansion & Integration):**
  - Develop a public API for third-party integrations.
  - Add support for internationalization (i18n) and multiple currencies.
  - Explore integrations with major ERP and accounting systems.

---

## 16. Resource Requirements

### 16.1. Development Team
- **Frontend Engineer:** 2 (Expert in Next.js, React, TypeScript)
- **Backend/Firebase Engineer:** 1 (Expert in Firestore data modeling and security rules)
- **AI/ML Engineer:** 1 (Expert in Genkit, prompt engineering, and GenAI models)
- **QA Engineer:** 1
- **UX/UI Designer:** 1

### 16.2. Infrastructure & Tooling
- **Firebase:** Blaze plan to accommodate multiple projects and scalable usage.
- **Google AI Platform:** Pay-as-you-go access to Gemini models.
- **Version Control:** Git (e.g., on GitHub, GitLab).
- **CI/CD:** Platform for automated testing and deployment (e.g., GitHub Actions).
