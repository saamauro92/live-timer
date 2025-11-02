export interface Room {
  id: string;
  name: string;
  description?: string;
  shareToken: string;
  ownerId: string;
  showTimerName?: boolean;
  createdAt: Date;
  updatedAt: Date;
  timers?: Timer[];
}

export interface Timer {
  id: string;
  roomId: string;
  title: string;
  description?: string;
  completionMessage?: string; // Message to display when timer reaches 0
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
  showTimerName?: boolean;
}

export interface CreateTimerData {
  roomId: string;
  title: string;
  description?: string;
  completionMessage?: string; // Message to display when timer reaches 0
  duration: number; // milliseconds
}

export interface TimerAction {
  timerId: string;
  action: 'start' | 'pause' | 'reset';
}

export interface UserConnectionInfo {
  socketId: string;
  userId?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  ip?: string;
  connectedAt: Date;
  lastSeen: Date;
  isOnline: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
    emailVerified: boolean;
  };
}

export interface SocketData {
  userId?: string;
  roomId?: string;
  isAdmin?: boolean;
  connectionInfo?: UserConnectionInfo;
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
  connections?: UserConnectionInfo[];
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

export interface UserJoinedEvent {
  roomId: string;
  connection: UserConnectionInfo;
  totalUsers: number;
}

export interface UserLeftEvent {
  roomId: string;
  socketId: string;
  totalUsers: number;
}

export interface UserCountUpdateEvent {
  roomId: string;
  count: number;
  connections: UserConnectionInfo[];
}

