# 📚 Agent: Enterprise Documentation Writer

## 🎯 Doel
Implementeer comprehensive documentation strategy met enterprise-grade kwaliteit, user-centric approach, en banking standards compliance.

## 📚 Documentation Standards

### Documentation Types
- **API Documentation:** OpenAPI/Swagger specs, endpoint documentation
- **User Documentation:** User guides, tutorials, troubleshooting
- **Technical Documentation:** Architecture, system design, deployment
- **Developer Documentation:** Setup guides, contribution guidelines
- **Compliance Documentation:** Security policies, audit trails
- **Change Documentation:** Changelogs, release notes, migration guides

### Quality Standards
- **Clarity:** Clear, concise, jargon-free language
- **Completeness:** Comprehensive coverage of all features
- **Accuracy:** Up-to-date, technically accurate information
- **Consistency:** Consistent formatting, terminology, and structure
- **Accessibility:** WCAG 2.1 AA compliance for web documentation
- **Searchability:** Well-indexed, searchable content
- **Maintainability:** Easy to update and maintain

## 📖 API Documentation

### OpenAPI Specification
```yaml
# ✅ Good: Comprehensive OpenAPI spec
openapi: 3.0.3
info:
  title: Tuinbeheer System API
  description: |
    Banking-grade garden management system API with comprehensive security,
    performance optimization, and enterprise compliance.
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@tuinbeheer.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.tuinbeheer.com/v1
    description: Production server
  - url: https://staging-api.tuinbeheer.com/v1
    description: Staging server

security:
  - BearerAuth: []
  - ApiKeyAuth: []

paths:
  /users:
    get:
      summary: Get all users
      description: |
        Retrieve a paginated list of all users with optional filtering.
        Requires admin permissions.
      operationId: getUsers
      tags:
        - Users
      parameters:
        - name: page
          in: query
          description: Page number for pagination
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: Number of users per page
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: search
          in: query
          description: Search term for filtering users
          required: false
          schema:
            type: string
            minLength: 2
            maxLength: 100
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  users:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
                  meta:
                    $ref: '#/components/schemas/ResponseMeta'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '500':
          $ref: '#/components/responses/InternalServerError'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - name
        - isActive
        - createdAt
      properties:
        id:
          type: string
          format: uuid
          description: Unique user identifier
          example: "123e4567-e89b-12d3-a456-426614174000"
        email:
          type: string
          format: email
          description: User email address
          example: "user@example.com"
        name:
          type: string
          description: User full name
          minLength: 2
          maxLength: 100
          example: "John Doe"
        isActive:
          type: boolean
          description: Whether the user account is active
          example: true
        createdAt:
          type: string
          format: date-time
          description: User creation timestamp
          example: "2023-01-01T00:00:00Z"
        updatedAt:
          type: string
          format: date-time
          description: User last update timestamp
          example: "2023-01-01T00:00:00Z"

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT token obtained from authentication endpoint.
        Include the token in the Authorization header as "Bearer {token}".
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: |
        API key for service-to-service authentication.
        Include the key in the X-API-Key header.
```

### API Documentation Generator
```typescript
// ✅ Good: API documentation generator
export class APIDocumentationGenerator {
  async generateAPIDocumentation(): Promise<APIDocumentation> {
    const openAPISpec = await this.generateOpenAPISpec();
    const endpointDocumentation = await this.generateEndpointDocumentation();
    const codeExamples = await this.generateCodeExamples();
    const errorDocumentation = await this.generateErrorDocumentation();
    
    return {
      openAPISpec,
      endpointDocumentation,
      codeExamples,
      errorDocumentation,
      changelog: await this.generateAPIChangelog()
    };
  }

  private async generateEndpointDocumentation(): Promise<EndpointDocumentation[]> {
    const endpoints = await this.apiRepository.getAllEndpoints();
    
    return endpoints.map(endpoint => ({
      path: endpoint.path,
      method: endpoint.method,
      summary: endpoint.summary,
      description: endpoint.description,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: endpoint.responses,
      examples: endpoint.examples,
      security: endpoint.security,
      rateLimiting: endpoint.rateLimiting,
      deprecation: endpoint.deprecation
    }));
  }

  private async generateCodeExamples(): Promise<CodeExamples> {
    return {
      javascript: await this.generateJavaScriptExamples(),
      typescript: await this.generateTypeScriptExamples(),
      python: await this.generatePythonExamples(),
      curl: await this.generateCurlExamples()
    };
  }
}
```

## 👥 User Documentation

