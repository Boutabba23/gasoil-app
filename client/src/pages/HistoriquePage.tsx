import React, { useState, useCallback, useMemo } from "react";
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
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  parse,
  isValid,
  subDays,
  isAfter,
  startOfDay,
  endOfDay,
  isWithinInterval,
  setDate,
  addMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useIsMobile } from "../hooks/use-mobile"; // Adjust path if needed

const destructiveSonnerToastClasses =
  "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";
const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";

const createDefaultDateRange = (): DateRange => {
  const today = startOfDay(new Date());
  let operationalMonthStart = setDate(today, 21);
  operationalMonthStart = startOfDay(operationalMonthStart);
  let operationalMonthEnd = setDate(addMonths(today, 1), 20);
  operationalMonthEnd = startOfDay(operationalMonthEnd);

  if (isAfter(operationalMonthStart, today)) {
    operationalMonthEnd = setDate(today, 20);
    operationalMonthEnd = startOfDay(operationalMonthEnd);
    operationalMonthStart = setDate(subDays(operationalMonthEnd, 0), 21);
    operationalMonthStart = startOfDay(operationalMonthStart);
    if (
      operationalMonthEnd.getMonth() === 0 &&
      operationalMonthStart.getMonth() === 0 &&
      operationalMonthStart.getDate() === 21
    ) {
      operationalMonthStart = setDate(addMonths(operationalMonthEnd, -1), 21);
      operationalMonthStart = startOfDay(operationalMonthStart);
    }
  }

  if (
    isWithinInterval(today, {
      start: operationalMonthStart,
      end: endOfDay(operationalMonthEnd),
    })
  ) {
    return { from: operationalMonthStart, to: operationalMonthEnd };
  } else {
    return { from: startOfDay(subDays(new Date(), 29)), to: new Date() };
  }
};

