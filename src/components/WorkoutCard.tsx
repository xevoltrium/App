import { DailyWorkout } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WorkoutCard({ workout, onComplete, index }: { 
  workout: DailyWorkout; 
  onComplete?: (idx: number) => void;
  index: number;
}) {
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${workout.isCompleted ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}>
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">{workout.dayName}</CardTitle>
            <CardDescription className="text-primary font-medium">{workout.focus}</CardDescription>
          </div>
          {workout.isCompleted && (
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Abgeschlossen
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-6">
          {workout.exercises.map((ex, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-primary/20 last:border-l-transparent">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary" />
              <div className="space-y-1">
                <h4 className="font-bold text-lg leading-tight">{ex.name}</h4>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {ex.sets} Sets</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ex.repsOrDuration}</span>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{ex.trainingMethod}</Badge>
                </div>
                <p className="text-sm mt-2 leading-relaxed text-muted-foreground italic">
                  "{ex.instructions}"
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {!workout.isCompleted && onComplete && (
          <Button 
            onClick={() => onComplete(index)} 
            className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Einheit beenden
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
