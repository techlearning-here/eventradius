import { Calendar } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import type { FormErrors, QuickCreateData } from './types';

interface DateTimeSectionProps {
  startTime: Date | null;
  endTime: Date | null;
  errors: FormErrors;
  onStartTimeChange: (date: Date | null) => void;
  onEndTimeChange: (date: Date | null) => void;
}

export const DateTimeSection = ({
  startTime,
  endTime,
  errors,
  onStartTimeChange,
  onEndTimeChange,
}: DateTimeSectionProps) => (
  <div className="space-y-3">
    <label className="text-sm font-medium flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      Date & Time <span className="text-red-500">*</span>
    </label>

    {/* Start Date & Time */}
    <div className="space-y-1">
      <p className="text-xs text-gray-500">Start Date & Time <span className="text-red-500">*</span></p>
      <DateTimePicker
        value={startTime}
        onChange={(date) => {
          onStartTimeChange(date);
          if (date) {
            const endDate = new Date(date.getTime() + 60 * 60 * 1000);
            if (!endTime || endTime <= date) {
              onEndTimeChange(endDate);
            }
          }
        }}
        placeholder="Select start date and time"
        error={!!errors.start_time}
        minDate={new Date()}
      />
      {errors.start_time && <p className="text-xs text-red-500">{errors.start_time}</p>}
    </div>

    {/* End Date & Time */}
    <div className="space-y-1">
      <p className="text-xs text-gray-500">End Date & Time <span className="text-red-500">*</span></p>
      <DateTimePicker
        value={endTime}
        onChange={onEndTimeChange}
        placeholder="Select end date and time"
        error={!!errors.end_time}
        minDate={startTime || new Date()}
      />
      {errors.end_time && <p className="text-xs text-red-500">{errors.end_time}</p>}
    </div>
  </div>
);
