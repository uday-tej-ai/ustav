# USTAV — Indian Invitation Card Platform

A full-stack online invitation card printing platform with a traditional Indian aesthetic. Customers browse event categories, select and customize invitation templates, and place orders. Admins manage categories, templates, and orders through a dedicated portal.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied to /api)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite, TailwindCSS v4, Wouter (routing), TanStack Query
- API: Express 5 + express-session (cookie-based auth)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — Source of truth for API contract
- `lib/api-zod/src/generated/` — Generated Zod schemas from OpenAPI
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/db/src/schema/index.ts` — Drizzle ORM schema (users, categories, templates, orders)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, categories, templates, orders, admin)
- `artifacts/ustav/src/pages/` — All frontend page components
- `artifacts/ustav/src/components/layout.tsx` — AppLayout + RequireAuth components
- `artifacts/ustav/src/index.css` — Theme (light + dark modes, Playfair Display + Lato fonts)

## Architecture decisions

- **Session-based auth** (not JWT): express-session with `SESSION_SECRET` env. userId stored in session, checked per request.
- **Password hashing**: SHA-256 of `password + "ustav_salt_2024"` — simple, no bcrypt dependency.
- **Role separation**: `users.role` enum (`customer` | `admin`). Login endpoint requires `role` field — same email can't be used for both roles.
- **No file upload for templates**: Admin uses image URL input. A `/api/templates/upload-image` multer endpoint exists for future use.
- **Customization stored as JSONB**: Order customization fields (hostName, eventDate, eventTime, venue, rsvpDetails, guestName, customMessage) stored as a JSONB blob on the orders table.

## Product

- **Landing page**: Brand hero, event category grid with design counts, featured invitation designs showcase, CTA section
- **Customer flow**: Register → Login → Dashboard (categories + featured) → Category browse → Template detail + customization form → Order placed → My orders with status
- **Admin flow**: Login → Dashboard (stats + recent orders) → Manage categories (CRUD) → Manage templates (CRUD) → All orders with inline status updates

## User preferences

- Traditional Indian aesthetic: deep maroon primary, warm gold accent, ivory/beige background, Playfair Display serif headings
- No emojis in UI (landing page category icons are an exception)
- Prices in Indian Rupees (₹)

## Seeded data

- Admin account: `admin@ustav.com` / `admin123`
- 6 categories: Wedding, Birthday, Housewarming, Baby Shower, Engagement, Festival Celebration
- 11 templates with Unsplash images

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml` before using new hooks
- The `and()` import from drizzle-orm is needed for multi-condition WHERE clauses — `&&` does not work
- `ListTemplatesQueryParams` uses `featured` (boolean) and `categoryId` (number) query params
- Session cookie `secure: false` for dev; set to `true` behind HTTPS in production

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
