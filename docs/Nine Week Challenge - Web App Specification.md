# Nine Week Challenge - Web App Specification

## Project Overview

Build a web-based progress tracking application called "Nine Week Challenge" for a 9-week wellness program. The app will allow users to track body measurements, daily habits, meals, and progress over time with a beautiful, responsive interface that works on both mobile and desktop devices.

## App Branding
- **App Name**: Nine Week Challenge
- **Logo**: Modern, minimalist design incorporating the number "9" (located in docs folder the nwc-icon.png)
- **Tagline**: "Transform Your Habits in 9 Weeks"
- **Brand Voice**: Encouraging, supportive, and empowering

## 🚀 Easy Deployment Strategy

### What YOU Need to Do (5 minutes):
1. Create a Supabase account (free)
2. Click "Deploy to Vercel" button
3. Connect GitHub and add 2 environment variables
4. Done! Your app is live

### What the AI Coder Will Provide:
- A complete GitHub repository scaffolded with `create-next-app@latest`
- Modern tech stack (TypeScript, Tailwind CSS v4, shadcn/ui)
- One-click deploy button in README
- All code ready to run
- Database migrations that auto-apply
- Clear instructions with screenshots

### What Happens Automatically:
- Database tables are created
- Authentication is configured
- Mobile responsive design works
- HTTPS/SSL is set up
- Updates deploy when you push to GitHub

### What You DON'T Need:
- ❌ No backend server setup
- ❌ No complex configuration
- ❌ No DevOps knowledge
- ❌ No command line usage (except for AI coder)
- ❌ No local development environment

### Keep It Simple!
The AI coder should resist the urge to overcomplicate. If a feature makes deployment harder, it should be saved for Phase 2. The goal is a working app in 5 minutes, not a perfect app that takes hours to deploy.

## Important Development Note

**For Production (Vercel Deployment):**
- The app uses Next.js with Supabase client library
- No MCP servers needed in production
- Everything runs directly on Vercel + Supabase cloud

**For Local Development Only (Optional):**
- Supabase MCP server can be used for database development
- Puppeteer MCP server can be used for automated testing
- These are development tools only - not part of the deployed app

## Core Requirements

### Technical Stack (Simplified for Easy Vercel Deployment)
- **Framework**: Next.js 14+ (App Router) - Vercel's native framework
- **Language**: TypeScript (now default and essential in 2025)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (modern component library)
- **Database & Backend**: Supabase (handles everything - no custom backend needed)
  - Database (PostgreSQL)
  - Authentication (built-in)
  - Real-time subscriptions
  - Row Level Security for data protection
  - Auto-generated APIs
- **Forms**: React Hook Form + Zod (for validation)
- **State Management**: Zustand (lightweight and simple)
- **Deployment**: Vercel (one-click deploy)
- **Development Tools** (optional, for local development only):
  - Supabase MCP server for database development
  - Puppeteer MCP server for testing

### Key Features

1. **User Authentication**
   - Simple email/password registration and login
   - Persistent sessions using JWT tokens
   - Password reset functionality

2. **User Profile**
   - Name, birthdate, age (auto-calculated), height, location
   - Profile photo upload (optional)
   - Starting date for the Nine Week Challenge

3. **Body Measurements Tracking**
   - Track 6 measurements: Hip, Waist, Chest, Chest 2 (under breast), Thigh, Bicep
   - Input fields for weeks 1, 3, 5, 7, and 9
   - Ability to record 3 measurements and calculate average
   - Visual progress charts showing trends over time
   - Reminder system for measurement days

4. **Daily Habit Tracking**
   - Three distinct phases:
     - Weeks 1-3: Basic habit building
     - Weeks 4-6: Hunger awareness focus
     - Weeks 7-9: Satisfaction and mindful eating
   - Track for each meal (up to 3 meals + 1 snack daily):
     - Hours of sleep
     - Ounces of water
     - Number of steps
     - Meal timing
     - Hunger level (1-10 scale)
     - Fullness level (1-10 scale)
     - Meal duration (minutes)
     - Distraction level (Y/N)
   - Daily wins section
   - Treat tracking with categories

