/**
 * Get the JWT secret from environment variable.
 * Twitch extension secrets are base64-encoded, so we decode them.
 * For development, you can use a plain string secret.
 *
 * Note: Real Twitch secrets are ~32 bytes base64-encoded (44 chars with padding).
 */
export function getSecret(): string {
  const rawSecret = Bun.env.TWITCH_EXTENSION_SECRET_KEY;

  // Twitch base64 secrets are typically 44 chars (32 bytes + padding)
  // and contain +, /, or = which plain text secrets rarely have
  const looksLikeBase64 =
    /^[A-Za-z0-9+/]+=*$/.test(rawSecret) &&
    rawSecret.length >= 40 &&
    rawSecret.length <= 50 &&
    /[+/=]/.test(rawSecret);

  if (looksLikeBase64) {
    return Buffer.from(rawSecret, "base64").toString("utf-8");
  }

  // Use raw secret for development
  return rawSecret;
}
