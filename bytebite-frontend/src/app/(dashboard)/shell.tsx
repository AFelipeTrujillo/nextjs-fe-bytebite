'use client';

import { type ReactNode } from 'react';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Header } from '@/components/layout/header';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <main className="mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full">
        {children}
      </main>
    </AuthGuard>
  );
}
