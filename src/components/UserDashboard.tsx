"use client"

import { useState } from 'react';
import { UserProfile, WorkoutPlan, DailyWorkout } from '@/lib/types';
import { generateSpecializedWorkoutPlan } from '@/ai/flows/generate-specialized-workout-plan';
import { Button } from '@/components/ui/button';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Plus, Loader2, LogOut, LayoutDashboard, UserCircle, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function UserDashboard({ 
  user, 
  plans, 
  onSavePlans, 
  onMarkComplete,
  onLogout 
}: { 
  user: UserProfile; 
  plans: WorkoutPlan[]; 
  onSavePlans: (plans: WorkoutPlan[]) => void;
  onMarkComplete: (planId: string, idx: number) => void;
  onLogout: () => void;
}) {
  const [generating, setGenerating] = useState(false);

  const createPlan = async () => {
    setGenerating(true);
    try {
      const result = await generateSpecializedWorkoutPlan({
        fitnessGoal: user.fitnessGoal,
        bmiLevel: user.bmiLevel,
        availableEquipment: user.availableEquipment,
        specializationRequest: user.specialPreferences || "Fokus auf Rücken und Abnehmen"
      });

      const newPlan: WorkoutPlan = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.planTitle,
        description: result.planDescription,
        dailyWorkouts: result.dailyWorkouts.map(dw => ({
          dayName: dw.dayName,
          focus: dw.focus,
          exercises: dw.exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            repsOrDuration: ex.repsOrDuration,
            trainingMethod: ex.trainingMethod,
            instructions: ex.instructions
          }))
        })),
        userId: 'current-user',
        createdAt: Date.now()
      };

      onSavePlans([newPlan, ...plans]);
      toast({ title: "Plan erstellt!", description: "Dein neuer KI-Plan ist bereit." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Fehler", description: "Plan konnte nicht generiert werden." });
    } finally {
      setGenerating(false);
    }
  };

  const activePlan = plans[0];
  const completedCount = activePlan?.dailyWorkouts.filter(w => w.isCompleted).length || 0;
  const progress = activePlan ? (completedCount / activePlan.dailyWorkouts.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-headline font-bold text-xl">
            <span className="text-primary">Vigour</span>AI
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">Hallo, {user.name}</span>
            <Button variant="ghost" size="icon" onClick={onLogout} title="Ausloggen">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10 max-w-5xl">
        <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl font-headline font-bold leading-tight">Bereit für dein nächstes Level?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Basierend auf deinem Ziel <span className="text-primary font-bold">"{user.fitnessGoal}"</span> und deinem BMI-Status haben wir deinen optimalen Pfad berechnet.
            </p>
            {!activePlan && (
              <Button 
                onClick={createPlan} 
                disabled={generating}
                className="bg-accent text-accent-foreground font-bold hover:bg-accent/90 h-12 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                KI-Trainingsplan generieren
              </Button>
            )}
          </div>

          {activePlan && (
            <div className="w-full md:w-64 space-y-4 bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Dein Fortschritt</span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {completedCount} von {activePlan.dailyWorkouts.length} Einheiten geschafft
              </p>
            </div>
          )}
        </section>

        {generating && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {activePlan && !generating && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-headline font-bold">{activePlan.title}</h3>
              <Button variant="outline" size="sm" onClick={createPlan} disabled={generating} className="text-primary border-primary hover:bg-primary/5">
                Plan aktualisieren
              </Button>
            </div>
            <p className="text-muted-foreground max-w-2xl">{activePlan.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePlan.dailyWorkouts.map((workout, idx) => (
                <WorkoutCard 
                  key={idx} 
                  index={idx}
                  workout={workout} 
                  onComplete={(dayIdx) => onMarkComplete(activePlan.id, dayIdx)}
                />
              ))}
            </div>
          </section>
        )}

        {!activePlan && !generating && (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl opacity-50">
            <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-headline font-medium">Noch kein Trainingsplan vorhanden.</p>
            <p className="text-muted-foreground">Klicke oben, um deine personalisierte Reise zu starten.</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-4 md:hidden z-40">
        <button className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Plan</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground opacity-50">
          <UserCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profil</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground opacity-50">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
    </div>
  );
}
