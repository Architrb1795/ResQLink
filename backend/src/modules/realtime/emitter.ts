import { EventEmitter } from 'events';

// ─── Typed Event Emitter ──────────────────────────────────────
// Cross-module event bus. Modules call eventEmitter.emit() to
// broadcast domain events. The Socket.IO module listens to these
// events and fans them out to connected clients.
//
// This decouples domain logic from transport (WebSocket) logic.
// ──────────────────────────────────────────────────────────────

export interface ResQLinkEvents {
  'incident.created': unknown;
  'incident.updated': unknown;
  'assignment.created': unknown;
  'unit.updated': unknown;
  'resource.updated': unknown;
  'broadcast.sent': unknown;
  'ai.processed': unknown;
}

class TypedEventEmitter extends EventEmitter {
  emit(event: keyof ResQLinkEvents, data: unknown): boolean {
    return super.emit(event, data);
  }

  on(event: keyof ResQLinkEvents, listener: (data: unknown) => void): this {
    return super.on(event, listener);
  }
}

export const eventEmitter = new TypedEventEmitter();
