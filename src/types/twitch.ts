/**
 * Twitch Extension JWT Payload
 * @see https://dev.twitch.tv/docs/extensions/reference/#jwt-schema
 */
export interface TwitchJWTPayload {
  /** Unix timestamp when the token expires */
  exp: number;
  /** Session-based user identifier (values starting with "U" are stable) */
  opaque_user_id: string;
  /** Twitch user ID (only available if user has shared identity) */
  user_id?: string;
  /** Channel ID where the extension is running */
  channel_id: string;
  /** User's role in the channel */
  role: "broadcaster" | "moderator" | "viewer" | "external";
  /** Whether the user's identity is unlinked */
  is_unlinked?: boolean;
  /** PubSub permissions */
  pubsub_perms?: {
    listen?: string[];
    send?: string[];
  };
}
