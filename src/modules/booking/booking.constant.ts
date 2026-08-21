/**
 * Everyone here is emailed at every step of the booking lifecycle: created,
 * therapist invited, accepted, no therapist found, and cancelled.
 * Add or remove addresses as the ops team changes.
 */
export const ADMIN_EMAILS: readonly string[] = [
    "huynh8a0k5@gmail.com",
    'poppetceldran@gmail.com'
]

/** Address every outbound email is sent from. */
export const FROM_EMAIL = "zen@jobfling.com"
