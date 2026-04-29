'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { recipesApi } from '@/lib/api';
import type { Recipe } from '@/lib/types';
import { RecipeList } from '@/components/recipes/recipe-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Utensils, CalendarDays, ShoppingCart, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch recipes ──
  const fetchRecipes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await recipesApi.list();
      setRecipes(data);
    } catch (error) {
      // Error handling is done in the API client (401 redirect, etc.)
      // Only show toast for non-auth errors
      toast.error('Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleRecipeDeleted = useCallback((recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  }, []);

  return (
    <div className="space-y-8">
      {/* ── Welcome Section ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{user?.full_name ? `, ${user.full_name}` : ''}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your recipes, plan weekly meals, and generate shopping lists.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecipes} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* ── Quick Actions ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Utensils className="h-5 w-5 text-primary" />
              Recipes
            </CardTitle>
            <CardDescription>
              Create and manage your recipe collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={ROUTES.RECIPES_NEW}>
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                New Recipe
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
              Meal Plans
            </CardTitle>
            <CardDescription>
              Plan your weekly lunches and dinners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={ROUTES.MEAL_PLANS}>
              <Button className="w-full gap-2">
                <CalendarDays className="h-4 w-4" />
                View Plans
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Shopping List
            </CardTitle>
            <CardDescription>
              Generate lists from your meal plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={ROUTES.MEAL_PLANS}>
              <Button variant="outline" className="w-full gap-2">
                <ShoppingCart className="h-4 w-4" />
                Go to Meal Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ── Recipe List Section ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Your Recipes
            {!isLoading && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({recipes.length})
              </span>
            )}
          </h2>
          <Link href={ROUTES.RECIPES_NEW}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Recipe
            </Button>
          </Link>
        </div>

        <RecipeList
          recipes={recipes}
          isLoading={isLoading}
          onDeleted={handleRecipeDeleted}
        />
      </div>
    </div>
  );
}
