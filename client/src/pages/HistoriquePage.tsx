import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription, // Can be used for desktop static description
} from "@/components/ui/card";
import HistoryTable from "../components/HistoryTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Search,
  RotateCcw,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isValid, subDays, isAfter, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile"; // Make sure this hook is correctly set up

const destructiveSonnerToastClasses =
  "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";
const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";

// Define props for the memoized filter controls
interface FilterControlsProps {
  inputSearchTerm: string;
  setInputSearchTerm: (value: string) => void;
  inputFromDateString: string;
  setInputFromDateString: (value: string) => void;
  inputToDateString: string;
  setInputToDateString: (value: string) => void;
  calendarPickerRange: DateRange | undefined; // For Calendar defaultMonth and selected
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (isOpen: boolean) => void;
  handleSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  syncCalendarToInputsOnBlur: (inputType: "from" | "to") => void;
  handleDateSelectFromCalendar: (newRange: DateRange | undefined) => void;
  handleApplyFiltersFromCalendar: () => void; // New prop
}
// 👇 Define FilterControlsContent as a memoized component OUTSIDE HistoriquePage or before it
const FilterControlsContent = memo<FilterControlsProps>(
  ({
    inputSearchTerm,
    setInputSearchTerm,
    inputFromDateString,
    setInputFromDateString,
    inputToDateString,
    setInputToDateString,
    calendarPickerRange,
    isDatePickerOpen,
    setIsDatePickerOpen,
    handleSearchKeyDown,
    syncCalendarToInputsOnBlur,
    handleDateSelectFromCalendar,
    handleApplyFiltersFromCalendar,
  }) => {
    console.log("FilterControlsContent rendering"); // See how often this renders
    return (
      <div className="border-t dark:border-slate-700 px-6 pt-4 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_auto] items-end gap-x-4 gap-y-4">
          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <Label htmlFor="search-history-input" className="text-xs">
              Rechercher (cm/L)
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-history-input"
                type="search"
                placeholder="Ex: 135 ou 24500..."
                value={inputSearchTerm}
                onChange={(e) => setInputSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-8 w-full h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from-date-input" className="text-xs">
              Date de Début
            </Label>
            <Input
              id="from-date-input"
              type="text"
              placeholder={DISPLAY_DATE_FORMAT.toLocaleUpperCase()}
              value={inputFromDateString}
              onChange={(e) => setInputFromDateString(e.target.value)}
              onBlur={() => syncCalendarToInputsOnBlur("from")}
              className="w-full h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to-date-input" className="text-xs">
              Date de Fin
            </Label>
            <Input
              id="to-date-input"
              type="text"
              placeholder={DISPLAY_DATE_FORMAT.toLocaleUpperCase()}
              value={inputToDateString}
              onChange={(e) => setInputToDateString(e.target.value)}
              onBlur={() => syncCalendarToInputsOnBlur("to")}
              className="w-full h-10"
            />
          </div>
          <div className="flex items-end h-10">
            <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  aria-label="Ouvrir le calendrier"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[fit-content]  overflow-hidden">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={
                    calendarPickerRange?.from ||
                    calendarPickerRange?.to ||
                    new Date()
                  }
                  selected={calendarPickerRange}
                  onSelect={handleDateSelectFromCalendar}
                  numberOfMonths={2}
                  locale={fr}
                  showOutsideDays={true}
                  fromYear={2020}
                  toYear={new Date().getFullYear() + 2}
                  classNames={{ day_today: "!bg-blue-500 !text-white ..." }}
                />
                <div className="p-2  border-t border-border flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant={"customStyle"}
                    onClick={handleApplyFiltersFromCalendar}
                  >
                    Ok & Appliquer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDatePickerOpen(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* The Apply/Reset buttons are now outside FilterControlsContent, or need their handlers passed in */}
      </div>
    );
  }
);

