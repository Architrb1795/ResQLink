import { z } from 'zod';

// ─── Logistics Validation Schemas ─────────────────────────────
// Zod schemas for logistics API request validation.
// ──────────────────────────────────────────────────────────────

export const updateVolunteerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['AVAILABLE', 'DEPLOYED', 'OFFLINE']).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  currentTaskId: z.string().nullable().optional(),
});

export const assignVolunteerSchema = z.object({
  volunteerId: z.string().min(1, 'Volunteer ID is required'),
  incidentId: z.string().min(1, 'Incident ID is required'),
});

export const updateResourceSchema = z.object({
  type: z.string().min(1).max(100).optional(),
  quantity: z.number().int().min(0).optional(),
  unit: z.string().min(1).max(50).optional(),
  status: z.enum(['AVAILABLE', 'LIMITED', 'DEPLETED']).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;
export type AssignVolunteerInput = z.infer<typeof assignVolunteerSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
