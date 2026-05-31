import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-background">
      <div className="bg-card p-12 rounded-2xl shadow-lg border text-center max-w-md mx-4">
        <div className="mx-auto w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4 font-display">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Сторінку не знайдено</h2>
        
        <p className="text-muted-foreground mb-8">
          Сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>

        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full">
          На головну
        </Link>
      </div>
    </div>
  );
}
