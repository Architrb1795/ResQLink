import { Router, Request, Response } from 'express';
import { smsService } from '../../services/notifications/sms';
import { pushService } from '../../services/notifications/push';
import { authenticate, authorize } from '../../middleware/auth';

// ─── Notification Routes ─────────────────────────────────────
// OTP verification, push token registration, and broadcasts.
// ──────────────────────────────────────────────────────────────

const router = Router();

// ─── SMS Endpoints ────────────────────────────────────────────

/**
 * POST /api/notifications/sms/send-otp
 * Send OTP to a phone number for verification.
 */
router.post('/sms/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  const result = await smsService.sendOtp(phone);
  res.json({
    ...result,
    serviceStatus: smsService.isAvailable() ? 'live' : 'stubbed (no Twilio credentials)',
  });
});

/**
 * POST /api/notifications/sms/verify-otp
 * Verify an OTP code.
 */
router.post('/sms/verify-otp', async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    res.status(400).json({ error: 'Phone number and code are required' });
    return;
  }

  const result = smsService.verifyOtp(phone, code);
  res.status(result.valid ? 200 : 400).json(result);
});

/**
 * POST /api/notifications/sms/broadcast
 * Send emergency SMS broadcast (AGENCY/ADMIN only).
 */
router.post('/sms/broadcast', authenticate, authorize('AGENCY', 'ADMIN'), async (req: Request, res: Response) => {
  const { numbers, message } = req.body;
  if (!Array.isArray(numbers) || !message) {
    res.status(400).json({ error: '"numbers" (array) and "message" (string) are required' });
    return;
  }

  const results = await Promise.all(
    numbers.map((num: string) => smsService.sendSms(num, message))
  );

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  res.json({
    sent,
    failed,
    total: numbers.length,
    serviceStatus: smsService.isAvailable() ? 'live' : 'stubbed',
  });
});

// ─── Push Notification Endpoints ──────────────────────────────

/**
 * POST /api/notifications/push/register
 * Register a device token for push notifications.
 */
router.post('/push/register', authenticate, async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Device token is required' });
    return;
  }

  pushService.registerToken(req.user!.userId, token);
  res.json({
    message: 'Device registered for push notifications',
    serviceStatus: pushService.isAvailable() ? 'live' : 'stubbed (no FCM credentials)',
  });
});

/**
 * POST /api/notifications/push/test
 * Send a test push notification to yourself.
 */
router.post('/push/test', authenticate, async (req: Request, res: Response) => {
  const results = await pushService.sendToUser(
    req.user!.userId,
    '🚨 ResQLink Test',
    'Push notifications are working!',
    { type: 'test' }
  );

  res.json({
    results,
    serviceStatus: pushService.isAvailable() ? 'live' : 'stubbed',
  });
});

/**
 * GET /api/notifications/status
 * Check which notification services are available.
 */
router.get('/status', authenticate, async (_req: Request, res: Response) => {
  res.json({
    sms: {
      available: smsService.isAvailable(),
      provider: 'Twilio',
      note: smsService.isAvailable() ? 'Configured' : 'Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER',
    },
    push: {
      available: pushService.isAvailable(),
      provider: 'Firebase Cloud Messaging',
      note: pushService.isAvailable() ? 'Configured' : 'Set FCM_SERVICE_ACCOUNT_JSON',
    },
  });
});

export default router;
