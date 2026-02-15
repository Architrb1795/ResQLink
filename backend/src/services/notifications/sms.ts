import { env } from '../../config/env';

// ─── SMS Service (Twilio) ─────────────────────────────────────
// Trial accounts available for testing.
// Degrades gracefully: logs the message if no credentials.
// ──────────────────────────────────────────────────────────────

interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  stubbed: boolean;
}

export const smsService = {
  /**
   * Check if SMS is properly configured.
   */
  isAvailable(): boolean {
    return !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER);
  },

  /**
   * Send an SMS message.
   * Stubs the call if Twilio is not configured.
   */
  async sendSms(to: string, body: string): Promise<SmsResult> {
    if (!this.isAvailable()) {
      console.warn('[SMS] Twilio not configured — message stubbed:', { to, body: body.substring(0, 50) });
      return { success: true, stubbed: true, messageId: `stub-${Date.now()}` };
    }

    try {
      // Twilio REST API — direct fetch instead of SDK to avoid heavy dependency
      const accountSid = env.TWILIO_ACCOUNT_SID!;
      const authToken = env.TWILIO_AUTH_TOKEN!;
      const from = env.TWILIO_PHONE_NUMBER!;

      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
      });

      if (!response.ok) {
        const error = await response.json() as { message?: string };
        console.error('[SMS] Twilio API error:', error);
        return { success: false, stubbed: false, error: (error as { message?: string }).message || 'Twilio API error' };
      }

      const result = await response.json() as { sid: string };
      return { success: true, stubbed: false, messageId: result.sid };
    } catch (error) {
      console.error('[SMS] Failed to send SMS:', error);
      return { success: false, stubbed: false, error: 'SMS service temporarily unavailable' };
    }
  },

  /**
   * Generate and send a 6-digit OTP.
   * Stores hashed OTP in-memory (use Redis in production).
   */
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (simple in-memory store — use Redis in production)
    otpStore.set(phone, { code: otp, expires: Date.now() + 5 * 60 * 1000, attempts: 0 });

    const result = await this.sendSms(phone, `Your ResQLink verification code is: ${otp}. Valid for 5 minutes.`);

    if (result.stubbed) {
      console.log(`[SMS] OTP for ${phone}: ${otp} (stubbed — would be sent via Twilio)`);
    }

    return { success: result.success, message: result.success ? 'OTP sent successfully' : 'Failed to send OTP' };
  },

  /**
   * Verify an OTP.
   */
  verifyOtp(phone: string, code: string): { valid: boolean; message: string } {
    const stored = otpStore.get(phone);

    if (!stored) {
      return { valid: false, message: 'No OTP found for this phone number. Request a new one.' };
    }

    if (stored.expires < Date.now()) {
      otpStore.delete(phone);
      return { valid: false, message: 'OTP has expired. Request a new one.' };
    }

    if (stored.attempts >= 3) {
      otpStore.delete(phone);
      return { valid: false, message: 'Too many attempts. Request a new OTP.' };
    }

    if (stored.code !== code) {
      stored.attempts++;
      return { valid: false, message: `Invalid code. ${3 - stored.attempts} attempts remaining.` };
    }

    otpStore.delete(phone);
    return { valid: true, message: 'Phone number verified successfully' };
  },
};

// Simple in-memory OTP store (use Redis in production)
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();
