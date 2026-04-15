import { useState } from 'react';
import { Home, LogOut, CalendarDays, BarChart3, Users, Megaphone, CreditCard, FileText, Settings, HelpCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  shouldCollapse?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  onLogout?: () => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'events', label: 'My Events', icon: CalendarDays, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 'attendees', label: 'Attendees', icon: Users, color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'promotions', label: 'Promotions', icon: Megaphone, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'billing', label: 'Billing', icon: CreditCard, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'resources', label: 'Resources', icon: FileText, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { id: 'recycle-bin', label: 'Recycle Bin', icon: Trash2, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, color: 'text-pink-600', bgColor: 'bg-pink-100' },
];

const bottomItems: SidebarItem[] = [];

export const Sidebar = ({ activeSection, onSectionChange, shouldCollapse = false, onCollapsedChange, onLogout }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Auto-collapse when shouldCollapse is true
  const effectiveCollapsed = shouldCollapse || isCollapsed;

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <div className={`h-[calc(100vh-6rem)] fixed left-4 top-24 z-40 bg-gradient-to-b from-sidebar-background via-sidebar-background to-sidebar-accent/30 border border-sidebar-border/50 rounded-2xl shadow-xl py-6 flex flex-col transition-all duration-300 ease-out ${
      effectiveCollapsed ? 'w-16 px-1.5' : 'w-52 px-3'
    }`}>
      {/* Logo & Toggle */}
      <div className={`flex items-center mb-8 ${effectiveCollapsed ? 'justify-center px-0' : 'justify-between px-2'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          {!effectiveCollapsed && (
            <div>
              <h2 className="font-semibold text-sm text-sidebar-foreground tracking-tight">Event Organizer</h2>
            </div>
          )}
        </div>
        {!effectiveCollapsed && (
          <button
            onClick={handleToggleCollapse}
            className="p-1.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 shadow-sm"
            title="Collapse"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse Toggle Button (when collapsed) */}
      {effectiveCollapsed && (
        <button
          onClick={handleToggleCollapse}
          className="absolute -right-3 top-20 p-1.5 rounded-lg bg-primary border border-primary/50 shadow-md hover:bg-primary/90 text-primary-foreground transition-all duration-200 z-50"
          title="Expand"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation Items - Icons Only */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center rounded-xl text-left transition-all duration-200 group ${
                effectiveCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
              } ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
              }`}
              title={item.label}
            >
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? `bg-white shadow-md ${item.color}` 
                  : `${item.bgColor} ${item.color} group-hover:opacity-80`
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              {!effectiveCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>{item.label}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions - Icons Only */}
      <div className="pt-4 border-t border-sidebar-border/30 space-y-1">
        {/* Recycle Bin */}
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center rounded-xl text-left transition-all duration-200 group ${
                effectiveCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
              } ${
                isActive
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
              }`}
              title={item.label}
            >
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-amber-500 text-white shadow-md' 
                  : 'bg-sidebar-accent/20 group-hover:bg-sidebar-accent/40'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              {!effectiveCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isActive ? 'text-amber-600' : ''}`}>{item.label}</div>
                </div>
              )}
            </button>
          );
        })}
        
        {/* Logout */}
        <button
          onClick={() => {
            onLogout?.();
          }}
          className={`w-full flex items-center rounded-xl text-left text-sidebar-foreground/70 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group ${
            effectiveCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
          }`}
          title="Logout"
        >
          <div className="p-2 rounded-lg bg-sidebar-accent/20 group-hover:bg-red-500/20 transition-all duration-200">
            <LogOut className="w-4 h-4" />
          </div>
          {!effectiveCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Logout</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
