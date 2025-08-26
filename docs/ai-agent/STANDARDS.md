# 🏦 Banking-Grade Standards

**Implementatie van Nederlandse banking standaarden en security requirements**

## 🚨 SECURITY-FIRST DEVELOPMENT

### **Database Wijzigingen**
- Elke database wijziging MOET audit logging hebben
- Elke user input MOET gevalideerd worden (SQL injection, XSS, path traversal)
- Elke nieuwe functie MOET RLS-ready zijn (ook al is RLS nog uit)
- Elke API endpoint MOET authentication checks hebben
- Elke gevoelige operatie MOET comprehensive logging hebben

### **Deployment Safety - Zero-Downtime Principe**
- ALTIJD backwards compatible wijzigingen maken
- ALTIJD IF NOT EXISTS gebruiken bij CREATE statements
- ALTIJD graceful fallbacks implementeren
- ALTIJD rollback procedures documenteren
- NOOIT breaking changes zonder migratie strategie

### **Code Kwaliteit Standards**
- Elke functie MOET error handling hebben
- Elke SQL query MOET performance optimized zijn (indexes, EXPLAIN ANALYZE)
- Elke nieuwe tabel MOET proper constraints en indexes hebben
- Elke API response MOET consistent error format hebben
- Elke security functie MOET uitgebreid getest worden

## 🎨 Nederlandse Banking UI/UX Standards

