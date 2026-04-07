import { useState } from 'react';
import { DollarSign, Ticket } from 'lucide-react';

// Import smaller components
import { TicketTypeEditor } from './TicketTypeEditor';
import { TicketingOverview } from './TicketingOverview';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity_available: number | null;
  min_per_order: number;
  max_per_order: number;
  sales_start_time: Date | null;
  sales_end_time: Date | null;
  visibility: 'visible' | 'hidden' | 'hidden_when_not_on_sale';
  absorb_fees: boolean;
  is_donation: boolean;
}

interface TicketingSectionProps {
  ticketTypes: Array<{
    name: string;
    description?: string;
    price: number;
    currency?: string;
    quantity_available?: number;
    min_per_order?: number;
    max_per_order?: number;
    sales_start_time?: Date | null;
    sales_end_time?: Date | null;
    visibility?: string;
    absorb_fees?: boolean;
    is_donation?: boolean;
    delivery_options?: string[];
  }>;
  onTicketTypesChange: (ticketTypes: Array<{
    name: string;
    description?: string;
    price: number;
    currency?: string;
    quantity_available?: number | null;
    min_per_order?: number;
    max_per_order?: number;
    sales_start_time?: Date | null;
    sales_end_time?: Date | null;
    visibility?: string;
    absorb_fees?: boolean;
    is_donation?: boolean;
    delivery_options?: string[];
  }>) => void;
}

export const TicketingSection = ({
  ticketTypes,
  onTicketTypesChange,
}: TicketingSectionProps) => {
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(true);

  // Convert interface to internal format
  const internalTicketTypes: TicketType[] = ticketTypes.map((ticket, index) => ({
    id: ticket.name || `ticket-${index}`,
    name: ticket.name,
    description: ticket.description || '',
    price: ticket.price,
    currency: ticket.currency || 'USD',
    quantity_available: ticket.quantity_available || null,
    min_per_order: ticket.min_per_order || 1,
    max_per_order: ticket.max_per_order || 10,
    sales_start_time: ticket.sales_start_time || null,
    sales_end_time: ticket.sales_end_time || null,
    visibility: (ticket.visibility as TicketType['visibility']) || 'visible',
    absorb_fees: ticket.absorb_fees || false,
    is_donation: ticket.is_donation || false,
  }));

  const updateTicketType = (updatedTicket: TicketType) => {
    const updatedTickets = internalTicketTypes.map(t =>
      t.id === updatedTicket.id ? updatedTicket : t
    );
    
    // Convert back to interface format
    const interfaceTickets = updatedTickets.map(t => ({
      name: t.name,
      description: t.description,
      price: t.price,
      currency: t.currency,
      quantity_available: t.quantity_available,
      min_per_order: t.min_per_order,
      max_per_order: t.max_per_order,
      sales_start_time: t.sales_start_time,
      sales_end_time: t.sales_end_time,
      visibility: t.visibility,
      absorb_fees: t.absorb_fees,
      is_donation: t.is_donation,
      delivery_options: [],
    }));
    
    onTicketTypesChange(interfaceTickets);
  };

  const deleteTicketType = (ticketId: string) => {
    const updatedTickets = internalTicketTypes.filter(t => t.id !== ticketId);
    
    // Convert back to interface format
    const interfaceTickets = updatedTickets.map(t => ({
      name: t.name,
      description: t.description,
      price: t.price,
      currency: t.currency,
      quantity_available: t.quantity_available,
      min_per_order: t.min_per_order,
      max_per_order: t.max_per_order,
      sales_start_time: t.sales_start_time,
      sales_end_time: t.sales_end_time,
      visibility: t.visibility,
      absorb_fees: t.absorb_fees,
      is_donation: t.is_donation,
      delivery_options: [],
    }));
    
    onTicketTypesChange(interfaceTickets);
  };

  const addNewTicketType = () => {
    const newTicket: TicketType = {
      id: `ticket-${Date.now()}`,
      name: 'New Ticket Type',
      description: '',
      price: 0,
      currency: 'USD',
      quantity_available: null,
      min_per_order: 1,
      max_per_order: 10,
      sales_start_time: null,
      sales_end_time: null,
      visibility: 'visible',
      absorb_fees: false,
      is_donation: false,
    };

    const updatedTickets = [...internalTicketTypes, newTicket];
    
    // Convert back to interface format
    const interfaceTickets = updatedTickets.map(t => ({
      name: t.name,
      description: t.description,
      price: t.price,
      currency: t.currency,
      quantity_available: t.quantity_available,
      min_per_order: t.min_per_order,
      max_per_order: t.max_per_order,
      sales_start_time: t.sales_start_time,
      sales_end_time: t.sales_end_time,
      visibility: t.visibility,
      absorb_fees: t.absorb_fees,
      is_donation: t.is_donation,
      delivery_options: [],
    }));
    
    onTicketTypesChange(interfaceTickets);
    setEditingTicketId(newTicket.id);
    setShowOverview(false);
  };

  const calculateTotalRevenue = () => {
    return internalTicketTypes.reduce((total, ticket) => {
      if (ticket.price > 0 && ticket.quantity_available) {
        return total + (ticket.price * ticket.quantity_available);
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Ticket className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold">Ticketing</h2>
      </div>

      {/* Toggle between overview and detailed view */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setShowOverview(true)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showOverview
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setShowOverview(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !showOverview
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Detailed View
        </button>
      </div>

      {showOverview ? (
        <TicketingOverview
          ticketTypes={internalTicketTypes}
          onAddTicket={addNewTicketType}
          totalRevenue={calculateTotalRevenue()}
        />
      ) : (
        <div className="space-y-6">
          {internalTicketTypes.map((ticketType) => (
            <TicketTypeEditor
              key={ticketType.id}
              ticketType={ticketType}
              onUpdate={updateTicketType}
              onDelete={() => deleteTicketType(ticketType.id)}
            />
          ))}
          
          <button
            onClick={addNewTicketType}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Add Another Ticket Type
          </button>
        </div>
      )}
    </div>
  );
};
