![Nine Week Challenge](src/assets/banner.png)

# Nine Week Challenge

Get Fit Without the Calorie Tracking. Make it Sustainable!

**MINDFUL EATING | HABIT FORMATION | PROGRESS TRACKING**

A comprehensive tracking application for a 9-week health and wellness journey, built with React and TypeScript.

By [Ashraf Ali](https://ashrafali.net)

## Daily Tracking Interface

![Daily Tracking Interface](/nine-week-challenge-screenshot.png)

## Features

- 📊 Daily tracking of meals, habits, and stats
- 📅 Calendar view for progress visualization
- 📈 Weekly measurements and progress tracking
- 📱 Mobile-friendly responsive design
- 📤 Data export functionality
- 🎯 Goal setting and progress monitoring

## Tech Stack

- React
- TypeScript
- Vite
- shadcn/ui
- Tailwind CSS
- Lucide Icons
- Recharts

## Getting Started

### Prerequisites

- Node.js v18+
- npm/yarn/pnpm
- PocketBase server

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nine-week-challenge.git
cd nine-week-challenge
```

2. Install dependencies:
```bash
npm install
```

3. Set up PocketBase:
   - Download PocketBase from https://pocketbase.io/docs/
   - Extract and run the PocketBase server:
     ```bash
     ./pocketbase serve
     ```
   - Create an admin account at http://127.0.0.1:8090/_/
   - Import the schema:
     ```bash
     ./pocketbase import pb_schema.json
     ```

4. Create a `.env` file:
```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

5. Start the development server:
```bash
npm run dev
```

### Migration from IndexedDB

If you're migrating from the IndexedDB version:

1. Set up environment variables:
```bash
export POCKETBASE_EMAIL=your@email.com
export POCKETBASE_PASSWORD=your_password
```

2. Run the migration:
```bash
npm run migrate-to-pocketbase
```

## Project Structure

```
src/
├── components/     # UI components
├── pages/         # Page components
├── services/      # Business logic and services
├── types/         # TypeScript types
├── utils/         # Utility functions
└── constants/     # Constants and configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.