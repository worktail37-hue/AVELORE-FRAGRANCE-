# Secure Backend Architecture & Dual-Channel Enquiry Pipeline

A robust, privacy-first backend and database architecture for Avelore Haute Parfumerie that captures extended visitor profiles, secures patron and owner PII, and delivers instant notifications via WhatsApp and Email upon sign-in and consultation inquiries.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your Phase 1 selections, the backend will implement:
> 1. **Dual Notification Channels**: Every consultation or bespoke enquiry triggers an automated Email dispatch to the owner (`worktail37@gmail.com`) and generates a pre-formatted, one-click WhatsApp dispatch payload.
> 2. **Owner & Visitor PII Protection**: The owner's contact phone number and API keys remain strictly server-side in environment configurations. Visitors can only view and mutate their own data via hardened Attribute-Based Access Control (ABAC) in Firestore rules.
> 3. **Extended Visitor Profiling**: Records sign-in metadata, favorite fragrance wardrobe details, boutique preferences, and olfactory family inclinations without exposing tracking IDs or sensitive credentials to third parties.

- **Confirmed Decision 1**: Dual notifications via WhatsApp (direct pre-formatted inquiry text) and Email.
- **Confirmed Decision 2**: Extended visitor profiling capturing fragrance wardrobe bookmarks, appointment history, and olfactory preferences.
- **Confirmed Decision 3**: Strict ABAC Firestore rules ensuring zero cross-patron data leakage and protected administrative access for `worktail37@gmail.com`.

---

## 1. Overview & Core Concept

- **What It Does**: 
  - Provides a secure, full-stack server backend (`/server.ts` Express API) combined with Firebase Firestore persistence.
  - Automatically enriches patron profiles upon Google sign-in with extended olfactory preferences and saved perfumes.
  - Intercepts all atelier consultation bookings and bespoke customer inquiries, saving them securely to Firestore and instantly notifying the maison owner via verified email and pre-composed WhatsApp alerts.
  - Includes a protected Owner / Salon Concierge View accessible by the verified admin (`worktail37@gmail.com`) to manage inbound requests in real-time.
- **Target Audience / Persona**: 
  - *Distinguished Patrons*: Experience effortless sign-in, private wardrobe synchronization, and boutique booking with zero fear of data breaches or unsolicited tracking.
  - *Maison Owner & Head Concierge*: Receives instant, beautifully formatted lead alerts directly on mobile (WhatsApp) and inbox (Email) the instant an inquiry or reservation is made.
- **Key Value**: 
  - Eliminates dropped leads and manual tracking while maintaining bank-grade patron privacy and uncompromising aesthetic refinement.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Patron Sign-in & Profile Sync*: Patron signs in via Google OAuth popup -> Backend creates/updates extended profile in `/users/{userId}` storing name, email, favorite fragrances, olfactory interests, and last visit timestamp.
  2. *Atelier Consultation Booking*: Patron fills the Private Consultation modal -> Data is validated and committed to Firestore `/consultations/{consultationId}` -> Server triggers an email alert to `worktail37@gmail.com` and provides a direct, luxury-styled "Open in WhatsApp" button with pre-formatted inquiry text.
  3. *General Bespoke Enquiry*: A new elegant enquiry form in the contact/atelier section allows visitors to submit bespoke questions -> Stored in `/enquiries/{enquiryId}` -> Triggers instant notifications.
  4. *Owner Portal*: When logged in with `worktail37@gmail.com`, an exclusive "Maison Management" badge appears in the Patron drawer, allowing the owner to view live consultation requests, client perfume wardrobes, and send direct WhatsApp follow-ups.
- **Visual Identity & Theme**:
  - *Color Palette*: Warm Wheat (`#FAF2E1`), Deep Tuscan Plum/Merlot (`#3B0000`), Burnished Ochre (`#801B00`), Golden Marigold (`#FFD482`), and Terracotta (`#A74700`).
  - *Typography*: High-contrast Cormorant Garamond / Bodoni display serif paired with clean Satoshi sans-serif and minimal monospace status badges.
  - *Component Styling*: Glassmorphic cards with subtle micro-borders, gilded status tags, and responsive modal transitions.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Notification Dispatcher vs. Client-Side API Keys**
  - *Chosen Approach*: Centralize email and webhook notification handling inside `server.ts` via `/api/notify-enquiry`.
  - *Why*: Never expose SMTP credentials, SendGrid/Resend API tokens, or personal phone numbers in the browser bundle. Client code only sends the sanitized booking reference to the server.
  - *Alternatives Considered*: Client-side email triggers (rejected due to severe security exposure and API key scraping risk).

- **Decision 2: Direct WhatsApp Alert Formatting vs. Third-Party Paid SMS/WhatsApp APIs**
  - *Chosen Approach*: Secure server-generated pre-formatted `https://wa.me/` direct dispatch URI alongside server-side webhook support.
  - *Why*: Zero third-party recurring subscription cost, instant delivery to the owner's WhatsApp app or WhatsApp Web, and full control over message templating without blocking users if third-party quotas are reached.

