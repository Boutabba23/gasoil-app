// client/src/pages/HistoriquePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from '@/components/ui/card';
import HistoryTable from '../components/HistoryTable'; // Assuming this component is correctly implemented
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar"; // ShadCN UI Calendar
import { format, parse, isValid, subDays, isAfter } from "date-fns"; // Added isAfter
import { fr } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // For validation error toasts

// Toast style for errors (define or import from a shared location)
const destructiveSonnerToastClasses = "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";

// Consistent date format for display and parsing
const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";

const defaultDateRange = (): DateRange => ({
  from: subDays(new Date(), 29), // Default to last 30 days
  to: new Date(),
});

const HistoriquePage: React.FC = () => {
  // For the search text input field
  const [inputSearchTerm, setInputSearchTerm] = useState<string>("");

  // For the date input string fields
  const [fromDateInputString, setFromDateInputString] = useState<string>(
    format(defaultDateRange().from!, DISPLAY_DATE_FORMAT, { locale: fr })
  );
  const [toDateInputString, setToDateInputString] = useState<string>(
    format(defaultDateRange().to!, DISPLAY_DATE_FORMAT, { locale: fr })
  );

  // Represents the date range currently selected in the calendar or typed validly,
  // before being officially "applied" as a filter.
  const [pendingDateRange, setPendingDateRange] = useState<DateRange | undefined>(defaultDateRange());

  // Filters that are *actually* applied to the HistoryTable
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const [activeDateRange, setActiveDateRange] = useState<DateRange | undefined>(defaultDateRange());

  // Controls the visibility of the calendar popover
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Sync input strings when pendingDateRange is updated (e.g., by calendar)
  useEffect(() => {
    setFromDateInputString(pendingDateRange?.from ? format(pendingDateRange.from, DISPLAY_DATE_FORMAT, { locale: fr }) : "");
    setToDateInputString(pendingDateRange?.to ? format(pendingDateRange.to, DISPLAY_DATE_FORMAT, { locale: fr }) : "");
  }, [pendingDateRange]);

  const parseDateInput = (dateString: string): Date | undefined => {
    const parsed = parse(dateString, DISPLAY_DATE_FORMAT, new Date(), { locale: fr });
    return isValid(parsed) ? parsed : undefined;
  };
  
  const handleFromDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDateInputString(e.target.value);
    const parsed = parseDateInput(e.target.value);
    if (parsed) {
      setPendingDateRange(prev => ({ from: parsed, to: prev?.to }));
    } else if (e.target.value === "") {
      setPendingDateRange(prev => ({ from: undefined, to: prev?.to }));
    }
  };
  
  const handleToDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDateInputString(e.target.value);
    const parsed = parseDateInput(e.target.value);
    if (parsed) {
      setPendingDateRange(prev => ({ from: prev?.from, to: parsed }));
    } else if (e.target.value === "") {
      setPendingDateRange(prev => ({ from: prev?.from, to: undefined }));
    }
  };
  

  const handleApplyFilters = useCallback(() => {
    let finalFrom = pendingDateRange?.from;
    let finalTo = pendingDateRange?.to;

    // Validate current input strings if they haven't blurred to update pendingDateRange
    const parsedInputFrom = parseDateInput(fromDateInputString);
    if (parsedInputFrom) finalFrom = parsedInputFrom;
    else if (fromDateInputString === "") finalFrom = undefined;
    else if (fromDateInputString !== "" && !parsedInputFrom){ // Typed invalid date
        toast.error("Format Date Incorrect", { description: `Date de début invalide: ${fromDateInputString}`, className: destructiveSonnerToastClasses });
        return;
    }


    const parsedInputTo = parseDateInput(toDateInputString);
    if (parsedInputTo) finalTo = parsedInputTo;
    else if (toDateInputString === "") finalTo = undefined;
    else if (toDateInputString !== "" && !parsedInputTo) { // Typed invalid date
        toast.error("Format Date Incorrect", { description: `Date de fin invalide: ${toDateInputString}`, className: destructiveSonnerToastClasses });
        return;
    }


    if (finalFrom && finalTo && isAfter(finalFrom, finalTo)) {
      toast.error("Dates Invalides", { description: "La date de début ne peut pas être après la date de fin.", className: destructiveSonnerToastClasses });
      return; // Prevent applying invalid range
    }
    
    // Construct the date range to be applied
    // Allow single date selection for 'from' or 'to' if that's a desired behavior
    let rangeToApply: DateRange | undefined = undefined;
    if (finalFrom || finalTo) {
        rangeToApply = { from: finalFrom, to: finalTo };
    }
    
    console.log("Applying filters: Search Term:", inputSearchTerm, "Date Range:", rangeToApply);
    setActiveSearchTerm(inputSearchTerm);
    setActiveDateRange(rangeToApply);
    setIsDatePickerOpen(false); // Close date picker on apply
  }, [inputSearchTerm, fromDateInputString, toDateInputString, pendingDateRange]);

  const handleResetFilters = () => {
    setInputSearchTerm("");
    setActiveSearchTerm("");
    const newDefaultRange = defaultDateRange();
    setPendingDateRange(newDefaultRange); // This will trigger useEffect to update input strings
    setActiveDateRange(newDefaultRange);
    setIsDatePickerOpen(false);
    console.log("Filters reset.");
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleApplyFilters();
    }
  };
  
  // Handler for when dates are selected using the Calendar component
  const handleDateSelectFromCalendar = (newRange: DateRange | undefined) => {
    setPendingDateRange(newRange);
    // Automatically close popover if a full range is selected from calendar
    if (newRange?.from && newRange?.to) {
      setIsDatePickerOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sticky Filter Card Wrapper */}
      <div className="sticky top-0 z-10 py-4 bg-muted/40 dark:bg-slate-900/80 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6">
        <Card className="shadow-md dark:border-slate-700">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg sm:text-xl">Filtrer les Enregistrements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_auto] items-end gap-x-4 gap-y-4">
              {/* Search Input */}
              <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                <Label htmlFor="search-history-input" className="text-xs">Rechercher (cm/L)</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="search-history-input" type="search" placeholder="Ex: 135 ou 24500..." value={inputSearchTerm} onChange={(e) => setInputSearchTerm(e.target.value)} onKeyDown={handleSearchKeyDown} className="pl-8 w-full h-10" />
                </div>
              </div>
              
              {/* "From" Date Input */}
              <div className="space-y-1.5">
                <Label htmlFor="from-date-input" className="text-xs">Date de Début</Label>
                <Input
                  id="from-date-input" type="text" placeholder={DISPLAY_DATE_FORMAT.toLocaleUpperCase()}
                  value={fromDateInputString}
                  onChange={handleFromDateInputChange}
                  onBlur={(e) => { // Parse on blur to update pendingDateRange if valid
                    const parsed = parseDateInput(e.target.value);
                    if (parsed) setPendingDateRange(prev => ({ ...prev, from: parsed }));
                    else if (e.target.value === "") setPendingDateRange(prev => ({ ...prev, from: undefined}));
                  }}
                  onClick={() => setIsDatePickerOpen(true)}
                  className="w-full h-10"
                />
              </div>

              {/* "To" Date Input */}
              <div className="space-y-1.5">
                <Label htmlFor="to-date-input" className="text-xs">Date de Fin</Label>
                <Input
                  id="to-date-input" type="text" placeholder={DISPLAY_DATE_FORMAT.toLocaleUpperCase()}
                  value={toDateInputString}
                  onChange={handleToDateInputChange}
                  onBlur={(e) => {
                    const parsed = parseDateInput(e.target.value);
                    if (parsed) setPendingDateRange(prev => ({ ...prev, to: parsed }));
                    else if (e.target.value === "") setPendingDateRange(prev => ({ ...prev, to: undefined}));
                  }}
                  onClick={() => setIsDatePickerOpen(true)}
                  className="w-full h-10"
                />
              </div>
                
              {/* Calendar Icon to trigger Popover */}
              <div className="flex items-end h-10"> {/* Match input height */}
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" aria-label="Ouvrir le calendrier">
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end" sideOffset={5}>
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={pendingDateRange?.from || pendingDateRange?.to || new Date()}
                          selected={pendingDateRange}
                          onSelect={handleDateSelectFromCalendar}
                          numberOfMonths={2}
                          locale={fr}
                          showOutsideDays={true}
                          classNames={{ day_today: "!bg-blue-500 !text-white hover:!bg-blue-600 dark:!bg-blue-700 dark:!text-white dark:hover:!bg-blue-800 rounded-md font-bold border-2 !border-blue-300 dark:!border-blue-500" }}
                        />
                        <div className="p-2 border-t border-border flex justify-end">
                            <Button size="sm" onClick={() => { setIsDatePickerOpen(false); handleApplyFilters(); }}>
                                Ok & Appliquer
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-1">
                <Button onClick={handleApplyFilters} className="w-full sm:w-auto sm:flex-1 whitespace-nowrap">
                    <Search className="mr-2 h-4 w-4" /> Appliquer Tous les Filtres
                </Button>
                <Button onClick={handleResetFilters} variant="outline" className="w-full sm:w-auto sm:flex-1 whitespace-nowrap">
                    <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Enregistrements</CardTitle>
          {(activeSearchTerm || activeDateRange?.from ) && ( /* Show if any filter active */
            <CardDescription className="text-xs">
              Filtres actifs :
              {activeSearchTerm && ` Terme="${activeSearchTerm}"`}
              {(activeSearchTerm && activeDateRange?.from) && " ; "}
              {activeDateRange?.from && 
                ` Période du ${format(activeDateRange.from, DISPLAY_DATE_FORMAT, {locale:fr})}`
              }
              {activeDateRange?.to && 
                ` au ${format(activeDateRange.to, DISPLAY_DATE_FORMAT, {locale:fr})}`
              }
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <HistoryTable searchTerm={activeSearchTerm} dateRange={activeDateRange} />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoriquePage;