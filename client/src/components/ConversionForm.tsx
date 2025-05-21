import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '../lib/api';
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const successSonnerToastClasses = "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/60 dark:border-green-700 dark:text-green-200 rounded-lg shadow-md p-4";
const destructiveSonnerToastClasses = "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";
const infoSonnerToastClasses = "bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/60 dark:border-blue-700 dark:text-blue-200 rounded-lg shadow-md p-4";
interface ConversionSuccessData {
  litres: number;
  cm: number; // The CM value that was converted
}
interface ConversionFormProps {
  // UPDATED: Expect an object with litres and cm
  onConversionSuccess: (data: { litres: number; cm: number }) => void; 
}


const ConversionForm: React.FC<ConversionFormProps> = ({ onConversionSuccess }) => {
  const [cmValue, setCmValue] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setInlineError(null); 
    setResult(null);     

    if (!cmValue.trim()) {
      const msg = 'Veuillez entrer une valeur.';
      setInlineError(msg);
      toast.error("Champ Requis", { description: msg, className: destructiveSonnerToastClasses });
      return;
    }

    const numericCmValue = parseFloat(cmValue);
    if (isNaN(numericCmValue) || numericCmValue < 0 || numericCmValue > 300) {
      const msg = `Valeur en cm invalide. Doit être un nombre entre 0 et 300. Reçu: ${cmValue}`;
      setInlineError(msg);
      toast.error("Valeur Invalide", { description: msg, className: destructiveSonnerToastClasses });
      return;
    }

    if (numericCmValue === 0) {
      const baseMessage = "0 cm ➜ 0 L";
      setResult(baseMessage);
      setInlineError(null);
      toast.info("Information", {
        description: baseMessage,
        className: infoSonnerToastClasses,
      });
      onConversionSuccess({ litres: 0, cm: 0 }); 
      setCmValue('');        
     
      // Log before calling for 0 cm case as well
      console.log("ConversionForm: [0 cm case] Type of onConversionSuccess:", typeof onConversionSuccess);
      if (typeof onConversionSuccess === 'function') {
        onConversionSuccess({ litres: 0, cm: 0 }); 
      } else {
        console.error("ConversionForm: [0 cm case] onConversionSuccess prop is NOT a function! Value:", onConversionSuccess);
      }
      setCmValue('');        
      return;
    }

    setIsLoading(true);
    try {
      console.log(`ConversionForm: Attempting API call for cmValue: ${numericCmValue}`);
      const response = await api.post('/data/convert', { value_cm: numericCmValue });
      console.log("ConversionForm: API Response SUCCESS", response.data);

      const successMessage = `${response.data.value_cm} cm ➜ ${response.data.volume_l} L`;
      
      setResult(successMessage);
      setInlineError(null); 
      toast.success("Conversion Réussie", {
        description: successMessage,
        className: successSonnerToastClasses,
      });
       // 👇 Pass an object with both litres and the original cm value from response
      onConversionSuccess({ 
          litres: response.data.volume_l, 
          cm: response.data.value_cm 
      });
      setCmValue('');
      // --- Debugging onConversionSuccess ---
      console.log("ConversionForm: Type of onConversionSuccess:", typeof onConversionSuccess);
      console.log("ConversionForm: Is onConversionSuccess a function?", onConversionSuccess instanceof Function);
      if (typeof onConversionSuccess === 'function') {
        onConversionSuccess({ litres: response.data.volume_l, cm: numericCmValue }); // Call the prop function
        console.log("ConversionForm: onConversionSuccess called successfully.");
      } else {
        console.error("ConversionForm: onConversionSuccess prop is NOT a function! Value:", onConversionSuccess);
        // To make the error more explicit if this is the cause:
        // throw new Error("CRITICAL: onConversionSuccess prop was not a function when expected."); 
      }
      // --- End Debugging ---

      setCmValue('');
    } catch (err: any) {
      // This catch block should now primarily handle actual API/network errors,
      // not errors from within the try block's success path.
      console.error("ConversionForm: API Call FAILED or error in post-API logic inside try.", err);
      // Detailed error logging from previous step remains useful here
      const apiErrorMessage = err.response?.data?.message || (err.message || "Une erreur technique est survenue. Veuillez réessayer.");
      setInlineError(apiErrorMessage);
      setResult(null);
      toast.error("Erreur de Conversion", {
        description: apiErrorMessage,
        className: destructiveSonnerToastClasses,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the JSX form structure (no changes needed there for this specific debug)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            if (inlineError) setInlineError(null); 
            if (result) setResult(null);         
          }}
          placeholder="Entrer une valeur Entre 0 et 259 (cm), Exemple: 135"
          min="0"
          max="259"
          maxLength={3}
          step="1"
          className="mt-1 block border-2 border-mylight w-full h-12 shadow-sm sm:text-sm rounded-md dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
          required
        />
      </div>
          <div className=' flex items-center justify-center mt-12'>

      <Button type="submit" disabled={isLoading} className="w-[60%] flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-md font-medium text-white bg-myprimary hover:bg-mysecondary focus:outline-none focus:ring-2 hover:cursor-pointer focus:ring-offset-2 h-12 mb-16 focus:ring-[#ffc9bd] disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
        {isLoading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Conversion en cours...
          </>
        ) : (
          'Convertir en Litres'
        )}
      </Button>
        </div>

      {!isLoading && inlineError && (
        <Alert variant="destructive" className="mt-4 bg-red-50 dark:bg-red-900/30  border-red-300 dark:border-red-700">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <AlertTitle className="font-semibold text-red-700 dark:text-red-300">Erreur</AlertTitle>
            <AlertDescription className="text-red-600 dark:text-red-400">{inlineError}</AlertDescription>
        </Alert>
      )}
      {!isLoading && !inlineError && result && ( 
        <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            <AlertTitle className="font-semibold text-green-700 dark:text-green-300">Résultat</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">{result}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};

export default ConversionForm;