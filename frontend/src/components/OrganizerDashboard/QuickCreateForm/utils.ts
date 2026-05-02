import type { QuickCreateData } from './types';

export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTimeLocal = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const parseDateTime = (dateStr: string, timeStr: string): Date => {
  let formattedDate = dateStr;
  if (dateStr.includes('/')) {
    const [month, day, year] = dateStr.split('/');
    formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return new Date(`${formattedDate}T${timeStr}`);
};

export const getEndDateDisplay = (startTime: Date | null, endTime: Date | null): string => {
  if (!startTime || !endTime) return 'Same day as start';

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if (
    endDate.getDate() !== startDate.getDate() ||
    endDate.getMonth() !== startDate.getMonth() ||
    endDate.getFullYear() !== startDate.getFullYear()
  ) {
    return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return 'Same day as start';
};

export const validateForm = (formData: QuickCreateData): Partial<Record<keyof QuickCreateData, string>> => {
  const errors: Partial<Record<keyof QuickCreateData, string>> = {};

  if (!formData.title.trim() || formData.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!formData.start_time) {
    errors.start_time = 'Start time is required';
  } else if (formData.start_time < new Date()) {
    errors.start_time = 'Start time must be in the future';
  }

  if (!formData.end_time) {
    errors.end_time = 'End time is required';
  } else if (formData.start_time && formData.end_time <= formData.start_time) {
    errors.end_time = 'End time must be after start time';
  }

  if (formData.event_type === 'in_person' && !formData.location.trim()) {
    errors.location = 'Location is required for in-person events';
  }

  return errors;
};

export const createDefaultTimes = () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return {
    now,
    oneHourLater,
    twoHoursLater,
    defaultDate: now.toISOString().split('T')[0],
    defaultTime: `${String(oneHourLater.getHours()).padStart(2, '0')}:${String(oneHourLater.getMinutes()).padStart(2, '0')}`,
    defaultEndTime: `${String(twoHoursLater.getHours()).padStart(2, '0')}:${String(twoHoursLater.getMinutes()).padStart(2, '0')}`,
  };
};
