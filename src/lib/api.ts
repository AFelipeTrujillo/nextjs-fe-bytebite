import { STORAGE_KEYS } from './constants';
import type {
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
  Ingredient,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  Recipe,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  MealPlan,
  CreateMealPlanRequest,
  ShoppingListResponse,
} from './types';

// ──────────────────────────────────────────────
// API Client Setup
// ──────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  window.location.href = '/';
}

// ──────────────────────────────────────────────
// Generic Request Helper
// ──────────────────────────────────────────────

export class ApiRequestError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiRequestError';
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — unauthorized
  if (res.status === 401) {
    clearToken();
    redirectToLogin();
    throw new ApiRequestError(401, 'Session expired. Please login again.');
  }

  // Handle 204 — No Content (successful DELETE)
  if (res.status === 204) {
    return undefined as T;
  }

  // Handle errors
  if (!res.ok) {
    let detail = 'An unexpected error occurred';
    try {
      const errorBody = await res.json();
      detail = errorBody.detail || JSON.stringify(errorBody);
    } catch {
      detail = res.statusText || detail;
    }
    throw new ApiRequestError(res.status, detail);
  }

  // Parse response JSON
  const data = await res.json();
  return data as T;
}

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest) =>
    request<RegisterResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: async (username: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams({ username, password });

    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!res.ok) {
      let detail = 'Login failed';
      try {
        const errorBody = await res.json();
        detail = errorBody.detail || detail;
      } catch {
        detail = res.statusText || detail;
      }
      throw new ApiRequestError(res.status, detail);
    }

    return res.json();
  },
};

// ──────────────────────────────────────────────
// Ingredients API
// ──────────────────────────────────────────────

export const ingredientsApi = {
  list: () => request<Ingredient[]>('/api/v1/ingredients/'),

  get: (id: string) => request<Ingredient>(`/api/v1/ingredients/${id}`),

  create: (data: CreateIngredientRequest) =>
    request<Ingredient>('/api/v1/ingredients/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateIngredientRequest) =>
    request<Ingredient>(`/api/v1/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/v1/ingredients/${id}`, {
      method: 'DELETE',
    }),
};

// ──────────────────────────────────────────────
// Recipes API
// ──────────────────────────────────────────────

export const recipesApi = {
  list: () => request<Recipe[]>('/api/v1/recipes/'),

  get: (id: string) => request<Recipe>(`/api/v1/recipes/${id}`),

  create: (data: CreateRecipeRequest) =>
    request<Recipe>('/api/v1/recipes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateRecipeRequest) =>
    request<Recipe>(`/api/v1/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/v1/recipes/${id}`, {
      method: 'DELETE',
    }),
};

// ──────────────────────────────────────────────
// Meal Plans API
// ──────────────────────────────────────────────

export const mealPlansApi = {
  list: () => request<MealPlan[]>('/api/v1/meal-plans/'),

  get: (id: string) => request<MealPlan>(`/api/v1/meal-plans/${id}`),

  create: (data: CreateMealPlanRequest) =>
    request<MealPlan>('/api/v1/meal-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ──────────────────────────────────────────────
// Shopping List API
// ──────────────────────────────────────────────

export const shoppingListApi = {
  get: (mealPlanId: string) =>
    request<ShoppingListResponse>(
      `/api/v1/shopping-list/${mealPlanId}`
    ),
};
