# Technical Context

## Technology Stack
1. Frontend Framework
- React with TypeScript
- Vite for build tooling
- React Router for navigation
- shadcn/ui for components

2. Backend Service
- PocketBase for data storage and authentication
- REST API endpoints
- Real-time subscriptions (available)
- File storage capabilities

3. UI Libraries
- Tailwind CSS for styling
- Lucide React for icons
- Radix UI for primitives
- Class Variance Authority

4. State Management
- React Context
- PocketBase SDK
- Local component state
- Local storage for offline capability

## Development Setup
1. Environment
- Node.js v18+
- npm/yarn/pnpm
- TypeScript
- VS Code (recommended)
- PocketBase server

2. Build Tools
- Vite
- PostCSS
- Autoprefixer
- TypeScript compiler

3. Development Tools
- ESLint for linting
- Prettier for formatting
- Chrome DevTools
- React DevTools
- PocketBase Admin UI

## Project Structure
1. Source Code
```
src/
  components/     # Reusable components
  database/       # PocketBase integration
    migration/    # Migration scripts
    models/       # Data models
    repositories/ # Data access layer
  pages/          # Page components
  services/       # Business logic
  types/          # TypeScript types
  utils/          # Utility functions
  lib/            # Library code
```

2. Documentation
```
docs/
  productContext.md   # Product context
  techContext.md      # Technical context
  systemPatterns.md   # System patterns
  activeContext.md    # Active context
  progress.md         # Progress tracking
  csvs/              # CSV data files
```

## Dependencies
1. Core Dependencies
- react
- react-dom
- react-router-dom
- typescript
- pocketbase
- tailwindcss
- @radix-ui/*
- lucide-react
- class-variance-authority
- clsx
- tailwind-merge

2. Development Dependencies
- @types/react
- @types/react-dom
- @typescript-eslint/*
- eslint
- prettier
- vite
- postcss
- autoprefixer

## Technical Constraints
1. Backend Requirements
- PocketBase server running on port 8090
- Admin access for initial setup
- Proper collection schema
- Data migration capability

2. Performance
- Fast initial load
- Responsive UI
- Efficient data handling
- Mobile optimization

3. Accessibility
- WCAG compliance
- Screen reader support
- Keyboard navigation
- Color contrast

4. Security
- PocketBase authentication
- Data validation
- Input sanitization
- Safe storage
- Error handling

## Development Workflow
1. Code Standards
- TypeScript strict mode
- ESLint rules
- Prettier formatting
- Component patterns
- Repository pattern for data access

2. Version Control
- Git
- Feature branches
- Pull requests
- Code review

3. Testing
- Unit tests (planned)
- Integration tests (planned)
- E2E tests (planned)
- Mobile testing (planned)

4. Deployment
- Build process
- Asset optimization
- Error tracking
- Performance monitoring
- PocketBase deployment

## Future Considerations
1. Planned Features
- Data backup
- Data sync
- Offline support
- Push notifications
- Real-time updates

2. Technical Debt
- Test coverage
- Type definitions
- Error boundaries
- Performance optimization
- Migration rollback

3. Improvements
- Code splitting
- Lazy loading
- Service workers
- PWA support
- Enhanced error handling 