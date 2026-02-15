import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../services/db';
import { auditService } from '../audit/audit.service';

// ─── Upload Service ───────────────────────────────────────────
// Handles media upload metadata. Uses a pre-signed URL pattern:
// 1. Client requests a pre-signed URL → backend generates one
// 2. Client uploads directly to object storage
// 3. Client confirms upload → backend stores metadata
//
// NOTE: The pre-signed URL generation is a stub until a storage
// provider (S3, Cloudflare R2, etc.) is configured.
// ──────────────────────────────────────────────────────────────

export const uploadService = {
  /**
   * Generate a pre-signed upload URL.
   * Currently returns a stub URL — plug in S3/R2 SDK here.
   */
  async generatePresignedUrl(
    incidentId: string,
    mimeType: string,
    sizeBytes: number
  ) {
    // Validate incident exists
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) {
      throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    }

    // Validate file constraints
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (sizeBytes > MAX_SIZE) {
      throw Object.assign(new Error('File too large. Maximum 50MB'), { statusCode: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(mimeType)) {
      throw Object.assign(
        new Error(`Unsupported file type. Allowed: ${allowedTypes.join(', ')}`),
        { statusCode: 400 }
      );
    }

    const fileKey = `incidents/${incidentId}/${uuidv4()}.${mimeType.split('/')[1]}`;

    // TODO: Replace with actual pre-signed URL generation
    // const url = await s3.getSignedUrl('putObject', { Bucket, Key: fileKey, ContentType: mimeType });
    const uploadUrl = `https://storage.resqlink.app/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      expiresIn: 3600, // 1 hour
    };
  },

  /**
   * Confirm an upload is complete and store metadata.
   */
  async confirmUpload(
    incidentId: string,
    uploaderId: string,
    url: string,
    mimeType: string,
    sizeBytes: number
  ) {
    const media = await prisma.mediaUpload.create({
      data: {
        incidentId,
        uploaderId,
        url,
        mimeType,
        sizeBytes,
      },
    });

    auditService.writeLog(uploaderId, 'MEDIA_UPLOADED', 'MediaUpload', media.id, {
      incidentId,
      mimeType,
      sizeBytes,
    });

    return media;
  },

  /**
   * List all media for a given incident.
   */
  async listByIncident(incidentId: string) {
    return prisma.mediaUpload.findMany({
      where: { incidentId },
      include: {
        uploader: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
