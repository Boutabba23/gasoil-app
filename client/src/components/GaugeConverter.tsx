import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from "../lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const successSonnerToastClasses =
  "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/60 dark:border-green-700 dark:text-green-200 rounded-lg shadow-md p-4";
const destructiveSonnerToastClasses =
  "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";
const infoSonnerToastClasses =
  "bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/60 dark:border-blue-700 dark:text-blue-200 rounded-lg shadow-md p-4";

interface BackendErrorPayload {
  message?: string;
}

export interface ConversionSuccessData {
  litres: number;
  cm: number;
}

interface GaugeConverterProps {
  onConversionSuccess: (data: ConversionSuccessData) => void;
}

const GaugeConverter: React.FC<GaugeConverterProps> = ({
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
      "GaugeConverter handleSubmit: Value of 'cmValueString' at start of submit:",
      `"${currentCmInputValue}"`
    );

    setInlineError(null);
    setResult(null);

    if (!currentCmInputValue) {
      const msg = "Veuillez entrer une valeur.";
      console.log(
        "GaugeConverter handleSubmit: Validation FAILED - input is empty."
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
        "GaugeConverter handleSubmit: Validation FAILED - value out of range or NaN."
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
        `GaugeConverter: Attempting API call for cmValue: ${numericCmValue}`
      );
      const response = await api.post("/data/convert", {
        value_cm: numericCmValue,
      });
      console.log("GaugeConverter: API Response SUCCESS", response.data);

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
        console.error("GaugeConverter: Axios Error", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
      } else if (err instanceof Error) {
        errorMessage = err.message;
        console.error("GaugeConverter: Generic Error", err);
      } else {
        console.error("GaugeConverter: Unknown Error", err);
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

  // Calculate gauge rotation based on input value (0-250 maps to 0-180 degrees)
  const calculateGaugeRotation = () => {
    if (!cmValueString) return 0;
    const value = parseFloat(cmValueString);
    if (isNaN(value)) return 0;
    // Map 0-250 to 0-180 degrees
    return Math.min(180, Math.max(0, (value / 250) * 180));
  };

  const gaugeRotation = calculateGaugeRotation();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Conversion Jauge
      </h2>

      {/* Gauge visualization */}
      <div className="relative w-64 h-32 mb-8">
        {/* Gauge background */}
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Gauge markings */}
        {[0, 50, 100, 150, 200, 250].map((mark) => (
          <div
            key={mark}
            className="absolute bottom-0 transform origin-bottom"
            style={{
              left: `${(mark / 250) * 100}%`,
              height: mark % 100 === 0 ? "16px" : "10px",
              width: "2px",
              backgroundColor: mark % 100 === 0 ? "#4B5563" : "#9CA3AF",
            }}
          >
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">
              {mark}
            </span>
          </div>
        ))}

        {/* Gauge needle */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 origin-bottom transition-transform duration-500 ease-out"
          style={{
            height: "100%",
            width: "4px",
            backgroundColor: "#EF4444",
            transform: `translateX(-50%) rotate(${gaugeRotation}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
        </div>

        {/* Center pivot */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-gray-800 dark:bg-gray-200 rounded-full z-10"></div>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <Label
            htmlFor="cm-value"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Valeur de Jauge (cm)
          </Label>
          <Input
            id="cm-value"
            type="number"
            value={cmValueString}
            onChange={handleCmInputChange}
            placeholder="0-250 cm"
            min="0"
            max="250"
            step="1"
            className="w-full h-12 text-center text-lg font-semibold border-2 border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
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
      </form>

      {/* Result display */}
      {!isLoading && inlineError && (
        <Alert
          variant="destructive"
          className="mt-6 w-full bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700"
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
          className="mt-6 w-full bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700"
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
    </div>
  );
};

export default GaugeConverter;
