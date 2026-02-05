/**
 * Get the JWT secret from environment variable.
 * Twitch extension secrets are base64-encoded, so we decode them.
 * For development, you can use a plain string secret.
 *
 * Note: Real Twitch secrets are ~32 bytes base64-encoded (44 chars with padding).
 */
export function getSecret() {
  const rawSecret = process.env.TWITCH_SHARED_SECRET;

  return Buffer.from(rawSecret, "base64");
}
