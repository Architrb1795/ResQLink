import { z } from 'zod';

// ─── Incident Validation Schemas ──────────────────────────────
// Zod schemas for request body validation in incident routes.
// ──────────────────────────────────────────────────────────────

export const createIncidentSchema = z.object({
  type: z.enum(['FLOOD', 'FIRE', 'MEDICAL', 'SUPPLY', 'INFRASTRUCTURE']),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  locationName: z.string().min(1, 'Location name is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
});

export const updateStatusSchema = z.object({
  status: z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED']),
});

export const listIncidentsSchema = z.object({
  type: z.enum(['FLOOD', 'FIRE', 'MEDICAL', 'SUPPLY', 'INFRASTRUCTURE']).optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListIncidentsQuery = z.infer<typeof listIncidentsSchema>;
