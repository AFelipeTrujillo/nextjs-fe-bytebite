# ByteBite Frontend — Implementation Plan

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **HTTP Client**: Native `fetch` wrapper
- **Auth**: JWT stored in `localStorage`, managed via React Context
- **Notifications**: `sonner` (shadcn/ui toast system)
- **Icons**: Lucide React (included with shadcn/ui)

---

## Step 1: Project Setup & API Client

### Files to create/modify:
- `.env.local` — Environment variable for API base URL
- `src/lib/api.ts` — Centralized HTTP client with auth interceptor
- `src/lib/types.ts` — TypeScript interfaces matching API schemas
- `src/lib/constants.ts` — Units list, categories list, etc.

### Technical Details:

#### `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### `src/lib/types.ts`
Define all TypeScript interfaces based on OpenAPI schemas:
```typescript
// Auth
interface RegisterRequest { email: string; password: string; full_name?: string; }
interface RegisterResponse { id: string; email: string; full_name?: string; message: string; }
interface TokenResponse { access_token: string; token_type: string; }

// Ingredients
interface Ingredient { id: string; name: string; category: string; }
interface CreateIngredientRequest { name: string; category: string; }
interface UpdateIngredientRequest { name?: string; category?: string; }

// Recipes
interface IngredientQuantity { amount: number; unit: UnitType; }
interface RecipeIngredient { ingredient_id: string; quantity: IngredientQuantity; ingredient_name?: string; }
interface Recipe { id: string; owner_id: string; name: string; ingredients: RecipeIngredient[]; references: string[]; }
interface CreateRecipeRequest { name: string; ingredients: RecipeIngredient[]; references?: string[]; }
interface UpdateRecipeRequest { name?: string; ingredients?: RecipeIngredient[]; references?: string[]; }

// Meal Plans
interface DailyPlan { lunch_recipe_id: string | null; dinner_recipe_id: string | null; }
interface MealPlan { id: string; owner_id: string; year: number; week_number: number; days: Record<string, DailyPlan>; }
interface CreateMealPlanRequest { year: number; week_number: number; days: Record<string, DailyPlan>; }

// Shopping List
interface ShoppingListItem { ingredient_id: string; ingredient_name: string; amount: number; unit: string; category: string; checked: boolean; }
interface CategoryGroup { category: string; items: ShoppingListItem[]; }
interface ShoppingListResponse { meal_plan_id: string; categories: CategoryGroup[]; }

// Units
type UnitType = 'GRAMS' | 'KILOGRAMS' | 'UNITS' | 'MILLILITERS' | 'LITERS' | 'TEASPOONS' | 'TABLESPOONS' | 'CUPS' | 'CLOVE';
```

#### `src/lib/api.ts`
Create a class/functions that:
- Reads token from `localStorage` (key: `bytebite_token`)
- Adds `Authorization: Bearer <token>` header automatically
- Handles base URL from `NEXT_PUBLIC_API_URL`
- Provides typed methods for all endpoints
- On 401 response, clears token and redirects to `/`
- Wraps `fetch` with error handling, JSON parsing

```typescript
// Example structure:
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('bytebite_token');
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...options?.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (res.status === 401) {
    localStorage.removeItem('bytebite_token');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(res.status, error.detail || 'Request failed');
  }
  
  return res.json();
}

// Auth
export const auth = {
  register: (data: RegisterRequest) => request<RegisterResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (username: string, password: string) => {
    // Login uses form-urlencoded
    const formData = new URLSearchParams({ username, password });
    return fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    }).then(res => res.json());
  },
};

// Ingredients, Recipes, MealPlans, ShoppingList follow same pattern
```

---

## Step 2: Authentication Context & Route Protection

### Files to create:
- `src/lib/auth-context.tsx` — React context for auth state
- `src/lib/protected-route.tsx` — HOC or wrapper component

### Technical Details:

#### `src/lib/auth-context.tsx`
- Provides: `user` (decoded token info), `token`, `login()`, `register()`, `logout()`, `isAdmin`, `isLoading`
- On mount, checks `localStorage` for existing token
- Decodes JWT payload (base64 decode — no library needed) to get `sub` (user ID) and `role`
- `login()` calls API, stores token, updates state
- `logout()` clears token and state, redirects to `/`

```typescript
interface AuthState {
  user: { id: string; email: string; role: 'admin' | 'user' } | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}
```

#### Route Protection
- Create a reusable `AuthGuard` component that checks auth state
- If not authenticated, redirect to `/`
- Show loading spinner while checking auth
- Wrap dashboard pages with `AuthGuard`

---

## Step 3: Login & Register Pages

### Files to create:
- `src/app/page.tsx` — Update landing/login page
- `src/app/auth/register/page.tsx` — Registration form

### Technical Details:

#### Login Page (`/`)
- Clean centered card layout
- Email + password form fields
- Submit calls `auth.login(email, password)`
- On success, redirect to `/dashboard`
- Show error messages using `sonner` toast
- Link to register page
- If already logged in (token exists), redirect to `/dashboard`

