// TypeScript module augmentation for express-session
declare module 'express-session' {
  import { Session, SessionData } from 'express-session';
  interface SessionData {
    user?: any;
    // Add any additional properties you store on session
  }
  interface Request {
    session: Session & Partial<SessionData>;
  }
}
