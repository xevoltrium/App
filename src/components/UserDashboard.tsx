"use client"

import { useState } from 'react';
import { UserProfile, WorkoutPlan, ChatMessage, BMICategory } from '@/lib/types';
import { generateSpecializedWorkoutPlan } from '@/ai/flows/generate-specialized-workout-plan';
import { chatWithTrainer } from '@/ai/flows/chat-with-trainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Loader2, 
  LogOut, 
  LayoutDashboard, 
  UserCircle, 
  Settings, 
  MessageSquare, 
  Send,
  User,
  Dumbbell,
  Target,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useVigourStore } from '@/hooks/use-vigour-store';

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
  const { updateUser, logout } = useVigourStore();
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'chat' | 'profile' | 'settings'>('plan');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const createPlan = async () => {
    setGenerating(true);
    try {
      const result = await generateSpecializedWorkoutPlan({
        fitnessGoal: user.fitnessGoal,
        bmiLevel: user.bmiLevel,
        availableEquipment: user.availableEquipment,
        specializationRequest: user.specialPreferences || "Fokus auf allgemeine Fitness"
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

  const handleSendChat = async () => {
    if (!chatInput.trim() || sendingChat) return;
    
    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setSendingChat(true);

    try {
      const result = await chatWithTrainer({
        message: chatInput,
        userProfile: {
          fitnessGoal: user.fitnessGoal,
          bmiLevel: user.bmiLevel
        }
      });
      setChatMessages(prev => [...prev, { role: 'ai', content: result.response }]);
    } catch (error) {
      toast({ variant: "destructive", title: "Fehler", description: "KI Trainer ist nicht erreichbar." });
    } finally {
      setSendingChat(false);
    }
  };

  const equipmentOptions = [
    "Dumbbells", "Resistance Bands", "Pull-up Bar", "Gym Access", "Bench", "Kettlebells", "None"
  ];

  const activePlan = plans[0];
  const completedCount = activePlan?.dailyWorkouts.filter(w => w.isCompleted).length || 0;
  const progress = activePlan ? (completedCount / activePlan.dailyWorkouts.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
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

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {activeTab === 'plan' && (
          <div className="space-y-10">
            <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
              
              <div className="space-y-4 max-w-lg">
                <h2 className="text-3xl font-headline font-bold leading-tight">Bereit für dein nächstes Level?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ziel: <span className="text-primary font-bold">"{user.fitnessGoal}"</span>
                </p>
                {!activePlan && (
                  <Button 
                    onClick={createPlan} 
                    disabled={generating}
                    className="bg-accent text-accent-foreground font-bold hover:bg-accent/90 h-12 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
                  >
                    {generating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                    KI-Trainingsplan generieren
                  </Button>
                )}
              </div>

              {activePlan && (
                <div className="w-full md:w-64 space-y-4 bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Fortschritt</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
              </div>
            )}

            {activePlan && !generating && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-headline font-bold">{activePlan.title}</h3>
                  <Button variant="outline" size="sm" onClick={createPlan} className="text-primary">Neu berechnen</Button>
                </div>
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
          </div>
        )}

        {activeTab === 'chat' && (
          <section className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-headline font-bold">KI Trainer Chat</h2>
              <p className="text-muted-foreground">Fragen zu Übungen oder Ernährung?</p>
            </div>
            <div className="bg-white border rounded-2xl shadow-sm flex flex-col h-[500px]">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {sendingChat && <div className="flex justify-start"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
                </div>
              </ScrollArea>
              <div className="p-4 border-t flex gap-2">
                <Input placeholder="Frag mich was..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} />
                <Button onClick={handleSendChat} disabled={sendingChat || !chatInput.trim()}><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-headline font-bold">{user.name}</h2>
                <p className="text-muted-foreground">Dein Fitness-Profil</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Ziel & Präferenzen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fitness-Ziel</Label>
                    <Input 
                      value={user.fitnessGoal} 
                      onChange={e => updateUser({ fitnessGoal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Besondere Wünsche</Label>
                    <Textarea 
                      value={user.specialPreferences || ''} 
                      onChange={e => updateUser({ specialPreferences: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Dumbbell className="w-5 h-5" /> Dein Equipment</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {equipmentOptions.map(eq => (
                    <div key={eq} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`prof-eq-${eq}`} 
                        checked={user.availableEquipment.includes(eq)}
                        onCheckedChange={(checked) => {
                          const current = user.availableEquipment;
                          const updated = checked 
                            ? [...current, eq] 
                            : current.filter(i => i !== eq);
                          updateUser({ availableEquipment: updated });
                        }}
                      />
                      <Label htmlFor={`prof-eq-${eq}`}>{eq}</Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>BMI Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={user.bmiLevel} 
                    onValueChange={v => updateUser({ bmiLevel: v as BMICategory })}
                    className="grid gap-2"
                  >
                    {['underweight', 'normal', 'overweight', 'obese'].map(l => (
                      <div key={l} className="flex items-center space-x-2">
                        <RadioGroupItem value={l} id={`prof-bmi-${l}`} />
                        <Label className="capitalize" htmlFor={`prof-bmi-${l}`}>{l === 'underweight' ? 'Untergewicht' : l === 'normal' ? 'Normal' : l === 'overweight' ? 'Übergewicht' : 'Adipositas'}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="space-y-2">
              <h2 className="text-3xl font-headline font-bold">Einstellungen</h2>
              <p className="text-muted-foreground">Verwalte deine App-Daten und Präferenzen.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg"><Settings className="w-5 h-5" /></div>
                        <div>
                          <p className="font-medium">Account-Status</p>
                          <p className="text-xs text-muted-foreground">Angemeldet als {user.role}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    </div>
                    
                    <button 
                      onClick={onLogout}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg"><LogOut className="w-5 h-5 text-primary" /></div>
                        <p className="font-medium">Abmelden</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        if (confirm("Möchtest du wirklich alle lokalen Daten löschen? Dies setzt dein Profil zurück.")) {
                          logout();
                        }
                      }}
                      className="w-full p-4 flex items-center justify-between hover:bg-destructive/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/10 rounded-lg group-hover:bg-destructive/20 transition-colors">
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </div>
                        <p className="font-medium text-destructive">Daten zurücksetzen</p>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-muted/30 border border-dashed rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  VigourAI speichert deine Daten aktuell nur lokal in deinem Browser. Wenn du den Browser-Cache leerst, gehen deine Trainingspläne verloren.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t flex items-center justify-around px-4 z-40">
        <button 
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'plan' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('plan')}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Plan</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'chat' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Chat</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profil</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
    </div>
  );
}