#### Register Page (`/auth/register`)
- Form with email, password, full name (optional)
- Validation: email format, password min length
- Submit calls `auth.register(email, password, fullName)`
- On success, show success toast + redirect to `/` (login)
- Link back to login

---

## Step 4: Layout & Navigation

### Files to create/modify:
- `src/app/layout.tsx` — Update with AuthProvider, Toaster, Navbar
- `src/components/layout/header.tsx` — Navigation header
- `src/components/layout/sidebar.tsx` — Optional sidebar for dashboard

### Technical Details:

#### Root Layout
- Wrap app with `AuthProvider`
- Add `<Toaster />` from `sonner`
- Add `<Header />` component

#### Header/Navbar
- Logo + "ByteBite" brand name
- Navigation links: Dashboard, Meal Plans
- User menu (dropdown): email display, admin link (if admin), logout button
- Responsive: hamburger menu on mobile

#### Route Groups
```
src/app/
├── (auth)/            # Login/Register - no header
│   └── page.tsx
├── (dashboard)/       # Authenticated routes
│   ├── layout.tsx     # Header + main content
│   ├── dashboard/
│   ├── recipes/
│   ├── meal-plans/
│   ├── shopping-list/
│   └── admin/
└── layout.tsx         # Root layout with providers
```

---

## Step 5: Dashboard & Recipe List

### Files to create:
- `src/app/dashboard/page.tsx` — Main dashboard with recipe cards
- `src/components/recipes/recipe-card.tsx` — Recipe card component
- `src/components/recipes/recipe-list.tsx` — Recipe list/grid

### Technical Details:

#### Dashboard
- Fetches `GET /api/v1/recipes/` on mount
- Shows loading skeleton state
- Displays recipes as cards in a responsive grid
- Each card shows: recipe name, ingredient count, quick action buttons
- Empty state: "No recipes yet. Create your first recipe!"
- Floating action button to create new recipe

#### Recipe Card
- Card with recipe name
- Badge showing count of ingredients
- Dropdown menu: View, Edit, Delete
- Delete shows confirmation dialog
- Click card → navigate to `/recipes/[id]`

---

## Step 6: Create/Edit Recipe

### Files to create:
- `src/app/recipes/new/page.tsx` — Create recipe form
- `src/app/recipes/[id]/page.tsx` — View/Edit recipe
- `src/components/recipes/recipe-form.tsx` — Shared form component
- `src/components/recipes/ingredient-selector.tsx` — Dynamic ingredient input

### Technical Details:

#### Recipe Form (`recipe-form.tsx`)
- Fields: Recipe name (text input), Ingredients (dynamic list), References (URLs)
- For ingredients:
  - Searchable dropdown of ingredients (fetched from `GET /api/v1/ingredients/`)
  - Quantity input (number)
  - Unit selector (dropdown with all unit types)
  - Add/remove ingredient rows
  - Each row has: ingredient select, amount input, unit select, remove button
- References: Add/remove URL input fields
- Submit: POST for create, PUT for update
- Cancel button → back to dashboard

#### View Recipe (`/recipes/[id]`)
- Display mode by default
- Edit button toggles to edit mode
- Reuses the same form component in view mode (disabled inputs) or edit mode
- Shows ingredient names (resolved from IDs)
- Delete button with confirmation

#### Data Flow
1. Load all ingredients for the dropdown
2. For edit mode, load recipe data via `GET /api/v1/recipes/{id}`
3. Map ingredient IDs to names for display
4. On submit, send only ingredient IDs + quantities

---

## Step 7: Meal Plans (Calendar View)

### Files to create:
- `src/app/meal-plans/page.tsx` — Meal plan list/calendar
- `src/app/meal-plans/[id]/page.tsx` — Meal plan detail
- `src/app/meal-plans/new/page.tsx` — Create meal plan
- `src/components/meal-plans/week-calendar.tsx` — Weekly grid component
- `src/components/meal-plans/day-slot.tsx` — Day cell with lunch/dinner

### Technical Details:

#### Meal Plan List (`/meal-plans`)
- Fetches `GET /api/v1/meal-plans/`
- Displays plans as an accordion/list sorted by most recent
- Each item shows: "Week {week_number}, {year}" and expandable day details
- "Create New Plan" button

