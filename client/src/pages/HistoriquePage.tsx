import React, { useState, useCallback } from 'react'; // Added useCallback
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import HistoryTable from '../components/HistoryTable'; // The updated component
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, RotateCcw } from "lucide-react"; // Added RotateCcw for reset
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns"; // Added subDays for default range
import { fr } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';

const HistoriquePage: React.FC = () => {
  // States for filters are managed here and passed to HistoryTable
  const [searchTermInput, setSearchTermInput] = useState(""); // Temp for input field
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // Actual term used for query
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // Default to last 30 days
    to: new Date(),
  });

  // Key to force HistoryTable re-render/re-fetch when filters are applied
  // This is simpler than making fetchHistory a prop or lifting all state
  const [historyTableKey, setHistoryTableKey] = useState(0);

  const applyFilters = useCallback(() => {
    setActiveSearchTerm(searchTermInput);
    setHistoryTableKey(prev => prev + 1); // Change key to trigger re-fetch in HistoryTable
  }, [searchTermInput]);

  const resetFilters = () => {
    setSearchTermInput("");
    setActiveSearchTerm("");
    setDateRange({ from: subDays(new Date(), 30), to: new Date() });
    setHistoryTableKey(prev => prev + 1);
  };

  // Apply filters on Enter key in search input
  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      applyFilters();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl dark:text-slate-100">
          Historique des Mesures
        </h1>
        {/* Future export button could go here */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Affinez votre recherche par terme ou sélectionnez une période.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="relative">
              <Label htmlFor="search-term" className="text-xs text-muted-foreground">Rechercher (cm/L)</Label>
              <Search className="absolute left-2.5 top-[calc(50%-2px+theme(spacing.2))] h-4 w-4 text-muted-foreground" /> {/* Adjusted positioning */}
              <Input
                id="search-term"
                type="search"
                placeholder="Ex: 135 ou 24500..."
                value={searchTermInput}
                onChange={(e) => setSearchTermInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-8 w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="date-range" className="text-xs text-muted-foreground">Période</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10", // Ensure consistent height
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd LLL yy", { locale: fr })} -{" "}
                          {format(dateRange.to, "dd LLL yy", { locale: fr })}
                        </>
                      ) : (
                        format(dateRange.from, "dd LLL yy", { locale: fr })
                      )
                    ) : (
                      <span>Choisissez une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={fr}
                    showOutsideDays={false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <Button onClick={applyFilters} className="w-full lg:w-auto flex-grow">
                    <Search className="mr-2 h-4 w-4"/> Appliquer
                </Button>
                <Button onClick={resetFilters} variant="outline" className="w-full lg:w-auto flex-grow">
                    <RotateCcw className="mr-2 h-4 w-4"/> Réinitialiser
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enregistrements des Conversions</CardTitle>
          {/* You could show active filter summary here */}
        </CardHeader>
        <CardContent>
          <HistoryTable
            key={historyTableKey} // Force re-render when key changes
            searchTerm={activeSearchTerm}
            dateRange={dateRange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoriquePage;