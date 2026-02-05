import { sign } from "jsonwebtoken";
import { getSecret } from "../utils/get-secret";

const TWITCH_PUBSUB_URL = "https://api.twitch.tv/helix/extensions/pubsub";

export type PubSubTarget = "broadcast" | `whisper-${string}`;

export interface PubSubResult {
  success: boolean;
  error?: string;
}

export class TwitchPubSub {
  private clientId: string;
  private secret: Buffer;

  constructor() {
    this.clientId = process.env.TWITCH_EXTENSION_CLIENT_ID;
    this.secret = getSecret();
  }

  /**
   * Create a signed JWT for EBS operations (sending PubSub messages).
   * The JWT must have role: "external" for EBS-originated requests.
   */
  createEBSToken(channelId: string): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      user_id: channelId,
      channel_id: channelId,
      role: "external",
      pubsub_perms: {
        send: ["broadcast"],
      },
      iat: now,
      exp: now + 60,
    };

    return sign(payload, this.secret);
  }

  /**
   * Send a message to Twitch Extension PubSub.
   *
   * Rate limits: 100 requests per minute per extension client ID + broadcaster ID combination.
   * Message size limit: 5 KB.
   */
  async send(
    channelId: string,
    target: PubSubTarget[],
    message: unknown,
  ): Promise<PubSubResult> {
    const token = this.createEBSToken(channelId);

    console.info(
      `Sending PubSub message to channel ${channelId} with target ${target.join(", ")}`,
    );

    const response = await fetch(TWITCH_PUBSUB_URL, {
      method: "POST",
      headers: {
        "Client-ID": this.clientId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        broadcaster_id: channelId,
        target,
        is_global_broadcast: false,
        message: JSON.stringify(message),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Twitch PubSub error (${response.status}): ${errorText}`,
      };
    }

    return { success: true };
  }

  /**
   * Broadcast a message to all viewers on a channel.
   */
  async broadcast(channelId: string, message: unknown): Promise<PubSubResult> {
    return this.send(channelId, ["broadcast"], message);
  }

  /**
   * Send a whisper message to a specific user on a channel.
   */
  async whisper(
    channelId: string,
    userId: string,
    message: unknown,
  ): Promise<PubSubResult> {
    return this.send(channelId, [`whisper-${userId}`], message);
  }
}

export const twitchPubSub = new TwitchPubSub();
