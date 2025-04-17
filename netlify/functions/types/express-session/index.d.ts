// TypeScript module augmentation for express-session
import 'express-session';
declare module 'express-session' {
  interface SessionData {
    user?: import('../server').User;
  }
}
