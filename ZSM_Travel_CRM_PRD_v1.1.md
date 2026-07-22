# ZSM TRAVEL
### CRM Platform for Airline Booking & Post-Booking Services

**Product Requirements Document (PRD)**
Version 1.1
Prepared: July 16, 2026 | Revised: July 18, 2026
Status: Draft for Review

## Document Control

| Field | Detail |
|---|---|
| Document Title | ZSM Travel CRM — Product Requirements Document |
| Version | 1.1 |
| Date | July 16, 2026 (Revised July 18, 2026) |
| Status | Draft |
| Product Type | Web-based CRM for airline ticket booking and after-booking service management |
| Market / Currency | United States domestic ticket sales only; all pricing, charges, and invoicing in US Dollars (USD) |
| Target Airlines (Phase 1) | Delta Air Lines, American Airlines, United Airlines, Southwest Airlines, JetBlue Airways, and other major U.S. carriers (extensible carrier list — see Section 1.3) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Dashboard Requirements](#3-dashboard-requirements)
4. [New Booking Workflow](#4-new-booking-workflow)
5. [Post-Booking Service Actions](#5-post-booking-service-actions)
6. [Booking Search & Customer Service](#6-booking-search--customer-service)
7. [Invoice & Proposal Email](#7-invoice--proposal-email)
8. [Reporting & Analytics](#8-reporting--analytics)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [High-Level Data Entities](#10-high-level-data-entities)
11. [Assumptions & Dependencies](#11-assumptions--dependencies)
12. [Out of Scope (This Release)](#12-out-of-scope-this-release)
13. [Open Questions for Stakeholder Review](#13-open-questions-for-stakeholder-review)

---

## 1. Introduction

### 1.1 Purpose

This document defines the functional and non-functional requirements for ZSM Travel CRM, a web application used by travel agents and back-office staff to sell airline tickets within the United States domestic market and to manage every stage of the booking lifecycle from initial reservation through post-booking servicing, refunds, and customer support.

### 1.2 Product Overview

ZSM Travel CRM combines a booking engine (connected to airline/GDS availability), a payment and invoicing workflow, an on-hold reservation queue, and a customer service module (search, notes, ticket escalation) into a single web application. The product serves the U.S. domestic market exclusively; all fares, fees, and invoices are captured and displayed in US Dollars (USD). A management dashboard gives leadership a real-time financial view of sales, refunds, chargebacks and pending items — without exposing raw airline cost, which remains restricted to back-office booking screens.

### 1.3 Scope

In scope for this release:

- New booking creation across major U.S. airline carriers, including Delta Air Lines, American Airlines, United Airlines, Southwest Airlines, JetBlue Airways, and other supported U.S. carriers
- Airline code connectivity for live/preview fare and availability lookup, USD-denominated
- Multi-passenger, multi-leg itinerary capture with baggage and insurance add-ons
- Credit/debit card charge workflow with mandatory cardholder declaration
- Editable fare and cost breakdown (base fare, taxes, fees, airline charges, misc.), all in USD
- On-hold booking queue and 11 post-booking service actions
- Booking search, case notes, and quality-escalation ticketing
- Executive dashboard with sales/refund/chargeback KPIs and charts

> **Update (July 18, 2026):** Scope has been expanded from the original three-carrier list (Delta, American, United) to a broader, extensible set of major U.S. airline carriers, reflecting that ZSM Travel books flights only within the USA in USD. Southwest Airlines and JetBlue Airways are added explicitly for Phase 1, with the carrier list designed to accommodate additional major U.S. airlines going forward without requiring a schema change.

Out of scope for this release is listed in Section 12.

### 1.4 Definitions & Acronyms

| Term | Definition |
|---|---|
| PNR | Passenger Name Record — the airline's reservation reference number |
| GDS | Global Distribution System used to search and price airline inventory |
| Descriptor | The company/merchant name that appears on the customer's invoice and card statement |
| Vendor | The source/channel through which the customer was converted (e.g., a partner or lead vendor) |
| Gateway | The payment gateway used to process the card; its processing charge appears on the invoice |
| Payout Type | Indicates whether the fare is charged to the customer's own card or to a company-held card |
| On Hold | A booking state where a PNR has been created with the airline but is not yet ticketed/confirmed |
| Chargeback | A disputed transaction reversed by the customer's card issuer |
| NA Booking | A booking record with no charge associated (no-charge / informational booking) |
| USD | United States Dollar — the sole currency supported for pricing, charging, and reporting in this release |

---

## 2. User Roles & Permissions

The application is used internally by the travel agency. Access levels shown below are recommended defaults and should be confirmed with stakeholders.

| Role | Primary Access |
|---|---|
| Travel Agent | Create bookings, search bookings, add notes, request post-booking service actions |
| Booking / Ops Team | Process on-hold bookings, confirm PNR/ticketing, apply airline cost, manage service actions |
| Quality / Escalation Team | Receive escalated tickets, review notes, resolve disputes |
| Accounts / Finance | View full cost breakdown including airline cost, manage refunds and chargebacks, reconcile gateway/descriptor settlement |
| Manager / Admin | Full dashboard access (sales, refunds, chargebacks), user management, no airline-cost visibility restriction |

**Business rule:** Airline cost (the agency's net cost from the airline) must never be visible on the Dashboard. It is visible only within the booking record's cost breakdown to authorized roles (Ops/Finance/Admin).

---

## 3. Dashboard Requirements

The Dashboard is the landing screen after login and gives a real-time snapshot of business performance. All monetary figures on the dashboard are displayed in USD.

### 3.1 KPI Tiles (Top of Screen)

- Total Sales
- Total Refund
- Total Partial Refund
- Total Pending
- Total Chargeback
- Total NA — No Charge Booking

### 3.2 Visualization

A chart (pie chart, with bar chart as an alternate view) breaks down the same six categories — Total Sales, Total Refund, Total Partial Refund, Total Pending, Total Chargeback, and Total NA — as proportions of overall booking volume, filterable by date range, descriptor, vendor, gateway, and airline carrier.

### 3.3 Restricted Data

Airline cost (net cost paid to the airline) is explicitly excluded from all dashboard tiles, charts, and exports. It only appears inside individual booking records for authorized roles.

---

## 4. New Booking Workflow

Clicking "New Booking" launches a multi-step wizard. Progress is auto-saved at each step so an in-progress booking can be resumed.

### 4.1 Step 1 — Airline Connect & Flight Selection

- An Airline Code entry box connects to the relevant airline/GDS source. Supported carriers for this release include Delta Air Lines, American Airlines, United Airlines, Southwest Airlines, JetBlue Airways, and other major U.S. carriers; the carrier list is configurable so additional U.S. airlines can be added without a system change.
- Agent previews live availability and fares (in USD) returned for the entered code/route and selects the correct flight(s).
- Primary Airline Name and PNR fields are captured; PNR status defaults to "On Hold" once the reservation is created with the airline.
- The form supports additional flight legs for connecting/return/multi-carrier itineraries: a "Next Airline Name" and "PNR" pair is available, initially blank, and becomes visible/editable once populated — supporting one or more additional airline segments per booking, including segments on different supported carriers.

### 4.2 Step 1 — Booking Configuration Dropdowns

| Dropdown | Purpose |
|---|---|
| Descriptor | Selects the company/merchant name that will display on the invoice and on the customer's card statement |
| Vendor | Identifies the source/channel through which this customer was converted |
| Gateway | Selects the payment gateway that will process the charge; the gateway's processing fee is itemized on the invoice |
| Payout Type | Selects whether the fare is charged to the customer's own credit/debit card or to the agency's own (house) card |

### 4.3 Step 2 — Passenger Details

Captured per passenger (form repeats for each passenger added to the itinerary):

- Title, First Name, Middle Name, Last Name
- Date of Birth, Gender
- Carry-on bag count (per passenger)
- Checked/check-in bag count and details (per passenger)
- Travel insurance selection and details
- Phone number and Alternate phone number
- Email ID

Special passenger types (see Section 5) such as minor-alone travel or pet booking are flagged at this step and route into the corresponding service workflow.

### 4.4 Step 3 — Payment / Card Charging

- Card entry supports Visa and Mastercard.
- All charges are processed and displayed in US Dollars (USD).
- Before the card is charged, the agent must present and the customer must agree to a charge declaration/authorization confirming the amount (in USD), currency, and cardholder consent to charge.
- The same declaration text is automatically included in the proposal/quote email sent to the customer, so the customer has written confirmation of what they agreed to before the charge is applied.
- Charging is blocked until the declaration is marked as agreed.

### 4.5 Step 4 — Fare & Cost Breakdown

Displayed as an editable side panel while the agent builds the booking. All amounts are in USD:

| Editable Charge Component | Description |
|---|---|
| Base Fare | Airline base fare for the itinerary (USD) |
| Taxes | Government/airport taxes applicable to the fare (USD) |
| Fees | Booking or service fees (USD) |
| Airline Charges for Fare | Airline-imposed charges tied to the fare (e.g., fare rules surcharges) (USD) |
| Miscellaneous | Any other itemized charge (baggage, seat, insurance, etc.) (USD) |

Cost summary shown before the booking is finalized:

- Total Cost — full amount (USD) to be charged to the customer
- Taxes with Misc. Cost — combined tax and miscellaneous total (USD)
- Actual Cost — agency's actual airline cost for the fare, USD (restricted visibility per Section 2)
- Actual Misc. Cost — agency's actual cost for miscellaneous add-ons, USD (restricted visibility per Section 2)

### 4.6 Step 5 — Confirmation

On submission, the booking is saved with status On Hold pending further processing, documentation, and airline ticketing confirmation. The system generates a unique Booking ID used for all subsequent search and service actions.

---

## 5. Post-Booking Service Actions

Once a booking exists, the following service actions can be initiated against it. Each action opens its own guided workflow, updates the booking's activity log, and can trigger a supplemental invoice/charge (in USD) where applicable.

| # | Service Action | Typical Use |
|---|---|---|
| 1 | Change Itinerary | Modify flight dates, routing, or times on an existing PNR |
| 2 | Cancellation for Refund | Cancel booking and process a monetary refund (USD) to the original payment method |
| 3 | Cancellation for Credit | Cancel booking and issue airline/agency credit instead of a cash refund |
| 4 | Name Correction | Correct a misspelled or legally changed passenger name |
| 5 | Seat Assign | Assign a standard seat to a passenger |
| 6 | Seat Upgrade | Upgrade passenger seat class or cabin |
| 7 | Add Baggage | Add checked or carry-on baggage after initial booking |
| 8 | Add Seat and Baggage | Combined seat and baggage add-on in one action |
| 9 | Pet Booking | Add an in-cabin or cargo pet reservation |
| 10 | Minor Alone Booking | Process an unaccompanied-minor travel arrangement |
| 11 | Checking Service | General check-in assistance / service request |

---

## 6. Booking Search & Customer Service

### 6.1 Search Criteria

A booking can be located using any of the following, individually:

- Booking ID
- First Name and Last Name
- Email ID
- Phone Number

### 6.2 Notes & Escalation

From a located booking, the agent can generate a case note or raise a support ticket. Tickets can be escalated to the Quality team for review and resolution. All notes and tickets remain attached to the booking's history.

### 6.3 Fields Visible After Booking Search

- Merchant name (Descriptor)
- Vendor code
- Booking source — travel agent name
- Payment method — credit card, internet banking, etc.
- User log date and time (system/agent activity)
- Booking date and time

---

## 7. Invoice & Proposal Email

A proposal/quote email is sent to the customer prior to charging, containing the itinerary, itemized fare breakdown in USD, and the mandatory charge declaration referenced in Section 4.4. The final invoice reflects the Descriptor (merchant name), itemized fare components in USD, and any gateway processing charge; it excludes the agency's actual/airline cost.

---

## 8. Reporting & Analytics

In addition to the dashboard tiles in Section 3, the system should support:

- Date-range and multi-select filtering by Descriptor, Vendor, Gateway, Payout Type, and Airline Carrier
- Export of sales, refund, partial refund, pending, chargeback, and NA-booking data in USD (excluding airline cost)
- Drill-down from a dashboard segment into the underlying list of bookings

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security & Compliance | PCI-DSS-compliant card capture and storage (tokenization recommended); role-based access control; encrypted storage of PII (DOB, phone, email, passport if added later) |
| Market & Currency | Application supports U.S. domestic ticket sales only for this release; all pricing, charging, invoicing, and reporting use US Dollars (USD) exclusively — no multi-currency support in this release |
| Auditability | Every booking, service action, note, and ticket must record user, timestamp, and before/after values |
| Availability | Airline connectivity checks should show clear availability/loading and error states when a carrier's fare source is unreachable |
| Performance | Fare search/preview should return results quickly enough for live agent-assisted booking; dashboard KPIs should load without noticeable delay for standard date ranges |
| Usability | Multi-step booking wizard must allow save-and-resume; validation errors shown inline per field |
| Extensibility | The supported-carrier list (Section 1.3, 4.1) should be configurable so additional major U.S. airlines can be onboarded without a schema or workflow redesign |
| Data Retention | Booking, payment declaration, and communication history retained per company and card-network policy |

---

## 10. High-Level Data Entities

- **Booking** — Booking ID, status (On Hold, Confirmed, Cancelled, etc.), Descriptor, Vendor, Gateway, Payout Type, currency (USD), created/updated timestamps
- **Flight Segment** — Airline name, Airline code, PNR, status, sequence
- **Passenger** — Title, name fields, DOB, gender, baggage, insurance, contact details
- **Fare Breakdown** — Base fare, taxes, fees, airline charges, misc., actual cost, actual misc. cost (all USD)
- **Payment** — Card type, charge declaration record, gateway reference, payout type, currency (USD)
- **Service Action** — Type (1 of the 11 in Section 5), linked booking, status, cost impact
- **Note / Ticket** — Linked booking, author, content, escalation status
- **User** — Role, permissions, activity log

---

## 11. Assumptions & Dependencies

- The agency has (or will obtain) API/GDS access credentials for each supported U.S. carrier, including Delta Air Lines, American Airlines, United Airlines, Southwest Airlines, JetBlue Airways, and additional major U.S. carriers to be onboarded
- A PCI-compliant payment gateway integration is available for USD card charging
- Email delivery service is available for sending proposal/invoice emails
- Exact field-level validation rules (e.g., required vs. optional fields) will be finalized with stakeholders during design
- This release targets U.S. domestic bookings only; international ticketing and multi-currency support are not assumed in scope

---

## 12. Out of Scope (This Release)

- Airlines outside the supported major U.S. carrier list (see Section 1.3)
- International (non-U.S.) ticket sales and non-domestic routing
- Pricing, charging, or settlement in currencies other than USD
- Hotel, car rental, or package bookings
- Customer-facing self-service booking portal (this PRD covers the internal agent CRM only)
- Automated fraud/chargeback dispute filing with card networks

---

## 13. Open Questions for Stakeholder Review

1. Should Actual Cost and Actual Misc. Cost be visible to Travel Agents at the point of booking, or restricted strictly to Ops/Finance/Admin?
2. What are the specific SLA targets for Quality-team ticket escalation resolution?
3. Is a single card charge per booking assumed, or should the workflow support split/multiple payment methods?
4. Should Pet Booking and Minor Alone Booking capture additional airline-specific compliance fields (e.g., minor's guardian details, pet crate dimensions) as part of this release?
5. Beyond Delta, American, United, Southwest, and JetBlue, which additional major U.S. carriers (e.g., Alaska Airlines, Spirit, Frontier) should be confirmed for Phase 1 vs. a later phase?
