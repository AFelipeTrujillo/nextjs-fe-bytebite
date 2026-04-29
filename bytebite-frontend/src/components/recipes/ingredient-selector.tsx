'use client';

import { type ReactNode } from 'react';
import type { Ingredient, RecipeIngredient, UnitType } from '@/lib/types';
import { UNITS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Plus, X, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface IngredientSelectorProps {
  ingredients: RecipeIngredient[];
  onChange: (ingredients: RecipeIngredient[]) => void;
  availableIngredients: Ingredient[];
}

// ──────────────────────────────────────────────
// Ingredient Row Component
// ──────────────────────────────────────────────

interface IngredientRowProps {
  ingredient: RecipeIngredient;
  index: number;
  availableIngredients: Ingredient[];
  onUpdate: (index: number, updated: RecipeIngredient) => void;
  onRemove: (index: number) => void;
}

function IngredientRow({
  ingredient,
  index,
  availableIngredients,
  onUpdate,
  onRemove,
}: IngredientRowProps) {
  const selectedIngredient = availableIngredients.find(
    (i) => i.id === ingredient.ingredient_id
  );

  return (
    <div className="flex items-start gap-2 rounded-lg border p-3">
      {/* Ingredient Select */}
      <div className="flex-1 min-w-0">
        <Select
          value={ingredient.ingredient_id || ""}
          onValueChange={(value) =>
            onUpdate(index, { ...ingredient, ingredient_id: value || "" })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select ingredient...">
              {selectedIngredient?.name ?? ingredient.ingredient_id}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableIngredients.map((ing) => (
              <SelectItem key={ing.id} value={ing.id}>
                {ing.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="w-24 shrink-0">
        <Input
          type="number"
          min="0"
          step="0.5"
          placeholder="Amount"
          value={ingredient.quantity.amount || ''}
          onChange={(e) =>
            onUpdate(index, {
              ...ingredient,
              quantity: {
                ...ingredient.quantity,
                amount: parseFloat(e.target.value) || 0,
              },
            })
          }
        />
      </div>

      {/* Unit */}
      <div className="w-32 shrink-0">
        <Select
          value={ingredient.quantity.unit}
          onValueChange={(value) =>
            onUpdate(index, {
              ...ingredient,
              quantity: { ...ingredient.quantity, unit: value as UnitType },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 mt-0.5 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(index)}
        type="button"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove ingredient</span>
      </Button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Ingredient Selector Component
// ──────────────────────────────────────────────

export function IngredientSelector({
  ingredients,
  onChange,
  availableIngredients,
}: IngredientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return availableIngredients;
    const query = searchQuery.toLowerCase();
    return availableIngredients.filter((ing) =>
      ing.name.toLowerCase().includes(query)
    );
  }, [availableIngredients, searchQuery]);

  const handleAdd = () => {
    const firstAvailable = availableIngredients[0];
    if (!firstAvailable) return;

    onChange([
      ...ingredients,
      {
        ingredient_id: firstAvailable.id,
        quantity: { amount: 1, unit: 'UNITS' as UnitType },
      },
    ]);
  };

  const handleUpdate = (index: number, updated: RecipeIngredient) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = updated;
    onChange(newIngredients);
  };

  const handleRemove = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Ingredients</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={availableIngredients.length === 0}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Ingredient
        </Button>
      </div>

      {/* Search filter */}
      {availableIngredients.length > 10 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {/* Ingredient rows */}
      {ingredients.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No ingredients added yet. Click &quot;Add Ingredient&quot; to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <IngredientRow
              key={index}
              ingredient={ingredient}
              index={index}
              availableIngredients={
                searchQuery.trim() ? filteredIngredients : availableIngredients
              }
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {ingredients.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {ingredients.length} {ingredients.length === 1 ? 'ingredient' : 'ingredients'} added
        </p>
      )}
    </div>
  );
}
