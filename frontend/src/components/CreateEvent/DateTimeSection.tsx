import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateTimeSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export const DateTimeSection = ({
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange
}: DateTimeSectionProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Date & Time</h2>
      <div className="space-y-6">
        {/* Start/End Date/Time Container */}
        <div className="grid grid-cols-[80px_1fr_80px] md:grid-cols-[100px_1fr_100px] gap-0 border border-black mb-4 md:mb-6">
          <div className="flex items-center justify-start gap-1.5 md:gap-2 border-r border-black px-2 md:px-3 py-2 md:py-3">
            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-black rounded-full"></div>
            <span className="text-[14px] md:text-[17px] font-medium">Start</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-left border-r border-black focus:outline-none bg-white",
                  !startDate && "text-[#C4C4C4]"
                )}
              >
                {startDate ? format(startDate, "EEE, dd MMM") : "Thu, 28 Oct"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <input
            type="text"
            placeholder="15:00"
            className="px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
          />
        </div>

        {/* End Date/Time */}
        <div className="grid grid-cols-[80px_1fr_80px] md:grid-cols-[100px_1fr_100px] gap-0 border border-black">
          <div className="flex items-center justify-start gap-1.5 md:gap-2 border-r border-black px-2 md:px-3 py-2 md:py-3">
            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-black rounded-full"></div>
            <span className="text-[14px] md:text-[17px] font-medium">End</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-left border-r border-black focus:outline-none bg-white",
                  !endDate && "text-[#C4C4C4]"
                )}
              >
                {endDate ? format(endDate, "EEE, dd MMM") : "Thu, 28 Oct"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <input
            type="text"
            placeholder="16:00"
            className="px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
