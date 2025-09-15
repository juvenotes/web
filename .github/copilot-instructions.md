# Juvenotes Web Application Development Guide

Juvenotes is a medical education platform built with AdonisJS v6 backend and Vue.js frontend. Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Initial Setup and Dependencies
- **System Requirements**: Node.js 20.19.5, Yarn 1.22.22
- Bootstrap the repository:
  - `yarn install --frozen-lockfile` -- takes 90 seconds. NEVER CANCEL. Set timeout to 3+ minutes.
  - `cp .env.example .env`
  - `node ace generate:key`
  - **CRITICAL**: Update .env with proper values (see Environment Configuration section)

### Build and Compilation
- **Build for production**: 
  - `yarn build` -- takes 30 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Build succeeds and generates optimized assets in `build/` directory
- **Type checking**: `yarn typecheck` -- takes 5 seconds
- **Code formatting**: `yarn format` -- takes 8 seconds (may have Edge template formatting issues, this is expected)
- **Linting**: `yarn lint` -- may show style issues, some auto-fixable

### Environment Configuration
Copy `.env.example` to `.env` and ensure these critical values are set correctly:
```bash
NODE_ENV=development  # or test for testing commands
APP_KEY=<generated-key>
APP_URL=http://localhost:3333
APP_DOMAIN=localhost  # NOT a URL, just domain name
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=app
MEILISEARCH_HOST=127.0.0.1  # NOT a URL, just host
```

**IMPORTANT**: Environment validation is very strict. URLs must be proper format, hosts cannot include protocols.

### Database Operations
- **75 migrations** are present in `database/migrations/`
- Migration commands: `NODE_ENV=test node ace migration:run`
- **KNOWN ISSUE**: Database and server commands fail due to Prometheus metrics provider bug

### Development Server Issues
**CRITICAL LIMITATION**: Development server (`yarn dev`) and test suite (`yarn test`) cannot start due to Prometheus metrics provider throwing "Invalid metric name" errors. This is a known issue with the `@julr/adonisjs-prometheus` package.

**Workaround**: Use production build process for testing changes:
1. Make code changes
2. Run `yarn build` to verify compilation
3. Run `yarn typecheck` to verify TypeScript
4. Manual testing must be done after deployment

## Project Structure

### Backend (AdonisJS v6 + TypeScript)
- `app/`: Main application code
  - `controllers/`: HTTP request handlers organized by feature
  - `models/`: Lucid ORM models for database entities  
  - `services/`: Business logic services
  - `middleware/`: HTTP middleware
  - `validators/`: VineJS request validation
  - `actions/`: Domain-specific action handlers
  - `jobs/`: Queue job handlers
- `database/`: 75+ migrations, seeders, factories
- `config/`: Configuration files for all services
- `start/`: Application bootstrapping (routes, events, kernel)

### Frontend (Vue.js + Inertia.js)
- `inertia/`: Frontend application code
  - `pages/`: Vue page components for routes
  - `components/`: Reusable Vue components (including Radix Vue UI components)
  - `layouts/`: Layout components
  - `lib/`: Utility libraries
  - `css/`: Tailwind CSS styles
- `resources/views/`: Edge.js server-side templates (minimal, mostly for email templates)

### Key Technologies
- **Backend**: AdonisJS v6, PostgreSQL, Redis, Lucid ORM
- **Frontend**: Vue.js 3, Inertia.js, Vite, Tailwind CSS
- **UI Components**: Radix Vue, custom component library
- **Testing**: Japa (unit/functional), Playwright (browser)
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Validation Requirements

### Manual Testing
**ALWAYS** build and run basic validation when making changes:
1. Run `yarn build` to ensure no compilation errors
2. Run `yarn typecheck` to catch TypeScript issues
3. Check `yarn lint` for code style issues
4. **Manual validation must happen post-deployment** due to server start issues

### Code Quality Checks
**ALWAYS** run these before committing:
- `yarn format` -- auto-fixes most formatting issues (ignore Edge template warnings)
- `yarn lint` -- identifies code quality issues
- `yarn typecheck` -- ensures TypeScript correctness

## Common Issues and Limitations

### Known Bugs
1. **Prometheus Provider Bug**: Prevents dev server and tests from running
   - Error: "Invalid metric name" from `@julr/adonisjs-prometheus`
   - Affects: `yarn dev`, `yarn test`, database commands
   - **Impact**: No local development server available

2. **Edge Template Formatting**: Prettier cannot format some Edge.js templates
   - Files affected: `resources/views/emails/*.edge`, `inertia_layout.edge`
   - **Impact**: Formatting command shows errors but continues

3. **Environment Validation**: Extremely strict URL/host validation
   - APP_URL must be complete URL with protocol
   - APP_DOMAIN must be domain only (no protocol)
   - Host configs must not include ports or protocols

### Development Workflow Limitations
- **Cannot run development server locally** due to Prometheus bug
- **Cannot run tests locally** due to same Prometheus issue  
- **Must use production build workflow** for validation
- **Database operations limited** without running server

## External Dependencies
The application requires these external services:
- **PostgreSQL database** (configured in config/database.ts)
- **Redis server** (for sessions, caching, queues)
- **MeiliSearch** (for search functionality) 
- **Email service** (Mailgun, Brevo, or SMTP)
- **File storage** (R2/S3 compatible)
- **Third-party APIs**: Google OAuth, M-Pesa payments, PostHog analytics

## Testing Strategy
Due to server start limitations:
1. **Unit tests**: Focus on pure functions, utilities, and models
2. **Integration testing**: Must be done in staging/production environment
3. **Browser testing**: Playwright tests must run in deployed environment
4. **Manual testing**: Required for all UI changes

## File Locations Reference

### Frequently Modified Files
- Routes: `start/routes.ts`
- Database models: `app/models/`
- API controllers: `app/controllers/api/`
- Frontend pages: `inertia/pages/`
- UI components: `inertia/components/ui/`
- Environment config: `start/env.ts`
- Database config: `config/database.ts`

### Important Configuration
- AdonisJS config: `adonisrc.ts`
- Vite frontend config: `vite.config.ts`
- Tailwind CSS: `tailwind.config.js`
- TypeScript: `tsconfig.json`
- Package management: `package.json`

### Build Artifacts (DO NOT COMMIT)
- `build/` - Production build output
- `node_modules/` - Dependencies
- `.env` - Environment variables

## Development Best Practices
- Use trash command to delete files on the terminal when they are no longer needed
- Follow AdonisJS v6 with TypeScript best practices
- Use Yarn to manage packages
- Use the latest version of packages when installing
- Always run build validation before committing changes

Remember: This codebase has active development limitations due to the Prometheus provider issue. Focus on code quality checks and production build validation rather than local development server testing.
