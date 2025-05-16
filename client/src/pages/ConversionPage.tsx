import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import ConversionForm from '../components/ConversionForm'; // The updated form
import { Progress } from "@/components/ui/progress";
// import api from '../lib/api'; // Uncomment if you implement fetching latest level

const ConversionPage: React.FC = () => {
  const [currentLitres, setCurrentLitres] = useState<number | null>(null);
  const [lastCmValue] = useState<number | null>(null); // Optional
  const MAX_LITRES = 50000;

  // Optional: Fetch latest level on mount
  useEffect(() => {
    const fetchLatestLevel = async () => {
      console.log("ConversionPage: Attempting to fetch latest level (if endpoint exists).");
      // try {
      //   const response = await api.get('/api/data/latest-conversion-details');
      //   if (response.data) {
      //     setCurrentLitres(response.data.volume_l);
      //     setLastCmValue(response.data.value_cm);
      //   }
      // } catch (error) {
      //   console.error("ConversionPage: Failed to fetch latest tank level", error);
      // }
    };
    fetchLatestLevel();
  }, []);

  // This IS the function that should be called
  const handleConversionSuccess = (convertedLitres: number) => {
    console.log("ConversionPage: Correct handleConversionSuccess CALLED with litres:", convertedLitres);
    setCurrentLitres(convertedLitres);
  };

  const progressValue = currentLitres !== null ? Math.min(100, Math.max(0, (currentLitres / MAX_LITRES) * 100)) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl dark:text-slate-100">Conversion de Jauge</h1>
      
      <Card>
          <CardHeader>
              <CardTitle>Niveau Actuel de la Citerne</CardTitle>
              {lastCmValue !== null && ( // Display only if lastCmValue is available
                <CardDescription>Dernière mesure de jauge: {lastCmValue} cm</CardDescription>
              )}
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
              {currentLitres !== null ? (
                  <>
                      <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{currentLitres.toLocaleString()} L</span>
                          <span>{MAX_LITRES.toLocaleString()} L</span>
                      </div>
                      <Progress value={progressValue} className="w-full h-3 [&>*]:bg-blue-600" />
                      <p className="text-center text-lg font-medium text-foreground dark:text-slate-200">
                          {progressValue.toFixed(1)}% plein
                      </p>
                  </>
              ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Le niveau actuel sera affiché après une conversion.
                  </p>
              )}
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Effectuer une Nouvelle Mesure</CardTitle>
          <CardDescription>
            Entrez la mesure de la jauge pour calculer le volume et enregistrer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Ensure onConversionSuccess is passed correctly */}
          <ConversionForm onConversionSuccess={handleConversionSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};
export default ConversionPage;