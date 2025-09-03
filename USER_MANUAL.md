# Supermoney Anchor Platform - User Manual

**Version 1.0**

---

## 1. Introduction

Welcome to the Supermoney Anchor Platform! This guide is designed to help you understand and use all the features of this comprehensive supply chain finance (SCF) solution.

The platform serves three primary user groups:
- **Anchors**: Large corporations managing their financing programs.
- **Internal Users (Admin/SuperMoney)**: Administrators who manage the platform, users, and programs.
- **Anchor's Onboarding Team**: Users with specific sub-roles responsible for the dealer onboarding workflow.

This manual will walk you through each section of the application, from logging in to leveraging our powerful AI tools.

---

## 2. Getting Started

### 2.1. Logging In

To access the platform, you will need the email address and password provided by your administrator.

1.  Navigate to the application's URL.
2.  Enter your email and password into the respective fields on the login screen.
3.  Click the **LOGIN** button.

Upon successful login, you will be directed to your primary dashboard.

### 2.2. The Main Layout

The application is divided into two main areas:
- **Sidebar (Left Navigation)**: This is your main navigation tool. It contains links to all the major sections of the platform that are accessible to you based on your role.
- **Main Content Area**: This is where the main information and functionality for each section are displayed.

---

## 3. Anchor User Dashboard

The Dashboard is your command center, providing a real-time overview of your entire supply chain finance program.

![Dashboard Overview](/.screenshots/dashboard.png)

#### Key Sections of the Dashboard:

-   **Credit Overview**: Displays the total, utilized, and available credit limits. It's broken down by funds from "Supermoney" and from "External Lenders".
-   **Summary Cards**:
    -   **Overdue Summary**: Shows the total amount currently overdue from all dealers. Clicking this card takes you to a pre-filtered list of overdue invoices.
    -   **Upcoming Payments**: Shows the total value of payments due in the next 7, 15, and 30 days.
    -   **Invoice Summary (7d)**: A quick look at the total invoices created in the last 7 days, broken down by status (Total, Disbursed, Pending, Rejected).
-   **Lead Summary**: Provides key metrics from the dealer onboarding pipeline, such as Total Leads, New, and In-Progress.
-   **Quick Actions**:
    -   **Add Lead**: Opens a form to create a new dealer lead, initiating the onboarding process.
    -   **Request for additional limit**: Allows you to formally request a credit limit increase for a specific dealer.
    -   **Send a Query**: Opens a dialog to send a message or support request directly to the Supermoney team.
-   **AI Assistant**: A powerful chat interface to ask questions about your data in plain English.
    -   **Examples**: "How many invoices are overdue?", "What is the total number of active dealers?", "Show me a summary of my programs."
-   **Program Overview**: A horizontally scrollable section of cards, with each card representing a financing program. It shows the utilization percentage and key statistics for each program.
-   **Recent Invoices**: A table displaying the most recent invoices. You can click on any row to open a dialog with detailed information about that invoice.

---

## 4. Core Features (Anchor & Admin)

### 4.1. Invoices (`/invoices`)

This page provides a comprehensive, filterable, and paginated table of all invoices.

-   **Filtering**: You can filter the list by Invoice #, Dealer Name, Lender, Status, Overdue Status, and Date Range.
-   **Viewing Details**: Click on any invoice row to open the **Invoice Detail Dialog**, which shows a lifecycle progress tracker and all associated data.
-   **Raising Invoices**: From the dashboard, you can use the "Raise Invoice" or "Bulk Invoice Upload" buttons. The "Raise Invoice" dialog uses AI to read and pre-fill data from an uploaded invoice document (PDF, JPG, PNG).

### 4.2. Dealers (`/retailers`)

This page lists all dealers associated with your anchor account.

-   **Filtering**: You can filter the list by Dealer Name, Lender, Status, and Overdue status.
-   **Viewing Details**: Click on any dealer row to open the **Dealer Detail Dialog**. This dialog provides a full financial summary, activity history, and allows for key actions.
-   **Key Actions (in Dealer Detail Dialog)**:
    -   **Edit Details**: Admins can directly edit a dealer's financial limits and status.
    -   **Stop Supply**: If a dealer has an overdue amount, this button allows an Anchor to suspend their financing facility. This action is logged and triggers notifications.

### 4.3. Programs (`/programs`)

This page displays all available financing programs.

-   **Admin View**: Admins see a table of all programs and can see which anchors are linked to them.
-   **Anchor View**: Anchors see a card-based view of their programs, similar to the "Program Overview" on the dashboard, with detailed stats for each.

---

## 5. Admin-Only Features

These pages are typically restricted to users with the "Admin" or "SuperMoney User" role.

### 5.1. Data Management (Bulk Uploads)

To streamline setup, the platform supports bulk data uploads via Excel files. Each bulk upload page includes a link to download a sample template with the required columns.

-   **Add Program (`/add-program`)**: Bulk import financing programs.
-   **Add Dealer (`/add-dealer`)**: Bulk import dealers and their associated credit limits. `applicationId` must be unique.
-   **Add Invoice (`/add-invoice`)**: Bulk import invoices.
-   **Add User (`/add-anchor`)**: Create a new user account (Anchor or Admin).

### 5.2. User Management (`/view-users`)

This page provides a table of all user accounts in the system, showing their name, email, role, and sub-role.

---

## 6. AI-Powered Features

### 6.1. AI Invoice Reader

-   **Where to find it**: In the "Raise Invoice" dialog, accessible from the Dashboard.
-   **How it works**: Upload an invoice document (PDF, JPG, PNG). The AI assistant reads the document and automatically extracts key information like the invoice number, dealer name, amount, and due date, pre-filling the form to save you time and reduce manual errors.

### 6.2. AI Risk Assessment (`/risk-assessment`)

-   **How it works**: Select a dealer from the dropdown menu and click "Assess Risk". The AI analyzes the dealer's entire invoice history, payment behavior, and other factors to generate a risk score from 0-100. It also provides a summary of key risk factors and actionable recommendations.

### 6.3. AI Assistant

-   **Where to find it**: On the main Dashboard.
-   **How it works**: Use the chat interface to ask questions. The assistant has access to tools that can fetch and summarize your live program, invoice, and dealer data to provide you with quick, accurate answers.

---

## 7. Dealer Onboarding Workflow

For enterprise clients who have subscribed to the premium onboarding module, a set of new navigation links will appear in the sidebar. This workflow is managed by users with specific sub-roles.

-   **Onboarding Dashboard (`/onboarding-dashboard`)**: A role-specific dashboard that shows key statistics and a table of "My Actions" — leads that require the logged-in user's attention.

-   **Lead Creation (`/add-lead`)**: The `sales_person` creates a new dealer lead, providing basic business and contact information.

-   **Lead Validation**: The `sales_manager` reviews new leads. They can approve or reject them from the lead's detail page.

-   **Document Collection & Verification (`/dealer-documents`)**: The `onboarding_ops` user uploads required documents (GST, PAN, etc.). The `legal_compliance` team then reviews and verifies these documents.

-   **Site Visit (`/site-visits`)**: After documents are verified, a `field_inspector` is dispatched. They use the platform to submit a site visit report, including notes and photos.

-   **Credit & Limit Approval (`/business-limit`)**: The `regional_manager`, with input from the legal team, performs an AI-assisted credit check and approves the final business limit for the dealer.

-   **Dealer Activation (`/dealer-activation`)**: The `dealer_admin` performs the final step, activating the dealer in the system and generating their unique dealer code.

---
*This document is a living guide and will be updated as new features are added to the platform.*