5. **Fullness Scale Reference**
   - Always visible reference showing 1-10 scale definitions
   - From "Starving/feel dizzy" to "So full, almost like a sick feeling"

6. **Progress Visualization**
   - Dashboard with charts showing:
     - Body measurement trends
     - Average daily water intake
     - Sleep patterns
     - Step count trends
     - Hunger/fullness patterns
     - Treat frequency
   - Weekly summary reports
   - Exportable progress reports (PDF)

### UI/UX Design Requirements

1. **Color Scheme** (defined in `tailwind.config.ts`):
   ```typescript
   // Brand colors inspired by the original design
   colors: {
     brand: {
       pink: '#E5B5D3',        // Primary accent
       'pink-light': '#F7D5E7', // Hover states
       mint: '#B8E5D5',        // Success states
       blue: '#C5D5F7',        // Info states
       yellow: '#F7E5B5',      // Warning/treats
     }
   }
   ```
   - Use shadcn/ui's default gray scale for neutrals
   - Light mode by default with optional dark mode support
   - Consistent use of brand colors for interactive elements

2. **Typography**
   - Use Next.js font optimization with Geist font family
   - Clear hierarchy: text-xs to text-5xl
   - Consistent font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

3. **Layout Principles**
   - Mobile-first responsive design (min-width: 320px)
   - Max content width: 1280px with responsive padding
   - Consistent spacing using Tailwind's spacing scale
   - Card-based UI with subtle shadows and borders

4. **Component Design**
   - Use shadcn/ui components as base
   - Consistent border radius (rounded-md as default)
   - Smooth transitions (transition-all duration-200)
   - Focus states for accessibility
   - Loading states with skeletons or spinners

5. **Interactive Elements**
   - Hover effects on all clickable elements
   - Active states for better feedback
   - Smooth animations using CSS transitions
   - Touch-friendly targets (min 44x44px)
   - Clear disabled states

### Database Schema

Create a migration file `supabase/migrations/001_initial_schema.sql` that runs automatically on deploy:

```sql
-- This file will be run automatically by Supabase when you connect your project
-- No manual setup needed!

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  birthdate DATE,
  height_inches INTEGER,
  location VARCHAR(255),
  profile_photo_url TEXT,
  program_start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Body measurements table
CREATE TABLE measurements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  week_number INTEGER NOT NULL,
  hip DECIMAL(5,2),
  waist DECIMAL(5,2),
  chest DECIMAL(5,2),
  chest_2 DECIMAL(5,2),
  thigh DECIMAL(5,2),
  bicep DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily tracking table
CREATE TABLE daily_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  hours_sleep DECIMAL(3,1),
  ounces_water INTEGER,
  steps INTEGER,
  daily_win TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Meals table
CREATE TABLE meals (
  id UUID PRIMARY KEY,
  daily_tracking_id UUID REFERENCES daily_tracking(id),
  meal_type VARCHAR(20) NOT NULL, -- 'meal1', 'meal2', 'meal3', 'snack'
  meal_time TIME,
  hunger_before INTEGER CHECK (hunger_before >= 1 AND hunger_before <= 10),
  fullness_after INTEGER CHECK (fullness_after >= 1 AND fullness_after <= 10),
  duration_minutes INTEGER,
  distracted BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Treats table
CREATE TABLE treats (
  id UUID PRIMARY KEY,
  daily_tracking_id UUID REFERENCES daily_tracking(id),
  treat_type VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE treats ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own measurements" ON measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own measurements" ON measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own measurements" ON measurements FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tracking" ON daily_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tracking" ON daily_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracking" ON daily_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for meals and treats tables
CREATE POLICY "Users can manage own meals" ON meals FOR ALL USING (
  auth.uid() = (SELECT user_id FROM daily_tracking WHERE id = meals.daily_tracking_id)
);

CREATE POLICY "Users can manage own treats" ON treats FOR ALL USING (
  auth.uid() = (SELECT user_id FROM daily_tracking WHERE id = treats.daily_tracking_id)
);
```

### Supabase MCP Server Implementation

