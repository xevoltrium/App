import { Zap } from 'lucide-react';

export function VigourLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-headline font-bold text-2xl tracking-tight ${className}`}>
      <div className="bg-primary p-1.5 rounded-lg shadow-sm">
        <Zap className="w-6 h-6 text-primary-foreground fill-current" />
      </div>
      <span className="text-foreground">Vigour<span className="text-primary">AI</span></span>
    </div>
  );
}
