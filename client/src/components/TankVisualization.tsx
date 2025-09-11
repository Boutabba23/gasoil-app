import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TankVisualizationProps {
  currentLitres: number | null;
  maxLitres: number;
  lastCmValue: number | null;
  isInitialLoading?: boolean;
}

const TankVisualization: React.FC<TankVisualizationProps> = ({
  currentLitres,
  maxLitres,
  lastCmValue,
  isInitialLoading = false,
}) => {
  const getLevelColorClasses = (
    percentage: number
  ): { textCls: string; progressCls: string } => {
    const p = typeof percentage === "number" && !isNaN(percentage) ? percentage : 0;

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

  const { displayPercentageString, progressPercentageValue, levelColor } = useMemo(() => {
    const isValidLitres =
      currentLitres !== null &&
      typeof currentLitres === "number" &&
      !isNaN(currentLitres);

    if (!isValidLitres) {
      const colors = getLevelColorClasses(0);
      return {
        displayPercentageString: "0.00%",
        progressPercentageValue: 0,
        levelColor: colors,
      };
    }

    const rawPercentage = (currentLitres / maxLitres) * 100;
    const clampedProgressPercentage = Math.min(100, Math.max(0, rawPercentage));
    const colors = getLevelColorClasses(clampedProgressPercentage);

    return {
      displayPercentageString: `${rawPercentage.toFixed(2)}%`,
      progressPercentageValue: clampedProgressPercentage,
      levelColor: colors,
    };
  }, [currentLitres, maxLitres]);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Visualisation de la Citerne</CardTitle>
        {isInitialLoading && (
          <div className="text-muted-foreground">Chargement du niveau actuel...</div>
        )}
        {!isInitialLoading && lastCmValue !== null && (
          <div className="text-muted-foreground">
            Basé sur la dernière mesure :{" "}
            {lastCmValue.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            cm
          </div>
        )}
        {!isInitialLoading && currentLitres === null && (
          <div className="text-muted-foreground">
            Effectuez une conversion pour afficher le niveau.
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md">
            {/* Tank visualization */}
            <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
              {/* Water level */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-700 ease-out"
                style={{ height: `${progressPercentageValue}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-4 bg-blue-400 opacity-50"></div>
              </div>

              {/* Tank markings */}
              {[0, 25, 50, 75, 100].map((mark) => (
                <div
                  key={mark}
                  className="absolute left-0 right-0 flex items-center"
                  style={{ bottom: `${mark}%` }}
                >
                  <div className="w-4 h-px bg-gray-500 dark:bg-gray-400"></div>
                  <div className="ml-2 text-xs text-gray-600 dark:text-gray-300">
                    {mark}%
                  </div>
                </div>
              ))}

              {/* Measurement indicator */}
              {lastCmValue !== null && (
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 w-1 h-4 bg-red-500"
                  style={{ bottom: `${(lastCmValue / 250) * 100}%` }}
                >
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                    {lastCmValue} cm
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 text-center space-y-4 w-full">
            {isInitialLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>Chargement...</p>
              </div>
            ) : currentLitres !== null ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Volume actuel</p>
                  <p
                    className={cn(
                      "text-4xl sm:text-5xl font-bold tracking-tight",
                      levelColor.textCls
                    )}
                  >
                    {currentLitres.toLocaleString()} L
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <Progress
                    value={progressPercentageValue}
                    className={cn(
                      "h-4 rounded-full",
                      levelColor.progressCls
                    )}
                  />
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0 L</span>
                  <span>{maxLitres.toLocaleString()} L</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TankVisualization;
