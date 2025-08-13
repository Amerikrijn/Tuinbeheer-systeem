# Tuinbeheer Systeem

Een modern tuinbeheer systeem gebouwd met Next.js, Supabase en TailwindCSS.

## Features

- **Plantvak Lettering Systeem** - Automatische letter codes (A, B, C, etc.) voor plantvakken
- Tuinbeheer
- Planten tracking
- Taakbeheer
- Logboek
- Visual Garden Designer

## Tech Stack

- Next.js 14
- Supabase (PostgreSQL)
- TailwindCSS
- TypeScript
- React Hook Form
- Zod Validation

## Development

```bash
npm install
npm run dev
```

## Database Setup

Het systeem gebruikt automatische letter codes voor plantvakken:
- Eerste plantvak krijgt letter A
- Tweede plantvak krijgt letter B
- Enzovoort...
- Na Z komt A1, A2, etc.
