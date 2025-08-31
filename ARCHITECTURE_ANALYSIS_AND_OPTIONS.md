# 🏗️ ARCHITECTUUR ANALYSE & OPTIES - Tuinbeheer Systeem

## Executive Summary
Het systeem vertoont fundamentele architectuur problemen die niet met quick fixes op te lossen zijn. De huidige aanpak creëert inderdaad technical debt. Dit document presenteert 4 uitgewerkte oplossingsrichtingen.

---

## 📊 HUIDIGE ARCHITECTUUR PROBLEMEN

### 1. **Alles is Client-Side Rendered**
```typescript
"use client"  // Op ELKE pagina
export const dynamic = 'force-dynamic'
```
**Impact:**
- Dubbele latency (HTML → JS → Data)
- Geen server-side optimalisaties
- Alle business logic in de browser
- Security risico's (alle logic zichtbaar)

### 2. **Database Queries vanuit Browser**
```typescript
// Direct vanuit React components:
const { data } = await supabase.from('tasks').select('*')
```
**Impact:**
- N+1 query patterns onvermijdelijk
- Geen query caching mogelijk
- Connection pool exhaustion
- Rate limiting issues

### 3. **Geen Separation of Concerns**
```
app/
  page.tsx (UI + Business Logic + Data Fetching)
  tasks/page.tsx (Alles in 1 file)
lib/
  database.ts (Direct Supabase calls)
```
**Impact:**
- Moeilijk testbaar
- Niet schaalbaar
- Business logic verspreid
- Geen centrale error handling

### 4. **Missing Abstraction Layers**
- Geen API layer
- Geen service layer
- Geen caching layer
- Geen validation layer

---

## 🎯 RANDVOORWAARDEN

Gebaseerd op eerdere discussies:
1. ✅ Moet werken met **Vercel** hosting
2. ✅ Moet werken met **Supabase** cloud
3. ✅ Budget bewust (geen dure infrastructure)
4. ✅ Moet snel te implementeren zijn
5. ✅ Behoud huidige functionaliteit
6. ✅ Nederlandse interface behouden

---

## 📐 OPTIE 1: Incremental Server Components Migration
**Tijdsinvestering: 2-3 weken | Complexiteit: Medium | Impact: Hoog**

### Architectuur:
```
app/
├── (server)/           # Server Components (nieuw)
│   ├── layout.tsx
│   ├── page.tsx       # Server-side data fetching
│   └── gardens/
│       └── page.tsx
├── (client)/          # Client Components (bestaand)
│   └── interactive/   # Alleen echt interactieve delen
└── api/               # API Routes voor mutations
    ├── gardens/
    └── tasks/
```

### Implementatie:
```typescript
// app/(server)/page.tsx - Server Component
export default async function HomePage() {
  // Data fetching op server
  const gardens = await fetchGardens() // Direct DB call
  
  return (
    <GardenList gardens={gardens} />  // Client component voor interactie
  )
}

// app/api/gardens/route.ts - API voor mutations
export async function POST(request: Request) {
  const data = await request.json()
  // Validation + Business logic
  const result = await createGarden(data)
  return NextResponse.json(result)
}
```

### Voordelen:
- ✅ Graduele migratie mogelijk
- ✅ Direct 50-70% snelheidswinst
- ✅ Geen breaking changes
- ✅ SEO verbetering
- ✅ Automatische code splitting

### Nadelen:
- ❌ Mix van patterns tijdens transitie
- ❌ Learning curve voor team
- ❌ Moet per pagina aangepakt worden

### Stappenplan:
1. Week 1: Homepage + Gardens naar Server Components
2. Week 2: Tasks + Logbook
3. Week 3: Testing + optimalisatie

---

## 📐 OPTIE 2: API-First Architecture met tRPC
**Tijdsinvestering: 3-4 weken | Complexiteit: Hoog | Impact: Zeer Hoog**

### Architectuur:
```
app/
├── _trpc/
│   ├── client.ts      # tRPC client setup
│   └── serverClient.ts
├── server/
│   ├── routers/
│   │   ├── garden.ts  # Garden procedures
│   │   └── task.ts    # Task procedures
│   └── context.ts     # Auth + DB context
└── pages/
    └── api/
        └── trpc/
            └── [trpc].ts  # tRPC handler
```

