# Garden Management App - Screens Overview & Navigation Flow

## 📋 Complete Screen Inventory

### 🏠 **Main/Landing Screens**
| Screen | Path | Status | Purpose | Usage |
|--------|------|--------|---------|--------|
| **Home Page** | `/` | ✅ **ACTIVE** | Main dashboard with garden overview | Primary entry point |
| **Gardens Overview** | `/gardens` | ⚠️ **REDIRECTS** | Garden listing (redirects to home) | Redirects to `/` |
| **404 Not Found** | `*` | ✅ **ACTIVE** | Error page for invalid routes | Error handling |

### 🌿 **Garden Management Screens**
| Screen | Path | Status | Purpose | Usage |
|--------|------|--------|---------|--------|
| **New Garden** | `/gardens/new` | ✅ **ACTIVE** | Create new garden | Accessible from home |
| **Garden Details** | `/gardens/[id]` | ✅ **ACTIVE** | Individual garden management | Linked from home |
| **Garden Visual View** | `/gardens/[id]/plantvak-view` | ✅ **ACTIVE** | Visual garden layout | Linked from home ("Visueel" button) |
| **Garden Plant Beds** | `/gardens/[id]/plant-beds` | ✅ **ACTIVE** | Plant beds within specific garden | Navigation from garden details |
| **New Plant Bed (Garden)** | `/gardens/[id]/plant-beds/new` | ✅ **ACTIVE** | Create plant bed in specific garden | From garden plant beds view |
| **Garden Plant Bed Detail** | `/gardens/[id]/plant-beds/[bedId]` | ✅ **ACTIVE** | Specific plant bed in garden | From garden plant beds list |
| **Garden Plant Bed Plants** | `/gardens/[id]/plant-beds/[bedId]/plants` | ✅ **ACTIVE** | Plants in specific garden plant bed | From plant bed details |
| **New Plant (Garden Bed)** | `/gardens/[id]/plant-beds/[bedId]/plants/new` | ✅ **ACTIVE** | Add plant to garden plant bed | From plant bed plants view |

### 🌱 **Plant Bed Management Screens**
| Screen | Path | Status | Purpose | Usage |
|--------|------|--------|---------|--------|
| **Plant Beds Overview** | `/plant-beds` | ✅ **ACTIVE** | All plant beds listing | Accessible from home quick actions |
| **New Plant Bed** | `/plant-beds/new` | ✅ **ACTIVE** | Create new plant bed | From home & plant beds overview |
| **Plant Bed Details** | `/plant-beds/[id]` | ✅ **ACTIVE** | Individual plant bed management | From plant beds list |
| **Edit Plant Bed** | `/plant-beds/[id]/edit` | ✅ **ACTIVE** | Edit plant bed details | From plant bed details |
| **Plant Bed Layout** | `/plant-beds/[id]/layout` | ✅ **ACTIVE** | Visual layout design | From plant bed details |
| **Plant Bed Plants** | `/plant-beds/[id]/plants` | ✅ **ACTIVE** | Plants in specific plant bed | From plant bed details |
| **New Plant (Plant Bed)** | `/plant-beds/[id]/plants/new` | ✅ **ACTIVE** | Add plant to plant bed | From plant bed plants view |
| **Add Plant (General)** | `/plant-beds/add-plant` | ✅ **ACTIVE** | General plant adding interface | From plant bed details |
| **Plant Beds Layout Tool** | `/plant-beds/layout` | ✅ **ACTIVE** | Layout design tool | From plant beds overview |
| **Popular Flowers** | `/plant-beds/popular-flowers` | ✅ **ACTIVE** | Browse popular flower types | From add-plant screen |

### 👨‍💼 **Admin Screens**
| Screen | Path | Status | Purpose | Usage |
|--------|------|--------|---------|--------|
| **Admin Dashboard** | `/admin` | ✅ **ACTIVE** | Admin main interface | Direct access |
| **Admin Garden** | `/admin/garden` | ✅ **ACTIVE** | Garden management for admins | From admin dashboard |
| **Admin Plant Beds** | `/admin/plant-beds` | ✅ **ACTIVE** | Plant beds admin overview | From admin dashboard |
| **Admin New Plant Bed** | `/admin/plant-beds/new` | ✅ **ACTIVE** | Create plant bed (admin) | From admin plant beds |
| **Admin Plant Bed Config** | `/admin/plant-beds/configure` | ✅ **ACTIVE** | Configure plant bed settings | From admin plant beds |
| **Admin Plant Bed Layout** | `/admin/plant-beds/layout` | ✅ **ACTIVE** | Layout management (admin) | From admin plant beds |
| **Admin Plant Bed Details** | `/admin/plant-beds/[id]` | ✅ **ACTIVE** | Individual plant bed (admin) | From admin plant beds list |
| **Admin Edit Plant Bed** | `/admin/plant-beds/[id]/edit` | ✅ **ACTIVE** | Edit plant bed (admin) | From admin plant bed details |
| **Admin Add Plant** | `/admin/plant-beds/[id]/add-plant` | ✅ **ACTIVE** | Add plant (admin) | From admin plant bed details |
| **Admin Edit Plant** | `/admin/plant-beds/[id]/plants/[plantId]/edit` | ✅ **ACTIVE** | Edit individual plant (admin) | From admin plant bed plants |

### 🔧 **Utility Screens**
| Screen | Path | Status | Purpose | Usage |
|--------|------|--------|---------|--------|
| **Loading Components** | Various `loading.tsx` | ✅ **ACTIVE** | Loading states | Automatic during navigation |
| **Error Pages** | `error.tsx`, `global-error.tsx` | ✅ **ACTIVE** | Error handling | Automatic on errors |
| **Debug White Screen** | `debug-white-screen.tsx` | 🔧 **DEBUG** | Development debugging | Debug tool |

