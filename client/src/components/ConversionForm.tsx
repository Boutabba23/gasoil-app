import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from "../lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios, { type AxiosError } from "axios";

const successSonnerToastClasses =
  "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/60 dark:border-green-700 dark:text-green-200 rounded-lg shadow-md p-4";
const destructiveSonnerToastClasses =
  "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";
const infoSonnerToastClasses =
  "bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/60 dark:border-blue-700 dark:text-blue-200 rounded-lg shadow-md p-4";

interface BackendErrorPayload {
  message?: string;
}

interface ConversionSuccessData {
  litres: number;
  cm: number;
}

interface ConversionFormProps {
  onConversionSuccess: (data: ConversionSuccessData) => void;
}

const ConversionForm: React.FC<ConversionFormProps> = ({
  onConversionSuccess,
}) => {
  const [cmValueString, setCmValueString] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericMax3IntRegex = /^\d{0,3}(\.\d*)?$/;

    if (value === "" || numericMax3IntRegex.test(value)) {
      setCmValueString(value);
      if (inlineError) setInlineError(null);
      if (result) setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentCmInputValue = cmValueString.trim();
    console.log(
      "ConversionForm handleSubmit: Value of 'cmValueString' at start of submit:",
      `"${currentCmInputValue}"`
    );

    setInlineError(null);
    setResult(null);

    if (!currentCmInputValue) {
      const msg = "Veuillez entrer une valeur.";
      console.log(
        "ConversionForm handleSubmit: Validation FAILED - input is empty."
      );
      setInlineError(msg);
      toast.error("Champ Requis", {
        description: msg,
        className: destructiveSonnerToastClasses,
      });
      return;
    }

    const numericCmValue = parseFloat(currentCmInputValue);
    if (isNaN(numericCmValue) || numericCmValue < 0 || numericCmValue > 250) {
      const msg = `Valeur de jauge invalide. Doit être un nombre entre 0.0 et 250.0. Reçu: "${currentCmInputValue}"`;
      console.log(
        "ConversionForm handleSubmit: Validation FAILED - value out of range or NaN."
      );
      setInlineError(msg);
      toast.error("Valeur Invalide", {
        description: msg,
        className: destructiveSonnerToastClasses,
      });
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
      if (typeof onConversionSuccess === "function") {
        onConversionSuccess({ litres: 0, cm: 0 });
      }
      setCmValueString("");
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        `ConversionForm: Attempting API call for cmValue: ${numericCmValue}`
      );
      const response = await api.post("/data/convert", {
        value_cm: numericCmValue,
      });
      console.log("ConversionForm: API Response SUCCESS", response.data);

      const successMessage = `${response.data.value_cm} cm ➜ ${response.data.volume_l} L`;

      setResult(successMessage);
      setInlineError(null);
      toast.success("Conversion Réussie", {
        description: successMessage,
        className: successSonnerToastClasses,
      });
      if (typeof onConversionSuccess === "function") {
        onConversionSuccess({
          litres: response.data.volume_l,
          cm: response.data.value_cm,
        });
      }
      setCmValueString("");
    } catch (err) {
      let errorMessage =
        "Une erreur technique est survenue. Veuillez réessayer.";
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as
          | Partial<BackendErrorPayload>
          | undefined;
        errorMessage =
          errorData?.message ||
          err.message ||
          `Erreur serveur (${err.response?.status || "inconnu"})`;
        console.error("ConversionForm: Axios Error", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
      } else if (err instanceof Error) {
        errorMessage = err.message;
        console.error("ConversionForm: Generic Error", err);
      } else {
        console.error("ConversionForm: Unknown Error", err);
      }

      setInlineError(errorMessage);
      setResult(null);
      toast.error("Erreur de Conversion", {
        description: errorMessage,
        className: destructiveSonnerToastClasses,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label
          htmlFor="cm-value"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Valeur de Jauge (en cm)
        </Label>
        <Input
          id="cm-value"
          type="number"
          value={cmValueString}
          onChange={handleCmInputChange}
          placeholder="Entrer une valeur Entre 0 et 250 (cm), Exemple: 135"
          min="0"
          max="250"
          maxLength={3}
          step="1"
          className="mt-1 block border-2 border-mylight w-full h-12 shadow-sm sm:text-sm rounded-md dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
          required
        />
      </div>
      <div className=" flex items-center justify-center mt-12">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-[60%] flex justify-center  py-2 px-4 border border-transparent rounded-full shadow-md text-md font-medium text-white bg-myprimary hover:bg-mysecondary focus:outline-none focus:ring-2 hover:cursor-pointer focus:ring-offset-2 h-12 mb-8 focus:ring-[#ffc9bd] disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Conversion en cours...
            </>
          ) : (
            "Convertir en Litres"
          )}
        </Button>
      </div>

      {!isLoading && inlineError && (
        <Alert
          variant="destructive"
          className="mt-4 bg-red-50 dark:bg-red-900/30  border-red-300 dark:border-red-700"
        >
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          <AlertTitle className="font-semibold text-red-700 dark:text-red-300">
            Erreur
          </AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-400">
            {inlineError}
          </AlertDescription>
        </Alert>
      )}
      {!isLoading && !inlineError && result && (
        <Alert
          variant="default"
          className="mt-4 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700"
        >
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
          <AlertTitle className="font-semibold text-green-700 dark:text-green-300">
            Résultat
          </AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            {result}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
};

export default ConversionForm;
