# Technical Context

## Technology Stack
1. Frontend Framework
- React with TypeScript
- Vite for build tooling
- React Router for navigation
- shadcn/ui for components

2. UI Libraries
- Tailwind CSS for styling
- Lucide React for icons
- Radix UI for primitives
- Class Variance Authority

3. State Management
- React Context
- Local component state
- Local storage for persistence

4. Form Handling
- Controlled components
- Form validation
- Error handling
- Loading states

## Development Setup
1. Environment
- Node.js v18+
- npm/yarn/pnpm
- TypeScript
- VS Code (recommended)

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

## Project Structure
1. Source Code
```
src/
  components/     # Reusable components
    ui/           # Base UI components
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
1. Browser Support
- Modern browsers
- Mobile browsers
- Progressive enhancement
- Responsive design

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

## Future Considerations
1. Planned Features
- Data backup
- Data sync
- Offline support
- Push notifications

2. Technical Debt
- Test coverage
- Type definitions
- Error boundaries
- Performance optimization

3. Improvements
- Code splitting
- Lazy loading
- Service workers
- PWA support 