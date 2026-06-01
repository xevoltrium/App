"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { BMICategory, UserProfile } from '@/lib/types';
import { Dumbbell, Target, User, Ruler } from 'lucide-react';

export function OnboardingForm({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    role: 'user',
    availableEquipment: [],
    fitnessGoal: 'schlank werden',
    bmiLevel: 'normal'
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const toggleEquipment = (eq: string) => {
    setProfile(prev => {
      const current = prev.availableEquipment || [];
      const updated = current.includes(eq) 
        ? current.filter(item => item !== eq) 
        : [...current, eq];
      return { ...prev, availableEquipment: updated };
    });
  };

  const handleSubmit = () => {
    onComplete({
      ...profile,
      isBoarded: true,
      name: profile.name || 'User',
      role: profile.role as 'user' | 'admin',
    } as UserProfile);
  };

  const equipmentOptions = [
    "Dumbbells", "Resistance Bands", "Pull-up Bar", "Gym Access", "Bench", "Kettlebells", "None"
  ];

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-xl bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline font-bold">Willkommen bei VigourAI</CardTitle>
          <CardDescription>Lass uns deinen perfekten Trainingsplan erstellen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <User className="w-5 h-5" /> <span>Grundlagen</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Dein Name</Label>
                <Input 
                  id="name" 
                  placeholder="Max Mustermann" 
                  value={profile.name || ''} 
                  onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Bist du Admin oder User?</Label>
                <RadioGroup 
                  value={profile.role} 
                  onValueChange={v => setProfile({...profile, role: v as any})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="r-user" />
                    <Label htmlFor="r-user">Normaler User</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="r-admin" />
                    <Label htmlFor="r-admin">Administrator</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Target className="w-5 h-5" /> <span>Deine Ziele</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Fitness Ziel</Label>
                <Input 
                  id="goal" 
                  placeholder="z.B. Rücken stärken, schlank werden" 
                  value={profile.fitnessGoal}
                  onChange={e => setProfile({...profile, fitnessGoal: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prefs">Spezielle Wünsche (optional)</Label>
                <Textarea 
                  id="prefs" 
                  placeholder="z.B. Keine Sprungübungen, Fokus auf Oberkörper"
                  value={profile.specialPreferences || ''}
                  onChange={e => setProfile({...profile, specialPreferences: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Ruler className="w-5 h-5" /> <span>BMI Status</span>
              </div>
              <RadioGroup 
                value={profile.bmiLevel} 
                onValueChange={v => setProfile({...profile, bmiLevel: v as BMICategory})}
                className="grid gap-3"
              >
                {['underweight', 'normal', 'overweight', 'obese'].map((level) => (
                  <Label key={level} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={level} id={`bmi-${level}`} />
                      <span className="capitalize">{level === 'underweight' ? 'Untergewicht' : level === 'normal' ? 'Normalgewicht' : level === 'overweight' ? 'Übergewicht' : 'Adipositas'}</span>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Dumbbell className="w-5 h-5" /> <span>Equipment</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {equipmentOptions.map(eq => (
                  <div key={eq} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox 
                      id={`eq-${eq}`} 
                      checked={profile.availableEquipment?.includes(eq)}
                      onCheckedChange={() => toggleEquipment(eq)}
                    />
                    <Label htmlFor={`eq-${eq}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {eq}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>Zurück</Button>
          )}
          {step < 4 ? (
            <Button onClick={nextStep} className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90">Weiter</Button>
          ) : (
            <Button onClick={handleSubmit} className="ml-auto bg-accent text-accent-foreground font-bold hover:bg-accent/90">Fertigstellen</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
