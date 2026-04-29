'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Recipe, Ingredient, RecipeIngredient, CreateRecipeRequest, UpdateRecipeRequest } from '@/lib/types';
import { ingredientsApi, recipesApi, ApiRequestError } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { IngredientSelector } from './ingredient-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: Recipe;
}

// ──────────────────────────────────────────────
// Recipe Form Component
// ──────────────────────────────────────────────

export function RecipeForm({ mode, initialData }: RecipeFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // ── Form state ──
  const [name, setName] = useState(initialData?.name ?? '');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialData?.ingredients ?? []
  );
  const [references, setReferences] = useState<string[]>(
    initialData?.references ?? ['']
  );

  // ── Loading states ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

  // ── Load available ingredients ──
  useEffect(() => {
    let cancelled = false;
    const loadIngredients = async () => {
      try {
        setIsLoadingIngredients(true);
        const data = await ingredientsApi.list();
        if (!cancelled) setAvailableIngredients(data);
      } catch (error) {
        if (!cancelled) {
          toast.error('Failed to load ingredients');
        }
      } finally {
        if (!cancelled) setIsLoadingIngredients(false);
      }
    };
    loadIngredients();
    return () => { cancelled = true; };
  }, []);

  // ── Reference handlers ──
  const handleReferenceChange = (index: number, value: string) => {
    const newRefs = [...references];
    newRefs[index] = value;
    setReferences(newRefs);
  };

  const addReference = () => {
    setReferences([...references, '']);
  };

  const removeReference = (index: number) => {
    const newRefs = references.filter((_, i) => i !== index);
    setReferences(newRefs.length === 0 ? [''] : newRefs);
  };

  // ── Submit handler ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Recipe name is required');
      return;
    }

    if (ingredients.length === 0) {
      toast.error('Add at least one ingredient');
      return;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.ingredient_id && ing.quantity.amount > 0
    );

    if (validIngredients.length === 0) {
      toast.error('All ingredients need a valid amount');
      return;
    }

    const nonEmptyReferences = references.filter((ref) => ref.trim() !== '');

    setIsSubmitting(true);

    try {
      if (isEdit && initialData) {
        const data: UpdateRecipeRequest = {
          name: name.trim(),
          ingredients: validIngredients,
          ...(nonEmptyReferences.length > 0
            ? { references: nonEmptyReferences }
            : {}),
        };
        await recipesApi.update(initialData.id, data);
        toast.success('Recipe updated successfully');
        router.push(ROUTES.RECIPE(initialData.id));
      } else {
        const data: CreateRecipeRequest = {
          name: name.trim(),
          ingredients: validIngredients,
          ...(nonEmptyReferences.length > 0
            ? { references: nonEmptyReferences }
            : {}),
        };
        const created = await recipesApi.create(data);
        toast.success('Recipe created successfully');
        router.push(ROUTES.RECIPE(created.id));
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.detail);
      } else {
        toast.error(
          isEdit ? 'Failed to update recipe' : 'Failed to create recipe'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = isEdit ? 'Edit Recipe' : 'New Recipe';
  const pageDescription = isEdit
    ? 'Update your recipe details below.'
    : 'Create a new recipe to add to your collection.';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.DASHBOARD}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>
      </div>

      {/* ── Recipe Name ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipe Name</CardTitle>
          <CardDescription>
            Give your recipe a descriptive name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g. Spaghetti Carbonara"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>

      {/* ── Ingredients ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingredients</CardTitle>
          <CardDescription>
            Select ingredients, set quantities, and choose units.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingIngredients ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading ingredients...
              </span>
            </div>
          ) : (
            <IngredientSelector
              ingredients={ingredients}
              onChange={setIngredients}
              availableIngredients={availableIngredients}
            />
          )}
        </CardContent>
      </Card>

      {/* ── References ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">References</CardTitle>
          <CardDescription>
            Add links to the original recipe or related resources (optional).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {references.map((ref, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="url"
                placeholder="https://example.com/recipe"
                value={ref}
                onChange={(e) => handleReferenceChange(index, e.target.value)}
                disabled={isSubmitting}
                className="flex-1"
              />
              {references.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeReference(index)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove reference</span>
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReference}
            className="gap-1.5"
            disabled={isSubmitting}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Reference
          </Button>
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between gap-4 pb-8">
        <Link href={ROUTES.DASHBOARD}>
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
        <div className="flex items-center gap-3">
          {isEdit && initialData && (
            <Link href={ROUTES.RECIPE(initialData.id)}>
              <Button variant="outline" type="button">Cancel Edit</Button>
            </Link>
          )}
          <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px]">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? isEdit
                ? 'Saving...'
                : 'Creating...'
              : isEdit
              ? 'Save Changes'
              : 'Create Recipe'}
          </Button>
        </div>
      </div>
    </form>
  );
}
