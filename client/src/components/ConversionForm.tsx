import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '../lib/api';
import { useToast } from "@/components/ui/sonner"; // Import useToast
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface ConversionFormProps {
  onConversionSuccess: () => void; // Callback pour rafraîchir l'historique
}

const ConversionForm: React.FC<ConversionFormProps> = ({ onConversionSuccess }) => {
  const [cmValue, setCmValue] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast(); // Initialiser useToast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!cmValue.trim()) {
      setError('Veuillez entrer une valeur.');
      return;
    }
    const numericCmValue = parseFloat(cmValue);
    if (isNaN(numericCmValue) || numericCmValue < 0 || numericCmValue > 300) {
        setError('Veuillez entrer une valeur numérique valide entre 0 et 300 cm.');
        return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/data/convert', { value_cm: numericCmValue });
      setResult(`${response.data.value_cm} cm ➜ ${response.data.volume_l} L`);
      toast({ // Afficher une notification de succès
        title: "Conversion Réussie",
        description: response.data.message,
      });
      onConversionSuccess(); // Appeler le callback
      setCmValue(''); // Réinitialiser le champ
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la conversion.";
      setError(errorMessage);
      toast({ // Afficher une notification d'erreur
        title: "Erreur de Conversion",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cm-value">Valeur de Jauge (cm)</Label>
        <Input
          id="cm-value"
          type="number"
          value={cmValue}
          onChange={(e) => setCmValue(e.target.value)}
          placeholder="Ex: 135"
          min="0"
          max="300" // La jauge fait 3m = 300cm
          step="0.1" // Permettre les décimales si besoin, sinon step="1"
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Conversion...' : 'Convertir'}
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {result && !error && (
         <Alert className="mt-4 bg-green-50 border-green-300 text-green-700">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Résultat</AlertTitle>
            <AlertDescription className="font-semibold">{result}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};

export default ConversionForm;