#### Create Meal Plan (`/meal-plans/new`)
- Week selector: year input + week number input (1-53)
- Or use a date picker to auto-calculate week number
- Day grid (Monday to Sunday)
- Each day slot:
  - Lunch: dropdown to select recipe (fetched from user's recipes)
  - Dinner: dropdown to select recipe
  - "None" option to clear a slot
- Submit creates the plan via `POST /api/v1/meal-plans`
- Show "Generate Shopping List" button after creation

#### Meal Plan Detail (`/meal-plans/[id]`)
- Read-only view of the weekly plan
- Shows the 7-day grid with assigned recipes
- Each recipe name is clickable → navigates to recipe detail
- "View Shopping List" button → `/shopping-list/[id]`
- "Edit" button to modify the plan

#### Weekly Calendar Grid
```
| Day       | Lunch          | Dinner         |
|-----------|---------------|----------------|
| Monday    | Recipe Name   | —              |
| Tuesday   | —             | Recipe Name    |
| ...       | ...           | ...            |
| Sunday    | Recipe Name   | Recipe Name    |
```

---

## Step 8: Shopping List

### Files to create:
- `src/app/shopping-list/[id]/page.tsx` — Shopping list display

### Technical Details:

#### Shopping List Page
- Fetches `GET /api/v1/shopping-list/{meal_plan_id}`
- Displays ingredients grouped by category
- Each category is a section/card with:
  - Category title (e.g., "Vegetables & Greens")
  - List of items with checkboxes (checked: false by default)
- Items show: checkbox, ingredient name, amount, unit
- Checkbox toggles `checked` state (locally for now — no API for saving yet)
- "Print" or "Export" option (optional)
- Link back to the associated meal plan

#### UI Layout
```
┌─────────────────────────────┐
│ 🛒 Shopping List            │
│ Week 11, 2026               │
├─────────────────────────────┤
│ 🥦 Vegetables & Greens      │
│ ☐ Garlic — 5 cloves         │
│ ☐ Onion — 2 units           │
├─────────────────────────────┤
│ 🥛 Dairy & Eggs             │
│ ☐ Milk — 500 ml             │
│ ☐ Eggs — 6 units            │
└─────────────────────────────┘
```

---

## Step 9: Admin — Ingredient Management

### Files to create:
- `src/app/admin/ingredients/page.tsx` — Ingredient CRUD
- `src/components/admin/ingredient-dialog.tsx` — Create/Edit ingredient dialog
- `src/components/admin/ingredient-table.tsx` — Ingredients data table

### Technical Details:

#### Ingredient List Page
- Guard: Only accessible if `user.role === 'admin'`
- Fetches `GET /api/v1/ingredients/`
- Displays in a table: Name, Category, Actions (Edit, Delete)
- Filter by category dropdown
- Search by name (client-side filter)

#### Create/Edit Dialog
- Dialog/modal with:
  - Ingredient name (text input)
  - Category (dropdown with all available categories)
- Submit: POST for create, PUT for update
- On success: refresh list, show toast

#### Delete
- Confirmation dialog before deleting
- Calls `DELETE /api/v1/ingredients/{id}`
- On success: remove from list, show toast

---

## Step 10: Polish & Error Handling

### Tasks:
- Add loading skeletons for all pages
- Add error boundaries
- Handle empty states (no recipes, no meal plans)
- Responsive design pass (mobile-friendly)
- Add page transitions/animations (optional)
- Test all flows end-to-end

### Error Handling Strategy:
- `ApiError` class with status code and message
- Toast notifications for all errors
- Form validation errors shown inline
- Network errors caught and displayed gracefully

---

## File Tree (Final Structure)

```
src/
├── app/
│   ├── layout.tsx                 # Root layout (providers, toaster)
│   ├── globals.css                # Tailwind + shadcn styles
│   ├── page.tsx                   # Login page
│   ├── auth/
│   │   └── register/
│   │       └── page.tsx           # Register page
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard
│   ├── recipes/
│   │   ├── new/
│   │   │   └── page.tsx           # Create recipe
│   │   └── [id]/
│   │       └── page.tsx           # View/Edit recipe
│   ├── meal-plans/
│   │   ├── page.tsx               # Meal plans list
│   │   ├── new/
│   │   │   └── page.tsx           # Create meal plan
│   │   └── [id]/
│   │       └── page.tsx           # Meal plan detail
│   ├── shopping-list/
│   │   └── [id]/
│   │       └── page.tsx           # Shopping list
│   └── admin/
│       └── ingredients/
│           └── page.tsx           # Admin ingredient management
├── components/
│   ├── layout/
│   │   └── header.tsx             # Navigation header
│   ├── recipes/
│   │   ├── recipe-card.tsx        # Recipe card component
│   │   ├── recipe-form.tsx        # Create/Edit form
│   │   └── ingredient-selector.tsx # Dynamic ingredient input
│   ├── meal-plans/
│   │   ├── week-calendar.tsx      # Weekly calendar grid
│   │   └── day-slot.tsx           # Day cell component
│   └── admin/
│       ├── ingredient-dialog.tsx   # Create/Edit ingredient modal
│       └── ingredient-table.tsx    # Ingredients table
├── lib/
│   ├── api.ts                     # HTTP client
│   ├── types.ts                   # TypeScript interfaces
│   ├── constants.ts               # Units, categories
│   └── auth-context.tsx           # Auth context provider
```

---

## Order of Implementation

| Step | Description | Dependencies |
|------|-------------|-------------|
| 1 | Project setup, API client, types | None |
| 2 | Auth context & route protection | Step 1 |
| 3 | Login & Register pages | Step 2 |
| 4 | Layout & navigation | Step 2 |
| 5 | Dashboard & recipe list | Step 4 |
| 6 | Create/Edit recipe | Step 5 |
| 7 | Meal plans (calendar) | Step 5 |
| 8 | Shopping list | Step 7 |
| 9 | Admin ingredients | Step 4 |
| 10 | Polish & error handling | All steps |
