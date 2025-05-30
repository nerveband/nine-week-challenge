# Nine Week Challenge 🎯

Transform your habits in 9 weeks with this comprehensive wellness tracking app. Track body measurements, daily habits, meals, and visualize your progress.

## 🚀 Deploy to Vercel in 5 Minutes!

### Step 1: Set up Supabase (3 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Enter these details:
   - **Project name**: `nine-week-challenge` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest to you
4. Click "Create new project" and wait ~1 minute
5. Once ready, go to **Settings → API** in the left sidebar
6. Copy these two values (you'll need them in Step 2):
   - **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
   - **anon public key**: `eyJhbGc...` (a long string)

**Important**: After deployment, configure authentication:
1. Go to your Supabase project → Authentication → URL Configuration
2. Add your domain to "Site URL": `https://your-domain.com`
3. Add to "Redirect URLs": `https://your-domain.com/**`

### Step 2: Deploy to Vercel (2 minutes)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nerveband/nine-week-challenge&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Required%20Supabase%20credentials&envLink=https://github.com/nerveband/nine-week-challenge/blob/main/.env.local.example&project-name=nine-week-challenge&repository-name=nine-week-challenge)

1. Click the "Deploy with Vercel" button above
2. Sign in with GitHub (create account if needed)
3. When prompted for environment variables, paste:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Project URL from Step 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key from Step 1
4. Click "Deploy"
5. Wait ~90 seconds for deployment

### Step 3: You're Done! 🎉

- Your app is live at `https://your-project-name.vercel.app`
- Share it with friends or use it yourself
- Works perfectly on phones and computers
- Updates automatically when you push changes

## 📱 Features

- **User Authentication**: Secure email/password login
- **Body Measurements**: Track 6 key measurements every 2 weeks
- **Daily Habits**: Log sleep, water, steps, and meals
- **Smart Phases**: 
  - Weeks 1-3: Basic habit building
  - Weeks 4-6: Hunger awareness
  - Weeks 7-9: Mindful eating
- **Progress Charts**: Beautiful visualizations of your journey
- **Mobile Responsive**: Works great on all devices

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Deployment**: Vercel

## 💻 Local Development

### Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account (free)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/nerveband/nine-week-challenge.git
cd nine-week-challenge
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Setup

The database migrations run automatically when you connect Supabase. No manual setup needed!

Tables created:
- `profiles` - User profiles
- `measurements` - Body measurements
- `daily_tracking` - Daily habit data
- `meals` - Meal tracking
- `treats` - Treat tracking

All tables have Row Level Security (RLS) enabled for data privacy.

## 🎨 Customization

### Brand Colors

Edit `tailwind.config.ts` to change the color scheme:

```javascript
brand: {
  primary: '#FF4500',        // Vibrant orange-red from kettlebell icon
  'primary-light': '#FF6B35', // Lighter coral tone
  secondary: '#FF8C42',       // Warm orange from highlights
  success: '#10B981',         // High contrast green
  info: '#3B82F6',           // Bright blue
  warning: '#F59E0B',        // Bold amber
}
```

### Logo

Replace `/docs/nwc-icon.png` with your own logo.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙋‍♀️ Support

Having issues? Check out:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Create an issue](https://github.com/nerveband/nine-week-challenge/issues)

---

Built with ❤️ for the Nine Week Challenge community