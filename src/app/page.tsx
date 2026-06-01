
"use client"

import { useVigourStore } from '@/hooks/use-vigour-store';
import { OnboardingForm } from '@/components/OnboardingForm';
import { UserDashboard } from '@/components/UserDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { VigourLogo } from '@/components/VigourLogo';
import { Loader2, LogIn } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { 
    user, 
    authUser, 
    plans, 
    loading, 
    saveUser, 
    savePlan, 
    logout, 
    loginWithGoogle,
    markWorkoutComplete 
  } = useVigourStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // If not logged in at all, show login screen
  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <VigourLogo className="mb-12 scale-150" />
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-4xl font-headline font-bold">Dein Weg zu mehr Kraft beginnt hier.</h1>
          <p className="text-muted-foreground">Melde dich an, um deine KI-generierten Trainingspläne zu speichern und überall darauf zuzugreifen.</p>
          <Button 
            onClick={loginWithGoogle} 
            size="lg" 
            className="w-full h-14 text-lg font-bold gap-3"
          >
            <LogIn className="w-6 h-6" /> Mit Google anmelden
          </Button>
        </div>
        <Toaster />
      </div>
    );
  }

  // If logged in but no profile (onboarding)
  if (!user || !user.isBoarded) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
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
          onUpdatePlans={() => {}} // Now handled via Firestore triggers/hooks
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
        onSavePlans={(newPlans) => savePlan(newPlans[0])} 
        onMarkComplete={markWorkoutComplete}
        onLogout={logout}
      />
      <Toaster />
    </>
  );
}
