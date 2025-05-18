import React, { useState, useCallback, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from '@/components/ui/card';
import HistoryTable from '../components/HistoryTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, FilterX } from "lucide-react"; // Added FilterX
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfMonth } from "date-fns";
import { fr } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // For pre-defined date ranges
import { Label } from '@/components/ui/label';

const dateRangeOptions = [
  { label: "Aujourd'hui", value: "today" },
  { label: "7 derniers jours", value: "7days" },
  { label: "30 derniers jours", value: "30days" },
  { label: "Mois en cours", value: "thisMonth" },
  { label: "Personnalisé", value: "custom" },
];

const HistoriquePage: React.FC = () => {
  const [searchTermInput, setSearchTermInput] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // Default
    to: new Date(),
  });
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>("30days");
  const [historyTableKey, setHistoryTableKey] = useState(0);

  const applyFilters = useCallback(() => {
    setActiveSearchTerm(searchTermInput.trim());
    // Date range is already updated by onSelect or preset change
    setHistoryTableKey(prev => prev + 1);
  }, [searchTermInput]);

  useEffect(() => { // Apply filters automatically when dateRange (from presets or calendar) changes
      if (selectedDatePreset !== "custom" || dateRange?.from && dateRange.to ) { // Apply if not custom or custom is fully set
        applyFilters();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedDatePreset]); // Do not include applyFilters here to avoid loop


  const handleDatePresetChange = (value: string) => {
    setSelectedDatePreset(value);
    const today = new Date();
    switch (value) {
      case "today":
        setDateRange({ from: today, to: today });
        break;
      case "7days":
        setDateRange({ from: subDays(today, 6), to: today });
        break;
      case "30days":
        setDateRange({ from: subDays(today, 29), to: today });
        break;
      case "thisMonth":
        setDateRange({ from: startOfMonth(today), to: today });
        break;
      case "custom":
        // Do nothing, user will use calendar. Keep existing dateRange or let them pick.
        // Could set to undefined to force calendar pick:
        // setDateRange(undefined); 
        break;
      default:
        setDateRange({ from: subDays(today, 29), to: today });
    }
    // applyFilters(); // Will be called by useEffect on dateRange change
  };


  const resetFilters = () => {
    setSearchTermInput("");
    setActiveSearchTerm("");
    handleDatePresetChange("30days"); // Reset to default preset which also sets dateRange and triggers apply
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') applyFilters();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b pb-4"> {/* Added border */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">Historique des Mesures</CardTitle>
              <CardDescription>
                Consultez et filtrez les enregistrements.
              </CardDescription>
            </div>
            <Button onClick={resetFilters} variant="outline" size="sm">
                <FilterX className="mr-2 h-4 w-4"/> Réinitialiser les Filtres
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div className="relative md:col-span-1"> {/* Input takes less space */}
              <Label htmlFor="search-term" className="text-xs font-medium text-muted-foreground">Rechercher par valeur</Label>
              <Search className="absolute left-2.5 top-[calc(1lh+0.875rem)] h-4 w-4 text-muted-foreground" /> {/* Adjusted positioning based on Label */}
              <Input
                id="search-term"
                type="search"
                placeholder="cm ou L..."
                value={searchTermInput}
                onChange={(e) => setSearchTermInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-8 w-full mt-1" // Added mt-1
              />
            </div>
            
            <div className="md:col-span-1"> {/* Select takes less space */}
              <Label htmlFor="date-preset" className="text-xs font-medium text-muted-foreground">Période Prédéfinie</Label>
               <Select value={selectedDatePreset} onValueChange={handleDatePresetChange}>
                <SelectTrigger className="w-full mt-1" id="date-preset">
                    <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                    {dateRangeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDatePreset === "custom" && ( // Show calendar only for custom
              <div className="md:col-span-1">
                <Label htmlFor="date-range-picker" className="text-xs font-medium text-muted-foreground">Période Personnalisée</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-range-picker"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal h-10 mt-1", !dateRange && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}</>) : format(dateRange.from, "dd/MM/yy")) : (<span>Date personnalisée</span>)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={fr} />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
           {/* Apply Filters button is now less prominent as filters apply more automatically or on Enter */}
           {/* You could keep it if you prefer explicit apply action for all filters */}
           {/* <div className="flex justify-end pt-2">
             <Button onClick={applyFilters} size="sm"><SlidersVertical className="mr-2 h-4 w-4"/> Appliquer Filtres</Button>
           </div> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Enregistrements</CardTitle>
           {/* Add count here? */}
        </CardHeader>
        <CardContent>
          <HistoryTable
            key={historyTableKey}
            searchTerm={activeSearchTerm}
            dateRange={dateRange}
          />
        </CardContent>
         {/* <CardFooter>
            <p className="text-xs text-muted-foreground">Pagination gérée dans le tableau.</p>
        </CardFooter> */}
      </Card>
    </div>
  );
};
export default HistoriquePage;