- **Decision 3: Zero-Trust Firestore Security Rules with ABAC**
  - *Chosen Approach*: Deploy strict rules that enforce ownership on `/users/{userId}` and `/consultations/{consultationId}`, while allowing `isAdmin()` lookup for `worktail37@gmail.com`.
  - *Why*: Prevents visitors from reading each other's private contact information, browsing competitor bookings, or enumerating client lists.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AVELORE CLIENT (SPA)                         │
│                                                                        │
│  ┌─────────────────────────┐           ┌─────────────────────────────┐ │
│  │   Patron Profile Modal  │           │  Private Consultation Modal │ │
│  │  - Extended Preferences │           │  - Atelier Date & Boutique  │ │
│  │  - Saved Fragrances     │           │  - Bespoke Notes            │ │
│  └────────────┬────────────┘           └──────────────┬──────────────┘ │
│               │                                       │                │
│               ▼                                       ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │            AuthContext & Secure Firebase Client SDK              │  │
│  │            (ABAC Auth, Google Sign-in, Auto-Sync)                │  │
│  └──────────────────┬─────────────────────────┬─────────────────────┘  │
└─────────────────────┼─────────────────────────┼────────────────────────┘
                      │                         │
     Direct ABAC Read/Write                     │ POST /api/notify-enquiry
                      │                         │ (Sanitized ID & Summary)
                      ▼                         ▼
┌───────────────────────────────┐     ┌──────────────────────────────────┐
│     FIRESTORE ENTERPRISE      │     │       AVELORE NODE SERVER        │
│                               │     │       (server.ts on Port 3000)   │
│ ┌───────────────────────────┐ │     │                                  │
│ │ /users/{userId}           │ │     │ 1. Input Sanitization & Anti-Spam│
│ │ - name, email, photo      │ │     │ 2. Compose Notification Payload  │
│ │ - favoriteProductIds      │ │     │ 3. Send Email Alert to Owner:    │
│ │ - preferredFamilies       │ │     │    worktail37@gmail.com          │
│ ├───────────────────────────┤ │     │ 4. Generate Encoded WhatsApp URI │
│ │ /consultations/{id}       │ │     │ 5. Olfactory Concierge Gemini API│
│ │ - clientName, clientEmail │ │     └────────────────┬─────────────────┘
│ │ - date, boutique, status  │ │                      │
│ ├───────────────────────────┤ │                      │
│ │ /enquiries/{id}           │ │                      ▼
│ │ - general bespoke inquiries│ │     ┌──────────────────────────────────┐
│ └───────────────────────────┘ │     │          OWNER MOBILE            │
│                               │     │ 1. Instant WhatsApp Alert        │
│ Protected by firestore.rules  │     │ 2. Formatted Luxury Email Receipt│
└───────────────────────────────┘     └──────────────────────────────────┘
```

### Data Models (`firebase-blueprint.json`)

1. **User Profile (`/users/{userId}`)**:
   - `id`: string (matches `request.auth.uid`)
   - `email`: string (patron email)
   - `displayName`: string
   - `photoURL`: string
   - `favoriteProductIds`: list of perfume IDs (max 100)
   - `favoriteProductNames`: list of perfume titles (max 100)
   - `preferredOlfactoryFamily`: string (e.g., Oriental Amber, Floral, Woody, Citrus)
   - `lastLoginAt`: string (ISO)
   - `createdAt`: string (ISO)
   - `updatedAt`: string (ISO)

2. **Consultation Reservation (`/consultations/{consultationId}`)**:
   - `id`: string (UUID)
   - `userId`: string (matches `request.auth.uid`)
   - `clientName`: string (max 128 chars)
   - `clientEmail`: string (max 256 chars)
   - `boutique`: string (Paris, London, New York, Tokyo)
   - `date`: string
   - `notes`: string (max 2000 chars)
   - `savedFragrancesSummary`: string
   - `status`: enum (`requested` | `confirmed` | `completed`)
   - `createdAt`: string (ISO)

3. **Bespoke General Enquiry (`/enquiries/{enquiryId}`)**:
   - `id`: string (UUID)
   - `clientName`: string
   - `clientEmail`: string
   - `subject`: string
   - `message`: string (max 2000 chars)
   - `status`: enum (`new` | `replied` | `archived`)
   - `createdAt`: string (ISO)

### Interactive Handlers & Security Gates

- **Input Sanitization**: Strip dangerous HTML tags and enforce length limits on all client inputs before sending.
- **Rule Enforcement**: Deploy updated `firestore.rules` allowing authenticated patrons to read/write their own records, while restricting list enumeration and providing admin oversight to `worktail37@gmail.com`.
- **Notification Route (`/api/notify-enquiry`)**: Accepts inquiry metadata, prepares a clean HTML notification dispatched to `worktail37@gmail.com`, and responds with a sanitized WhatsApp pre-filled chat link for instant owner follow-up.
