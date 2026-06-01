"use client"

import { useState } from 'react';
import { useVigourStore } from '@/hooks/use-vigour-store';
import { OnboardingForm } from '@/components/OnboardingForm';
import { UserDashboard } from '@/components/UserDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { VigourLogo } from '@/components/VigourLogo';
import { Loader2, KeyRound, User as UserIcon } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const { 
    user, 
    authUser, 
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
      toast({ variant: "destructive", title: "Fehler", description: "Bitte Name und Passwort eingeben." });
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
            <CardDescription className="text-center">Einfach Name und Passwort wählen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              {authActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Starten / Einloggen"}
            </Button>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground flex flex-col gap-2">
            <p>Neu hier? Wähle einen Namen und ein Passwort aus.</p>
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
        <AdminDashboard onLogout={logout} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <UserDashboard onLogout={logout} />
      <Toaster />
    </>
  );
}