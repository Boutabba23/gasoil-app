// client/src/pages/ConversionPage.tsx
import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import ConversionForm, {
  type ConversionSuccessData,
} from "../components/ConversionForm"; // Import type
import { Progress } from "@/components/ui/progress";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "../lib/api"; // Assuming you might want to fetch initial state
interface ConversionRecordForLatest {
  // Tailored for what you expect for "latest"
  _id: string;
  value_cm: number;
  volume_l: number;
  createdAt: string;
  // Add userEmail, userName if your backend returns them for the latest record
}
interface PaginatedHistoryResponse {
  // More specific name for this context
  data: ConversionRecordForLatest[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const ConversionPage: React.FC = () => {
  const [currentLitres, setCurrentLitres] = useState<number | null>(null);
  const [lastCmValue, setLastCmValue] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true); // For initial data fetch
  const MAX_LITRES = 50710;

  // Function to get color classes based on percentage
  const getLevelColorClasses = (
    percentage: number
  ): { textCls: string; progressCls: string } => {
    // Ensure percentage is a valid number, default to 0 if not
    const p =
      typeof percentage === "number" && !isNaN(percentage) ? percentage : 0;

    if (p <= 10)
      return {
        textCls: "text-red-600 dark:text-red-400",
        progressCls: "[&>*]:bg-red-600 dark:[&>*]:bg-red-500",
      };
    if (p <= 30)
      return {
        textCls: "text-orange-500 dark:text-orange-400",
        progressCls: "[&>*]:bg-orange-500 dark:[&>*]:bg-orange-400",
      };
    if (p <= 70)
      return {
        textCls: "text-yellow-500 dark:text-yellow-400",
        progressCls: "[&>*]:bg-yellow-500 dark:[&>*]:bg-yellow-400",
      };
    if (p <= 90)
      return {
        textCls: "text-lime-600 dark:text-lime-400",
        progressCls: "[&>*]:bg-lime-600 dark:[&>*]:bg-lime-500",
      };
    return {
      textCls: "text-green-600 dark:text-green-400",
      progressCls: "[&>*]:bg-green-600 dark:[&>*]:bg-green-500",
    };
  };

  // Callback from ConversionForm
  const handleConversionSuccess = (data: ConversionSuccessData) => {
    console.log(
      "ConversionPage: handleConversionSuccess CALLED with data:",
      data
    );
    if (typeof data.litres === "number" && typeof data.cm === "number") {
      setCurrentLitres(data.litres);
      setLastCmValue(data.cm);
    } else {
      console.error("ConversionPage: Invalid data from ConversionForm:", data);
      // Potentially reset to a "data error" state if necessary
      setCurrentLitres(null);
      setLastCmValue(null);
    }
  };

  // --- Refined Percentage Calculation and Color Determination ---
  const { displayPercentageString, progressPercentageValue, levelColor } =
    useMemo(() => {
      const isValidLitres =
        currentLitres !== null &&
        typeof currentLitres === "number" &&
        !isNaN(currentLitres);

      if (!isValidLitres) {
        // Handle case where MAX_LITRES might be 0 to avoid division by zero
        const colors = getLevelColorClasses(0);
        return {
          displayLitres:
            currentLitres !== null ? currentLitres.toLocaleString() : "---", // Show "---" or similar if null
          displayPercentageString: "0.00%", // Default if no valid litres
          progressPercentageValue: 0,
          levelColor: colors,
        };
      }

      // Calculate percentage with higher precision internally
      const rawPercentage = (currentLitres / MAX_LITRES) * 100;

      // Clamp value for the Progress component (0-100)
      const clampedProgressPercentage = Math.min(
        100,
        Math.max(0, rawPercentage)
      );

      const colors = getLevelColorClasses(clampedProgressPercentage);

      return {
        displayLitres: currentLitres.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }), // Display litres, e.g., 1 decimal
        // 👇 Choose how many decimal places for percentage display
        displayPercentageString: `${rawPercentage.toFixed(2)}%`, // e.g., "12.34%" (2 decimal places)
        // Or for more: displayPercentageString: `${rawPercentage.toFixed(4)}%`, // e.g., "12.3456%"
        progressPercentageValue: clampedProgressPercentage,
        levelColor: colors,
      };
    }, [currentLitres]); // MAX_LITRES dependency removed if it's a true constant

  // Effect for fetching initial data on mount
  useEffect(() => {
    const fetchLatestLevel = async () => {
      setIsInitialLoading(true);
      try {
        console.log(
          "ConversionPage: Fetching latest conversion details from API."
        );
        // 👇 Use the correct response type here
        const response = await api.get<PaginatedHistoryResponse>(
          "/data/history?page=1&limit=1"
        );
        console.log(
          "ConversionPage: Raw response from /data/history for latest:",
          response
        );
        // Adjust endpoint if you have a dedicated one for "latest"
        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          const latestEntry = response.data.data[0];
          if (
            typeof latestEntry.volume_l === "number" &&
            typeof latestEntry.value_cm === "number"
          ) {
            setCurrentLitres(latestEntry.volume_l);
            setLastCmValue(latestEntry.value_cm);
            console.log(
              "ConversionPage: Initial level set from API:",
              latestEntry
            );
          } else {
            console.warn("ConversionPage: Latest API data has invalid types.");
          }
        } else {
          console.log(
            "ConversionPage: No initial conversion data found from API."
          );
          // setCurrentLitres(null) & setLastCmValue(null) are already default
        }
      } catch (error) {
        console.error(
          "ConversionPage: Failed to fetch latest tank level on mount:",
          error
        );
        // setCurrentLitres(null); // Already null initially
        // setLastCmValue(null);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchLatestLevel();
  }, []); // Empty dependency array: runs only on mount

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Nouvelle Mesure de Jauge
            </CardTitle>
            <CardDescription className="mb-12">
              Entrez la valeur de la jauge (0-259 cm) pour calculer le volume et
              enregistrer une nouvelle mesure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConversionForm onConversionSuccess={handleConversionSuccess} />
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md text-sm text-blue-700 dark:text-blue-300 flex items-start">
              <Lightbulb className="h-5 w-5 mr-3 mt-0.5 shrink-0 text-blue-500" />
              <p>
                Pour une lecture précise, assurez-vous que la jauge est propre
                et maintenue verticalement.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Niveau Citerne Actuel
            </CardTitle>
            {isInitialLoading && (
              <CardDescription>Chargement du dernier niveau...</CardDescription>
            )}
            {!isInitialLoading && lastCmValue !== null && (
              <CardDescription className="mb-12">
                Basé sur la dernière mesure :{" "}
                {lastCmValue.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                cm
              </CardDescription>
            )}
            {!isInitialLoading &&
              currentLitres === null && ( // Show if not loading AND no data
                <CardDescription>
                  Effectuez une conversion pour afficher le niveau.
                </CardDescription>
              )}
          </CardHeader>
          <CardContent className="space-y-4 pt-2 min-h-[200px] h-full flex flex-col justify-center items-center">
            {" "}
            {/* Added min-h */}
            {isInitialLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>Chargement...</p> {/* Or use a ShadCN Skeleton */}
              </div>
            ) : currentLitres !== null ? ( // Check currentLitres is not null
              <>
                <p
                  className={cn(
                    "text-4xl sm:text-5xl font-bold tracking-tight my-2",
                    levelColor.textCls
                  )}
                >
                  {currentLitres.toLocaleString()} L
                </p>
                <Progress
                  value={progressPercentageValue}
                  className={cn(
                    "w-full h-4 rounded-full",
                    levelColor.progressCls
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground w-full mt-1">
                  <span>0 L</span>
                  <span className={cn("font-medium", levelColor.textCls)}>
                    {displayPercentageString}
                  </span>
                  <span>{MAX_LITRES.toLocaleString()} L</span>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="mb-2">
                  Le niveau sera affiché après une mesure valide.
                </p>
              </div>
            )}
            {!isInitialLoading && ( // Only show this tip once loading is done
              <p className="text-xs text-muted-foreground mt-auto pt-4 text-center">
                Le niveau est mis à jour après chaque nouvelle mesure valide.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversionPage;
