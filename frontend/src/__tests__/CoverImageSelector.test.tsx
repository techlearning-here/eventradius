import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoverImageSelector } from '../components/EventWizard/CoverImageSelector';

describe('CoverImageSelector', () => {
  const mockOnImageSelect = jest.fn();
  const mockOnImageUpload = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('should render with no image selected', () => {
      render(
        <CoverImageSelector
          selectedImageUrl={null}
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      expect(screen.getByText('Event Image')).toBeInTheDocument();
      expect(screen.getByText('Choose a cover image that represents your event')).toBeInTheDocument();
      expect(screen.getByText('Gallery')).toBeInTheDocument();
      expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    test('should render with selected image from gallery', () => {
      render(
        <CoverImageSelector
          selectedImageUrl="/cover-images/general/01-conference.jpg"
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      expect(screen.getByText('Cover Image Selected')).toBeInTheDocument();
      expect(screen.getByAltText('Selected cover')).toBeInTheDocument();
      expect(screen.getByText('Change Image')).toBeInTheDocument();
    });

    test('should render with custom uploaded image', () => {
      render(
        <CoverImageSelector
          selectedImageUrl="blob:https://example.com/123"
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      expect(screen.getByText('Custom Upload Ready')).toBeInTheDocument();
      expect(screen.getByAltText('Selected cover')).toBeInTheDocument();
    });
  });

  describe('Gallery Tab', () => {
    test('should display all category tabs', () => {
      render(
        <CoverImageSelector
          selectedImageUrl={null}
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      const categories = ['General', 'Social', 'Professional', 'Arts', 'Cultural', 'Painting', 
                          'Photography', 'Film', 'Literature', 'Sports', 'Food', 'Wellness', 'Tech'];
      
      categories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    test('should switch between category tabs', () => {
      render(
        <CoverImageSelector
          selectedImageUrl={null}
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      const sportsTab = screen.getByText('Sports');
      fireEvent.click(sportsTab);
      
      expect(sportsTab).toHaveClass('bg-blue-500');
    });

    test('should call onImageSelect when gallery image is clicked', () => {
      render(
        <CoverImageSelector
          selectedImageUrl={null}
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      // Find and click on a gallery image
      const images = screen.getAllByRole('img');
      const galleryImage = images.find(img => img.getAttribute('alt')?.includes('conference') || 
                                              img.getAttribute('alt')?.includes('party') ||
                                              img.getAttribute('alt')?.includes('meeting'));
      
      if (galleryImage) {
        fireEvent.click(galleryImage);
        expect(mockOnImageSelect).toHaveBeenCalled();
      }
    });
  });

  describe('Upload Tab', () => {
    test('should switch to upload tab when clicked', () => {
      render(
        <CoverImageSelector
          selectedImageUrl={null}
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      const uploadTab = screen.getByText('Upload');
      fireEvent.click(uploadTab);

      expect(screen.getByText('Upload Your Own Image')).toBeInTheDocument();
      expect(screen.getByText('Click or drag to upload')).toBeInTheDocument();
    });

    test('should handle file upload', () => {
      render(
        <CoverImageSelector
          selectedImageUrl={null}
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      // Switch to upload tab
      fireEvent.click(screen.getByText('Upload'));

      // Simulate file upload
      const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/Upload image/);
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(mockOnImageUpload).toHaveBeenCalledWith(file);
    });
  });

  describe('Change Image', () => {
    test('should show gallery when change image button is clicked', () => {
      render(
        <CoverImageSelector
          selectedImageUrl="/cover-images/general/01-conference.jpg"
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      const changeButton = screen.getByText('Change Image');
      fireEvent.click(changeButton);

      // After clicking Change Image, should show Gallery tab
      expect(screen.getByText('Gallery')).toBeInTheDocument();
    });
  });

  describe('Free Gallery Notice', () => {
    test('should display free gallery notice', () => {
      render(
        <CoverImageSelector
          selectedImageUrl={null}
          eventType="in_person"
          onImageSelect={mockOnImageSelect}
          onImageUpload={mockOnImageUpload}
        />
      );

      expect(screen.getByText(/Gallery: 65 free images/)).toBeInTheDocument();
    });
  });
});
