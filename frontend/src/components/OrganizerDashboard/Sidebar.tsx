import { useState } from 'react';
import { Home, ChevronLeft, ChevronRight, LogOut, CalendarDays, BarChart3, Users, Megaphone, CreditCard, FileText, Settings, HelpCircle } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  description: string;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sidebarIconized: boolean;
  onToggleSidebar: () => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'events', label: 'My Events', icon: CalendarDays, description: 'Manage your events' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'View performance metrics' },
  { id: 'attendees', label: 'Attendees', icon: Users, description: 'Manage participant lists' },
  { id: 'promotions', label: 'Promotions', icon: Megaphone, description: 'Marketing tools' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Payment & subscription' },
  { id: 'resources', label: 'Resources', icon: FileText, description: 'Guides & documentation' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Account preferences' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, description: 'Get assistance' },
];

export const Sidebar = ({ activeSection, onSectionChange, sidebarIconized, onToggleSidebar }: SidebarProps) => {
  return (
    <div className={`bg-black border-r border-gray-200 transition-all duration-300 ease-in-out pt-12 ${
      sidebarIconized ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 pt-12">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between mb-6">
          {!sidebarIconized && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-white">Event Publisher</h2>
                <p className="text-xs text-gray-400">Organizer Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-800 text-white transition-colors"
            title={sidebarIconized ? "Expand sidebar" : "Iconize sidebar"}
          >
            {sidebarIconized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-black border border-blue-200'
                    : 'text-white hover:bg-gray-800 hover:text-white'
                }`}
                title={sidebarIconized ? `${item.label} - ${item.description}` : ''}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarIconized && (
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isActive ? 'text-black' : 'text-white'}`}>{item.label}</div>
                    <div className={`text-xs truncate ${isActive ? 'text-black' : 'text-white'}`}>{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              // Handle logout - will be passed as prop
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-white hover:bg-red-600 hover:text-white transition-colors"
            title={sidebarIconized ? "Logout" : ""}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarIconized && <div className="text-sm font-medium">Logout</div>}
          </button>
        </div>
      </div>
    </div>
  );
};
