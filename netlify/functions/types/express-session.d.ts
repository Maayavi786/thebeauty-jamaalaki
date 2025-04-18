import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: any;
    // Add any additional properties you store on session
  }
}