### **Navigatie & Informatie Architectuur**
- **Breadcrumbs**: Altijd tonen waar gebruiker is (Home > Gardens > Plant Details)
- **Clear Navigation**: Maximum 7 items in hoofdmenu (Miller's Rule)
- **Consistent Layout**: Header, sidebar, main content, footer structuur
- **Progressive Disclosure**: Complexe informatie stap-voor-stap onthullen
- **Search & Filter**: Altijd beschikbaar voor data-heavy pagina's
- **Back Button**: Altijd functioneel, ook in SPA's

### **Accessibility (WCAG 2.1 AA Compliant)**
- **Keyboard Navigation**: Tab order logisch, alle functies bereikbaar
- **Screen Reader**: Proper ARIA labels, semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio voor normale tekst, 3:1 voor grote tekst
- **Focus Indicators**: Duidelijk zichtbaar welk element focus heeft
- **Alternative Text**: Alle afbeeldingen hebben betekenisvolle alt tekst
- **Language**: HTML lang attribute correct ingesteld (nl-NL)

### **Responsive Design (Mobile-First)**
- **Breakpoints**: 320px (mobile), 768px (tablet), 1024px (desktop), 1440px (large)
- **Touch Targets**: Minimum 44px x 44px (iOS/Android guidelines)
- **Readable Text**: Minimum 16px font-size op mobile
- **Thumb-Friendly**: Belangrijke acties binnen thumb reach
- **Loading States**: Skeleton screens voor betere perceived performance
- **Offline Support**: Graceful degradation bij netwerkproblemen

### **Forms & Input Validation (Banking-Grade)**
- **Real-time Validation**: Feedback tijdens typen, niet alleen bij submit
- **Clear Error Messages**: Specifiek wat er fout is en hoe het op te lossen
- **Success Indicators**: Bevestiging van succesvolle acties
- **Required Fields**: Duidelijk gemarkeerd met * en aria-required
- **Input Types**: Correct HTML5 input types (email, tel, number, date)
- **Autocomplete**: Proper autocomplete attributes voor betere UX

### **Content & Typography**
- **Scannable Content**: Headers, bullet points, korte paragrafen
- **Typography Scale**: Consistent gebruik van heading hierarchy (h1-h6)
- **Line Height**: 1.4-1.6 voor optimale leesbaarheid
- **Content Width**: Maximum 75 karakters per regel voor lange teksten
- **White Space**: Generous gebruik van white space voor rust
- **Dutch Language**: Alle content in correct Nederlands, geen Dunglish

### **Performance & Loading**
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Progressive Loading**: Critical content eerst, dan enhancement
- **Image Optimization**: WebP format, proper sizing, lazy loading
- **Bundle Splitting**: Route-based code splitting
- **Caching Strategy**: Aggressive caching voor statische assets
- **Loading Indicators**: Voor acties > 200ms

## 📱 UI Component Templates

### **Navigation Component Template**
```typescript
// Altijd deze navigatie structuur gebruiken
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  requiredPermission?: string;
}

export function BankingNavigation() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  
  const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <HomeIcon /> },
    { href: '/gardens', label: 'Tuinen', icon: <GardenIcon /> },
    { href: '/plants', label: 'Planten', icon: <PlantIcon /> },
    { href: '/logbook', label: 'Logboek', icon: <BookIcon /> },
    { href: '/admin', label: 'Beheer', icon: <AdminIcon />, requiredPermission: 'admin' },
  ];
  
  // Filter items based on permissions
  const visibleItems = navItems.filter(item => 
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );
  
  return (
    <nav className="banking-nav" role="navigation" aria-label="Hoofdnavigatie">
      <ul className="flex space-x-4">
        {visibleItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### **Form Component Template**
```typescript
// Banking-grade form met validation en accessibility
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { validateInput } from '@/lib/banking-security';

interface FormData {
  [key: string]: any;
}

export function BankingForm({ 
  onSubmit, 
  schema, 
  children,
  title,
  description 
}: {
  onSubmit: (data: FormData) => Promise<void>;
  schema: any;
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<FormData>({
    resolver: schema,
    mode: 'onChange' // Real-time validation
  });
  
  const onSubmitHandler = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Client-side validation
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && !validateInput(value, 1000, false)) {
          throw new Error(`Ongeldige invoer in veld: ${key}`);
        }
      }
      
      await onSubmit(data);
      
      // Success feedback
      // Show success message or redirect
      
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Er is een fout opgetreden');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit(onSubmitHandler)}
      className="banking-form"
      noValidate // We handle validation ourselves
    >
      <div className="form-header">
        <h1 className="form-title">{title}</h1>
        {description && (
          <p className="form-description">{description}</p>
        )}
      </div>
      
      <div className="form-content">
        {children}
      </div>
      
      {submitError && (
        <div 
          className="error-message" 
          role="alert"
          aria-live="polite"
        >
          {submitError}
        </div>
      )}
      
      <div className="form-actions">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="btn-primary"
          aria-describedby={submitError ? "submit-error" : undefined}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              <span>Bezig met opslaan...</span>
            </>
          ) : (
            'Opslaan'
          )}
        </button>
      </div>
    </form>
  );
}
```

### **Data Table Component Template**
```typescript
// Banking-grade data table met sorting, filtering, pagination
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-supabase-auth';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export function BankingDataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchable = true,
  pagination = true,
  pageSize = 10
}: {
  data: T[];
  columns: Column<T>[];
  title: string;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;
    
    // Search filtering
    if (searchTerm && searchable) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection]);
  
  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = pagination 
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;
  
  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  return (
    <div className="banking-data-table">
      <div className="table-header">
        <h2 className="table-title">{title}</h2>
        
        {searchable && (
          <div className="search-container">
            <label htmlFor="table-search" className="sr-only">
              Zoeken in {title}
            </label>
            <input
              id="table-search"
              type="search"
              placeholder={`Zoeken in ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}
      </div>
      
      <div className="table-container" role="region" aria-label={`${title} tabel`}>
        <table className="data-table" role="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={column.sortable ? 'sortable' : ''}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  aria-sort={
                    sortColumn === column.key 
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  {column.label}
                  {column.sortable && sortColumn === column.key && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && totalPages > 1 && (
        <div className="pagination" role="navigation" aria-label="Paginering">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Vorige pagina"
          >
            Vorige
          </button>
          
          <span className="page-info">
            Pagina {currentPage} van {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Volgende pagina"
          >
            Volgende
          </button>
        </div>
      )}
    </div>
  );
}
```

### **Loading State Template**
```typescript
// Banking-grade loading states
export function BankingLoadingState({ 
  type = 'page',
  message = 'Laden...'
}: {
  type?: 'page' | 'component' | 'button' | 'table';
  message?: string;
}) {
  const skeletonConfig = {
    page: { rows: 8, height: 'h-4' },
    component: { rows: 3, height: 'h-3' },
    button: { rows: 1, height: 'h-8' },
    table: { rows: 5, height: 'h-4' }
  };
  
  const config = skeletonConfig[type];
  
  return (
    <div 
      className="banking-loading"
      role="status" 
      aria-live="polite"
      aria-label={message}
    >
      <div className="skeleton-container">
        {Array.from({ length: config.rows }, (_, i) => (
          <div 
            key={i}
            className={`skeleton ${config.height} animate-pulse bg-gray-200 rounded mb-2`}
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
      
      <span className="sr-only">{message}</span>
    </div>
  );
}
```

## 🚀 Deployment Success Garantie

### **Pre-Deployment Checklist (Automatisch Toepassen)**
```sql
-- Altijd deze patronen gebruiken:
CREATE TABLE IF NOT EXISTS...
CREATE INDEX IF NOT EXISTS...
CREATE OR REPLACE FUNCTION...
ALTER TABLE ... ADD COLUMN IF NOT EXISTS...

-- Nooit deze patronen gebruiken:
DROP TABLE ... (gebruik soft deletes)
ALTER TABLE ... DROP COLUMN ... (gebruik deprecation)
DELETE FROM ... (gebruik status updates)
```

### **Fout-Resistente Patterns**
- Gebruik COALESCE voor NULL handling
- Gebruik TRY-CATCH equivalenten (BEGIN/EXCEPTION/END)
- Gebruik parameter validation in alle functies
- Gebruik typed parameters (UUID, TIMESTAMPTZ, etc.)
- Gebruik CHECK constraints voor data integrity

### **Monitoring & Alerting (Altijd Implementeren)**
- Log alle database schema wijzigingen
- Monitor performance impact van nieuwe queries
- Track error rates na deployments
- Alert bij unusual security events
- Measure deployment success rates

---

**Laatste update**: 25-08-2025  
**Versie**: 1.0.0  
**Status**: Actief - Verplicht voor alle AI agents