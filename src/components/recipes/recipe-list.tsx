'use client';

import type { Recipe } from '@/lib/types';
import { RecipeCard } from './recipe-card';
import { Card, CardContent } from '@/components/ui/card';
import { Utensils, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  onDeleted: (recipeId: string) => void;
}

// ──────────────────────────────────────────────
// Loading Skeleton
// ──────────────────────────────────────────────

function RecipeSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-5">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
            <div className="mt-4 flex gap-2">
              <div className="h-5 w-20 rounded-full bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
            <div className="mt-4 h-8 w-full rounded-lg bg-muted" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

// ──────────────────────────────────────────────
// Empty State
// ──────────────────────────────────────────────

function RecipeEmpty() {
  return (
    <div className="col-span-full">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Utensils className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No recipes yet</h3>
          <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
            Create your first recipe to get started with meal planning and shopping lists.
          </p>
          <Link href={ROUTES.RECIPES_NEW}>
            <Button className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Create Recipe
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────
// Recipe List Component
// ──────────────────────────────────────────────

export function RecipeList({ recipes, isLoading, onDeleted }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RecipeSkeleton />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RecipeEmpty />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}
