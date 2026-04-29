'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { recipesApi, ingredientsApi, ApiRequestError } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import type { Recipe, Ingredient } from '@/lib/types';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Edit3, Trash2, ExternalLink, Utensils, Loader2, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

// ──────────────────────────────────────────────
// Recipe Detail Page
// ──────────────────────────────────────────────

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ingredientMap, setIngredientMap] = useState<Record<string, Ingredient>>({});

  // ── Fetch recipe and ingredients ──
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [recipeData, ingredientsData] = await Promise.all([
        recipesApi.get(recipeId),
        ingredientsApi.list(),
      ]);
      setRecipe(recipeData);

      const map: Record<string, Ingredient> = {};
      ingredientsData.forEach((ing) => {
        map[ing.id] = ing;
      });
      setIngredientMap(map);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 404) {
          toast.error('Recipe not found');
          router.push(ROUTES.DASHBOARD);
          return;
        }
        toast.error(error.detail);
      } else {
        toast.error('Failed to load recipe');
      }
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Delete handler ──
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await recipesApi.delete(recipeId);
      toast.success('Recipe deleted successfully');
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.detail);
      } else {
        toast.error('Failed to delete recipe');
      }
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!recipe) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <ChefHat className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Recipe not found</h2>
        <p className="text-sm text-muted-foreground">
          The recipe you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href={ROUTES.DASHBOARD}>
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // ── Editing mode ──
  if (isEditing) {
    return (
      <div>
        <RecipeForm mode="edit" initialData={recipe} />
      </div>
    );
  }

  // ── View mode ──
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.DASHBOARD}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{recipe.name}</h1>
            <p className="text-sm text-muted-foreground">
              {recipe.ingredients.length} ingredient
              {recipe.ingredients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger>
              <Button variant="outline" size="sm" className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Recipe</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <strong>{recipe.name}</strong>? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      {/* ── Ingredients ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Utensils className="h-4 w-4" />
            Ingredients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recipe.ingredients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ingredients listed.</p>
          ) : (
            <ul className="divide-y">
              {recipe.ingredients.map((item, idx) => {
                const ingredient = ingredientMap[item.ingredient_id];
                const name = ingredient?.name ?? item.ingredient_name ?? item.ingredient_id;
                const category = ingredient?.category;

                return (
                  <li key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">{name}</span>
                      {category && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {category}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0 ml-4">
                      {item.quantity.amount} {item.quantity.unit.toLowerCase()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── References ── */}
      {recipe.references && recipe.references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ExternalLink className="h-4 w-4" />
              References
            </CardTitle>
            <CardDescription>
              Original sources and related links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.references.map((ref, idx) => {
                let hostname = '';
                try {
                  hostname = new URL(ref).hostname;
                } catch {
                  hostname = ref;
                }
                return (
                  <li key={idx}>
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {hostname}
                    </a>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Footer actions ── */}
      <div className="flex items-center gap-3 pb-8">
        <Link href={ROUTES.DASHBOARD}>
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
