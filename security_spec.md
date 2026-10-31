# Avelore Maison - Firestore Security Specification & Invariants

This specification defines the Attribute-Based Access Control (ABAC), Zero-Trust security rules, and data invariants for the Avelore Haute Parfumerie Firestore database, with a particular focus on the `enquiries` collection and server-side submission sanitization.

---

## 1. Data Invariants

### Collection: `enquiries`
1. **Zero Guest Access**: Unauthenticated visitors have strictly zero read, list, update, or delete access to `/enquiries/{enquiryId}` via the client Firestore SDK.
2. **Owner-Only Read & List Enforcement**: Only authenticated users with an verified `owner` role (`request.auth.token.email == 'worktail37@gmail.com' && request.auth.token.email_verified == true`, or a verified profile `role == 'owner'`) may read single documents (`get`) or execute query scans (`list`). Non-owner patrons and guests receive `PERMISSION_DENIED`.
3. **Identity Spoofing Guard**: When an authenticated user submits an enquiry directly, any attached `userId` must strictly match `request.auth.uid`. Falsifying the `userId` to target or frame another patron is strictly blocked.
4. **ID Format Hardening**: Document IDs must match the regex `^[a-zA-Z0-9_\-]+$` and be between 1 and 128 characters.
5. **Anti-Shadow Field Protection**: Allowed keys on creation are strictly bounded to `['id', 'clientName', 'clientEmail', 'clientPhone', 'subject', 'message', 'userId', 'status', 'createdAt']`. Any extraneous or ghost attributes (e.g. `role`, `isAdmin`, `isApproved`) immediately fail validation.
6. **Volumetric Boundaries**:
   - `clientName`: string, 1–128 characters.
   - `clientEmail`: string, 1–256 characters.
   - `clientPhone`: optional string, 1–32 characters.
   - `subject`: optional string, 1–256 characters.
   - `message`: string, 1–2000 characters.
   - `status`: enum `['new', 'replied', 'archived']`.
   - `createdAt`: string ISO timestamp, 1–64 characters.
7. **Restricted Update Mutation**: Only users with the `owner` role can update an enquiry. The only mutable field is `status` via `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status'])`. All original content (client contact info, notes, message, timestamp) is immutable.
8. **Owner-Only Deletion**: Only users with the `owner` role can delete records from `/enquiries`.

---

## 2. The "Dirty Dozen" Attack Payloads

| # | Attack Vector | Target Operation | Exploit Payload / Context | Expected Result |
|---|---|---|---|---|
| 1 | Unauthenticated Guest Read | `get /enquiries/{id}` | `auth: null`, attempt to fetch visitor contact record | **PERMISSION_DENIED** |
| 2 | Unauthenticated Guest List | `list /enquiries` | `auth: null`, attempt to query all client leads | **PERMISSION_DENIED** |
| 3 | Unauthenticated Guest Direct Write | `create /enquiries/{id}` | `auth: null`, attempt direct database mutation | **PERMISSION_DENIED** |
| 4 | Authenticated Non-Owner Read | `get /enquiries/{id}` | `auth.uid: 'patron_456'`, attempts to view enquiry | **PERMISSION_DENIED** |
| 5 | Authenticated Non-Owner List | `list /enquiries` | `auth.uid: 'patron_456'`, attempts collection scan | **PERMISSION_DENIED** |
| 6 | Identity Spoofing on Create | `create /enquiries/{id}` | `auth.uid: 'patron_456'`, payload `{ userId: 'victim_789' }` | **PERMISSION_DENIED** |
| 7 | Shadow Field Privilege Escalation | `create /enquiries/{id}` | Valid fields + `{ role: 'owner', isAdmin: true }` | **PERMISSION_DENIED** |
| 8 | Denial-of-Wallet Buffer Overflow | `create /enquiries/{id}` | `message` string of 100,000 characters (> 2000 limit) | **PERMISSION_DENIED** |
| 9 | Malformed Document ID Poisoning | `create /enquiries/{id}` | ID containing invalid characters or traversal strings `../` | **PERMISSION_DENIED** |
| 10 | Unauthorized Status Manipulation | `update /enquiries/{id}` | Non-owner user attempts to set `status: 'archived'` | **PERMISSION_DENIED** |
| 11 | Immutable Field Modification | `update /enquiries/{id}` | Owner attempts to overwrite `clientEmail` or `message` | **PERMISSION_DENIED** |
| 12 | Unauthorized Record Deletion | `delete /enquiries/{id}` | Non-owner user attempts document deletion | **PERMISSION_DENIED** |

---

## 3. Server-Side Submission Validation Architecture

To accommodate unauthenticated public visitors safely without granting guest access to Firestore rules:
1. Public form submissions route through the authenticated backend gateway `/api/enquiries` and `/api/notify-enquiry`.
2. The server enforces:
   - Strict rate limiting per IP address.
   - HTML/Script tag stripping (`<script>`, `<svg>`, `onerror=`, `javascript:`).
   - Strict volumetric string length bounds.
   - RFC-compliant email syntax validation.
   - Phone number character whitelisting (`+`, `()`, `-`, ` ` and digits).
   - Server-authenticated database archival and instant WhatsApp dispatch.
