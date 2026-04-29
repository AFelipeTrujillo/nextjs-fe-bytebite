'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ChefHat,
  LayoutDashboard,
  CalendarDays,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  User,
  Utensils,
  ClipboardList,
} from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// ──────────────────────────────────────────────
// Navigation Links
// ──────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainLinks: NavLink[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Recipes', href: '/recipes', icon: Utensils },
  { label: 'Meal Plans', href: ROUTES.MEAL_PLANS, icon: CalendarDays },
  { label: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
];

const adminLinks: NavLink[] = [
  { label: 'Ingredients', href: ROUTES.ADMIN_INGREDIENTS, icon: ClipboardList },
];

// ──────────────────────────────────────────────
// Header Component
// ──────────────────────────────────────────────

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo & Brand ── */}
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">ByteBite</span>
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav className="hidden items-center gap-1 md:flex">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'gap-2',
                  isActive(link.href) && 'font-medium'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* ── Right Side: User Menu & Mobile Toggle ── */}
        <div className="flex items-center gap-2">
          {/* Desktop User Menu */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="max-w-[120px] truncate text-sm">
                      {user?.email ?? 'User'}
                    </span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{user?.email}</p>
                    {user && (
                      <p className="text-xs text-muted-foreground">
                        {isAdmin ? 'Administrator' : 'User'}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      render={<Link href={ROUTES.ADMIN_INGREDIENTS} />}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin — Ingredients
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="pb-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <ChefHat className="h-4 w-4 text-primary-foreground" />
                  </div>
                  ByteBite
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-1 px-2">
                {mainLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant={isActive(link.href) ? 'secondary' : 'ghost'}
                      className="justify-start gap-3 w-full"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>

              {isAdmin && (
                <>
                  <Separator className="my-4" />
                  <p className="px-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Admin
                  </p>
                  <div className="flex flex-col gap-1 px-2">
                    {adminLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                        <Button
                          variant={isActive(link.href) ? 'secondary' : 'ghost'}
                          className="justify-start gap-3 w-full"
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <Separator className="my-4" />

              <div className="flex flex-col gap-1 px-2">
                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[180px]">{user?.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {isAdmin ? 'Administrator' : 'User'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="justify-start gap-3 text-destructive hover:text-destructive w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
