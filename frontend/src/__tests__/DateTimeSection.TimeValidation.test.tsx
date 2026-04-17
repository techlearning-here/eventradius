import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateTimeSection } from '../components/EventWizard/DateTimeSection';

describe('DateTimeSection - Time Validation', () => {
  const mockHandlers = {
    onStartDateChange: jest.fn(),
    onEndDateChange: jest.fn(),
    onStartTimeChange: jest.fn(),
    onEndTimeChange: jest.fn(),
    onTimezoneChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auto End Time', () => {
    test('should auto-fill end time 1 hour after start time', () => {
      render(
        <DateTimeSection
          startDate={null}
          endDate={null}
          startTime=""
          endTime=""
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const timeInputs = document.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      fireEvent.change(startTimeInput, { target: { value: '10:00' } });

      expect(mockHandlers.onStartTimeChange).toHaveBeenCalledWith('10:00');
      expect(mockHandlers.onEndTimeChange).toHaveBeenCalledWith('11:00');
    });

    test('should handle end time crossing midnight', () => {
      render(
        <DateTimeSection
          startDate={null}
          endDate={null}
          startTime=""
          endTime=""
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const timeInputs = document.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      fireEvent.change(startTimeInput, { target: { value: '23:15' } });

      expect(mockHandlers.onEndTimeChange).toHaveBeenCalledWith('00:15');
    });
  });

  describe('End Time Validation', () => {
    test('should show error styling when end time is before start time on same day', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');
      
      render(
        <DateTimeSection
          startDate={startDate}
          endDate={endDate}
          startTime="14:00"
          endTime="13:00"
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const timeInputs = document.querySelectorAll('input[type="time"]');
      const endTimeInput = timeInputs[1];
      expect(endTimeInput).toHaveClass('border-red-500');
      expect(screen.getByText('End time must be after start time')).toBeInTheDocument();
    });

    test('should show error when end time equals start time', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');
      
      render(
        <DateTimeSection
          startDate={startDate}
          endDate={endDate}
          startTime="14:00"
          endTime="14:00"
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      expect(screen.getByText('End time must be after start time')).toBeInTheDocument();
    });

    test('should not show error when end time is after start time', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');
      
      render(
        <DateTimeSection
          startDate={startDate}
          endDate={endDate}
          startTime="14:00"
          endTime="16:00"
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      expect(screen.queryByText('End time must be after start time')).not.toBeInTheDocument();
    });
  });

  describe('Date Inputs', () => {
    test('should render date and time inputs', () => {
      render(
        <DateTimeSection
          startDate={null}
          endDate={null}
          startTime=""
          endTime=""
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      const timeInputs = document.querySelectorAll('input[type="time"]');
      expect(dateInputs.length).toBe(2);
      expect(timeInputs.length).toBe(2);
    });

    test('should call onStartDateChange when start date is selected', () => {
      render(
        <DateTimeSection
          startDate={null}
          endDate={null}
          startTime=""
          endTime=""
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      const startDateInput = dateInputs[0];
      fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });

      expect(mockHandlers.onStartDateChange).toHaveBeenCalled();
    });
  });
});
