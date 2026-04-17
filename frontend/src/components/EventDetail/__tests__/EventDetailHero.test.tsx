import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventDetailHero } from '../EventDetailHero';

describe('EventDetailHero', () => {
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders event type badge for in_person events', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
        is_public={true}
      />
    );

    expect(screen.getByText('In Person')).toBeInTheDocument();
  });

  it('renders event type badge for online events', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="online"
        is_public={true}
      />
    );

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders public badge when is_public is true', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
        is_public={true}
      />
    );

    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('renders private badge when is_public is false', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
        is_public={false}
      />
    );

    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('renders share button when onShare is provided', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
        is_public={true}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('does not render share button when onShare is not provided', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
        is_public={true}
      />
    );

    expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument();
  });

  it('calls onShare when share button is clicked', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
        is_public={true}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    expect(mockOnShare).toHaveBeenCalledTimes(1);
  });

  it('prevents event propagation when clicking share button', () => {
    const mockStopPropagation = jest.fn();

    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
        is_public={true}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton, { stopPropagation: mockStopPropagation });

    expect(mockOnShare).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
        is_public={true}
        loading={true}
      />
    );

    expect(screen.getByText('Loading event...')).toBeInTheDocument();
  });

  it('renders without event type badge when event_type is not provided', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        is_public={true}
      />
    );

    expect(screen.queryByText('In Person')).not.toBeInTheDocument();
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('renders without public/private badge when is_public is not provided', () => {
    render(
      <EventDetailHero
        image_url="https://example.com/image.jpg"
        event_type="in_person"
      />
    );

    expect(screen.queryByText('Public')).not.toBeInTheDocument();
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
  });

  it('uses background_image_url as fallback when image_url is not provided', () => {
    const { container } = render(
      <EventDetailHero
        background_image_url="https://example.com/bg.jpg"
        event_type="in_person"
        is_public={true}
      />
    );

    const heroElement = container.querySelector('[style*="background-image"]');
    expect(heroElement).toHaveStyle('background-image: url("https://example.com/bg.jpg")');
  });

  it('uses gradient fallback when no image is provided', () => {
    const { container } = render(
      <EventDetailHero
        event_type="in_person"
        is_public={true}
      />
    );

    const heroElement = container.querySelector('[style*="linear-gradient"]');
    expect(heroElement).toBeInTheDocument();
  });
});
