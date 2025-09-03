/**
 * DocsWriter Agent - Updates real documentation
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface DocumentationUpdate {
  readme: boolean
  changelog: boolean
  api: boolean
  userGuide: boolean
  deployment: boolean
}

export class DocsWriter {
  /**
   * Update all relevant documentation
   */
  async updateDocumentation(feature: string, files: string[], changes: string[]): Promise<{
    success: boolean
    updated: DocumentationUpdate
    errors: string[]
  }> {
    const result = {
      success: false,
      updated: {
        readme: false,
        changelog: false,
        api: false,
        userGuide: false,
        deployment: false
      },
      errors: [] as string[]
    }

    try {
      // Update README.md
      if (await this.updateReadme(feature, changes)) {
        result.updated.readme = true
      }

      // Update CHANGELOG.md
      if (await this.updateChangelog(feature, changes)) {
        result.updated.changelog = true
      }

      // Update API documentation
      if (await this.updateApiDocs(feature, files)) {
        result.updated.api = true
      }

      // Create user guide
      if (await this.createUserGuide(feature, changes)) {
        result.updated.userGuide = true
      }

      // Update deployment docs
      if (await this.updateDeploymentDocs(feature, files)) {
        result.updated.deployment = true
      }

      result.success = true
      return result

    } catch (error) {
      result.errors.push(`Documentation update failed: ${error}`)
      return result
    }
  }

  /**
   * Update README.md
   */
  private async updateReadme(feature: string, changes: string[]): Promise<boolean> {
    try {
      const readmePath = 'README.md'
      let content = ''

      if (existsSync(readmePath)) {
        content = readFileSync(readmePath, 'utf8')
      } else {
        // Create basic README structure
        content = `# Tuinbeheer Systeem

Garden management system with enterprise AI pipeline.

## Features

## Installation

## Usage

## Contributing

## License
`
      }

      // Add feature to features section
      const featureSection = `\n### ${feature}\n${changes.map(change => `- ${change}`).join('\n')}\n`
      
      if (content.includes('## Features')) {
        content = content.replace('## Features', `## Features${featureSection}`)
      } else {
        content += `\n## Features${featureSection}`
      }

      writeFileSync(readmePath, content)
      return true

    } catch (error) {
      console.error('Failed to update README:', error)
      return false
    }
  }

  /**
   * Update CHANGELOG.md
   */
  private async updateChangelog(feature: string, changes: string[]): Promise<boolean> {
    try {
      const changelogPath = 'CHANGELOG.md'
      let content = ''

      if (existsSync(changelogPath)) {
        content = readFileSync(changelogPath, 'utf8')
      } else {
        content = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

`
      }

      // Add new version entry
      const today = new Date().toISOString().split('T')[0]
      const version = `## [Unreleased] - ${today}`
      const changeEntry = `
${version}

### Added
${changes.map(change => `- ${change}`).join('\n')}

### Changed
- Implemented ${feature} feature

### Fixed
- Various bug fixes and improvements

`

      // Insert at the beginning after the header
      const headerEnd = content.indexOf('\n\n') + 2
      content = content.slice(0, headerEnd) + changeEntry + content.slice(headerEnd)

      writeFileSync(changelogPath, content)
      return true

    } catch (error) {
      console.error('Failed to update CHANGELOG:', error)
      return false
    }
  }

  /**
   * Update API documentation
   */
  private async updateApiDocs(feature: string, files: string[]): Promise<boolean> {
    try {
      const apiFiles = files.filter(f => f.includes('app/api/'))
      
      if (apiFiles.length === 0) {
        return false
      }

      const apiDocPath = `docs/api/${feature}-api.md`
      let content = `# ${feature} API Documentation

## Overview
API endpoints for ${feature} functionality.

## Endpoints

`

      for (const apiFile of apiFiles) {
        try {
          const apiContent = readFileSync(apiFile, 'utf8')
          const routeName = apiFile.split('/').slice(-2, -1)[0]
          
          content += `### ${routeName.toUpperCase()}\n\n`
          
          // Extract HTTP methods
          if (apiContent.includes('export async function GET')) {
            content += `#### GET /api/${routeName}\n`
            content += `Description: Retrieve ${feature} data\n\n`
            content += `**Response:**\n`
            content += `\`\`\`json\n{\n  "success": true,\n  "data": {}\n}\n\`\`\`\n\n`
          }
          
          if (apiContent.includes('export async function POST')) {
            content += `#### POST /api/${routeName}\n`
            content += `Description: Create or update ${feature} data\n\n`
            content += `**Request Body:**\n`
            content += `\`\`\`json\n{\n  "data": {}\n}\n\`\`\`\n\n`
            content += `**Response:**\n`
            content += `\`\`\`json\n{\n  "success": true,\n  "data": {}\n}\n\`\`\`\n\n`
          }
          
          if (apiContent.includes('export async function PUT')) {
            content += `#### PUT /api/${routeName}\n`
            content += `Description: Update ${feature} data\n\n`
          }
          
          if (apiContent.includes('export async function DELETE')) {
            content += `#### DELETE /api/${routeName}\n`
            content += `Description: Delete ${feature} data\n\n`
          }
          
        } catch (error) {
          // Skip if file can't be read
        }
      }

      content += `## Authentication
All endpoints require valid authentication.

## Error Handling
All endpoints return consistent error responses:

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
\`\`\`

## Rate Limiting
API endpoints are rate limited to prevent abuse.

Generated on: ${new Date().toISOString()}
`

      writeFileSync(apiDocPath, content)
      return true

    } catch (error) {
      console.error('Failed to update API docs:', error)
      return false
    }
  }

  /**
   * Create user guide
   */
  private async createUserGuide(feature: string, changes: string[]): Promise<boolean> {
    try {
      const userGuidePath = `docs/user/${feature}-guide.md`
      
      const content = `# ${feature} User Guide

## Overview
This guide explains how to use the ${feature} feature.

## Getting Started

### Prerequisites
- Access to the garden management system
- Appropriate user permissions

### Basic Usage

1. Navigate to the ${feature} section
2. Follow the on-screen instructions
3. Save your changes

## Features

${changes.map(change => `### ${change}\nDetailed explanation of ${change.toLowerCase()}.\n`).join('\n')}

## Troubleshooting

### Common Issues

**Issue**: Feature not loading
**Solution**: Check your internet connection and refresh the page.

**Issue**: Changes not saving
**Solution**: Ensure you have the necessary permissions and try again.

## Support

If you need additional help, please contact support or refer to the main documentation.

## Related Documentation
- [API Documentation](../api/${feature}-api.md)
- [Deployment Guide](../deployment/${feature}-deployment.md)

Last updated: ${new Date().toISOString()}
`

      writeFileSync(userGuidePath, content)
      return true

    } catch (error) {
      console.error('Failed to create user guide:', error)
      return false
    }
  }

  /**
   * Update deployment documentation
   */
  private async updateDeploymentDocs(feature: string, files: string[]): Promise<boolean> {
    try {
      const deploymentDocPath = `docs/deployment/${feature}-deployment.md`
      
      const hasApiRoutes = files.some(f => f.includes('app/api/'))
      const hasComponents = files.some(f => f.includes('components/'))
      const hasDatabase = files.some(f => f.includes('database') || f.includes('supabase'))
      
      const content = `# ${feature} Deployment Guide

## Overview
Deployment instructions for the ${feature} feature.

## Prerequisites
- Node.js 18+ installed
- Access to deployment environment
- Database access (if applicable)

## Deployment Steps

### 1. Code Deployment
\`\`\`bash
git checkout main
git pull origin main
npm install
npm run build
\`\`\`

### 2. Environment Variables
Ensure the following environment variables are set:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`

${hasDatabase ? `### 3. Database Migration
\`\`\`bash
# Run any necessary database migrations
npm run db:migrate
\`\`\`
` : ''}

${hasApiRoutes ? `### 4. API Routes
The following API routes are included:
${files.filter(f => f.includes('app/api/')).map(f => `- \`${f.replace('app/api/', '/api/').replace('/route.ts', '')}\``).join('\n')}
` : ''}

${hasComponents ? `### 5. Frontend Components
New components have been added:
${files.filter(f => f.includes('components/')).map(f => `- \`${f}\``).join('\n')}
` : ''}

## Testing
After deployment, test the following:

1. **Functionality Test**
   - Verify all features work as expected
   - Test user interactions

2. **Performance Test**
   - Check page load times
   - Monitor API response times

3. **Security Test**
   - Verify authentication works
   - Check authorization permissions

## Rollback Plan
If issues occur, rollback using:
\`\`\`bash
git checkout <previous-commit>
npm run build
\`\`\`

## Monitoring
Monitor the following metrics:
- Application performance
- Error rates
- User activity

## Support
Contact the development team if issues occur during deployment.

Generated on: ${new Date().toISOString()}
`

      writeFileSync(deploymentDocPath, content)
      return true

    } catch (error) {
      console.error('Failed to update deployment docs:', error)
      return false
    }
  }
}
