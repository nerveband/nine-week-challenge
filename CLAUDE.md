# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Nine Week Challenge web application - a wellness tracking app for a 9-week program. The project uses modern web technologies and is designed for one-click deployment to Vercel with Supabase as the backend.

## Key Commands

### Initial Setup
```bash
# Scaffold the project with all modern features
npx create-next-app@latest nine-week-challenge --typescript --tailwind --eslint --app --src-dir --turbopack

# Install core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @hookform/resolvers react-hook-form zod zustand lucide-react recharts

# Initialize shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form input label select tabs toast slider checkbox radio-group sheet dialog alert-dialog
```

### Development
```bash
# Run development server with Turbopack
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Testing (when implemented)
```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# E2E tests with Puppeteer (via MCP server)
# Use Puppeteer MCP server for browser automation testing
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (mandatory, no JavaScript files)
- **Styling**: Tailwind CSS v4 with custom brand colors
- **UI Components**: shadcn/ui
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel (one-click deploy)

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth group (login, signup, reset)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── tracking/      # Daily tracking
│   │   ├── measurements/  # Body measurements
│   │   └── progress/      # Progress visualization
│   ├── api/               # API routes (minimal, mostly use Supabase)
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components (tracking, measurements)
│   ├── charts/            # Progress visualization components
│   └── layout/            # Layout components (nav, sidebar)
├── lib/
│   ├── supabase/          # Supabase client and helpers
│   ├── stores/            # Zustand stores
│   ├── utils/             # Utility functions
│   └── validations/       # Zod schemas
├── types/                 # TypeScript type definitions
└── styles/               # Global styles and Tailwind config
```

### Database Schema
The database uses Supabase with the following main tables:
- `users` - User profiles extending Supabase auth
- `measurements` - Body measurements (weeks 1, 3, 5, 7, 9)
- `daily_tracking` - Daily habit tracking
- `meals` - Meal tracking with hunger/fullness levels
- `treats` - Treat tracking

All tables have Row Level Security (RLS) enabled so users can only access their own data.

### Key Design Patterns

1. **Server Components by Default**
   - Use Server Components for data fetching
   - Client Components only for interactivity
   - Proper use of `use client` directive

2. **Type Safety**
   - All data types defined in `src/types/`
   - Zod schemas for runtime validation
   - No `any` types allowed

3. **Supabase Integration**
   - Server Components use `createServerComponentClient`
   - Client Components use `createClientComponentClient`
   - API routes use `createRouteHandlerClient`
   - Middleware uses `createMiddlewareClient`

4. **Form Handling**
   - React Hook Form for form state
   - Zod for validation
   - Server actions for form submission where possible

5. **State Management**
   - Zustand for global client state
   - Server state via Supabase
   - Optimistic updates for better UX

## Important Implementation Notes

### Brand Colors
```typescript
// Use these brand colors defined in tailwind.config.ts
brand: {
  pink: '#E5B5D3',        // Primary accent
  'pink-light': '#F7D5E7', // Hover states
  mint: '#B8E5D5',        // Success states
  blue: '#C5D5F7',        // Info states
  yellow: '#F7E5B5',      // Warning/treats
}
```

### Authentication Flow
- Use Supabase Auth UI components for login/signup
- Middleware protects dashboard routes
- Session management handled automatically

### Daily Tracking Phases
- Weeks 1-3: Basic habit building
- Weeks 4-6: Hunger awareness focus
- Weeks 7-9: Satisfaction and mindful eating

### Measurement Schedule
Body measurements are taken on weeks 1, 3, 5, 7, and 9 only.

### Mobile-First Design
- Minimum viewport: 320px
- Touch targets: minimum 44x44px
- Swipe gestures for daily navigation

## Deployment Requirements

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
```

### One-Click Deploy
The project must include:
1. Deploy to Vercel button in README
2. Automatic database migrations via `supabase/migrations/`
3. Clear setup instructions with screenshots
4. Zero configuration needed beyond environment variables

## Development Guidelines

1. **Keep It Simple**: If a feature complicates deployment, save it for Phase 2
2. **Mobile First**: Test all features on 320px viewport
3. **Type Everything**: No implicit any, proper types for all data
4. **Use Modern Patterns**: App Router, Server Components, streaming
5. **Follow Brand**: Use the defined color palette consistently
6. **Test Deployment**: Ensure one-click deploy actually works

## Common Tasks

### Adding a New Page
1. Create route in `src/app/(dashboard)/`
2. Use Server Component for data fetching
3. Add to navigation in layout component
4. Implement loading.tsx and error.tsx

### Adding a Form
1. Define Zod schema in `src/lib/validations/`
2. Create form component with React Hook Form
3. Use Server Action or API route for submission
4. Add optimistic updates with Zustand

### Adding a Chart
1. Use Recharts components
2. Fetch data in Server Component
3. Pass to Client Component for rendering
4. Ensure responsive sizing

### Working with Supabase
1. Always use typed client
2. Handle errors gracefully
3. Use RLS policies for security
4. Implement optimistic updates

## Testing with MCP Servers

### Supabase MCP Server (Local Development)
Use for database operations during development:
- Creating/modifying tables
- Testing queries
- Managing migrations

### Puppeteer MCP Server (Automated Testing)
Use for E2E testing:
- User registration flow
- Daily tracking workflow
- Measurement entry
- Progress visualization
- Mobile responsiveness

Note: MCP servers are development tools only - not needed for production deployment.


After every implementation, always push to git. This will trigger Vercel to deploy the latest version of the app.

## Recent Updates
- Redesigned interface with vibrant orange color scheme inspired by modern fitness apps
- Fixed TypeScript date arithmetic issues for production builds
- All database tables verified and properly configured