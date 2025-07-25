# Tuinbeheer Systeem 🌱

Een professioneel tuinbeheersysteem gebouwd volgens bancaire standaarden met uitgebreide logging, validatie, en testing.

## 🏗️ Architectuur

### Banking-Standard Implementation 
- **Comprehensive Error Handling**: Gestructureerde foutafhandeling met custom error classes
- **Audit Logging**: Volledige audit trail voor alle gebruikersacties en data toegang
- **Performance Monitoring**: Real-time performance tracking met alerting
- **Input Validation**: Uitgebreide validatie met sanitization voor alle gebruikersinvoer
- **Type Safety**: Volledig TypeScript met strikte type checking

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Logging**: Winston met structured logging
- **Testing**: Jest, React Testing Library
- **Validation**: Zod schemas met custom validators
- **Deployment**: Vercel (Production Ready)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm of yarn
- Supabase account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd tuinbeheer-systeem

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Setup database
npm run db:setup

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NODE_ENV=development
```

## 🧪 Testing

### Test Architecture
- **Unit Tests**: Service layer, validation, utilities
- **Integration Tests**: API endpoints, database operations
- **Component Tests**: React components with user interactions
- **Coverage**: 80%+ code coverage requirement

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests for CI/CD
npm run test:ci
```

### Test Structure
```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── services/
│   │   │   └── database.service.test.ts
│   │   └── validation/
│   │       └── index.test.ts
│   └── components/
└── integration/
    └── api/
        └── gardens.test.ts
```

## 📊 Logging & Monitoring

### Logging Levels
- **ERROR**: System errors, failed operations
- **WARN**: Performance issues, security events
- **INFO**: User actions, system events
- **DEBUG**: Development information
- **TRACE**: Detailed execution flow

### Log Categories
- **AUDIT**: User actions and data access
- **SECURITY**: Security-related events
- **PERFORMANCE**: Operation timing and alerts
- **DATA_ACCESS**: Database operations

### Example Usage

```typescript
import { uiLogger, AuditLogger, PerformanceLogger } from '@/lib/logger'

// Application logging
uiLogger.info('User logged in', { userId: '123' })
uiLogger.error('Failed to load data', error, { context: 'homepage' })

// Audit logging
AuditLogger.logUserAction('123', 'CREATE', 'gardens', 'garden-id', { name: 'My Garden' })

// Performance monitoring
PerformanceLogger.startTimer('operation-id')
// ... operation
PerformanceLogger.endTimer('operation-id', 'Load Gardens')
```

## 🔒 Security & Validation

### Input Validation
- **Server-side validation**: All API endpoints
- **Client-side validation**: Real-time user feedback
- **Sanitization**: XSS protection for all inputs
- **Type checking**: Runtime type validation with Zod

### Security Features
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Next.js built-in protection
- **Rate Limiting**: API endpoint protection
- **Audit Trail**: Complete user action logging

## 📁 Project Structure

```
tuinbeheer-systeem/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── gardens/           # Garden pages
│   └── page.tsx           # Homepage
├── lib/                   # Core business logic
│   ├── services/          # Service layer
│   │   └── database.service.ts
│   ├── validation/        # Input validation
│   ├── types/            # TypeScript definitions
│   ├── logger.ts         # Logging system
│   └── supabase.ts       # Database client
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── error-boundary.tsx
├── __tests__/           # Test files
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── hooks/              # Custom React hooks
└── database/           # Database migrations
```

## 🎯 Core Features

### Garden Management
- **CRUD Operations**: Create, read, update, delete gardens
- **Search & Filter**: Real-time search with debouncing
- **Pagination**: Efficient data loading
- **Validation**: Comprehensive input validation

### Plant Bed Management
- **Visual Designer**: Drag & drop interface
- **Position Tracking**: Precise plant bed positioning
- **Size Management**: Scalable dimensions

### Plant Tracking
- **Plant Database**: Comprehensive plant information
- **Status Monitoring**: Health tracking
- **Photo Management**: Image upload and storage
- **Care Instructions**: Detailed plant care

## 🔧 Development

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Extended Next.js configuration
- **Prettier**: Code formatting
- **Banking Standards**: Error handling, logging, validation

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript checking
npm run format           # Format code with Prettier

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Database
npm run db:setup         # Setup database
npm run db:reset         # Reset database
npm run db:schema        # Update schema

# Security
npm run audit:security   # Security audit
```

### Development Workflow

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Develop with tests
   npm run test:watch
   
   # Ensure code quality
   npm run lint
   npm run type-check
   
   # Run full test suite
   npm run test:coverage
   ```

2. **Pre-commit Checks**
   - All tests pass
   - Code coverage ≥ 80%
   - No TypeScript errors
   - No ESLint errors
   - Security audit clean

## 🚀 Deployment

### Production Deployment (Vercel)

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy --prod
```

### Environment Setup
- **Staging**: `staging.tuinbeheer.app`
- **Production**: `tuinbeheer.app`

### Monitoring
- **Error Tracking**: Integrated logging
- **Performance**: Real-time metrics
- **Uptime**: Automated monitoring

## 📈 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Intelligent caching strategies
- **Lazy Loading**: Component and data lazy loading

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## 🤝 Contributing

### Development Guidelines
1. Follow banking-standard practices
2. Write comprehensive tests
3. Include proper logging
4. Validate all inputs
5. Handle errors gracefully

### Pull Request Process
1. Create feature branch
2. Implement with tests
3. Ensure 80%+ coverage
4. Pass all quality checks
5. Submit PR with description

### Code Review Checklist
- [ ] Tests included and passing
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Logging statements included
- [ ] TypeScript types defined
- [ ] Performance considered

## 📄 API Documentation

### Gardens API

```typescript
// GET /api/gardens
// Query parameters: search, page, pageSize, sort
Response: PaginatedResponse<Tuin>

// POST /api/gardens
Body: TuinFormData
Response: ApiResponse<Tuin>

// GET /api/gardens/[id]
Response: ApiResponse<Tuin>

// PUT /api/gardens/[id]
Body: Partial<TuinFormData>
Response: ApiResponse<Tuin>

// DELETE /api/gardens/[id]
Response: ApiResponse<boolean>
```

### Response Format

```typescript
interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  total_pages: number
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check environment variables
   npm run db:setup
   ```

2. **Test Failures**
   ```bash
   # Clear Jest cache
   npx jest --clearCache
   npm run test
   ```

3. **Build Errors**
   ```bash
   # Clean build cache
   npm run clean
   npm run build
   ```

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=* npm run dev
```

## 📊 Metrics & Analytics

### Key Performance Indicators
- **System Uptime**: 99.9%
- **Response Time**: < 200ms average
- **Error Rate**: < 0.1%
- **Test Coverage**: > 80%

### Monitoring Dashboard
- Real-time performance metrics
- Error tracking and alerting
- User activity analytics
- System health monitoring

## 📞 Support

### Documentation
- [API Reference](./docs/api.md)
- [Development Guide](./docs/development.md)
- [Deployment Guide](./docs/deployment.md)

### Contact
- **Technical Issues**: Create GitHub issue
- **Security Concerns**: security@tuinbeheer.app
- **General Questions**: support@tuinbeheer.app

---

**Tuinbeheer Systeem** - Professional garden management built to banking standards 🌱

**Status**: Production Ready ✅  
**Test Coverage**: 80%+ ✅  
**Security**: Banking Standard ✅
