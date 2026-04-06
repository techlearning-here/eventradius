import { Calendar, Clock } from 'lucide-react';

interface RegistrationTimingProps {
  registrationStartTime: Date | null;
  registrationEndTime: Date | null;
  onRegistrationStartTimeChange: (value: Date | null) => void;
  onRegistrationEndTimeChange: (value: Date | null) => void;
}

export const RegistrationTiming = ({
  registrationStartTime,
  registrationEndTime,
  onRegistrationStartTimeChange,
  onRegistrationEndTimeChange,
}: RegistrationTimingProps) => {
  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (value: string, isStart: boolean) => {
    if (!value) {
      if (isStart) {
        onRegistrationStartTimeChange(null);
      } else {
        onRegistrationEndTimeChange(null);
      }
      return;
    }

    const date = new Date(value);
    if (isStart) {
      onRegistrationStartTimeChange(date);
    } else {
      onRegistrationEndTimeChange(date);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Registration Period</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Registration Opens
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="datetime-local"
              value={formatDateTime(registrationStartTime)}
              onChange={(e) => handleDateTimeChange(e.target.value, true)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            When people can start registering for your event
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Registration Closes
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="datetime-local"
              value={formatDateTime(registrationEndTime)}
              onChange={(e) => handleDateTimeChange(e.target.value, false)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            When registration ends (leave empty for no end time)
          </p>
        </div>
      </div>
    </div>
  );
};
