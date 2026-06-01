
"use client"

import { useState } from 'react';
import { WorkoutPlan } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Edit3, Trash2, LogOut, Search, Users, Activity } from 'lucide-react';
import { editAiGeneratedPlan } from '@/ai/flows/admin-edit-ai-generated-plan';
import { toast } from '@/hooks/use-toast';
import { useVigourStore } from '@/hooks/use-vigour-store';

export function AdminDashboard({ 
  plans, 
  onLogout 
}: { 
  plans: WorkoutPlan[]; 
  onLogout: () => void;
}) {
  const { deletePlan, adminUpdatePlans } = useVigourStore();
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const startEdit = (plan: WorkoutPlan) => {
    setEditingPlan(JSON.parse(JSON.stringify(plan)));
    setReasoning("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Möchtest du diesen Plan wirklich löschen?")) {
      deletePlan(id);
      toast({ title: "Plan gelöscht", description: "Der Trainingsplan wurde entfernt." });
    }
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setSaving(true);
    try {
      const reviewResult = await editAiGeneratedPlan({
        planId: editingPlan.id,
        editedPlan: editingPlan,
        reasoning: reasoning || "Manuelle Optimierung durch Admin"
      });

      if (reviewResult.success) {
        const updatedPlans = plans.map(p => p.id === editingPlan.id ? editingPlan : p);
        adminUpdatePlans(updatedPlans);
        setEditingPlan(null);
        toast({ title: "Plan aktualisiert", description: reviewResult.message });
      } else {
        toast({ variant: "destructive", title: "Review Fehlgeschlagen", description: reviewResult.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Fehler", description: "Speichern fehlgeschlagen." });
    } finally {
      setSaving(false);
    }
  };

  const filteredPlans = plans.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-headline font-bold text-xl">Admin Oversight</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}><LogOut className="w-5 h-5" /></Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!editingPlan ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Aktive Nutzer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent" /> Generierte Pläne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{plans.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-primary text-primary-foreground">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">Aktiv</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-headline font-bold">Trainingspläne verwalten</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Suchen..." 
                    className="pl-9 w-64 bg-white" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredPlans.map(plan => (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{plan.title}</h3>
                          <Badge variant="outline">User ID: {plan.userId}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{plan.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(plan)}>
                          <Edit3 className="w-4 h-4 mr-2" /> Bearbeiten
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-headline font-bold">Plan Editor</h2>
              <Button variant="outline" onClick={() => setEditingPlan(null)}>Abbrechen</Button>
            </div>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Titel des Plans</Label>
                  <Input 
                    value={editingPlan.title} 
                    onChange={e => setEditingPlan({...editingPlan, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea 
                    value={editingPlan.description} 
                    onChange={e => setEditingPlan({...editingPlan, description: e.target.value})}
                    rows={4}
                  />
                </div>
                <Button 
                  className="w-full h-12 bg-primary text-primary-foreground font-bold" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Speichere..." : "Änderungen speichern"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
