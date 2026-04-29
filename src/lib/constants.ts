import type { UnitType } from './types';

// ──────────────────────────────────────────────
// Available Units
// ──────────────────────────────────────────────

export const UNITS: { label: string; value: UnitType }[] = [
  { label: 'Grams', value: 'GRAMS' },
  { label: 'Kilograms', value: 'KILOGRAMS' },
  { label: 'Units', value: 'UNITS' },
  { label: 'Milliliters', value: 'MILLILITERS' },
  { label: 'Liters', value: 'LITERS' },
  { label: 'Teaspoons', value: 'TEASPOONS' },
  { label: 'Tablespoons', value: 'TABLESPOONS' },
  { label: 'Cups', value: 'CUPS' },
  { label: 'Clove', value: 'CLOVE' },
];

// ──────────────────────────────────────────────
// Ingredient Categories (available in the API)
// ──────────────────────────────────────────────

export const CATEGORIES = [
  'Vegetables & Greens',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Pantry Essentials',
  'Herbs & Spices',
  'Fresh Fruits',
  'Frozen Foods',
  'Everything Else',
] as const;

// ──────────────────────────────────────────────
// Local Storage Keys
// ──────────────────────────────────────────────

export const STORAGE_KEYS = {
  TOKEN: 'bytebite_token',
} as const;

// ──────────────────────────────────────────────
// Route Paths
// ──────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  RECIPES_NEW: '/recipes/new',
  MEAL_PLANS: '/meal-plans',
  MEAL_PLANS_NEW: '/meal-plans/new',
  ADMIN_INGREDIENTS: '/admin/ingredients',
  RECIPE: (id: string) => `/recipes/${id}`,
  MEAL_PLAN: (id: string) => `/meal-plans/${id}`,
  SHOPPING_LIST: (id: string) => `/shopping-list/${id}`,
} as const;