When implementing the database and backend functionality locally, developers can use the Supabase MCP server for:
- Database operations and migrations
- Authentication testing
- File storage development
- Real-time feature development

### Puppeteer MCP Server (For Automated Testing Only)

The Puppeteer MCP server should be used for automated testing and debugging of the Nine Week Challenge app:

1. **Available Tools**
   - `puppeteer_navigate`: Navigate to app pages
   - `puppeteer_screenshot`: Capture UI states for visual regression testing
   - `puppeteer_click`: Test interactive elements
   - `puppeteer_fill`: Test form inputs
   - `puppeteer_evaluate`: Execute JavaScript for testing app state

2. **Testing Scenarios**
   - **User Registration Flow**
     - Navigate to registration page
     - Fill in user details
     - Submit form
     - Verify successful registration
   
   - **Daily Tracking**
     - Navigate to daily tracking page
     - Fill in sleep, water, steps data
     - Test meal entry forms
     - Verify data persistence
   
   - **Measurement Entry**
     - Navigate to measurements page
     - Enter body measurements
     - Test averaging functionality
     - Screenshot progress charts
   
   - **Mobile Responsiveness**
     - Test at different viewport sizes (320px, 768px, 1024px)
     - Verify touch interactions
     - Test swipe gestures

3. **Debugging Workflow**
   ```javascript
   // Example debugging session for Nine Week Challenge
   // 1. Navigate to the app
   await puppeteer_navigate({ url: 'http://localhost:3000' });
   
   // 2. Take initial screenshot
   await puppeteer_screenshot({ name: 'homepage', width: 375, height: 667 });
   
   // 3. Test login
   await puppeteer_fill({ selector: '#email', value: 'test@example.com' });
   await puppeteer_fill({ selector: '#password', value: 'password123' });
   await puppeteer_click({ selector: '#login-button' });
   
   // 4. Verify dashboard loads
   await puppeteer_evaluate({ 
     script: 'document.querySelector(".dashboard-title").textContent' 
   });
   
   // 5. Test daily tracking form
   await puppeteer_navigate({ url: 'http://localhost:3000/daily-tracking' });
   await puppeteer_screenshot({ name: 'daily-tracking-form' });
   
   // 6. Test hunger/fullness sliders
   await puppeteer_evaluate({ 
     script: 'document.querySelector("#hunger-slider").value = 7' 
   });
   await puppeteer_evaluate({ 
     script: 'document.querySelector("#fullness-slider").value = 8' 
   });
   
   // 7. Test measurement entry
   await puppeteer_navigate({ url: 'http://localhost:3000/measurements' });
   await puppeteer_fill({ selector: '#waist-input', value: '32.5' });
   await puppeteer_fill({ selector: '#hip-input', value: '40.0' });
   
   // 8. Verify data persistence
   await puppeteer_navigate({ url: 'http://localhost:3000/progress' });
   await puppeteer_screenshot({ name: 'progress-charts', width: 1200, height: 800 });
   ```

4. **Configuration**
   - Use headless mode for CI/CD pipelines
   - Use headed mode for visual debugging
   - Configure viewport sizes for mobile testing

5. **Nine Week Challenge Specific Tests**
   - **Week Transition Testing**: Verify habit tracking changes between weeks 1-3, 4-6, and 7-9
   - **Measurement Days**: Test reminders and input validation on weeks 1, 3, 5, 7, 9
   - **Fullness Scale**: Verify tooltip/reference displays correctly
   - **Progress Visualization**: Capture screenshots of charts at different stages
   - **Data Export**: Test PDF generation and CSV export functionality
   - **Treat Tracking**: Test category selection and daily limits
   - **Mobile Swipe**: Test swipe navigation between daily tracking days

6. **Console Monitoring**
   - Monitor browser console for JavaScript errors during testing
   - Track API request failures
   - Debug state management issues
   - Identify performance bottlenecks
   - Access console logs via `console://logs` resource

**Note**: These MCP servers are development tools only. The deployed app on Vercel does not use or need them.

### TypeScript Requirements

Since TypeScript is now essential (not optional) in 2025, the AI coder must:

