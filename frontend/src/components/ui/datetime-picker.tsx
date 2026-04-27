import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  minDate?: Date;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  label,
  error,
  minDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | null>(value);
  const [tempTime, setTempTime] = React.useState<string>(
    value ? format(value, "HH:mm") : "12:00"
  );

  // Sync temp values when popover opens or value changes externally
  React.useEffect(() => {
    if (isOpen) {
      setTempDate(value);
      setTempTime(value ? format(value, "HH:mm") : "12:00");
    }
  }, [isOpen, value]);

  const handleOK = () => {
    if (tempDate) {
      const [hours, minutes] = tempTime.split(":").map(Number);
      const finalDate = new Date(tempDate);
      finalDate.setHours(hours, minutes, 0, 0);
      onChange(finalDate);
    } else {
      onChange(null);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDate(value);
    setTempTime(value ? format(value, "HH:mm") : "12:00");
    setIsOpen(false);
  };

  const displayValue = value
    ? format(value, "MMM d, yyyy 'at' h:mm a")
    : placeholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500",
            "bg-white dark:bg-gray-900"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900" align="start">
        <div className="p-4 space-y-4">
          {label && (
            <Label className="text-sm font-medium">
              {label}
            </Label>
          )}
          
          <Calendar
            mode="single"
            selected={tempDate || undefined}
            onSelect={(date) => setTempDate(date || null)}
            disabled={(date) => {
              if (minDate) {
                // Disable dates before minDate (set to start of day for comparison)
                const minDateStart = new Date(minDate);
                minDateStart.setHours(0, 0, 0, 0);
                return date < minDateStart;
              }
              return false;
            }}
            initialFocus
          />
          
          {/* Time Selection */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Clock className="h-4 w-4 text-gray-500" />
            <Label className="text-sm text-gray-600 dark:text-gray-400">Time</Label>
            <Input
              type="time"
              value={tempTime}
              onChange={(e) => setTempTime(e.target.value)}
              className="w-32 ml-auto"
            />
          </div>
          
          {/* OK and Cancel Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleOK}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