FilterControlsContent.displayName = "FilterControlsContent"; // For better debugging names
const createDefaultDateRange = (): DateRange => ({
  from: startOfDay(subDays(new Date(), 29)),
  to: new Date(),
});
const HistoriquePage: React.FC = () => {
  const isMobile = useIsMobile();
  const initialDefaultRange = useMemo(() => createDefaultDateRange(), []);

  const [inputSearchTerm, setInputSearchTerm] = useState<string>("");
  const [inputFromDateString, setInputFromDateString] = useState<string>(() =>
    initialDefaultRange.from
      ? format(initialDefaultRange.from, DISPLAY_DATE_FORMAT, { locale: fr })
      : ""
  );
  const [inputToDateString, setInputToDateString] = useState<string>(() =>
    initialDefaultRange.to
      ? format(initialDefaultRange.to, DISPLAY_DATE_FORMAT, { locale: fr })
      : ""
  );
  const [calendarPickerRange, setCalendarPickerRange] = useState<
    DateRange | undefined
  >(initialDefaultRange);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const [activeDateRange, setActiveDateRange] = useState<DateRange | undefined>(
    initialDefaultRange
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(!isMobile); // Open by default on desktop, closed on mobile

  // Effect to update isFiltersOpen if isMobile changes after initial render
  useEffect(() => {
    setIsFiltersOpen(!isMobile);
  }, [isMobile]);

  const parseAndValidateDateInput = useCallback(
    (
      dateString: string,
      dateType: "Début" | "Fin"
    ): Date | null | undefined => {
      if (dateString.trim() === "") return undefined;
      const parsed = parse(dateString, DISPLAY_DATE_FORMAT, new Date(), {
        locale: fr,
      });
      if (!isValid(parsed)) {
        toast.error("Format Date Incorrect", {
          description: `Date de ${dateType.toLowerCase()} invalide: ${dateString}. Utilisez ${DISPLAY_DATE_FORMAT.toLocaleUpperCase()}.`,
          className: destructiveSonnerToastClasses,
        });
        return null;
      }
      return startOfDay(parsed);
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    const parsedFrom = parseAndValidateDateInput(inputFromDateString, "Début");
    const parsedTo = parseAndValidateDateInput(inputToDateString, "Fin");

    if (parsedFrom === null || parsedTo === null) return;
    const fromDateToApply = parsedFrom;
    const toDateToApply = parsedTo;

    if (
      fromDateToApply &&
      toDateToApply &&
      isAfter(fromDateToApply, toDateToApply)
    ) {
      toast.error("Dates Invalides", {
        description: "La date de début ne peut pas être après la date de fin.",
        className: destructiveSonnerToastClasses,
      });
      return;
    }

    let rangeToApply: DateRange | undefined = undefined;
    if (fromDateToApply || toDateToApply) {
      rangeToApply = { from: fromDateToApply, to: toDateToApply };
    }

    setActiveSearchTerm(inputSearchTerm);
    setActiveDateRange(rangeToApply);
    setCalendarPickerRange(rangeToApply);
    setIsDatePickerOpen(false);
    // if (isMobile) setIsFiltersOpen(false); // Optionally close filter section on mobile after apply
  }, [
    inputSearchTerm,
    inputFromDateString,
    inputToDateString,
    parseAndValidateDateInput /*, isMobile*/,
  ]);

  const handleResetFilters = useCallback(
    () => {
      setInputSearchTerm("");
      const newDefaultRange = createDefaultDateRange();
      setInputFromDateString(
        newDefaultRange.from
          ? format(newDefaultRange.from, DISPLAY_DATE_FORMAT, { locale: fr })
          : ""
      );
      setInputToDateString(
        newDefaultRange.to
          ? format(newDefaultRange.to, DISPLAY_DATE_FORMAT, { locale: fr })
          : ""
      );
      setCalendarPickerRange(newDefaultRange);
      setActiveSearchTerm("");
      setActiveDateRange(newDefaultRange);
      setIsDatePickerOpen(false);
      // if (isMobile) setIsFiltersOpen(false); // Optionally close filter section
    },
    [
      /*isMobile*/
    ]
  );

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") handleApplyFilters();
  };

  const handleDateSelectFromCalendar = (newRange: DateRange | undefined) => {
    setCalendarPickerRange(newRange);
    setInputFromDateString(
      newRange?.from
        ? format(newRange.from, DISPLAY_DATE_FORMAT, { locale: fr })
        : ""
    );
    setInputToDateString(
      newRange?.to
        ? format(newRange.to, DISPLAY_DATE_FORMAT, { locale: fr })
        : ""
    );
  };

  // 👇 START OF MODIFIED/HIGHLIGHTED FUNCTION
  const syncCalendarToInputsOnBlur = useCallback(
    (inputType: "from" | "to") => {
      const dateStringToParse =
        inputType === "from" ? inputFromDateString : inputToDateString;
      // parseAndValidateDateInput returns: Date | null (invalid) | undefined (empty)
      const parsedDateOrNull = parseAndValidateDateInput(
        dateStringToParse,
        inputType === "from" ? "Début" : "Fin"
      );

      // Only proceed to update calendarPickerRange if input was not explicitly invalid
      if (parsedDateOrNull !== null) {
        const newDateValueForCalendar = parsedDateOrNull; // This is Date | undefined

        setCalendarPickerRange((prevRange) => {
          // Get current values from previous range, defaulting to undefined if prevRange is undefined
          const currentFrom = prevRange?.from;
          const currentTo = prevRange?.to;

          let updatedFrom: Date | undefined;
          let updatedTo: Date | undefined;

          if (inputType === "from") {
            updatedFrom = newDateValueForCalendar;
            updatedTo = currentTo; // Preserve existing 'to' date
          } else {
            // inputType === 'to'
            updatedFrom = currentFrom; // Preserve existing 'from' date
            updatedTo = newDateValueForCalendar;
          }

          // If, after update, both from and to are undefined, it means no range is selected.
          // So, the calendarPickerRange itself should be undefined.
          if (updatedFrom === undefined && updatedTo === undefined) {
            return undefined;
          }

          // Otherwise, return a valid DateRange object.
          // Both 'from' and 'to' keys must be present.
          return { from: updatedFrom, to: updatedTo };
        });
      }
      // If parsedDateOrNull was null (invalid input), do nothing to calendarPickerRange,
      // as the user got a toast and the input string itself is still reflecting the bad input.
    },
    [inputFromDateString, inputToDateString, parseAndValidateDateInput]
  ); // Dependencies for useCallback
  // 👆 END OF MODIFIED/HIGHLIGHTED FUNCTION

  const filterControlsProps: FilterControlsProps = {
    inputSearchTerm,
    setInputSearchTerm,
    inputFromDateString,
    setInputFromDateString,
    inputToDateString,
    setInputToDateString,
    calendarPickerRange,
    isDatePickerOpen,
    setIsDatePickerOpen,
    handleSearchKeyDown: handleSearchKeyDown, // Ensure this is correctly defined/passed
    syncCalendarToInputsOnBlur: syncCalendarToInputsOnBlur, // Ensure this is correctly defined/passed
    handleDateSelectFromCalendar: handleDateSelectFromCalendar, // Ensure this is correctly defined/passed
    handleApplyFiltersFromCalendar: handleApplyFilters,
  };

  return (
    <div className="space-y-6">
      {/* 👇 START OF CHANGE 4: Always use Collapsible structure */}
      <div
        className={cn(
          "sticky top-0 z-10 py-1 bg-muted/40 dark:bg-slate-900/80 backdrop-blur-sm",
          "-mx-4 sm:-mx-6 px-4 sm:px-6",
          !isFiltersOpen ? "pb-1" : "pb-4" // Adjust padding based on open state
        )}
      >
        <Card className="shadow-md dark:border-slate-700 overflow-hidden">
          <Collapsible
            open={isFiltersOpen}
            onOpenChange={setIsFiltersOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full px-6 py-3 cursor-pointer hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Filter size={18} className="text-primary" />
                  <span className="text-base sm:text-lg font-semibold select-none text-foreground">
                    Filtrer les Enregistrements
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200", // Base styles and transition
                    isFiltersOpen ? "rotate-180" : "rotate-0" // Rotate if open
                    // Or using data attribute variants directly if preferred by ShadCN for this component:
                    // "group-data-[state=open]:rotate-180"
                    // Check if CollapsibleTrigger's parent div (the one with cursor-pointer) gets a `group` class from Collapsible.
                    // If CollapsibleTrigger ITSELF gets data-state, then:
                    // "data-[state=open]:rotate-180"
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              <FilterControlsContent {...filterControlsProps} />{" "}
              {/* Props include handlers and state */}
              {/* Main Apply/Reset buttons are now consistently placed */}
              <div className="px-6 pb-6">
                <div className="flex justify-end flex-col sm:flex-row gap-2 pt-4 border-t dark:border-slate-700">
                  <Button
                    className="w-[fit-content] max-sm:w-[100%]"
                    onClick={handleApplyFilters}
                    variant={"customStyle"}
                    size={"lg"}
                  >
                    <Search className="mr-2 h-4 w-4" /> Rechercher
                  </Button>
                  <Button
                    onClick={handleResetFilters}
                    variant={"outline"}
                    size={"lg"}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
      {/* 👆 END OF CHANGE 4 */}

      <Card className={cn(isMobile && !isFiltersOpen ? "mt-1" : "mt-0")}>
        {" "}
        {/* Slightly adjust margin when filter is collapsed on mobile */}
        <CardHeader>
          <CardTitle>Liste des Enregistrements</CardTitle>
          {(activeSearchTerm ||
            activeDateRange?.from ||
            activeDateRange?.to) && (
            <CardDescription className="text-xs"> ... </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <HistoryTable
            searchTerm={activeSearchTerm}
            dateRange={activeDateRange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoriquePage;
