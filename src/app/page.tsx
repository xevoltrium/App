
"use client"

import { useState } from 'react';
import { useVigourStore } from '@/hooks/use-vigour-store';
import { OnboardingForm } from '@/components/OnboardingForm';
import { UserDashboard } from '@/components/UserDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { VigourLogo } from '@/components/VigourLogo';
import { Loader2, LogIn, Mail, UserPlus, UserRound } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

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
    loginWithEmail,
    registerWithEmail,
    loginAsGuest,
    markWorkoutComplete 
  } = useVigourStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authActionLoading, setAuthActionLoading] = useState(false);

  const handleEmailAuth = async (type: 'login' | 'register') => {
    if (!email || !password) {
      toast({ variant: "destructive", title: "Fehler", description: "Bitte E-Mail und Passwort eingeben." });
      return;
    }
    setAuthActionLoading(true);
    try {
      if (type === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Fehler", description: error.message });
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setAuthActionLoading(true);
    try {
      await loginAsGuest();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } finally {
      setAuthActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // If not logged in at all, show custom login screen
  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <VigourLogo className="mb-8" />
        
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-headline font-bold text-center">Willkommen</CardTitle>
            <CardDescription className="text-center">Wähle deine bevorzugte Art der Anmeldung</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registrieren</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="E-Mail" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                  <Input 
                    type="password" 
                    placeholder="Passwort" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
                <Button 
                  onClick={() => handleEmailAuth('login')} 
                  className="w-full gap-2" 
                  disabled={authActionLoading}
                >
                  {authActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Mit E-Mail anmelden
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="E-Mail" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                  <Input 
                    type="password" 
                    placeholder="Passwort" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
                <Button 
                  onClick={() => handleEmailAuth('register')} 
                  variant="secondary"
                  className="w-full gap-2"
                  disabled={authActionLoading}
                >
                  {authActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Konto erstellen
                </Button>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Oder</span>
              </div>
            </div>

            <div className="grid gap-3">
              <Button 
                variant="outline" 
                onClick={loginWithGoogle} 
                className="w-full gap-2"
                disabled={authActionLoading}
              >
                <LogIn className="w-4 h-4" /> Mit Google
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleGuestLogin} 
                className="w-full gap-2"
                disabled={authActionLoading}
              >
                <UserRound className="w-4 h-4" /> Als Gast fortfahren
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground">
            Deine Daten werden sicher in der Cloud gespeichert.
          </CardFooter>
        </Card>
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
          onUpdatePlans={() => {}} 
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
        onLogout={logout}
      />
      <Toaster />
    </>
  );
}
