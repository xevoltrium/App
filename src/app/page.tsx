
"use client"

import { useState } from 'react';
import { useVigourStore } from '@/hooks/use-vigour-store';
import { OnboardingForm } from '@/components/OnboardingForm';
import { UserDashboard } from '@/components/UserDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { VigourLogo } from '@/components/VigourLogo';
import { Loader2, KeyRound, User } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const { 
    user, 
    authUser, 
    plans, 
    loading, 
    saveUser, 
    logout, 
    loginWithNickname,
  } = useVigourStore();

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [authActionLoading, setAuthActionLoading] = useState(false);

  const handleLogin = async () => {
    if (!nickname || !password) {
      toast({ variant: "destructive", title: "Fehler", description: "Bitte Nickname und Passwort eingeben." });
      return;
    }
    setAuthActionLoading(true);
    try {
      await loginWithNickname(nickname, password);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Fehler", description: error.message || "Login fehlgeschlagen." });
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

  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <VigourLogo className="mb-8" />
        
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-headline font-bold text-center">Willkommen</CardTitle>
            <CardDescription className="text-center">Einfach Nickname und Passwort wählen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Dein Nickname" 
                    className="pl-10"
                    value={nickname} 
                    onChange={e => setNickname(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Dein Passwort" 
                    className="pl-10"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full h-12 text-lg font-bold" 
              disabled={authActionLoading}
            >
              {authActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Loslegen"}
            </Button>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground flex flex-col gap-2">
            <p>Kein Konto? Gib einfach einen neuen Namen ein.</p>
            <p>Deine Daten werden lokal in deinem Browser gespeichert.</p>
          </CardFooter>
        </Card>
        <Toaster />
      </div>
    );
  }

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
