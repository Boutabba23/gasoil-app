// client/src/pages/HistoriquePage.tsx
import React, { useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import HistoryTable from "../components/HistoryTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label"; // Ensure Label is imported

const HistoriquePage: React.FC = () => {
  const [inputSearchTerm, setInputSearchTerm] = useState(""); // For the controlled input field
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // Term used for the actual query

  // Default date range, e.g., last 30 days
  const [dateRange, setDateRange] =
    (useState < DateRange) |
    (undefined >
      (() => {
        return { from: subDays(new Date(), 29), to: new Date() };
      }));

  // This state will trigger re-render of HistoryTable with new props
  const [filtersApplied, setFiltersApplied] = useState(0);

  const handleApplyFilters = useCallback(() => {
    setActiveSearchTerm(inputSearchTerm);
    setFiltersApplied((prev) => prev + 1); // Increment to trigger re-render if props themselves don't cause it
    console.log(
      "Applying filters. Search:",
      inputSearchTerm,
      "DateRange:",
      dateRange
    );
  }, [inputSearchTerm, dateRange]); // Add dateRange here

  const handleResetFilters = () => {
    setInputSearchTerm("");
    setActiveSearchTerm("");
    setDateRange({ from: subDays(new Date(), 29), to: new Date() });
    setFiltersApplied((prev) => prev + 1); // Trigger re-render
    console.log("Filters reset.");
  };

  const handleSearchKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleApplyFilters();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Title is now primarily in DashboardLayout's header, can be removed or kept as sub-header */}
        {/* <h1 className="text-2xl font-semibold text-foreground sm:text-3xl dark:text-slate-100">
          Historique des Mesures
        </h1> */}
      </div>

      {/* --- THIS IS THE MISSING FILTER CONTROLS CARD --- */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer les Enregistrements</CardTitle>
          <CardDescription>
            Affinez votre recherche par terme (valeur en cm ou volume en L) ou
            sélectionnez une période.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-1 space-y-1.5">
              <Label htmlFor="search-history-input">Rechercher (cm ou L)</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-history-input"
                  type="search"
                  placeholder="Ex: 135 ou 24500..."
                  value={inputSearchTerm}
                  onChange={(e) => setInputSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyPress} // Changed from onKeyPress to onKeyDown for better Enter key handling
                  className="pl-8 w-full"
                />
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="md:col-span-1 space-y-1.5">
              <Label htmlFor="date-range-picker-btn">Période</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range-picker-btn" // Give button an id if Label points to it
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10", // Consistent height
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM yy", { locale: fr })}{" "}
                          - {format(dateRange.to, "dd MMM yy", { locale: fr })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yy", { locale: fr })
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
                    onSelect={(newRange) => {
                      setDateRange(newRange);
                      // Optionally auto-apply on date select, or rely on "Appliquer" button
                      // If auto-applying: setActiveSearchTerm(inputSearchTerm); setFiltersApplied(prev => prev + 1);
                    }}
                    numberOfMonths={2}
                    locale={fr}
                    showOutsideDays={true}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:col-span-1 md:self-end">
              {" "}
              {/* md:self-end to align with input bottom */}
              <Button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto flex-1"
              >
                <Search className="mr-2 h-4 w-4" /> Appliquer
              </Button>
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="w-full sm:w-auto flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* --- END OF FILTER CONTROLS CARD --- */}

      <Card>
        <CardHeader>
          <CardTitle>Liste des Enregistrements</CardTitle>
          {/* Optional: Display active filters here */}
          {(activeSearchTerm || (dateRange?.from && dateRange?.to)) && (
            <CardDescription className="text-xs">
              Filtres actifs:
              {activeSearchTerm && ` Terme="${activeSearchTerm}"`}
              {activeSearchTerm && dateRange?.from && dateRange?.to && " et "}
              {dateRange?.from &&
                dateRange?.to &&
                `Période du ${format(dateRange.from, "dd/MM/yy", {
                  locale: fr,
                })} au ${format(dateRange.to, "dd/MM/yy", { locale: fr })}`}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {/* Pass the activeSearchTerm and dateRange. 
              The 'key' prop ensures HistoryTable re-mounts if these crucial filter identity props change,
              BUT ideally, HistoryTable should have its own useEffect reacting to prop changes to refetch.
              We modified HistoryTable previously to react to searchTerm & dateRange prop changes to reset page and fetch.
          */}
          <HistoryTable
            // key={filtersApplied} // Only use this if HistoryTable *doesn't* have internal useEffects reacting to prop changes
            searchTerm={activeSearchTerm}
            dateRange={dateRange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoriquePage;
