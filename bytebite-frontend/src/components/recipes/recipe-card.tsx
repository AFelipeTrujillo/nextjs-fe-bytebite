'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Recipe } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { recipesApi, ApiRequestError } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Eye, Edit, Trash2, MoreVertical, Utensils } from 'lucide-react';
import { toast } from 'sonner';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface RecipeCardProps {
  recipe: Recipe;
  onDeleted: (recipeId: string) => void;
}

// ──────────────────────────────────────────────
// Recipe Card Component
// ──────────────────────────────────────────────

export function RecipeCard({ recipe, onDeleted }: RecipeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const ingredientCount = recipe.ingredients.length;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await recipesApi.delete(recipe.id);
      toast.success('Recipe deleted successfully');
      onDeleted(recipe.id);
      setDeleteOpen(false);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.detail);
      } else {
        toast.error('Failed to delete recipe');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="group relative transition-all hover:shadow-md">
      {/* ── Header: Recipe Name + Actions ── */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={ROUTES.RECIPE(recipe.id)}
            className="flex-1 truncate text-base font-semibold hover:text-primary transition-colors"
          >
            {recipe.name}
          </Link>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                render={<Link href={ROUTES.RECIPE(recipe.id)} />}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={ROUTES.RECIPE(recipe.id)} />}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger>
                  <div
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-destructive outline-hidden select-none focus:bg-destructive/10 focus:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </div>
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
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* ── Card Content ── */}
      <Link href={ROUTES.RECIPE(recipe.id)}>
        <CardContent className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Utensils className="h-4 w-4" />
            <span>
              {ingredientCount} {ingredientCount === 1 ? 'ingredient' : 'ingredients'}
            </span>
          </div>

          {recipe.references && recipe.references.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {recipe.references.slice(0, 2).map((ref, idx) => {
                let hostname = '';
                try {
                  hostname = new URL(ref).hostname;
                } catch {
                  hostname = ref;
                }
                return (
                  <Badge key={idx} variant="secondary" className="truncate text-xs max-w-[140px]">
                    {hostname}
                  </Badge>
                );
              })}
              {recipe.references.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{recipe.references.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>

      {/* ── Footer: Quick Action ── */}
      <CardFooter className="pt-0">
        <Link href={ROUTES.RECIPE(recipe.id)} className="w-full">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Eye className="h-3.5 w-3.5" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
