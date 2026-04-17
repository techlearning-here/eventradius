import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateTimeSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  timezone: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onTimezoneChange: (timezone: string) => void;
}

export const DateTimeSection = ({
  startDate,
  endDate,
  startTime,
  endTime,
  timezone,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onTimezoneChange
}: DateTimeSectionProps) => {
  return (
    <div>
      {/* Step 1: Date & Time */}
      <h2 className="text-2xl font-bold mb-6">Date & Time</h2>
      <div className="space-y-6">
        {/* Start Date/Time */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <h3 className="text-lg font-semibold">Start Date & Time <span className="text-red-500">*</span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Start Date</label>
              <input
                type="date"
                value={startDate && startDate instanceof Date && !isNaN(startDate.getTime()) ? format(startDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : null;
                  onStartDateChange(newDate);
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Start Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  onStartTimeChange(newStartTime);
                  // Auto-calculate end time as start time + 1 hour
                  if (newStartTime) {
                    const [hours, minutes] = newStartTime.split(':').map(Number);
                    const endHours = (hours + 1) % 24;
                    const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    onEndTimeChange(endTimeStr);
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              />
            </div>
          </div>
        </div>

        {/* End Date/Time */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <h3 className="text-lg font-semibold">End Date & Time <span className="text-red-500">*</span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">End Date</label>
              <input
                type="date"
                value={endDate && endDate instanceof Date && !isNaN(endDate.getTime()) ? format(endDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : null;
                  onEndDateChange(newDate);
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">End Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  const newEndTime = e.target.value;
                  // Validation: end time must be after start time
                  if (startDate && endDate && startDate.getTime() === endDate.getTime() && startTime && newEndTime <= startTime) {
                    alert('End time must be after start time');
                    return;
                  }
                  onEndTimeChange(newEndTime);
                }}
                className={cn(
                  "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-black bg-white",
                  startTime && endTime && endTime <= startTime && startDate && endDate && startDate.getTime() === endDate.getTime()
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-blue-500"
                )}
              />
              {startTime && endTime && endTime <= startTime && startDate && endDate && startDate.getTime() === endDate.getTime() && (
                <p className="text-red-400 text-xs mt-1">End time must be after start time</p>
              )}
            </div>
          </div>
        </div>

        {/* Timezone Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <h3 className="text-lg font-semibold">Event Timezone</h3>
          </div>
          <p className="text-white mb-4">Select the timezone for your event</p>
          <div className="max-w-md">
            <select
              value={timezone}
              onChange={(e) => onTimezoneChange(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            >
              <option value="">-- Select Timezone --</option>
              
              {/* North America */}
              <optgroup label="North America">
                <option value="America/New_York">Eastern Time (ET) - New York</option>
                <option value="America/Chicago">Central Time (CT) - Chicago</option>
                <option value="America/Denver">Mountain Time (MT) - Denver</option>
                <option value="America/Los_Angeles">Pacific Time (PT) - Los Angeles</option>
                <option value="America/Anchorage">Alaska Time (AKT) - Anchorage</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT) - Honolulu</option>
                <option value="America/Toronto">Eastern Time - Toronto</option>
                <option value="America/Vancouver">Pacific Time - Vancouver</option>
                <option value="America/Mexico_City">Central Time - Mexico City</option>
              </optgroup>
              
              {/* Europe */}
              <optgroup label="Europe">
                <option value="Europe/London">Greenwich Mean Time (GMT) - London</option>
                <option value="Europe/Paris">Central European Time (CET) - Paris</option>
                <option value="Europe/Berlin">Central European Time (CET) - Berlin</option>
                <option value="Europe/Rome">Central European Time (CET) - Rome</option>
                <option value="Europe/Madrid">Central European Time (CET) - Madrid</option>
                <option value="Europe/Amsterdam">Central European Time (CET) - Amsterdam</option>
                <option value="Europe/Athens">Eastern European Time (EET) - Athens</option>
                <option value="Europe/Istanbul">Eastern European Time (EET) - Istanbul</option>
                <option value="Europe/Moscow">Moscow Time (MSK) - Moscow</option>
                <option value="Europe/Dublin">Irish Time (IST) - Dublin</option>
              </optgroup>
              
              {/* Asia */}
              <optgroup label="Asia">
                <option value="Asia/Dubai">Gulf Standard Time (GST) - Dubai</option>
                <option value="Asia/Karachi">Pakistan Time (PKT) - Karachi</option>
                <option value="Asia/Mumbai">India Standard Time (IST) - Mumbai</option>
                <option value="Asia/Dhaka">Bangladesh Time (BST) - Dhaka</option>
                <option value="Asia/Bangkok">Indochina Time (ICT) - Bangkok</option>
                <option value="Asia/Singapore">Singapore Time (SGT) - Singapore</option>
                <option value="Asia/Hong_Kong">Hong Kong Time (HKT) - Hong Kong</option>
                <option value="Asia/Shanghai">China Standard Time (CST) - Shanghai</option>
                <option value="Asia/Seoul">Korea Standard Time (KST) - Seoul</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST) - Tokyo</option>
                <option value="Asia/Manila">Philippine Time (PHT) - Manila</option>
                <option value="Asia/Jakarta">Western Indonesia Time (WIB) - Jakarta</option>
              </optgroup>
              
              {/* Australia & Pacific */}
              <optgroup label="Australia & Pacific">
                <option value="Australia/Perth">Australian Western Time (AWST) - Perth</option>
                <option value="Australia/Adelaide">Australian Central Time (ACST) - Adelaide</option>
                <option value="Australia/Sydney">Australian Eastern Time (AET) - Sydney</option>
                <option value="Australia/Melbourne">Australian Eastern Time (AET) - Melbourne</option>
                <option value="Australia/Brisbane">Australian Eastern Time (AET) - Brisbane</option>
                <option value="Pacific/Auckland">New Zealand Time (NZT) - Auckland</option>
                <option value="Pacific/Fiji">Fiji Time (FJT) - Fiji</option>
              </optgroup>
              
              {/* South America */}
              <optgroup label="South America">
                <option value="America/Sao_Paulo">Brasilia Time (BRT) - São Paulo</option>
                <option value="America/Argentina/Buenos_Aires">Argentina Time (ART) - Buenos Aires</option>
                <option value="America/Lima">Peru Time (PET) - Lima</option>
                <option value="America/Bogota">Colombia Time (COT) - Bogotá</option>
                <option value="America/Santiago">Chile Time (CLT) - Santiago</option>
              </optgroup>
              
              {/* Africa */}
              <optgroup label="Africa">
                <option value="Africa/Cairo">Eastern European Time (EET) - Cairo</option>
                <option value="Africa/Johannesburg">South Africa Time (SAST) - Johannesburg</option>
                <option value="Africa/Lagos">West Africa Time (WAT) - Lagos</option>
                <option value="Africa/Nairobi">East Africa Time (EAT) - Nairobi</option>
                <option value="Africa/Casablanca">Western European Time (WET) - Casablanca</option>
              </optgroup>
              
              {/* UTC */}
              <optgroup label="Universal">
                <option value="UTC">UTC (Coordinated Universal Time)</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