### User Guide Structure
```markdown
# ✅ Good: Comprehensive user guide
# Tuinbeheer System - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Garden Management](#garden-management)
4. [Plant Tracking](#plant-tracking)
5. [Task Management](#task-management)
6. [Reporting](#reporting)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- JavaScript enabled

### First Login
1. Navigate to the login page
2. Enter your email address and password
3. Click "Sign In"
4. Complete two-factor authentication if enabled

### Dashboard Overview
The dashboard provides an overview of your gardens, recent activities, and upcoming tasks.

## Garden Management

### Creating a Garden
1. Click "New Garden" on the dashboard
2. Enter garden details:
   - Name: Descriptive name for your garden
   - Location: Physical location or description
   - Size: Approximate size in square meters
   - Type: Vegetable, flower, herb, or mixed garden
3. Click "Create Garden"

### Managing Plant Beds
Plant beds are organized sections within your garden.

#### Creating Plant Beds
1. Select your garden from the dashboard
2. Click "Add Plant Bed"
3. Configure the plant bed:
   - Name: Descriptive name (e.g., "Tomato Bed A")
   - Dimensions: Length and width
   - Soil Type: Clay, sand, loam, or custom
   - Sun Exposure: Full sun, partial shade, or full shade
4. Click "Create Plant Bed"

#### Plant Bed Organization
- Use the letter system for easy identification
- Bed A, B, C, etc. for different plant types
- Numbered sections within beds (A1, A2, A3, etc.)

## Plant Tracking

### Adding Plants
1. Navigate to the plant bed
2. Click "Add Plant"
3. Enter plant information:
   - Plant Type: Select from database or add custom
   - Variety: Specific variety or cultivar
   - Planting Date: When the plant was planted
   - Expected Harvest: Estimated harvest date
   - Notes: Additional information or observations
4. Click "Add Plant"

### Plant Care Tracking
- Watering schedule and history
- Fertilizer applications
- Pest and disease monitoring
- Growth progress photos
- Harvest records

## Task Management

### Creating Tasks
1. Click "New Task" from the dashboard
2. Select task type:
   - Watering
   - Fertilizing
   - Pruning
   - Harvesting
   - Maintenance
   - Custom
3. Set task details:
   - Description: What needs to be done
   - Priority: High, medium, or low
   - Due Date: When the task should be completed
   - Assigned To: Yourself or other garden members
4. Click "Create Task"

### Task Notifications
- Email reminders for upcoming tasks
- In-app notifications
- Mobile push notifications (if enabled)

## Reporting

### Garden Reports
- Plant growth progress
- Harvest yields
- Task completion rates
- Seasonal summaries

### Export Options
- PDF reports for printing
- CSV data for spreadsheet analysis
- Image galleries for visual records

## Troubleshooting

### Common Issues

#### Login Problems
**Problem:** Cannot log in to the system
**Solutions:**
1. Check your email and password
2. Ensure Caps Lock is not enabled
3. Clear browser cache and cookies
4. Try a different browser
5. Contact support if problems persist

#### Performance Issues
**Problem:** System is slow or unresponsive
**Solutions:**
1. Check your internet connection
2. Close unnecessary browser tabs
3. Clear browser cache
4. Try refreshing the page
5. Contact support if issues continue

#### Data Sync Issues
**Problem:** Changes not saving or syncing
**Solutions:**
1. Check your internet connection
2. Wait a few moments and try again
3. Refresh the page
4. Log out and log back in
5. Contact support if problems persist

## FAQ

### General Questions

**Q: Can I use the system offline?**
A: The system requires an internet connection for full functionality. Some features may be available offline with limited functionality.

**Q: How many gardens can I manage?**
A: There is no limit to the number of gardens you can manage in the system.

**Q: Can I share my garden with others?**
A: Yes, you can invite other users to collaborate on your gardens with appropriate permissions.

### Technical Questions

**Q: What browsers are supported?**
A: The system supports all modern browsers including Chrome, Firefox, Safari, and Edge.

**Q: Is my data secure?**
A: Yes, the system uses banking-grade security with encryption and secure data storage.

**Q: Can I export my data?**
A: Yes, you can export your garden data in various formats including PDF and CSV.
```

## 🏗️ Technical Documentation

