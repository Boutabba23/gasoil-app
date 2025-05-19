// client/src/pages/HistoriquePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import HistoryTable from '../components/HistoryTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { fr } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";

const defaultDateRange = (): DateRange => ({
  from: subDays(new Date(), 29), // Default to last 30 days (0-29 is 30 days)
  to: new Date(),
});

const HistoriquePage: React.FC = () => {
  // State for the input field value
  const [inputSearchTerm, setInputSearchTerm] = useState<string>("");

  // --- State for the date picker itself (what the user is currently selecting) ---
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(defaultDateRange());

  // --- State for the ACTUAL filters applied to the table ---
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const [activeDateRange, setActiveDateRange] = useState<DateRange | undefined>(defaultDateRange());
  
  const [popoverOpen, setPopoverOpen] = useState(false); // To control Popover visibility


  const handleApplyFilters = useCallback(() => {
    setActiveSearchTerm(inputSearchTerm);
    setActiveDateRange(selectedDateRange); // Apply the date range selected in the picker
    setPopoverOpen(false); // Close popover on apply
    console.log("Applying filters. Search:", inputSearchTerm, "DateRange:", selectedDateRange);
    // HistoryTable will re-fetch automatically due to prop changes on activeSearchTerm or activeDateRange
  }, [inputSearchTerm, selectedDateRange]);

  const handleResetFilters = () => {
    setInputSearchTerm("");
    setActiveSearchTerm("");
    const newDefaultDateRange = defaultDateRange();
    setSelectedDateRange(newDefaultDateRange); // Reset picker selection
    setActiveDateRange(newDefaultDateRange);  // Reset active filter for table
    setPopoverOpen(false); // Close popover on reset
    console.log("Filters reset.");
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleApplyFilters();
    }
  };
  
  // When date range selection is complete in the picker, update selectedDateRange
  // We don't auto-apply here, wait for the button.
  const handleDateSelect = (newRange: DateRange | undefined) => {
    setSelectedDateRange(newRange);
    // If 'to' date is selected, consider closing the popover.
    // Or add an "Apply" button inside the popover.
    if (newRange?.from && newRange?.to) {
        // setPopoverOpen(false); // Optional: close popover when full range is selected
    }
  };

  return (
    <div className="space-y-6">
      {/* Sticky Filter Card Wrapper */}
      <div className="py-4 bg-muted/40 dark:bg-slate-900/80 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6">
        <Card className="shadow-md dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Filtrer les Enregistrements</CardTitle>
          </CardHeader>
          <CardContent>
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
                    onKeyDown={handleSearchKeyDown}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
              
              {/* Date Range Picker */}
              <div className="md:col-span-1 space-y-1.5">
                <Label htmlFor="date-range-picker-btn">Période</Label>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-range-picker-btn"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !selectedDateRange && "text-muted-foreground" // Use selectedDateRange for display
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDateRange?.from ? (
                        selectedDateRange.to ? (
                          <>
                            {format(selectedDateRange.from, "dd MMM yy", { locale: fr })} -{" "}
                            {format(selectedDateRange.to, "dd MMM yy", { locale: fr })}
                          </>
                        ) : (
                          format(selectedDateRange.from, "dd MMM yy", { locale: fr })
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
                      defaultMonth={selectedDateRange?.from}
                      selected={selectedDateRange} // Bind to selectedDateRange
                      onSelect={handleDateSelect}   // Use new handler
                      numberOfMonths={2}
                      locale={fr}
                      showOutsideDays={true}
                      // Add your custom classNames for 'today' if needed
                      classNames={{
                        day_today: "!bg-blue-500 !text-white hover:!bg-blue-600 dark:!bg-blue-700 dark:!text-white dark:hover:!bg-blue-800 rounded-md font-bold border-2 !border-blue-300 dark:!border-blue-500",
                        // ... other day_selected, day_range_middle etc styles ...
                      }}
                    />
                    <div className="p-3 border-t border-border flex justify-end">
                       
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:col-span-1 md:self-end">
                  <Button onClick={handleApplyFilters} className="w-full sm:w-auto h-10 hover:bg-mysecondary hover:cursor-pointer bg-myprimary flex-1">
                      <Search className="mr-2 h-4 w-4" /> Appliquer Filtres
                  </Button>
                  <Button onClick={handleResetFilters} variant="outline" className="w-full text-myprimary h-10 hover:cursor-pointer hover:bg-myprimary sm:w-auto flex-1">
                      <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
                  </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Enregistrements</CardTitle>
          {(activeSearchTerm || (activeDateRange?.from && activeDateRange?.to)) && (
            <CardDescription className="text-xs">
              Filtres actifs: 
              {activeSearchTerm && ` Terme="${activeSearchTerm}"`}
              {activeSearchTerm && (activeDateRange?.from && activeDateRange?.to) && " et "}
              {(activeDateRange?.from && activeDateRange?.to) && 
                `Période du ${format(activeDateRange.from, "dd/MM/yy", {locale:fr})} au ${format(activeDateRange.to, "dd/MM/yy", {locale:fr})}`
              }
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <HistoryTable
            searchTerm={activeSearchTerm} 
            dateRange={activeDateRange} // Pass the *active* date range
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoriquePage;