import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter
} from '@/components/ui/card';
import ConversionForm from '../components/ConversionForm';
import { Progress } from "@/components/ui/progress";
import { Lightbulb } from 'lucide-react';
// import api from '../lib/api'; // If you need to fetch initial data

const ConversionPage: React.FC = () => {
  const [currentLitres, setCurrentLitres] = useState<number | null>(null);
  const [lastCmValue, setLastCmValue] = useState<number | null>(null); 
  const MAX_LITRES = 50000;

  useEffect(() => {
    // Optional: Fetch latest level on mount
  }, []);

  const handleConversionSuccess = (data: { litres: number; cm: number }) => {
    setCurrentLitres(data.litres);
    setLastCmValue(data.cm);
  };

  const progressValue = currentLitres !== null ? Math.min(100, Math.max(0, (currentLitres / MAX_LITRES) * 100)) : null;

  return (
    // Corrected: max-w-none to allow full width within its container from DashboardLayout
    // mx-auto is removed as it's not needed if there's no max-width other than full.
    // space-y-8 for vertical spacing. p-1 can be kept or handled by DashboardLayout's main padding.
    <div className=" w-fit  space-y-8 "> 
      
      <h1 className="text-3xl font-bold text-foreground dark:text-slate-100">
        Conversion de Jauge
      </h1>
       <div className="flex  gap-8 max-w-none w-full">
      <Card className="w-full bloc">
        <CardHeader>
          <CardTitle className="text-xl">Nouvelle Mesure de Jauge</CardTitle>
          <CardDescription>
            Entrez la valeur de la jauge pour calculer le volume et enregistrer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConversionForm 
            onConversionSuccess={handleConversionSuccess} 
          />
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t pt-4">
            <Lightbulb className="mr-2 h-4 w-4 text-yellow-500 shrink-0" />
            <span>Assurez-vous que la jauge est propre et insérée verticalement pour une mesure précise.</span>
        </CardFooter>
      </Card>

      <Card className="w-full">
          <CardHeader>
              <CardTitle className="text-xl">Niveau Citerne Actuel</CardTitle>
              {lastCmValue !== null && (
                <CardDescription>Basé sur la dernière mesure : {lastCmValue.toFixed(1)} cm</CardDescription>
              )}
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-2 min-h-[150px]">
              {progressValue !== null && currentLitres !== null ? (
                  <>
                      <div className="text-4xl font-bold text-primary text-center">
                        {currentLitres.toLocaleString()} 
                        <span className="text-2xl font-normal text-muted-foreground ml-1">L</span>
                      </div>
                      <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% plein`} className="w-full h-3 [&>*]:bg-primary" />
                      <div className="w-full flex justify-between text-sm text-muted-foreground">
                          <span>0 L</span>
                          <span className="font-semibold">{progressValue.toFixed(0)}%</span>
                          <span>{MAX_LITRES.toLocaleString()} L</span>
                      </div>
                  </>
              ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Effectuez une conversion pour voir le niveau.</p>
                  </div>
              )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground text-center justify-center border-t pt-4">
              Le niveau est mis à jour après chaque nouvelle mesure valide.
          </CardFooter>
      </Card>
    </div>
    </div>
  );
};
export default ConversionPage;