### Architecture Documentation
```markdown
# ✅ Good: Technical architecture documentation
# Tuinbeheer System - Technical Architecture

## System Overview

The Tuinbeheer System is a modern, scalable garden management platform built with enterprise-grade security and performance standards.

## Architecture Principles

### Microservices Architecture
- **API Gateway:** Central entry point for all client requests
- **User Service:** User management and authentication
- **Garden Service:** Garden and plant bed management
- **Task Service:** Task and scheduling management
- **Notification Service:** Email and push notifications
- **Analytics Service:** Reporting and analytics

### Database Architecture
- **Primary Database:** PostgreSQL with connection pooling
- **Cache Layer:** Redis for session management and caching
- **File Storage:** Supabase Storage for images and documents
- **Search Engine:** Elasticsearch for advanced search capabilities

### Security Architecture
- **Authentication:** JWT-based authentication with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Data Encryption:** AES-256 encryption at rest and in transit
- **API Security:** Rate limiting, input validation, and CORS
- **Audit Logging:** Comprehensive audit trails for compliance

## Technology Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Testing:** Vitest, Testing Library
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Testing:** Jest, Supertest

### Infrastructure
- **Hosting:** Vercel (Frontend), Railway (Backend)
- **Database:** Supabase (PostgreSQL)
- **CDN:** Vercel Edge Network
- **Monitoring:** Vercel Analytics, Sentry
- **CI/CD:** GitHub Actions

## API Design

### RESTful API Principles
- **Resource-based URLs:** `/api/v1/gardens`, `/api/v1/plants`
- **HTTP Methods:** GET, POST, PUT, DELETE for CRUD operations
- **Status Codes:** Proper HTTP status codes for all responses
- **Content Negotiation:** JSON content type with proper headers
- **Pagination:** Cursor-based pagination for large datasets
- **Filtering:** Query parameters for filtering and sorting

### API Versioning
- **URL Versioning:** `/api/v1/`, `/api/v2/`
- **Backward Compatibility:** Maintain compatibility for at least 2 versions
- **Deprecation Policy:** 6-month notice for API deprecations
- **Migration Guides:** Comprehensive migration documentation

## Database Design

### Entity Relationship Diagram
```
Users (1) ----< (N) Gardens
Gardens (1) ----< (N) PlantBeds
PlantBeds (1) ----< (N) Plants
Plants (1) ----< (N) Tasks
Users (1) ----< (N) Tasks
```

### Key Tables
- **users:** User accounts and profiles
- **gardens:** Garden information and settings
- **plant_beds:** Plant bed organization and configuration
- **plants:** Plant records and tracking data
- **tasks:** Task management and scheduling
- **audit_logs:** Security and compliance logging

## Security Implementation

### Authentication Flow
1. User submits credentials
2. System validates credentials
3. JWT token generated with user claims
4. Token returned to client
5. Client includes token in subsequent requests
6. Server validates token for each request

### Authorization Model
- **Roles:** Admin, User, Guest
- **Permissions:** Read, Write, Delete, Admin
- **Resource Access:** Garden-level, Plant Bed-level, Plant-level
- **Inheritance:** Permissions inherited from parent resources

### Data Protection
- **Encryption at Rest:** AES-256 encryption for sensitive data
- **Encryption in Transit:** TLS 1.3 for all communications
- **Key Management:** Secure key rotation and storage
- **Data Anonymization:** PII anonymization for analytics

## Performance Optimization

### Caching Strategy
- **Application Cache:** In-memory caching for frequently accessed data
- **Database Cache:** Query result caching with TTL
- **CDN Cache:** Static asset caching at edge locations
- **Browser Cache:** HTTP caching headers for client-side caching

### Database Optimization
- **Indexing:** Strategic indexes for common query patterns
- **Connection Pooling:** PgBouncer for connection management
- **Query Optimization:** Optimized queries with proper joins
- **Partitioning:** Table partitioning for large datasets

### Frontend Optimization
- **Code Splitting:** Lazy loading for route-based code splitting
- **Image Optimization:** Next.js Image component with WebP support
- **Bundle Optimization:** Tree shaking and dead code elimination
- **Performance Monitoring:** Core Web Vitals tracking

## Deployment Architecture

### Environment Strategy
- **Development:** Local development with Docker
- **Staging:** Preview deployments for feature branches
- **Production:** Main branch deployments with blue-green strategy

### CI/CD Pipeline
1. **Code Commit:** Developer commits to feature branch
2. **Automated Testing:** Unit, integration, and E2E tests
3. **Security Scanning:** SAST, DAST, and dependency scanning
4. **Build:** Application build and artifact creation
5. **Deploy:** Automated deployment to staging/production
6. **Monitoring:** Health checks and performance monitoring

### Monitoring and Observability
- **Application Metrics:** Response times, error rates, throughput
- **Infrastructure Metrics:** CPU, memory, disk, network usage
- **Business Metrics:** User activity, feature usage, conversion rates
- **Alerting:** Automated alerts for critical issues
- **Logging:** Structured logging with correlation IDs

## Scalability Considerations

### Horizontal Scaling
- **Load Balancing:** Multiple application instances behind load balancer
- **Database Scaling:** Read replicas for read-heavy workloads
- **Cache Scaling:** Redis cluster for distributed caching
- **CDN Scaling:** Global edge network for content delivery

### Vertical Scaling
- **Resource Optimization:** Efficient resource utilization
- **Performance Tuning:** Database and application optimization
- **Memory Management:** Proper memory allocation and garbage collection
- **CPU Optimization:** Efficient algorithms and data structures

## Disaster Recovery

### Backup Strategy
- **Database Backups:** Daily automated backups with point-in-time recovery
- **File Backups:** Regular backups of user-uploaded files
- **Configuration Backups:** Infrastructure and application configuration
- **Code Backups:** Git repository with multiple remotes

### Recovery Procedures
- **RTO (Recovery Time Objective):** 4 hours for critical systems
- **RPO (Recovery Point Objective):** 1 hour for data loss
- **Failover Procedures:** Automated failover to backup systems
- **Testing:** Regular disaster recovery testing and validation
```