const HistoriquePage: React.FC = () => {
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
  const isMobileView = useIsMobile();

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
  const numericRegex = /^\d*\.?\d*$/;

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;

    // 1. Allow empty string for clearing
    if (currentValue === "") {
      setInputSearchTerm("");
      return;
    }

    // 2. Regex to allow only digits and at most one decimal point.
    //    Does not yet enforce length of integer part.
    const basicNumericRegex = /^\d*\.?\d*$/;
    if (!basicNumericRegex.test(currentValue)) {
      // If it's not even in basic numeric format (e.g., contains letters, multiple dots), ignore.
      return;
    }

    // 3. Enforce max 3 digits before the decimal point.
    const parts = currentValue.split(".");
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : undefined;

    if (integerPart.length > 3) {
      integerPart = integerPart.slice(0, 3); // Truncate integer part to 3 digits
      // Show a toast, but still apply the truncated value
      toast.warn("Limite de chiffres atteinte", {
        description: "Maximum 3 chiffres avant la virgule pour la recherche.",
        duration: 2000,
      });
    }

    // 4. Optional: Enforce max digits after the decimal point (e.g., 2)
    // let finalDecimalPart = decimalPart;
    // if (decimalPart && decimalPart.length > 2) {
    //   finalDecimalPart = decimalPart.slice(0, 2);
    // }

    // 5. Reconstruct the value and update state
    let finalValue = integerPart;
    if (currentValue.includes(".")) {
      // Only add decimal if user typed it or it's part of a valid partial input
      finalValue += "."; // Add the dot back if it was there or intended
      if (decimalPart !== undefined) {
        // Using `finalDecimalPart` if you implemented step 4
        finalValue += decimalPart;
      }
    }

    // One last check to ensure the reconstructed finalValue still passes basic numeric regex
    // This can catch edge cases if user types just "." initially.
    if (finalValue === "." || numericRegex.test(finalValue)) {
      // Using the more general numericRegex from before
      setInputSearchTerm(finalValue);
    } else if (finalValue === "") {
      // if truncation resulted in empty integer and no decimal typed yet
      setInputSearchTerm("");
    }
  };
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
  }, [
    inputSearchTerm,
    inputFromDateString,
    inputToDateString,
    parseAndValidateDateInput,
  ]);

  // const handleResetFilters = useCallback(() => {
  //   setInputSearchTerm("");
  //   const newDefaultRange = createDefaultDateRange();
  //   setInputFromDateString(
  //     newDefaultRange.from
  //       ? format(newDefaultRange.from, DISPLAY_DATE_FORMAT, { locale: fr })
  //       : ""
  //   );
  //   setInputToDateString(
  //     newDefaultRange.to
  //       ? format(newDefaultRange.to, DISPLAY_DATE_FORMAT, { locale: fr })
  //       : ""
  //   );
  //   setCalendarPickerRange(newDefaultRange);
  //   setActiveSearchTerm("");
  //   setActiveDateRange(newDefaultRange);
  //   setIsDatePickerOpen(false);
  // }, []);

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

  const syncCalendarToInputsOnBlur = (inputType: "from" | "to") => {
    const dateStringToParse =
      inputType === "from" ? inputFromDateString : inputToDateString;
    const parsedDate = parseAndValidateDateInput(
      dateStringToParse,
      inputType === "from" ? "Début" : "Fin"
    );

    if (parsedDate !== null) {
      setCalendarPickerRange((prev) => {
        const newRange = { ...prev };
        if (inputType === "from") newRange.from = parsedDate;
        else newRange.to = parsedDate;
        return newRange;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 py-4 bg-muted/40 dark:bg-slate-900/80 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6">
        <Card className="shadow-sm dark:border-slate-700">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg sm:text-xl">
              Filtrer les Enregistrements
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    placeholder="Ex: 135cm ou 24500L..."
                    value={inputSearchTerm}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeyDown}
                    className="mt-1 pl-8 block border-2 border-mylight  w-full h-12 shadow-sm sm:text-sm rounded-md dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
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
                  className="mt-1  block border-2 border-mylight w-full h-12 shadow-sm sm:text-sm rounded-md dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
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
                  className="mt-1  block border-2 border-mylight w-full h-12 shadow-sm sm:text-sm rounded-md dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
                />
              </div>
              <div className="flex items-end h-10">
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 shrink-0 border-2 border-mylight hover:cursor-pointer hover:bg-mylight active:bg-mysecondary"
                      aria-label="Ouvrir le calendrier"
                    >
                      <CalendarIcon className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>{" "}
                  <PopoverContent
                    className="w-auto p-0"
                    align={isMobileView ? "center" : "start"} // Example usage
                    side={isMobileView ? "right" : "top"}
                    sideOffset={isMobileView ? 10 : 5}
                  >
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
                      classNames={{
                        day_today:
                          "!bg-blue-500 !text-white hover:!bg-blue-600 dark:!bg-blue-700 dark:!text-white dark:hover:!bg-blue-800 rounded-md font-bold border-2 !border-blue-300 dark:!border-blue-500",
                      }}
                    />
                    <div className="p-2 border-t border-border flex justify-center">
                      <Button
                        className="bg-myprimary hover:cursor-pointer shadow-md hover:bg-mysecondary"
                        size="sm"
                        onClick={handleApplyFilters}
                      >
                        Rechercher
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="  sm:flex-row gap-2 mt-4 pt-1">
                <Button
                  onClick={handleApplyFilters}
                  className="w-full sm:w-auto bg-myprimary hover:cursor-pointer shadow-md hover:bg-mysecondary sm:flex-1 whitespace-nowrap"
                >
                  <Search className="mr-2 h-4 w-4" /> Rechercher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Enregistrements</CardTitle>
          {(activeSearchTerm ||
            activeDateRange?.from ||
            activeDateRange?.to) && (
            <CardDescription className="text-xs">
              Filtres actifs :
              {activeSearchTerm && ` Terme="${activeSearchTerm}"`}
              {activeSearchTerm &&
                (activeDateRange?.from || activeDateRange?.to) &&
                " ; "}
              {(activeDateRange?.from || activeDateRange?.to) && " Période "}
              {activeDateRange?.from &&
                `du ${format(activeDateRange.from, DISPLAY_DATE_FORMAT, {
                  locale: fr,
                })}`}
              {activeDateRange?.to &&
                `${activeDateRange?.from ? " au " : "jusqu'au "}${format(
                  activeDateRange.to,
                  DISPLAY_DATE_FORMAT,
                  { locale: fr }
                )}`}
            </CardDescription>
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