1. **Use Proper Types Throughout**
   ```typescript
   // Define all data types
   interface User {
     id: string
     email: string
     name: string
     program_start_date: Date
     // ... etc
   }
   
   interface DailyTracking {
     id: string
     user_id: string
     date: Date
     hours_sleep?: number
     ounces_water?: number
     steps?: number
     // ... etc
   }
   ```

2. **Zod Schemas for Validation**
   ```typescript
   import { z } from 'zod'
   
   export const dailyTrackingSchema = z.object({
     hours_sleep: z.number().min(0).max(24).optional(),
     ounces_water: z.number().min(0).optional(),
     steps: z.number().min(0).optional(),
     daily_win: z.string().max(500).optional(),
   })
   
   export type DailyTrackingInput = z.infer<typeof dailyTrackingSchema>
   ```

3. **Type-Safe Supabase Client**
   ```typescript
   // Generate types from Supabase schema
   export type Database = {
     public: {
       Tables: {
         users: {
           Row: User
           Insert: Omit<User, 'id' | 'created_at'>
           Update: Partial<Omit<User, 'id'>>
         }
         // ... other tables
       }
     }
   }
   ```

4. **No `any` Types** - Use `unknown` if type is truly unknown

### Modern Next.js Features to Implement

1. **App Router Best Practices**
   - Use Server Components by default
   - Client Components only for interactivity
   - Proper use of `loading.tsx` and `error.tsx`
   - Nested layouts for shared UI
   - Route groups for organization

2. **Performance Optimizations**
   - Image optimization with `next/image`
   - Font optimization with `next/font`
   - Dynamic imports for heavy components
   - Proper use of Suspense boundaries
   - Static generation where possible

3. **Data Fetching Patterns**
   ```typescript
   // Server Component data fetching
   async function DashboardPage() {
     const supabase = createServerComponentClient({ cookies })
     const { data: user } = await supabase.auth.getUser()
     
     const { data: trackingData } = await supabase
       .from('daily_tracking')
       .select('*')
       .eq('user_id', user.id)
       .order('date', { ascending: false })
       .limit(7)
     
     return <DashboardClient initialData={trackingData} />
   }
   ```

4. **Middleware for Auth**
   ```typescript
   // src/middleware.ts
   import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'
   
   export async function middleware(req: NextRequest) {
     const res = NextResponse.next()
     const supabase = createMiddlewareClient({ req, res })
     await supabase.auth.getSession()
     return res
   }
   
   export const config = {
     matcher: ['/dashboard/:path*', '/tracking/:path*', '/measurements/:path*']
   }
   ```

### API Implementation 

No complex backend needed! The app uses:
- **Supabase Auth**: Handles all login/signup with built-in UI components
- **Supabase Database**: Stores all user data with Row Level Security
- **Supabase Storage**: Stores profile photos
- **Next.js App Router**: Modern file-based routing

Example API usage with App Router:
```typescript
// src/app/api/user/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return NextResponse.json(data)
}
```

Everything is connected automatically through the environment variables.

### Key UI Components (Using shadcn/ui)

1. **Dashboard Layout**
   - Welcome message with "Nine Week Challenge" branding
   - Current week indicator with progress ring
   - Quick stats cards (streak, % complete, next measurement day)
   - Today's tracking summary with completion indicators
   - Quick action buttons using shadcn/ui Button component

2. **Daily Tracking Form**
   - Multi-step form using shadcn/ui Tabs
   - Slider inputs for hunger/fullness (custom component)
   - Time picker for meal times
   - Number inputs with increment/decrement buttons
   - Auto-save with debouncing
   - Toast notifications for save status

3. **Measurements Form**
   - Visual body diagram showing measurement points
   - Input fields with shadcn/ui Input component
   - Inline validation messages
   - Progress comparison cards
   - Photo upload with preview

4. **Progress Visualization**
   - Recharts for line/bar charts
   - Custom progress cards
   - Responsive grid layout
   - Export button with dropdown menu

