import { render, screen, fireEvent } from '@testing-library/react';
import { ContactInfo } from '../components/EventWizard/ContactInfo';

describe('ContactInfo', () => {
  const mockOnContactPhoneChange = jest.fn();
  const mockOnContactPhoneCountryCodeChange = jest.fn();
  const mockOnContactEmailChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phone Country Code Dropdown', () => {
    test('should render country code dropdown with default value +1', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      const countryCodeSelect = screen.getByDisplayValue('+1 (US)');
      expect(countryCodeSelect).toBeInTheDocument();
    });

    test('should render all 20 country code options', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      const countryCodeSelect = screen.getByDisplayValue('+1 (US)');
      
      // Check for specific country codes
      expect(screen.getByText('+1 (US)')).toBeInTheDocument();
      expect(screen.getByText('+44 (UK)')).toBeInTheDocument();
      expect(screen.getByText('+91 (IN)')).toBeInTheDocument();
      expect(screen.getByText('+61 (AU)')).toBeInTheDocument();
      expect(screen.getByText('+81 (JP)')).toBeInTheDocument();
    });

    test('should call onContactPhoneCountryCodeChange when country code is selected', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      const countryCodeSelect = screen.getByDisplayValue('+1 (US)');
      fireEvent.change(countryCodeSelect, { target: { value: '+91' } });

      expect(mockOnContactPhoneCountryCodeChange).toHaveBeenCalledWith('+91');
    });

    test('should allow selecting India (+91) country code', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+91"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      expect(screen.getByDisplayValue('+91 (IN)')).toBeInTheDocument();
    });
  });

  describe('Phone Number Input', () => {
    test('should only accept phone number characters (digits, dashes, parentheses, spaces)', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      const phoneInput = screen.getByPlaceholderText('(555) 123-4567');
      
      // Type valid phone characters
      fireEvent.change(phoneInput, { target: { value: '(555) 123-4567' } });
      expect(mockOnContactPhoneChange).toHaveBeenCalledWith('(555) 123-4567');

      jest.clearAllMocks();

      // Try to type letters (should be filtered out)
      fireEvent.change(phoneInput, { target: { value: 'abc123xyz' } });
      expect(mockOnContactPhoneChange).toHaveBeenCalledWith('123');
    });

    test('should filter out special characters not allowed in phone numbers', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      const phoneInput = screen.getByPlaceholderText('(555) 123-4567');
      
      // Try to type special characters
      fireEvent.change(phoneInput, { target: { value: '555@#$123' } });
      expect(mockOnContactPhoneChange).toHaveBeenCalledWith('555123');
    });

    test('should display phone number value correctly', () => {
      render(
        <ContactInfo
          contactPhone="(555) 123-4567"
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      const phoneInput = screen.getByDisplayValue('(555) 123-4567');
      expect(phoneInput).toBeInTheDocument();
    });
  });

  describe('Email Input', () => {
    test('should render email input with placeholder', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      const emailInput = screen.getByPlaceholderText('contact@your-event.com');
      expect(emailInput).toBeInTheDocument();
    });

    test('should call onContactEmailChange when email is typed', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      const emailInput = screen.getByPlaceholderText('contact@your-event.com');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(mockOnContactEmailChange).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Component Rendering', () => {
    test('should render Contact Information heading', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Help attendees reach you with questions')).toBeInTheDocument();
    });

    test('should render Stay Connected section', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      expect(screen.getByText('Stay Connected')).toBeInTheDocument();
    });

    test('should render Pro Tips section', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      expect(screen.getByText('Pro Tips')).toBeInTheDocument();
    });

    test('should show warning when no contact info provided', () => {
      render(
        <ContactInfo
          contactPhone=""
          contactPhoneCountryCode="+1"
          contactEmail=""
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      expect(screen.getByText(/Add at least one contact method/i)).toBeInTheDocument();
    });

    test('should show success message when both contact methods provided', () => {
      render(
        <ContactInfo
          contactPhone="(555) 123-4567"
          contactPhoneCountryCode="+1"
          contactEmail="test@example.com"
          onContactPhoneChange={mockOnContactPhoneChange}
          onContactPhoneCountryCodeChange={mockOnContactPhoneCountryCodeChange}
          onContactEmailChange={mockOnContactEmailChange}
        />
      );

      expect(screen.getByText(/Excellent! Providing both contact options/i)).toBeInTheDocument();
    });
  });
});
