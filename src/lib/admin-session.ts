/**
 * localStorage key holding the admin passcode after a successful unlock.
 * Shared by every admin page (guestbook, contact) so one unlock covers all of
 * them. Client-side only — the server never reads this; it receives the value
 * in the `x-admin-key` header and compares it against ADMIN_PASSCODE.
 */
export const ADMIN_STORAGE_KEY = "admin-key";
