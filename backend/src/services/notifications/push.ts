import { env } from '../../config/env';

// ─── Push Notification Service (Firebase Cloud Messaging) ─────
// Free unlimited push notifications.
// Degrades gracefully: logs intent if no FCM config.
//
// NOTE: firebase-admin is loaded dynamically to avoid compile
// errors when the package is not installed. Install it with:
//   npm install firebase-admin
// ──────────────────────────────────────────────────────────────

interface PushResult {
  success: boolean;
  messageId?: string;
  error?: string;
  stubbed: boolean;
}

// Device token registry (in-memory — use DB in production)
const deviceTokens = new Map<string, string[]>(); // userId → [tokens]

export const pushService = {
  /**
   * Check if FCM is properly configured.
   */
  isAvailable(): boolean {
    return !!env.FCM_SERVICE_ACCOUNT_JSON;
  },

  /**
   * Register a device token for a user.
   */
  registerToken(userId: string, token: string): void {
    const existing = deviceTokens.get(userId) || [];
    if (!existing.includes(token)) {
      existing.push(token);
      deviceTokens.set(userId, existing);
    }
    console.log(`[Push] Registered token for user ${userId} (total: ${existing.length})`);
  },

  /**
   * Remove a device token.
   */
  unregisterToken(userId: string, token: string): void {
    const existing = deviceTokens.get(userId) || [];
    deviceTokens.set(userId, existing.filter((t) => t !== token));
  },

  /**
   * Get all tokens for a user.
   */
  getTokens(userId: string): string[] {
    return deviceTokens.get(userId) || [];
  },

  /**
   * Send a push notification to a specific device.
   * Stubs the call if FCM is not configured.
   */
  async sendPush(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<PushResult> {
    if (!this.isAvailable()) {
      console.warn('[Push] FCM not configured — notification stubbed:', { title, body });
      return { success: true, stubbed: true, messageId: `stub-push-${Date.now()}` };
    }

    try {
      // Dynamic require to avoid compile-time dependency on firebase-admin
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const admin = require('firebase-admin');

      // Initialize Firebase if not already done
      if (!admin.apps.length) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
        const serviceAccount = require(env.FCM_SERVICE_ACCOUNT_JSON!);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      const message = {
        token,
        notification: { title, body },
        data: data || {},
      };

      const response = await admin.messaging().send(message);
      return { success: true, stubbed: false, messageId: response };
    } catch (error) {
      console.error('[Push] Failed to send notification:', error);
      return { success: false, stubbed: false, error: 'Push notification service error' };
    }
  },

  /**
   * Send push notification to all tokens for a user.
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<PushResult[]> {
    const tokens = this.getTokens(userId);
    if (tokens.length === 0) {
      return [{ success: false, stubbed: false, error: 'No registered devices for user' }];
    }

    return Promise.all(tokens.map((t) => this.sendPush(t, title, body, data)));
  },

  /**
   * Broadcast to all registered devices.
   */
  async broadcast(
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const [, tokens] of deviceTokens) {
      for (const t of tokens) {
        const result = await this.sendPush(t, title, body, data);
        if (result.success) sent++;
        else failed++;
      }
    }

    return { sent, failed };
  },
};
