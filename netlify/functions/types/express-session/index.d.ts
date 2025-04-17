// TypeScript module augmentation for express-session
declare module 'express-session' {
  interface SessionData {
    user?: any;
  }
}
