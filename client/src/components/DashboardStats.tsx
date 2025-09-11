import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import api from "../lib/api";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  refreshTrigger?: number;
}

interface StatsData {
  totalVolume: number;
  averageConsumption: number;
  lastMeasurement: {
    value_cm: number;
    volume_l: number;
    createdAt: string;
  } | null;
  dailyTrend: "up" | "down" | "stable";
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch last 30 days of data
        const response = await api.get("/data/history?page=1&limit=100&from=30days");
        const data = response.data.data;

        if (data.length === 0) {
          setStats({
            totalVolume: 0,
            averageConsumption: 0,
            lastMeasurement: null,
            dailyTrend: "stable",
          });
          return;
        }

        // Calculate stats
        const totalVolume = data.reduce((sum: number, record: any) => sum + record.volume_l, 0);

        // Calculate average daily consumption
        const uniqueDays = new Set(data.map((record: any) => 
          format(new Date(record.createdAt), "yyyy-MM-dd")
        ));
        const averageConsumption = totalVolume / uniqueDays.size;

        // Get last measurement
        const lastMeasurement = data[data.length - 1];

        // Determine trend (compare last 5 days with previous 5 days)
        const sortedData = [...data].sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const recentData = sortedData.slice(-5);
        const previousData = sortedData.slice(-10, -5);

        const recentTotal = recentData.reduce((sum: number, record: any) => sum + record.volume_l, 0);
        const previousTotal = previousData.reduce((sum: number, record: any) => sum + record.volume_l, 0);

        let dailyTrend: "up" | "down" | "stable" = "stable";
        if (previousTotal > 0) {
          const change = ((recentTotal - previousTotal) / previousTotal) * 100;
          if (change > 5) dailyTrend = "up";
          else if (change < -5) dailyTrend = "down";
        }

        setStats({
          totalVolume,
          averageConsumption,
          lastMeasurement,
          dailyTrend,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Impossible de charger les statistiques");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  const MAX_LITRES = 50710;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500 dark:text-red-400">{error || "Données indisponibles"}</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (stats.dailyTrend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    switch (stats.dailyTrend) {
      case "up":
        return "Consommation en hausse";
      case "down":
        return "Consommation en baisse";
      default:
        return "Consommation stable";
    }
  };

  const getPercentage = () => {
    if (!stats.lastMeasurement) return 0;
    return (stats.lastMeasurement.volume_l / MAX_LITRES) * 100;
  };

  const getLevelColorClasses = (percentage: number) => {
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

  const levelColor = getLevelColorClasses(getPercentage());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Volume Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVolume.toLocaleString()} L</div>
          <p className="text-xs text-muted-foreground">
            Volume total sur 30 jours
          </p>
        </CardContent>
      </Card>

      {/* Average Consumption Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consommation Moyenne</CardTitle>
          {getTrendIcon()}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageConsumption.toFixed(1)} L/jour</div>
          <p className="text-xs text-muted-foreground">
            {getTrendText()}
          </p>
        </CardContent>
      </Card>

      {/* Last Measurement Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dernière Mesure</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.lastMeasurement ? (
            <>
              <div className="text-2xl font-bold">
                {stats.lastMeasurement.volume_l.toLocaleString()} L
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.lastMeasurement.value_cm} cm -{" "}
                {format(new Date(stats.lastMeasurement.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: fr,
                })}
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">-</div>
          )}
        </CardContent>
      </Card>

      {/* Tank Level Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Niveau Citerne</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.lastMeasurement ? (
            <>
              <div className="text-2xl font-bold mb-2">
                {getPercentage().toFixed(1)}%
              </div>
              <Progress
                value={getPercentage()}
                className={cn(
                  "w-full h-2 rounded-full",
                  levelColor.progressCls
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">-</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