## 📊 **Usage Status Summary**

- **Total Screens**: 29 unique pages
- **Active Screens**: 28 (96.5%)
- **Redirecting Screens**: 1 (`/gardens` → `/`)
- **Debug/Development**: 1
- **Broken/Unused**: 0

## 🗺️ **Navigation Flow Diagram**

```mermaid
graph TD
    A[🏠 Home Page<br/>"/"] --> B[🌿 New Garden<br/>"/gardens/new"]
    A --> C[🌱 New Plant Bed<br/>"/plant-beds/new"]
    A --> D[📋 Plant Beds Overview<br/>"/plant-beds"]
    A --> E[👨‍💼 Admin Dashboard<br/>"/admin"]
    
    %% From Home - Garden Cards
    A --> F[🌿 Garden Details<br/>"/gardens/[id]"]
    A --> G[👁️ Garden Visual View<br/>"/gardens/[id]/plantvak-view"]
    
    %% Garden Management Flow
    F --> H[🌱 Garden Plant Beds<br/>"/gardens/[id]/plant-beds"]
    H --> I[➕ New Garden Plant Bed<br/>"/gardens/[id]/plant-beds/new"]
    H --> J[🌱 Garden Plant Bed Details<br/>"/gardens/[id]/plant-beds/[bedId]"]
    J --> K[🌿 Garden Bed Plants<br/>"/gardens/[id]/plant-beds/[bedId]/plants"]
    K --> L[➕ New Plant (Garden)<br/>"/gardens/[id]/plant-beds/[bedId]/plants/new"]
    
    %% Plant Bed Management Flow
    D --> M[🌱 Plant Bed Details<br/>"/plant-beds/[id]"]
    D --> N[🎨 Plant Beds Layout Tool<br/>"/plant-beds/layout"]
    
    M --> O[✏️ Edit Plant Bed<br/>"/plant-beds/[id]/edit"]
    M --> P[🎨 Plant Bed Layout<br/>"/plant-beds/[id]/layout"]
    M --> Q[🌿 Plant Bed Plants<br/>"/plant-beds/[id]/plants"]
    M --> R[➕ Add Plant<br/>"/plant-beds/add-plant"]
    
    Q --> S[➕ New Plant<br/>"/plant-beds/[id]/plants/new"]
    R --> T[🌺 Popular Flowers<br/>"/plant-beds/popular-flowers"]
    
    %% Admin Flow
    E --> U[🌿 Admin Garden<br/>"/admin/garden"]
    E --> V[🌱 Admin Plant Beds<br/>"/admin/plant-beds"]
    
    V --> W[➕ Admin New Plant Bed<br/>"/admin/plant-beds/new"]
    V --> X[⚙️ Admin Configure<br/>"/admin/plant-beds/configure"]
    V --> Y[🎨 Admin Layout<br/>"/admin/plant-beds/layout"]
    V --> Z[🌱 Admin Plant Bed Details<br/>"/admin/plant-beds/[id]"]
    
    Z --> AA[✏️ Admin Edit Plant Bed<br/>"/admin/plant-beds/[id]/edit"]
    Z --> BB[➕ Admin Add Plant<br/>"/admin/plant-beds/[id]/add-plant"]
    Z --> CC[✏️ Admin Edit Plant<br/>"/admin/plant-beds/[id]/plants/[plantId]/edit"]
    
    %% Redirects
    DD[📍 Gardens Overview<br/>"/gardens"] -.-> A
    
    %% Error Handling
    EE[❌ 404 Not Found<br/>"/*"] --> A
    
    %% Styling
    classDef active fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef redirect fill:#fff3e0,stroke:#ff9800,stroke-width:2px,stroke-dasharray: 5 5
    classDef admin fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    classDef error fill:#ffebee,stroke:#f44336,stroke-width:2px
    
    class A,B,C,D,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T active
    class DD redirect
    class E,U,V,W,X,Y,Z,AA,BB,CC admin
    class EE error
```

## 🔄 **Navigation Patterns**

### **Primary Navigation Flows:**

1. **🏠 Home → Garden Management**
   - Home → Garden Details → Plant Beds → Plants
   - Home → Visual Garden View (direct)

2. **🌱 Plant Bed Focused**
   - Home → Plant Beds Overview → Plant Bed Details → Plants
   - Plant Bed Details → Layout Design → Back to Details

3. **👨‍💼 Admin Management**
   - Admin Dashboard → Garden/Plant Bed Management
   - Full CRUD operations on all entities

4. **➕ Quick Creation**
   - Home → New Garden (quick action)
   - Home → New Plant Bed (quick action)

### **Key Navigation Components:**

- **Breadcrumbs**: Most screens have back navigation
- **Action Buttons**: Primary actions prominently displayed
- **Quick Actions**: Home page provides fast access to common tasks
- **Search**: Available on main listing pages

### **Unused/Redirecting Screens:**

- `/gardens` - **Redirects to home** (gardens overview is now integrated into home page)
- All other screens are actively used in the navigation flow

## 🎯 **Recommendations**

1. **All screens are well-connected** - No orphaned pages found
2. **Clear navigation hierarchy** - Logical flow from general to specific
3. **Admin section is properly separated** - Good separation of concerns
4. **Good error handling** - 404 and error pages are in place
5. **Consider removing** the redirect at `/gardens` if it's no longer needed
6. **Debug screen** can be removed in production builds

The app has a **well-structured navigation system** with clear user flows for both regular users and administrators.