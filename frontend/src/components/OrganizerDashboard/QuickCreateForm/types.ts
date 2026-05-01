import type { Event } from '@/integrations/backend/api';

export interface QuickCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingEvent?: Event | null;
  onDetailedEdit?: (event: Event) => void;
}

export interface QuickCreateData {
  title: string;
  description: string;
  start_time: Date | null;
  end_time: Date | null;
  event_type: 'in_person' | 'online';
  location: string;
  virtual_event_url: string;
  image_url: string;
  ticket_price: number;
  ticketing_website?: string;
  require_approval: boolean;
  max_participants: number | undefined;
  enable_capacity_limit: boolean;
  enable_waitlist: boolean;
}

export type FormErrors = Partial<Record<keyof QuickCreateData, string>>;

export interface CapacityTempState {
  enableLimit: boolean;
  maxParticipants: number;
  enableWaitlist: boolean;
}

export interface AddressSuggestion {
  display_name: string;
  place_id: number;
}