### Implementatie:
```typescript
// server/routers/garden.ts
export const gardenRouter = router({
  getAll: publicProcedure
    .input(z.object({
      page: z.number(),
      search: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      // Caching layer
      const cached = await redis.get(`gardens:${input.page}`)
      if (cached) return cached
      
      // Optimized query
      const result = await ctx.db.gardens.findMany({
        include: { plantBeds: true },
        take: 10,
        skip: (input.page - 1) * 10
      })
      
      await redis.set(`gardens:${input.page}`, result, 'EX', 300)
      return result
    }),
    
  create: protectedProcedure
    .input(gardenSchema)
    .mutation(async ({ input, ctx }) => {
      // Business logic centralized
      return await GardenService.create(input, ctx.user)
    })
})

// app/page.tsx - Client usage
function HomePage() {
  const { data, isLoading } = trpc.garden.getAll.useQuery({ page: 1 })
  const createMutation = trpc.garden.create.useMutation()
  
  return <GardenList data={data} onCreate={createMutation.mutate} />
}
```

### Voordelen:
- ✅ Type-safe API (end-to-end TypeScript)
- ✅ Automatic batching & caching
- ✅ Central business logic
- ✅ Built-in validation
- ✅ Real-time subscriptions support

### Nadelen:
- ❌ Grote refactor nodig
- ❌ Extra complexity
- ❌ Bundle size toename

### Stappenplan:
1. Week 1: tRPC setup + auth context
2. Week 2: Garden + Task routers
3. Week 3: Frontend migration
4. Week 4: Testing + optimization

---

## 📐 OPTIE 3: Edge-First met Vercel KV Cache
**Tijdsinvestering: 1-2 weken | Complexiteit: Laag | Impact: Medium**

### Architectuur:
```
app/
├── api/
│   ├── edge/          # Edge Functions (nieuw)
│   │   ├── gardens/
│   │   └── tasks/
│   └── data/          # Data aggregation
│       └── dashboard/
lib/
├── cache/
│   └── kv.ts          # Vercel KV wrapper
└── services/
    └── cached/        # Cached service layer
```

### Implementatie:
```typescript
// app/api/edge/gardens/route.ts
import { kv } from '@vercel/kv'

export const runtime = 'edge'  // Edge function!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  
  // Check cache first
  const cacheKey = `gardens:${page}`
  const cached = await kv.get(cacheKey)
  
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' }
    })
  }
  
  // Fetch from Supabase
  const { data, error } = await supabase
    .from('gardens')
    .select(`
      *,
      plant_beds(
        *,
        plants(*)
      )
    `)
    .range((page - 1) * 10, page * 10 - 1)
  
  // Cache for 5 minutes
  await kv.set(cacheKey, data, { ex: 300 })
  
  return NextResponse.json(data, {
    headers: { 'X-Cache': 'MISS' }
  })
}

// lib/services/cached/garden.service.ts
export class CachedGardenService {
  static async getGardens(page: number) {
    // Use edge function
    const response = await fetch(`/api/edge/gardens?page=${page}`)
    return response.json()
  }
}
```

### Voordelen:
- ✅ Snelle implementatie
- ✅ Edge = geen cold starts
- ✅ Automatic global distribution
- ✅ Redis-compatible caching
- ✅ Pay-per-use model

### Nadelen:
- ❌ Vendor lock-in (Vercel)
- ❌ Extra kosten voor KV storage
- ❌ Beperkte cache control

### Kosten:
- Vercel KV: ~$0.15 per 100k requests
- Edge Functions: Gratis tot 1M requests/maand

### Stappenplan:
1. Week 1: KV setup + Edge functions voor read operations
2. Week 2: Cache strategies + invalidation

---

## 📐 OPTIE 4: Hybrid Static Generation met ISR
**Tijdsinvestering: 2 weken | Complexiteit: Medium | Impact: Hoog**

### Architectuur:
```
app/
├── (static)/          # Statically generated
│   ├── gardens/
│   │   └── [id]/
│   │       └── page.tsx  # ISR enabled
│   └── help/
└── (dynamic)/         # Dynamic pages
    ├── tasks/
    └── logbook/
```

### Implementatie:
```typescript
// app/(static)/gardens/[id]/page.tsx
export const revalidate = 60  // Revalidate every minute

export async function generateStaticParams() {
  // Pre-build top 100 gardens
  const gardens = await supabase
    .from('gardens')
    .select('id')
    .limit(100)
  
  return gardens.data.map(g => ({ id: g.id }))
}

export default async function GardenPage({ params }) {
  // This runs at BUILD time for pre-generated pages
  // And on-demand for other pages
  const garden = await fetchGarden(params.id)
  
  return <GardenDetail garden={garden} />
}

// app/(dynamic)/tasks/page.tsx
import dynamic from 'next/dynamic'

// Lazy load heavy components
const TaskCalendar = dynamic(
  () => import('@/components/TaskCalendar'),
  { 
    loading: () => <TaskCalendarSkeleton />,
    ssr: false  // Client-only 
  }
)

export default function TasksPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TaskCalendar />
    </Suspense>
  )
}
```

