// client/src/components/ConversionForm.tsx

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '../lib/api';
import { toast } from "sonner"; // Correct import for Sonner's trigger
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For inline messages
import {  CheckCircle, AlertCircle } from "lucide-react"; // Icons for inline messages

import{successToastClasses, destructiveToastClasses} from '@/lib/toastStyles';

interface ConversionFormProps {
  onConversionSuccess: () => void; // Callback to refresh history or other actions
}

const ConversionForm: React.FC<ConversionFormProps> = ({ onConversionSuccess }) => {
  const [cmValue, setCmValue] = useState<string>('');
  const [result, setResult] = useState<string | null>(null); // For displaying result inline
  const [inlineError, setInlineError] = useState<string | null>(null); // For displaying errors inline
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null); // Clear previous inline errors
    setResult(null);     // Clear previous inline results

    // --- Input Validation ---
    if (!cmValue.trim()) {
      const msg = 'Veuillez entrer une valeur.';
      setInlineError(msg);
      toast.error("Champ Requis", {
        description: msg,
        className: destructiveToastClasses,
      });
      return;
    }

    const numericCmValue = parseFloat(cmValue);
    if (isNaN(numericCmValue) || numericCmValue < 0 || numericCmValue > 300) {
      const msg = 'Veuillez entrer une valeur numérique valide entre 0 et 300 cm.';
      setInlineError(msg);
      toast.error("Valeur Invalide", {
        description: msg,
        className: destructiveToastClasses,
      });
      return;
    }

    setIsLoading(true);
    try {
      // --- API Call ---
      const response = await api.post('/data/convert', { value_cm: numericCmValue });
      const successMessage = `${response.data.value_cm} cm ➜ ${response.data.volume_l} L`;
      setResult(successMessage); // Set inline result

      // --- Success Toast ---
      toast.success("Conversion Réussie", {
        description: successMessage, // You can customize this description
        className: successToastClasses,
      });

      onConversionSuccess(); // Trigger callback (e.g., to refresh history table)
      setCmValue('');        // Reset input field
    } catch (err: any) {
      console.error("API Error in ConversionForm:", err);
      const apiErrorMessage = err.response?.data?.message || "Une erreur est survenue lors de la conversion.";
      setInlineError(apiErrorMessage); // Set inline error

      // --- Error Toast ---
      toast.error("Erreur de Conversion", {
        description: apiErrorMessage,
        className: destructiveToastClasses,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased space for better layout */}
      <div>
        <Label htmlFor="cm-value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Valeur de Jauge (en cm)
        </Label>
        <Input
          id="cm-value"
          type="number"
          value={cmValue}
          onChange={(e) => {
            setCmValue(e.target.value);
            if (inlineError) setInlineError(null); // Clear inline error on input change
            if (result) setResult(null);         // Clear inline result on input change
          }}
          placeholder="Ex: 135"
          min="0"
          max="300"
          step="0.1" // Allow decimals, or use "1" for whole numbers
          className="mt-1 block w-full shadow-sm sm:text-sm rounded-md dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
          required // HTML5 validation
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Conversion en cours...
          </>
        ) : (
          'Convertir en Litres'
        )}
      </Button>

      {/* Optional: Inline messages for immediate feedback in the form */}
      {inlineError && !isLoading && (
        <Alert variant="destructive" className="mt-4 bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          <AlertTitle className="font-semibold text-red-700 dark:text-red-300">Erreur de saisie</AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-400">{inlineError}</AlertDescription>
        </Alert>
      )}
      {result && !isLoading && (
         <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            <AlertTitle className="font-semibold text-green-700 dark:text-green-300">Résultat de la Conversion</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">{result}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};

export default ConversionForm;