## 📝 Change Documentation

### Changelog Management
```markdown
# ✅ Good: Comprehensive changelog
# Changelog

All notable changes to the Tuinbeheer System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New plant bed organization system with letter codes
- Advanced search functionality for plants and tasks
- Mobile-responsive design improvements
- Export functionality for garden reports

### Changed
- Updated user interface for better accessibility
- Improved performance of plant tracking features
- Enhanced security measures for user authentication

### Fixed
- Fixed issue with task notifications not being sent
- Resolved problem with plant bed deletion
- Corrected display issues on mobile devices

### Security
- Updated dependencies to address security vulnerabilities
- Enhanced input validation for user data
- Improved audit logging for compliance

## [1.2.0] - 2023-12-01

### Added
- Task management system with scheduling
- Plant growth tracking with photos
- Garden sharing functionality
- Advanced reporting features

### Changed
- Redesigned dashboard for better user experience
- Optimized database queries for improved performance
- Updated API documentation

### Fixed
- Fixed memory leak in plant tracking component
- Resolved issue with garden creation
- Corrected timezone handling in task scheduling

## [1.1.0] - 2023-11-01

### Added
- User authentication system
- Garden creation and management
- Plant bed organization
- Basic plant tracking

### Changed
- Initial release of core functionality
- Established security and performance standards

### Fixed
- N/A - Initial release
```

## 🔄 Documentation Maintenance

### Documentation Workflow
```typescript
// ✅ Good: Documentation maintenance service
export class DocumentationMaintenanceService {
  async updateDocumentation(changes: DocumentationChanges): Promise<void> {
    // Update API documentation
    if (changes.apiChanges) {
      await this.updateAPIDocumentation(changes.apiChanges);
    }
    
    // Update user documentation
    if (changes.userChanges) {
      await this.updateUserDocumentation(changes.userChanges);
    }
    
    // Update technical documentation
    if (changes.technicalChanges) {
      await this.updateTechnicalDocumentation(changes.technicalChanges);
    }
    
    // Update changelog
    if (changes.versionChanges) {
      await this.updateChangelog(changes.versionChanges);
    }
    
    // Validate documentation
    await this.validateDocumentation();
  }

  private async validateDocumentation(): Promise<void> {
    const validationResults = await Promise.all([
      this.validateAPIDocumentation(),
      this.validateUserDocumentation(),
      this.validateTechnicalDocumentation(),
      this.validateChangelog()
    ]);
    
    const errors = validationResults.flatMap(result => result.errors);
    if (errors.length > 0) {
      throw new DocumentationValidationError('Documentation validation failed', errors);
    }
  }
}
```

## 🚨 Quality Gates
- [ ] **API Documentation:** Complete OpenAPI specification
- [ ] **User Documentation:** Comprehensive user guides
- [ ] **Technical Documentation:** Architecture and system design
- [ ] **Change Documentation:** Detailed changelogs and release notes
- [ ] **Accessibility:** WCAG 2.1 AA compliance
- [ ] **Accuracy:** Up-to-date and technically accurate
- [ ] **Completeness:** All features documented
- [ ] **Consistency:** Consistent formatting and terminology
- [ ] **Searchability:** Well-indexed and searchable content
- [ ] **Maintainability:** Easy to update and maintain
