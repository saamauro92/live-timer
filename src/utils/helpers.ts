import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => {
  return uuidv4();
};

export const generateShareToken = (): string => {
  return uuidv4();
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateRemainingTime = (endTimestamp: Date, isActive: boolean): number => {
  if (!isActive) return 0;
  
  const now = Date.now();
  const end = endTimestamp.getTime();
  return Math.max(0, end - now);
};

export const isTimerExpired = (endTimestamp: Date, isActive: boolean): boolean => {
  if (!isActive) return false;
  return endTimestamp.getTime() <= Date.now();
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateDuration = (duration: number): boolean => {
  return duration >= 1000 && duration <= 86400000; // 1 second to 24 hours
};

export const getClientIP = (req: any): string => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        throw lastError;
      }
      await delay(delayMs * attempt);
    }
  }
  
  throw lastError!;
};
