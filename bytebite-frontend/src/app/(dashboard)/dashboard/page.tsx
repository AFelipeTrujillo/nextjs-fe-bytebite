'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Utensils, CalendarDays, ShoppingCart, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* ── Welcome Section ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{user?.full_name ? `, ${user.full_name}` : ''}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your recipes, plan weekly meals, and generate shopping lists.
        </p>
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

      {/* ── Empty State (placeholder for future recipe list) ── */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Utensils className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No recipes yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first recipe to get started with meal planning.
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
