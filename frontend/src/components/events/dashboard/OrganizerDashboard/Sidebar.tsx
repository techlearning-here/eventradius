import { useState } from 'react';
import { Home, ChevronLeft, ChevronRight, LogOut, CalendarDays, BarChart3, Users, Megaphone, CreditCard, FileText, Settings, HelpCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
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
    <div className={`bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-in-out pt-12 ${
      sidebarIconized ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 pt-12">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between mb-6">
          {!sidebarIconized && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-sidebar-foreground">Event Publisher</h2>
                <p className="text-xs text-sidebar-accent-foreground">Organizer Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
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
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground border border-sidebar-border'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
                title={sidebarIconized ? `${item.label} - ${item.description}` : ''}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarIconized && (
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground'}`}>{item.label}</div>
                    <div className={`text-xs truncate ${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-accent-foreground'}`}>{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-sidebar-border">
          <button
            onClick={() => {
              // Handle logout - will be passed as prop
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
