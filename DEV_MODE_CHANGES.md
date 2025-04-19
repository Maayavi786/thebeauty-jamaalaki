# DEV_MODE_CHANGES.md

This file tracks all temporary changes made for development or debugging purposes, so they can be easily reverted before production deployment.

---

## 2025-04-19: Salon Page Dark Mode & UI Consistency

**Files Affected:**
- `client/src/pages/Salons.tsx`
- (Potentially others as development continues)

**Dev-Only Changes:**
- Updated Salons page to use a fully dark patterned background in dark mode, matching the Home page for visual consistency.
- Set the container background to transparent to allow the dark root background to show through.

**How to Revert for Production:**
- Restore the previous background and container styles in `Salons.tsx` if you want to return to the original production appearance.
- Review this file before each production deployment and revert or adjust any dev-specific changes as needed.

---

## 2025-04-19: Dev Mode Backend Fix

**Files Affected:**
- `server/index.ts`

**Dev-Only Changes:**
- Commented out the import and usage of `setupVite`, `serveStatic`, and `log` from `vite.mjs` in `server/index.ts` because `vite.mjs` does not exist in dev mode.
- Replaced `log` with `console.log` for server start message.
- These changes are for development only. Restore the original import and usages before production if needed.

---

**Tip:**
- Add a new entry here for any future development/debugging changes that should not go to production.
- This helps ensure a clean, production-ready codebase when deploying.

---

_Last updated: 2025-04-19_
