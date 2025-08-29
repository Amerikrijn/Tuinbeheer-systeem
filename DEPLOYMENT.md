# Deployment Guide

This guide explains how to deploy the Tuinbeheersysteem application.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Vercel account (recommended) or other hosting platform

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Database Setup

1. Create a new Supabase project
2. Run the migration files in the `supabase/migrations/` directory
3. Verify that the tables are created correctly

## Deployment Options

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure your web server to serve the application

## Post-Deployment

1. Test all functionality
2. Verify database connections
3. Check that all pages load correctly
4. Test the garden and plant bed creation features

## Troubleshooting

- Check Supabase connection if database operations fail
- Verify environment variables are set correctly
- Check browser console for JavaScript errors
- Review server logs for backend issues
\`\`\`

```plaintext file="LICENSE"
MIT License

Copyright (c) 2024 Tuinbeheersysteem

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
