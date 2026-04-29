# ByteBite Frontend — Project Brief

## Project Overview

ByteBite is a personal recipe management and weekly meal planning API. Users can register, manage their recipes, plan weekly meals, and generate a categorized shopping list for the supermarket.

- **Backend**: Python FastAPI (Clean Architecture)
- **Database**: MongoDB Atlas (remote)
- **API Spec**: See `openapi.json` for the complete OpenAPI 3.1 specification
- **Base URL**: `http://localhost:8000`

---

## Recommended Tech Stack (Next.js)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **HTTP Client**: `fetch` or `axios`
- **Auth**: JWT stored in httpOnly cookies or localStorage (your choice)
- **UI**: Tailwind CSS + shadcn/ui (recommended, but your call)

---

## Core User Flows

### 1. Authentication
- User registers with email + password (`POST /api/v1/auth/register`)
- User logs in to get JWT token (`POST /api/v1/auth/login` — form-urlencoded with `username` and `password`)
- All subsequent endpoints require `Authorization: Bearer <token>` header
- Token contains user ID (`sub`) and role (`role`: `"admin"` | `"user"`)

### 2. Ingredient Catalog (Admin-managed)
- `GET /api/v1/ingredients/` — List all ingredients (public for logged users)
- Each ingredient has: `id`, `name`, `category`
- The ingredient catalog is read-only for regular users. Only admins can create/update/delete.
- **Categories available**: Vegetables & Greens, Dairy & Eggs, Meat & Seafood, Pantry Essentials, Herbs & Spices, Fresh Fruits, Frozen Foods, Everything Else.

### 3. Recipe Management
- Users can create, view, update, and delete their own recipes
- `POST /api/v1/recipes` — Create recipe with name, ingredients (list of ingredient_id + quantity), and optional references
- `GET /api/v1/recipes/` — List all user's recipes
- `GET /api/v1/recipes/{id}` — Get single recipe (owner only)
- `PUT /api/v1/recipes/{id}` — Update recipe (owner only)
- `DELETE /api/v1/recipes/{id}` — Delete recipe (owner only)
- **Ingredients format**: `{ "ingredient_id": "uuid", "quantity": { "amount": 200, "unit": "GRAMS" } }`
- **Available units**: `GRAMS`, `KILOGRAMS`, `UNITS`, `MILLILITERS`, `LITERS`, `TEASPOONS`, `TABLESPOONS`, `CUPS`, `CLOVE`

### 4. Weekly Meal Planning (Calendar View)
- Users create weekly meal plans for a specific year + week number
- Each day can have a lunch recipe and a dinner recipe
- `POST /api/v1/meal-plans` — Create plan with year, week_number, and days
- `GET /api/v1/meal-plans/` — List all user's plans (sorted by most recent first) — ideal for a calendar/accordion view
- `GET /api/v1/meal-plans/{id}` — Get single plan detail

### 5. Shopping List Generation
- `GET /api/v1/shopping-list/{meal_plan_id}` — Generate categorized shopping list
- Returns ingredients grouped by category (e.g., "Vegetables & Greens", "Dairy & Eggs")
- Within each category, items are sorted alphabetically
- Duplicate ingredients across recipes are consolidated (e.g., 200g flour + 300g flour = 500g flour)
- Each item includes a `checked: false` field (future interactivity)
- **Only the owner** of the meal plan can access its shopping list

---

## Authentication Flow

1. User registers or logs in
2. Backend returns `{ "access_token": "eyJ...", "token_type": "bearer" }`
3. Store the token (localStorage or cookie)
4. Include in all requests: `Authorization: Bearer eyJ...`
5. If you get a `401`, redirect to login page

---

## Key Response Formats

### Shopping List (grouped)
```json
{
  "meal_plan_id": "uuid",
  "categories": [
    {
      "category": "Vegetables & Greens",
      "items": [
        {
          "ingredient_id": "uuid",
          "ingredient_name": "Garlic",
          "amount": 5,
          "unit": "CLOVE",
          "category": "Vegetables & Greens",
          "checked": false
        }
      ]
    }
  ]
}
```

### Meal Plan
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "year": 2026,
  "week_number": 11,
  "days": {
    "1": { "lunch_recipe_id": "uuid", "dinner_recipe_id": null },
    "2": { "lunch_recipe_id": null, "dinner_recipe_id": "uuid" }
  }
}
```

### Recipe
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "name": "Pasta Carbonara",
  "ingredients": [
    {
      "ingredient_id": "uuid",
      "ingredient_name": "Pasta",
      "quantity": { "amount": 200, "unit": "GRAMS" }
    }
  ],
  "references": ["https://example.com/carbonara"],
  "invited_users": []
}
```

---

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (POST resources) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not your resource or not admin) |
| 404 | Not Found |
| 409 | Conflict (duplicate email or ingredient name) |
| 422 | Validation Error (check request body) |

---

## Suggested Pages/Routes (Next.js App Router)

```
/                    → Landing / Login page
/auth/register       → Registration form
/dashboard           → Main dashboard (recipe list)
/recipes/new         → Create recipe
/recipes/[id]        → View/Edit recipe
/meal-plans          → Calendar view with week selector
/meal-plans/[id]     → Weekly meal plan detail
/shopping-list/[id]  → Shopping list display
/admin/ingredients   → Ingredient management (admin only)
```

---

## Getting Started

```bash
# Create Next.js project
npx create-next-app@latest bytebite-frontend --typescript --tailwind --app

# Run the frontend (default port 3000)
npm run dev
```

Make sure the backend is running on `http://localhost:8000`. If you need to change the backend URL, set it in an `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Complete API Reference

All endpoints, request/response schemas, and error codes are documented in the `openapi.json` file included in this repository. You can also explore the interactive Swagger docs when the backend is running at:

```
http://localhost:8000/docs
```
