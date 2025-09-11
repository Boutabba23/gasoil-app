import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Using standard HTML select instead of Select component
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { format, subDays, isAfter, startOfDay, endOfDay, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import api from "../lib/api";

interface ConsumptionData {
  date: string;
  consumption: number;
}

interface PeriodData {
  period: string;
  consumption: number;
}

const FuelAnalytics: React.FC = () => {
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [periodData, setPeriodData] = useState<PeriodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [showCost, setShowCost] = useState(false);

  // Fetch consumption data
  useEffect(() => {
    const fetchConsumptionData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const endDate = new Date();
        const startDate = subDays(endDate, days);

        const response = await api.get(`/data/analytics?from=${format(startDate, "yyyy-MM-dd")}&to=${format(endDate, "yyyy-MM-dd")}`);
        const data = response.data;

        // Process daily data
        const dailyData: Record<string, number> = {};

        data.forEach((record: any) => {
          const date = format(new Date(record.createdAt), "yyyy-MM-dd");
          if (!dailyData[date]) {
            dailyData[date] = 0;
          }
          dailyData[date] += record.volume_l;
        });

        // Convert to array and sort
        const processedDailyData = Object.keys(dailyData).map(date => ({
          date,
          consumption: dailyData[date]
        })).sort((a, b) => a.date.localeCompare(b.date));

        setConsumptionData(processedDailyData);

        // Process period data (weekly/monthly)
        const periodData: PeriodData[] = [];
        const currentDate = new Date(startDate);

        if (days <= 30) {
          // Weekly data for 30 days or less
          while (isAfter(endOfDay(currentDate), startOfDay(startDate))) {
            const weekStart = format(currentDate, "yyyy-MM-dd");
            const weekEnd = format(addDays(currentDate, 6), "yyyy-MM-dd");

            const weekConsumption = data
              .filter((record: any) => {
                const recordDate = new Date(record.createdAt);
                return isAfter(recordDate, startOfDay(currentDate)) &&
                       !isAfter(recordDate, endOfDay(addDays(currentDate, 6)));
              })
              .reduce((sum: number, record: any) => sum + record.volume_l, 0);

            periodData.push({
              period: `Semaine ${Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`,
              consumption: weekConsumption
            });

            currentDate.setDate(currentDate.getDate() + 7);
          }
        } else {
          // Monthly data for more than 30 days
          while (isAfter(endOfDay(currentDate), startOfDay(startDate))) {
            const monthStart = format(currentDate, "yyyy-MM");
            const monthEnd = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), "yyyy-MM-dd");

            const monthConsumption = data
              .filter((record: any) => {
                const recordDate = new Date(record.createdAt);
                return format(recordDate, "yyyy-MM") === monthStart;
              })
              .reduce((sum: number, record: any) => sum + record.volume_l, 0);

            periodData.push({
              period: format(currentDate, "MMM yyyy", { locale: fr }),
              consumption: monthConsumption
            });

            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        }

        setPeriodData(periodData);
      } catch (err) {
        console.error("Failed to fetch consumption data:", err);
        setError("Impossible de charger les données de consommation");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsumptionData();
  }, [timeRange]);

  // Calculate statistics
  const totalConsumption = consumptionData.reduce((sum, day) => sum + day.consumption, 0);
  const avgDailyConsumption = consumptionData.length > 0 ? totalConsumption / consumptionData.length : 0;
  const firstDay = consumptionData.length > 0 ? consumptionData[0].consumption : 0;
  const lastDay = consumptionData.length > 0 ? consumptionData[consumptionData.length - 1].consumption : 0;
  const trend = lastDay > firstDay ? "up" : lastDay < firstDay ? "down" : "stable";

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analyse de Consommation</h1>
          <p className="text-muted-foreground">
            Suivi et analyse détaillée de votre consommation de carburant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as "7d" | "30d" | "90d")}
            className="w-[150px] border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
          <Button
            variant={showCost ? "default" : "outline"}
            onClick={() => setShowCost(!showCost)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Coûts
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consommation totale</p>
                <p className="text-2xl font-bold">{totalConsumption.toFixed(1)} L</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consommation journalière</p>
                <p className="text-2xl font-bold">{avgDailyConsumption.toFixed(1)} L/jour</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tendance</p>
                <div className="flex items-center gap-1">
                  {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {trend === "stable" && <div className="h-4 w-4 rounded-full bg-gray-500" />}
                  <span className={`font-medium ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}`}>
                    {trend === "up" ? "En augmentation" : trend === "down" ? "En baisse" : "Stable"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coût estimé</p>
                <p className="text-2xl font-bold">
                  {showCost ? formatCurrency(totalConsumption * 1.5) : "---"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Consommation Journalière</CardTitle>
            <CardDescription>
              Évolution de votre consommation de carburant jour par jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Chargement des données...</p>
              </div>
            ) : error ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), "dd/MM")}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), "dd/MM/yyyy")}
                    formatter={(value) => [`${value} L`, "Consommation"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              {timeRange === "7d" ? "Consommation par Semaine" : "Consommation par Mois"}
            </CardTitle>
            <CardDescription>
              Agrégation de la consommation par {timeRange === "7d" ? "semaine" : "mois"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Chargement des données...</p>
              </div>
            ) : error ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <AreaChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} L`, "Consommation"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
          <CardDescription>
            Basées sur votre historique de consommation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200">Optimisation</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                {avgDailyConsumption > 100 
                  ? "Considérez réduire votre consommation journalière pour économiser sur les coûts."
                  : "Votre consommation est bien équilibrée. Continuez comme ça !"}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200">Maintenance</h3>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                {trend === "up" 
                  ? "Une augmentation de la consommation est détectée. Vérifiez si une maintenance est nécessaire."
                  : "Votre consommation est stable, pas besoin d'intervention particulière."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelAnalytics;
