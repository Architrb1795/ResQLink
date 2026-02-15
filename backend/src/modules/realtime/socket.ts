import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { JwtPayload } from '../../middleware/auth';
import { eventEmitter, ResQLinkEvents } from './emitter';
import { auditService } from '../audit/audit.service';

// ─── Socket.IO Server ─────────────────────────────────────────
// Real-time engine for live updates. Authenticated via JWT
// handshake, auto-joins rooms by role. Bridges internal domain
// events to WebSocket broadcasts.
// ──────────────────────────────────────────────────────────────

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.NODE_ENV === 'production'
        ? ['https://resqlink.vercel.app']
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // ─── JWT Authentication Middleware ────────────────────────
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      (socket as Socket & { user: JwtPayload }).user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ─── Connection Handler ───────────────────────────────────
  io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user: JwtPayload }).user;

    // Auto-join role-based room
    socket.join(`role:${user.role}`);
    socket.join(`user:${user.userId}`);

    console.log(`🔌 Socket connected: ${user.userId} (${user.role})`);

    // ─── Client Events ──────────────────────────────────────

    // Subscribe to a specific incident's updates
    socket.on('incident:subscribe', (incidentId: string) => {
      socket.join(`incident:${incidentId}`);
    });

    // Unsubscribe from an incident
    socket.on('incident:unsubscribe', (incidentId: string) => {
      socket.leave(`incident:${incidentId}`);
    });

    // Volunteer location update
    socket.on('location:update', (data: { lat: number; lng: number }) => {
      if (user.role === 'VOLUNTEER') {
        io.to('role:AGENCY').to('role:ADMIN').emit('unit:moved', {
          userId: user.userId,
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Broadcast message (AGENCY/ADMIN only)
    socket.on('broadcast:send', (data: { channel: string; message: string; priority?: string }) => {
      if (user.role === 'AGENCY' || user.role === 'ADMIN') {
        const broadcast = {
          senderId: user.userId,
          senderRole: user.role,
          ...data,
          timestamp: new Date().toISOString(),
        };

        io.to(`role:${data.channel}`).emit('broadcast:received', broadcast);

        auditService.writeLog(user.userId, 'BROADCAST_SENT', 'Broadcast', 'system', {
          channel: data.channel,
          message: data.message,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.userId}`);
    });
  });

  // ─── Bridge Domain Events → Socket.IO ────────────────────
  const domainEvents: (keyof ResQLinkEvents)[] = [
    'incident.created',
    'incident.updated',
    'assignment.created',
    'unit.updated',
    'resource.updated',
    'broadcast.sent',
  ];

  for (const event of domainEvents) {
    eventEmitter.on(event, (data) => {
      // Broadcast to all connected clients by default
      // Fine-grained room targeting can be added per event type
      io.emit(event, data);
    });
  }

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}
