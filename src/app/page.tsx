"use client"

import { useVigourStore } from '@/hooks/use-vigour-store';
import { OnboardingForm } from '@/components/OnboardingForm';
import { UserDashboard } from '@/components/UserDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { VigourLogo } from '@/components/VigourLogo';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { user, plans, loading, saveUser, savePlans, logout, markWorkoutComplete } = useVigourStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // If not logged in/boarded, show onboarding
  if (!user || !user.isBoarded) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background blobs for aesthetic */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <header className="py-8 px-4 flex justify-center">
          <VigourLogo />
        </header>
        <main>
          <OnboardingForm onComplete={saveUser} />
        </main>
        <Toaster />
      </div>
    );
  }

  // Handle Admin view
  if (user.role === 'admin') {
    return (
      <>
        <AdminDashboard 
          plans={plans} 
          onUpdatePlans={savePlans} 
          onLogout={logout} 
        />
        <Toaster />
      </>
    );
  }

  // Regular User Dashboard
  return (
    <>
      <UserDashboard 
        user={user} 
        plans={plans} 
        onSavePlans={savePlans} 
        onMarkComplete={markWorkoutComplete}
        onLogout={logout}
      />
      <Toaster />
    </>
  );
}