### Voordelen:
- ✅ Instant loading voor static content
- ✅ Automatic revalidation
- ✅ CDN caching
- ✅ Reduced database load
- ✅ Progressive enhancement

### Nadelen:
- ❌ Complex caching strategies
- ❌ Build times kunnen oplopen
- ❌ Niet alles kan static

### Stappenplan:
1. Week 1: Identify static vs dynamic content
2. Week 2: Implement ISR + optimize build

---

## 🏆 AANBEVELING: Combinatie Aanpak

### Beste Oplossing: **Optie 1 + 3**
**Server Components + Edge Caching**

### Waarom:
1. **Laagste risico** - Incrementele migratie
2. **Snelste wins** - Direct 50%+ verbetering
3. **Toekomstbestendig** - Modern Next.js patterns
4. **Budget-vriendelijk** - Geen extra services nodig
5. **Vercel-optimized** - Maakt gebruik van platform features

### Implementatie Volgorde:

#### Fase 1 (Week 1) - Quick Wins
```typescript
// 1. Belangrijkste pages naar Server Components
app/(server)/page.tsx          // Homepage
app/(server)/gardens/page.tsx  // Gardens list

// 2. Edge API voor zware queries
app/api/edge/weekly-tasks/route.ts
app/api/edge/logbook/route.ts
```

#### Fase 2 (Week 2) - Core Migration
```typescript
// 3. Service layer met caching
lib/services/
  ├── base.service.ts      // Abstract class met caching
  ├── garden.service.ts    // Server-side only
  └── task.service.ts      // Server-side only

// 4. API routes voor mutations
app/api/
  ├── gardens/[id]/route.ts
  └── tasks/[id]/route.ts
```

#### Fase 3 (Week 3) - Optimization
```typescript
// 5. Implement caching strategies
lib/cache/strategies/
  ├── stale-while-revalidate.ts
  └── cache-first.ts

// 6. Add monitoring
lib/monitoring/
  └── performance.ts
```

### Verwachte Resultaten:
- **Week 1**: 40-50% sneller
- **Week 2**: 60-70% sneller  
- **Week 3**: 80-90% sneller

### Kosten:
- **Development**: 3 weken
- **Infrastructure**: $0 extra (gebruikt bestaande Vercel/Supabase)
- **Maintenance**: Lager door betere architectuur

---

## 📋 BESLISSINGSMATRIX

| Criterium | Optie 1 | Optie 2 | Optie 3 | Optie 4 |
|-----------|---------|---------|---------|---------|
| Implementatie tijd | 2-3 weken | 3-4 weken | 1-2 weken | 2 weken |
| Complexiteit | Medium | Hoog | Laag | Medium |
| Performance gain | 70% | 90% | 50% | 80% |
| Maintenance | Laag | Medium | Laag | Medium |
| Vendor lock-in | Laag | Geen | Hoog | Medium |
| Kosten | €0 | €0 | €5-10/maand | €0 |
| Schaalbaarheid | Hoog | Zeer hoog | Medium | Hoog |
| **Totaal Score** | **8/10** | 7/10 | 6/10 | 7/10 |

---

## 🚀 NEXT STEPS

1. **Beslissing nemen** over architectuur richting
2. **Proof of Concept** voor gekozen optie (1 dag)
3. **Migratie plan** opstellen met milestones
4. **Start met hoogste impact pages** (Homepage/Gardens)
5. **Monitor & iterate** based on metrics

## ⚠️ BELANGRIJKE OVERWEGINGEN

### Technical Debt
De huidige quick fixes maken het probleem erger:
- Connection leak fix → symptoombestrijding
- Cache time increases → maskeert echte problemen
- Client-side optimizations → verkeerde layer

### Toekomstbestendigheid
- Next.js App Router is de toekomst
- Server Components worden de standaard
- Edge computing wordt belangrijker

### Team Skills
- Heeft team ervaring met Server Components?
- Is er tijd voor learning curve?
- Wie gaat het onderhouden?

---

## 💡 CONCLUSIE

**Stop met quick fixes.** De architectuur heeft een structurele aanpak nodig. 

Mijn advies: **Ga voor Optie 1 + 3** (Server Components + Edge Caching). Dit geeft:
- Beste ROI
- Moderne architectuur
- Incrementele migratie
- Lage risico's
- Platform-optimized (Vercel)

Begin met een **Proof of Concept** op de homepage. Als dat werkt, rol uit naar andere pagina's.