5. **Component Styling**
   ```tsx
   // Example component using shadcn/ui + custom styling
   import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
   import { Button } from '@/components/ui/button'
   
   export function WeekProgressCard({ week, isActive }: Props) {
     return (
       <Card className={cn(
         "transition-all hover:shadow-lg",
         isActive && "border-brand-pink shadow-brand-pink/20"
       )}>
         <CardHeader>
           <CardTitle>Week {week}</CardTitle>
         </CardHeader>
         <CardContent>
           {/* Progress content */}
         </CardContent>
       </Card>
     )
   }
   ```

### Additional Features

1. **Notifications**
   - Daily reminders for tracking
   - Measurement day reminders
   - Motivational messages
   - Progress milestones

2. **Offline Capability**
   - Cache recent data locally
   - Queue updates when offline
   - Sync when connection restored

3. **Data Export**
   - CSV export for all data
   - PDF progress reports
   - Backup/restore functionality

### Security Considerations

1. **Authentication**
   - Secure password requirements
   - Rate limiting on login attempts
   - Secure session management
   - HTTPS only

2. **Data Privacy**
   - Encrypted sensitive data
   - GDPR compliant
   - User data deletion option
   - No sharing of personal data

### Performance Requirements

1. **Load Times**
   - Initial load under 3 seconds
   - Subsequent navigation under 1 second
   - Smooth scrolling and animations

2. **Mobile Optimization**
   - Works on devices as small as 320px wide
   - Touch-optimized interface
   - Reduced data usage on mobile

### Development Workflow for AI Coder

1. **Scaffold the Project**:
   ```bash
   npx create-next-app@latest nine-week-challenge --typescript --tailwind --eslint --app --src-dir --turbopack
   cd nine-week-challenge
   ```

2. **Install Core Dependencies**:
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @hookform/resolvers react-hook-form zod zustand lucide-react
   ```

3. **Initialize shadcn/ui**:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card form input label select tabs toast
   ```

4. **Set Up Supabase**:
   - Create the migration file in `supabase/migrations/`
   - Set up the Supabase client in `src/lib/`
   - Configure authentication helpers

5. **Build Core Features**:
   - Authentication flow with Supabase Auth UI
   - Dashboard with week progress indicator
   - Daily tracking forms with Zod validation
   - Measurement tracking pages
   - Progress visualization with charts

6. **Optimize for Deployment**:
   - Ensure all env vars are properly typed
   - Add proper error boundaries
   - Include loading states
   - Test on mobile viewports

7. **Prepare for Vercel**:
   - Create comprehensive README with deploy button
   - Add `.env.local.example` with clear instructions
   - Test the deployment process
   - Include troubleshooting guide

### Development Phases

1. **Phase 1 (MVP - Deploy This First!)**
   - Next.js app with Supabase auth
   - Basic daily tracking
   - Simple measurements input
   - Mobile responsive design
   - **One-click Vercel deployment**

2. **Phase 2 (Can be added after deployment)**
   - Progress visualizations
   - Data export
   - Offline capability
   - Enhanced UI animations

3. **Phase 3 (Future enhancements)**
   - Social features (optional)
   - Advanced analytics
   - Integration with fitness trackers
   - AI-powered insights

### Testing Requirements

1. **Unit Tests**
   - All API endpoints
   - Data validation functions
   - Calculation functions

2. **Integration Tests**
   - User workflows
   - Data persistence
   - Authentication flow

3. **UI Tests (using Puppeteer MCP Server)**
   - Form submissions
   - Navigation
   - Responsive behavior
   - Visual regression testing
   - Cross-browser compatibility
   
4. **Automated Test Scenarios**
   - Complete user journey from registration to week 9
   - Daily tracking workflow
   - Measurement entry and progress viewing
   - Data export functionality
   - Offline/online synchronization

### Simple Vercel Deployment Instructions

## Quick Start (5 Minutes to Deploy!)

