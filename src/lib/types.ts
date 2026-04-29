// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  full_name?: string;
  message: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ──────────────────────────────────────────────
// Ingredients
// ──────────────────────────────────────────────

export interface Ingredient {
  id: string;
  name: string;
  category: string;
}

export interface CreateIngredientRequest {
  name: string;
  category: string;
}

export interface UpdateIngredientRequest {
  name?: string;
  category?: string;
}

// ──────────────────────────────────────────────
// Recipes
// ──────────────────────────────────────────────

export type UnitType =
  | 'GRAMS'
  | 'KILOGRAMS'
  | 'UNITS'
  | 'MILLILITERS'
  | 'LITERS'
  | 'TEASPOONS'
  | 'TABLESPOONS'
  | 'CUPS'
  | 'CLOVE';

export interface IngredientQuantity {
  amount: number;
  unit: UnitType;
}

export interface RecipeIngredient {
  ingredient_id: string;
  quantity: IngredientQuantity;
  ingredient_name?: string;
}

export interface Recipe {
  id: string;
  owner_id: string;
  name: string;
  ingredients: RecipeIngredient[];
  references: string[];
}

export interface CreateRecipeRequest {
  name: string;
  ingredients: RecipeIngredient[];
  references?: string[];
}

export interface UpdateRecipeRequest {
  name?: string;
  ingredients?: RecipeIngredient[];
  references?: string[];
}

// ──────────────────────────────────────────────
// Meal Plans
// ──────────────────────────────────────────────

export interface DailyPlan {
  lunch_recipe_id: string | null;
  dinner_recipe_id: string | null;
}

export interface MealPlan {
  id: string;
  owner_id: string;
  year: number;
  week_number: number;
  days: Record<string, DailyPlan>;
}

export interface CreateMealPlanRequest {
  year: number;
  week_number: number;
  days: Record<string, DailyPlan>;
}

// ──────────────────────────────────────────────
// Shopping List
// ──────────────────────────────────────────────

export interface ShoppingListItem {
  ingredient_id: string;
  ingredient_name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
}

export interface CategoryGroup {
  category: string;
  items: ShoppingListItem[];
}

export interface ShoppingListResponse {
  meal_plan_id: string;
  categories: CategoryGroup[];
}

// ──────────────────────────────────────────────
// API Error
// ──────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}
