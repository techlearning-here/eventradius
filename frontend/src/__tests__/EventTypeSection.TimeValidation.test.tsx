import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventTypeSection } from '../components/EventWizard/EventTypeSection';

describe('EventTypeSection - Time Validation', () => {
  const mockHandlers = {
    onEventTypeChange: jest.fn(),
    onEventFormatChange: jest.fn(),
    onVenueAddressChange: jest.fn(),
    onVenueStreetChange: jest.fn(),
    onVenueCityChange: jest.fn(),
    onVenueStateChange: jest.fn(),
    onVenueZipCodeChange: jest.fn(),
    onVenueCountryChange: jest.fn(),
    onVenueBuildingNameChange: jest.fn(),
    onOnlineMeetingLinkChange: jest.fn(),
    onSingleEventDateChange: jest.fn(),
    onSingleEventStartTimeChange: jest.fn(),
    onSingleEventEndTimeChange: jest.fn(),
    onRecurringEventDayChange: jest.fn(),
    onRecurringEventStartTimeChange: jest.fn(),
    onRecurringEventEndTimeChange: jest.fn(),
    onRecurringFrequencyChange: jest.fn(),
    onRecurringEndDateChange: jest.fn(),
    onRecurringHasEndDateChange: jest.fn(),
    onRecurringDailyTypeChange: jest.fn(),
    onRecurringExcludedDaysChange: jest.fn(),
    onMultiDateEventsChange: jest.fn(),
    onDoorsOpenTimeChange: jest.fn(),
    onRegistrationStartTimeChange: jest.fn(),
    onRegistrationEndTimeChange: jest.fn(),
    onTimezoneChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Single Event - Auto End Time', () => {
    test('should auto-fill end time 1 hour after start time', () => {
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate="2024-01-15"
          singleEventStartTime=""
          singleEventEndTime=""
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      // Get time inputs by type
      const timeInputs = document.querySelectorAll('input[type="time"]');
      expect(timeInputs.length).toBeGreaterThanOrEqual(2);
      
      const startTimeInput = timeInputs[0];
      fireEvent.change(startTimeInput, { target: { value: '14:30' } });

      expect(mockHandlers.onSingleEventStartTimeChange).toHaveBeenCalledWith('14:30');
      expect(mockHandlers.onSingleEventEndTimeChange).toHaveBeenCalledWith('15:30');
    });

    test('should handle end time crossing midnight', () => {
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate="2024-01-15"
          singleEventStartTime=""
          singleEventEndTime=""
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const timeInputs = document.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      fireEvent.change(startTimeInput, { target: { value: '23:30' } });

      expect(mockHandlers.onSingleEventEndTimeChange).toHaveBeenCalledWith('00:30');
    });

    test('should handle start time at midnight', () => {
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate="2024-01-15"
          singleEventStartTime=""
          singleEventEndTime=""
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const timeInputs = document.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      fireEvent.change(startTimeInput, { target: { value: '00:00' } });

      expect(mockHandlers.onSingleEventEndTimeChange).toHaveBeenCalledWith('01:00');
    });
  });

  describe('Single Event - End Time Validation', () => {
    test('should show error when end time is before start time', () => {
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate="2024-01-15"
          singleEventStartTime="14:00"
          singleEventEndTime="13:00"
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
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate="2024-01-15"
          singleEventStartTime="14:00"
          singleEventEndTime="14:00"
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const timeInputs = document.querySelectorAll('input[type="time"]');
      const endTimeInput = timeInputs[1];
      expect(endTimeInput).toHaveClass('border-red-500');
      expect(screen.getByText('End time must be after start time')).toBeInTheDocument();
    });

    test('should not show error when end time is after start time', () => {
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate="2024-01-15"
          singleEventStartTime="14:00"
          singleEventEndTime="15:00"
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      const timeInputs = document.querySelectorAll('input[type="time"]');
      const endTimeInput = timeInputs[1];
      expect(endTimeInput).not.toHaveClass('border-red-500');
      expect(screen.queryByText('End time must be after start time')).not.toBeInTheDocument();
    });
  });

  describe('Timezone Selection', () => {
    test('should render timezone dropdown with options', () => {
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate=""
          singleEventStartTime=""
          singleEventEndTime=""
          timezone=""
          {...mockHandlers}
        />
      );

      const timezoneSelect = screen.getByRole('combobox');
      expect(timezoneSelect).toBeInTheDocument();
      expect(screen.getByText('-- Select --')).toBeInTheDocument();
      expect(screen.getByText('ET - New York')).toBeInTheDocument();
      expect(screen.getByText('GMT - London')).toBeInTheDocument();
    });

    test('should display selected timezone', () => {
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate="2024-01-15"
          singleEventStartTime="14:00"
          singleEventEndTime="15:00"
          timezone="America/New_York"
          {...mockHandlers}
        />
      );

      expect(screen.getByText(/Selected Timezone:/)).toBeInTheDocument();
      expect(screen.getByText('America/New_York')).toBeInTheDocument();
    });

    test('should call onTimezoneChange when timezone is selected', () => {
      render(
        <EventTypeSection
          eventType="in_person"
          eventFormat="single"
          singleEventDate=""
          singleEventStartTime=""
          singleEventEndTime=""
          timezone=""
          {...mockHandlers}
        />
      );

      const timezoneSelect = screen.getByRole('combobox');
      fireEvent.change(timezoneSelect, { target: { value: 'Europe/London' } });

      expect(mockHandlers.onTimezoneChange).toHaveBeenCalledWith('Europe/London');
    });
  });
});
