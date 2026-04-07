export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  category?: string;
  max_participants?: number;
  is_public: boolean;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  current_participants?: number;
  is_paid_event?: boolean;
  ticket_pricing_description?: string;
  ticketing_website?: string;
  timezone?: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  // Legacy fields for compatibility
  creator?: string;
  date?: string;
  time?: string;
  address?: string;
  background_image_url?: string;
  target_date?: string;
  event_type?: string;
  event_status?: string;
  created_by?: string;
}