### Step 1: Set up Supabase (2 minutes)
1. Go to [supabase.com](https://supabase.com) and sign up (it's free)
2. Click "New Project" 
3. Name it "nine-week-challenge" (or anything you want)
4. Choose a password and region
5. Wait ~1 minute for project to create
6. Go to Settings → API
7. Copy these two values:
   - Project URL (looks like: `https://abcdefgh.supabase.co`)
   - Anon Key (a long string starting with `eyJ...`)

### Step 2: Deploy to Vercel (3 minutes)
1. The AI coder will give you a GitHub link
2. Click the "Deploy with Vercel" button in the README
3. Sign in to Vercel with GitHub (create free account if needed)
4. When asked for environment variables, paste:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL from step 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Anon Key from step 1
5. Click "Deploy"
6. Wait ~90 seconds for deployment

### Step 3: You're Done!
- Your app is live at `your-project-name.vercel.app`
- Share it with friends or use it yourself
- It works on phones and computers
- Updates automatically when the code is improved

## What Happens Automatically:
- ✅ Database tables are created via Supabase migrations
- ✅ Authentication is set up and ready
- ✅ The app is fully responsive on mobile and desktop
- ✅ SSL/HTTPS is configured
- ✅ Your app updates automatically when you push to GitHub

## Essential Files for One-Click Deploy

The AI coder must create these files for easy deployment:

### 1. `package.json`
```json
{
  "name": "nine-week-challenge",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.43.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@hookform/resolvers": "^3.3.4",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "zustand": "^4.5.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.378.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.0"
  }
}
```

### 2. `.env.local.example`
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For enhanced features
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. `README.md`
Must include:
- Deploy to Vercel button: 
  ```markdown
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/nine-week-challenge&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Required%20Supabase%20credentials&envLink=https://supabase.com/docs/guides/getting-started&project-name=nine-week-challenge&repository-name=nine-week-challenge)
  ```
- Step-by-step setup with screenshots
- Where to find Supabase keys (with images)
- Common troubleshooting tips

### 4. `supabase/migrations/001_initial_schema.sql`
Complete database schema that auto-runs on Supabase (as specified earlier)

### 5. `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 6. `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```

### 7. `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nine Week Challenge brand colors
        brand: {
          pink: '#E5B5D3',
          'pink-light': '#F7D5E7',
          mint: '#B8E5D5',
          blue: '#C5D5F7',
          yellow: '#F7E5B5',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}

export default config
```
```
nine-week-challenge/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with Supabase provider
│   ├── page.tsx           # Landing page
│   ├── login/page.tsx     # Login page
│   ├── dashboard/page.tsx # Main dashboard
│   ├── tracking/page.tsx  # Daily tracking
│   └── measurements/page.tsx # Body measurements
├── components/            # Reusable components
├── lib/                   # Utilities
│   └── supabase.ts       # Supabase client
├── supabase/             # Database setup
│   └── migrations/       # Auto-run on deploy
├── .env.local            # Local environment variables
├── package.json          # Dependencies
└── README.md             # Setup instructions
```

### Success Metrics

1. **User Engagement**
   - Daily active users
   - Completion rate of Nine Week Challenge
   - Average tracking consistency

2. **Performance**
   - Page load times
   - Error rates
   - User retention

3. **Deployment Success**
   - One-click deployment works
   - Zero configuration needed
   - Updates deploy automatically

## Final Note for AI Coder

**Priority Order**:
1. **Use proper scaffolding** - Start with `create-next-app@latest` with ALL recommended options
2. **Make deployment dead simple** - One-click deploy must work
3. **Use modern tech stack** - Next.js 14+, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase
4. **Follow 2025 best practices** - App Router, Server Components, proper folder structure
5. **Create beautiful UI** - Use shadcn/ui components and the brand color palette
6. **Include clear instructions** - With screenshots of Supabase setup
7. **Test the deploy process** - Make sure it actually works on Vercel

Create a Next.js app that:
1. **Starts with proper scaffolding** using `create-next-app@latest`
2. **Deploys to Vercel in one click** (most important!)
3. Uses Supabase for everything backend-related
4. Includes shadcn/ui for beautiful, accessible components
5. Has all database migrations in `supabase/migrations/`
6. Uses TypeScript throughout (no JavaScript files)
7. Follows the modern `src/` directory structure
8. Includes comprehensive README with deploy button
9. Requires zero setup from the user beyond clicking "Deploy"

The goal is for a non-technical user to have their Nine Week Challenge app live in under 5 minutes!

**Remember**: Keep it simple. If a feature makes deployment harder, save it for Phase 2.