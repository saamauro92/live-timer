export interface Room {
  id: string;
  name: string;
  description?: string;
  shareToken: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  timers?: Timer[];
}

export interface Timer {
  id: string;
  roomId: string;
  title: string;
  description?: string;
  startTimestamp: Date;
  endTimestamp: Date;
  duration: number; // milliseconds
  isActive: boolean;
  createdAt: Date;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  ownerId: string;
}

export interface CreateTimerData {
  roomId: string;
  title: string;
  description?: string;
  duration: number; // milliseconds
}

export interface TimerAction {
  timerId: string;
  action: 'start' | 'pause' | 'reset';
}

export interface SocketData {
  userId?: string;
  roomId?: string;
  isAdmin?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
    emailVerified: boolean;
  };
}

export interface JoinRoomData {
  shareToken: string;
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface JwtPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface RoomStats {
  connectedUsers: number;
  isActive: boolean;
}

export interface TimerUpdateEvent {
  timerId: string;
  title: string;
  isActive: boolean;
  endTimestamp: Date;
}

export interface RoomStateEvent {
  id: string;
  name: string;
  description?: string;
  shareToken: string;
  ownerId: string;
  timers: Timer[];
  isAdmin: boolean;
}
