# Netlify Build Forever-Fix: Best Practices and Checklist

This project is now configured to ensure reliable, repeatable, and future-proof Netlify builds. If you follow these guidelines, you will avoid common build failures forever.

## 1. Dependency Versioning: Use Only Exact Versions for All Types
- All `@types/express`, `@types/express-serve-static-core`, and similar type packages **must** use exact versions (no `^` or `~`) in both `dependencies`, `devDependencies`, and `resolutions`.
- This prevents npm's "Invalid Version" errors during Netlify builds.

## 2. No Yarn-Only Features
- Netlify uses npm by default. Do not rely on Yarn-only features (like `resolutions` without `npm-force-resolutions`).
- Use `npm-force-resolutions` via a `preinstall` script if you need resolutions.

## 3. Monorepo/Workspace Compatibility
- Ensure all workspace `package.json` files (e.g., `client/`, `server/`, `shared/`) do not contain conflicting versions for shared dependencies.
- If a sub-package needs a different version, resolve it at the root and use peerDependencies if needed.

## 4. Build Command Consistency
- Your build command must install dependencies and build in the correct order.
- Example:
  ```bash
  cd client && npm install && VITE_API_BASE_URL=/api npm run build && cd ../netlify && npm install && npm run build
  ```

## 5. No Relative Ambient Module Declarations
- Do not use `declare module './something'` in `.d.ts` files.
- Only use module augmentation if you are extending an actual module.

## 6. No DevDependencies in Production
- Netlify sets `NODE_ENV=production`, so only `dependencies` are installed in production.
- If you need a package at build/runtime, put it in `dependencies`, not `devDependencies`.

## 7. TypeScript Configuration
- `tsconfig.json` should have the correct `include` and `exclude` fields.
- All files you want to build must be included.

## 8. Environment Variables
- All secrets and environment variables must be set in the Netlify UI, not in code.

## 9. Security and CORS
- Session cookies: `secure: true`, `sameSite: 'none'`, `httpOnly: true`, `maxAge` set.
- CORS: Only allow your production frontend domain, with `credentials: true`.

## 10. Automated Checks (Recommended)
- Add a GitHub Action to run `npm ci && npm run build` for all workspaces on every push, so you catch build errors before deploying to Netlify.

## 11. Common Build Failures and How to Fix
| Error Message | Cause | Forever Fix |
|---------------|-------|------------|
| `Invalid Version: ^x.y.z` | Caret version in types or resolutions | Use `"x.y.z"` everywhere |
| `No inputs were found in config file` | Wrong `include` in `tsconfig.json` | Add all entry files explicitly |
| `Ambient module declaration cannot specify relative module name` | `declare module './foo'` in .d.ts | Remove or use correct augmentation |
| `devDependencies not installed` | Needed in production | Move to `dependencies` |
| `Cannot find module` | Wrong file path or missing build step | Check `tsconfig.json` and build scripts |

## 12. What Was Fixed
- All type dependencies use exact versions.
- No more invalid ambient module declarations.
- `tsconfig.json` includes all necessary files.
- No conflicting or duplicated type versions.
- Build scripts and dependency install order are correct.

## 13. What To Do Next
- If you add or update dependencies, always use exact versions for types.
- If you add new workspaces, ensure their dependencies are compatible.
- If you see a new build error, read the error log and check if it’s covered above.
- If you ever get a new error, share the full log and I’ll provide a targeted fix.

---

**You are now set up for reliable, repeatable, and future-proof Netlify builds!**
If you hit any new error, just send me the log and I’ll handle it.
