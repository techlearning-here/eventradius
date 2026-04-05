# Event Wizard Component Architecture Documentation

## 📋 Overview

This document provides a comprehensive overview of the Event Wizard component architecture, including all components, their purposes, relationships, and data flow within the event creation system.

## 🎯 Main Wizard Component

### EventWizard.tsx (23KB)
**Purpose**: Main orchestrator for the entire event creation flow

**Key Responsibilities**:
- Manages wizard state and navigation
- Handles data collection and validation
- Provides auto-save functionality
- Integrates with API endpoints
- Controls step progression and completion

**Key Features**:
- 8-step wizard flow with progress tracking
- Auto-save every 30 seconds
- Step validation and completion checks
- Preview modal functionality
- Save draft and publish actions
- Responsive design with sidebar navigation

**Props Interface**:
```typescript
interface EventWizardProps {
  initialData?: Partial<EventFormData>;
  onSave: (data: EventFormData) => Promise<void>;
  onPublish: (data: EventFormData) => Promise<void>;
}
```

---

## 🧩 Split Components (New Modular Architecture)

### Registration Section Components

#### RegistrationPrivacySelector.tsx (~2KB)
**Purpose**: Handles event privacy settings

**Functionality**:
- Controls who can find and register for events
- Visual card-based selection with icons
- Three privacy levels with detailed descriptions

**Privacy Options**:
- **Public**: Anyone can find and register
- **Private**: Only people with the link can register
- **Unlisted**: Not searchable, only accessible via direct link

**Props Interface**:
```typescript
interface RegistrationPrivacySelectorProps {
  eventPrivacy: 'public' | 'private' | 'unlisted';
  onEventPrivacyChange: (value: 'public' | 'private' | 'unlisted') => void;
}
```

#### RegistrationTiming.tsx (~2KB)
**Purpose**: Manages registration period settings

**Functionality**:
- Sets when registration opens and closes
- DateTime pickers with timezone support
- Validation for logical time sequences
- Optional end time support

**Features**:
- Registration start time (optional)
- Registration end time (optional)
- Timezone-aware datetime handling
- Clear date formatting

**Props Interface**:
```typescript
interface RegistrationTimingProps {
  registrationStartTime: Date | null;
  registrationEndTime: Date | null;
  onRegistrationStartTimeChange: (value: Date | null) => void;
  onRegistrationEndTimeChange: (value: Date | null) => void;
}
```

#### RegistrationSettings.tsx (~2KB)
**Purpose**: Handles additional registration requirements

**Functionality**:
- Password protection for private events
- Age restriction settings
- Contact email configuration
- Conditional field display

**Features**:
- Password field (only for private events)
- Age restriction dropdown (13+, 16+, 18+, 21+, custom)
- Contact email input with validation
- Contextual help text

**Props Interface**:
```typescript
interface RegistrationSettingsProps {
  eventPrivacy: 'public' | 'private' | 'unlisted';
  eventPassword: string;
  ageRestriction: string;
  eventContactEmail: string;
  onEventPasswordChange: (value: string) => void;
  onAgeRestrictionChange: (value: string) => void;
  onEventContactEmailChange: (value: string) => void;
}
```

#### AccessibilityFeatures.tsx (~2KB)
**Purpose**: Manages accessibility options for events

**Functionality**:
- Lists available accessibility features
- Checkbox-based selection interface
- Stores comma-separated feature list
- Grid layout for easy scanning

**Accessibility Features**:
- Wheelchair accessible
- Accessible parking
- Accessible restrooms
- Elevator access
- Ramp access
- Sign language interpreter
- Closed captions
- Audio description
- Quiet space available
- Service animals welcome

**Props Interface**:
```typescript
interface AccessibilityFeaturesProps {
  accessibilityOptions: string;
  onAccessibilityOptionsChange: (value: string) => void;
}
```

---

### Ticketing Section Components

#### TicketTypeEditor.tsx (~4KB)
**Purpose**: Individual ticket type management interface

**Functionality**:
- Create, edit, and delete individual ticket types
- Comprehensive ticket configuration options
- Advanced settings with collapsible interface
- Real-time validation and updates

**Features**:
- **Basic Settings**: Name, description, price, currency
- **Quantity Management**: Available quantity, min/max per order
- **Sales Timing**: Sales start/end times
- **Advanced Options**: Donation tickets, fee absorption, visibility
- **Currency Support**: USD, EUR, GBP, CAD, AUD, JPY

**Props Interface**:
```typescript
interface TicketTypeEditorProps {
  ticketType: TicketType;
  onUpdate: (ticketType: TicketType) => void;
  onDelete: () => void;
}
```

#### TicketingOverview.tsx (~3KB)
**Purpose**: High-level ticketing dashboard

**Functionality**:
- Quick overview of all ticket types
- Revenue projection calculations
- Quick actions for ticket management
- Empty state handling

**Features**:
- **Summary Cards**: Revenue projection, ticket count, pricing overview
- **Quick Actions**: Add new ticket type button
- **Ticket List**: Compact view of all ticket types
- **Empty State**: Guidance for first-time users

**Props Interface**:
```typescript
interface TicketingOverviewProps {
  ticketTypes: TicketType[];
  onAddTicket: () => void;
  totalRevenue?: number;
}
```

---

## 🎨 Original Components (Existing Architecture)

### Basic Info Components

#### BasicInfo.tsx (1.6KB)
**Purpose**: Core event information collection

**Functionality**:
- Event title and description input
- Character limits and validation
- Rich text editing capabilities
- Real-time field validation

**Features**:
- Title input with character counter
- Description textarea with rich text support
- Required field validation
- Auto-save integration

**Props Interface**:
```typescript
interface BasicInfoProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}
```

#### ImageUpload.tsx (2.6KB)
**Purpose**: Event image management

**Functionality**:
- Upload, preview, and remove event images
- Drag-and-drop file upload
- Image validation and optimization
- Multiple format support

**Features**:
- Drag-and-drop interface
- Image preview with zoom
- File validation (size, format)
- Remove and replace functionality
- Loading states and progress indicators

**Props Interface**:
```typescript
interface ImageUploadProps {
  imageUrl?: string;
  imageFile?: File | null;
  onImageUrlChange: (url: string) => void;
  onImageFileChange: (file: File | null) => void;
}
```

---

### Event Type Components

#### EventTypeSection.tsx (6.7KB)
**Purpose**: Event format and delivery method selection

**Functionality**:
- Online/in-person/hybrid selection
- Event format configuration
- Privacy settings integration
- Visual card-based selection

**Features**:
- **Event Type**: Online, In-Person, Hybrid
- **Event Format**: Single, Recurring, Multi-Date
- **Privacy Settings**: Public, Private, Unlisted
- Visual icons and descriptions
- Conditional field display

**Props Interface**:
```typescript
interface EventTypeSectionProps {
  eventType: 'online' | 'in_person' | 'hybrid';
  eventFormat: 'single' | 'recurring' | 'multi_date';
  eventPrivacy: 'public' | 'private' | 'unlisted';
  onEventTypeChange: (value: 'online' | 'in_person' | 'hybrid') => void;
  onEventFormatChange: (value: 'single' | 'recurring' | 'multi_date') => void;
  onEventPrivacyChange: (value: 'public' | 'private' | 'unlisted') => void;
}
```

---

### Date & Time Components

#### DateTimeSection.tsx (4.1KB)
**Purpose**: Event scheduling management

**Functionality**:
- Event start and end time configuration
- Timezone selection and detection
- Doors open time setting
- Date validation and sequencing

**Features**:
- Start/end datetime pickers
- Automatic timezone detection
- Doors open time configuration
- Date validation (end after start)
- Timezone support

**Props Interface**:
```typescript
interface DateTimeSectionProps {
  startTime: Date | null;
  endTime: Date | null;
  timezone: string;
  doorsOpenTime: Date | null;
  onStartTimeChange: (value: Date | null) => void;
  onEndTimeChange: (value: Date | null) => void;
  onTimezoneChange: (value: string) => void;
  onDoorsOpenTimeChange: (value: Date | null) => void;
}
```

---

### Location Components

#### LocationSection.tsx (1KB)
**Purpose**: Event venue and location management

**Functionality**:
- Physical address configuration
- Virtual event URL setup
- Platform selection for online events
- Conditional field display

**Features**:
- Address autocomplete
- Virtual event URL input
- Platform selection (Zoom, Teams, etc.)
- Conditional display based on event type

**Props Interface**:
```typescript
interface LocationSectionProps {
  location: string;
  virtualEventUrl: string;
  virtualEventPlatform: string;
  onLocationChange: (value: string) => void;
  onVirtualEventUrlChange: (value: string) => void;
  onVirtualEventPlatformChange: (value: string) => void;
}
```

---

### Advanced Components

#### AdvancedSection.tsx (7.9KB)
**Purpose**: Additional event settings and policies

**Functionality**:
- Refund policy configuration
- Custom refund policy setup
- Event website and contact info
- Policy template management

**Features**:
- **Refund Policies**: No refunds, 7 days, 24 hours, 1 hour, custom
- **Custom Policies**: Rich text editor for custom terms
- **Contact Info**: Website and email configuration
- **Policy Templates**: Pre-configured policy options

**Props Interface**:
```typescript
interface AdvancedSectionProps {
  eventWebsite: string;
  eventContactEmail: string;
  refundPolicy: 'no_refunds' | 'refund_up_to_7_days' | 'refund_up_to_24_hours' | 'refund_up_to_1_hour' | 'custom';
  customRefundPolicy: string;
  onEventWebsiteChange: (value: string) => void;
  onEventContactEmailChange: (value: string) => void;
  onRefundPolicyChange: (value: any) => void;
  onCustomRefundPolicyChange: (value: string) => void;
}
```

---

### Review Components

#### ReviewSection.tsx (17.6KB)
**Purpose**: Event preview and publishing interface

**Functionality**:
- Complete event preview before publishing
- Validation checks and error reporting
- Publishing options and settings
- Social sharing configuration

**Features**:
- **Event Preview**: Complete event display
- **Validation Checks**: Required fields, data integrity
- **Publishing Options**: Draft, published, scheduled
- **Social Sharing**: Social media preview configuration
- **Action Buttons**: Save, publish, back navigation

**Props Interface**:
```typescript
interface ReviewSectionProps {
  formData: EventFormData;
  onEdit: (stepId: string) => void;
  onSave: () => void;
  onPublish: () => void;
}
```

#### PreviewSection.tsx (1KB)
**Purpose**: Quick event preview modal

**Functionality**:
- Shows how event will appear to attendees
- Responsive preview design
- Social card preview
- Modal-based interface

**Features**:
- Event card preview
- Social media preview
- Responsive design
- Modal overlay

**Props Interface**:
```typescript
interface PreviewSectionProps {
  formData: EventFormData;
  onClose: () => void;
}
```

---

## 🔧 Utility Components

### FormField.tsx (1.3KB)
**Purpose**: Reusable form input component

**Functionality**:
- Standardized input field styling
- Label and validation state management
- Error message display
- Multiple input types support

**Features**:
- **Input Types**: Text, email, password, textarea
- **Validation States**: Normal, error, success
- **Labels**: Required indicators, help text
- **Accessibility**: ARIA labels, keyboard navigation

**Props Interface**:
```typescript
interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}
```

### Button.tsx (954B)
**Purpose**: Consistent button styling

**Functionality**:
- Standardized button appearance
- Multiple variants and states
- Loading state support
- Accessibility features

**Features**:
- **Variants**: Primary, secondary, outline, ghost
- **Sizes**: Small, medium, large
- **States**: Normal, loading, disabled
- **Icons**: Icon support with positioning

**Props Interface**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}
```

### Toggle.tsx (637B)
**Purpose**: Toggle switch component

**Functionality**:
- Boolean setting configuration
- Animated transitions
- Accessibility support
- Custom styling

**Features**:
- **States**: On/off with smooth transitions
- **Labels**: Optional text labels
- **Accessibility**: ARIA labels, keyboard navigation
- **Styling**: Customizable appearance

**Props Interface**:
```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}
```

---

## 📱 Navigation Components

### SidePanel.tsx (4KB)
**Purpose**: Wizard navigation and progress tracking

**Functionality**:
- Step navigation between wizard sections
- Progress indicator and percentage
- Step completion status display
- Quick access to all wizard steps

**Features**:
- **Step Navigation**: Click to jump to any step
- **Progress Tracking**: Visual progress bar and percentage
- **Completion Status**: Visual indicators for completed steps
- **Quick Actions**: Save, preview, publish buttons
- **Responsive Design**: Collapsible on mobile

**Props Interface**:
```typescript
interface SidePanelProps {
  currentStep: number;
  totalSteps: number;
  stepProgress: number;
  isStepComplete: (stepId: string) => boolean;
  goToStep: (step: number) => void;
  onSave: () => void;
  onPreview: () => void;
}
```

---

## 🏷️ Legacy Components (To Be Removed/Updated)

### CategorySection.tsx (7.2KB)
**Purpose**: Event categorization (deprecated)

**Status**: Being replaced by enhanced EventTypeSection
**Migration Path**: Moving category functionality into EventTypeSection
**Reason**: Redundant with new event_type field structure

---

## 🎯 Component Usage Flow

### Step-by-Step Component Usage
```
1. Basic Info: BasicInfo + ImageUpload
2. Event Type: EventTypeSection  
3. Date & Time: DateTimeSection
4. Location: LocationSection
5. Registration: 
   - RegistrationPrivacySelector
   - RegistrationTiming
   - RegistrationSettings
   - AccessibilityFeatures
6. Ticketing: 
   - TicketingOverview
   - TicketTypeEditor (multiple instances)
7. Advanced: AdvancedSection
8. Review: ReviewSection + PreviewSection
```

### Shared Components (Used Across All Steps)
```
- FormField: Standardized input fields
- Button: Consistent button styling
- Toggle: Boolean setting controls
- SidePanel: Navigation and progress
```

### Data Flow Architecture
```
EventFormData → Individual Components → EventWizard → API
     ↓                ↓                    ↓         ↓
State Management → Component Props → Data Aggregation → Backend
```

---

## 🚀 Architecture Benefits

### Modular Design
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components can be used in different contexts
- **Maintainability**: Easy to update individual components
- **Testing**: Smaller components are easier to unit test
- **Performance**: Better code splitting and lazy loading

### User Experience
- **Progressive Disclosure**: Show relevant fields at each step
- **Clear Validation**: Immediate feedback on each section
- **Professional Flow**: Industry-standard event creation process
- **Accessibility**: WCAG compliant components
- **Responsive Design**: Works on all device sizes

### Developer Experience
- **Type Safety**: Strong TypeScript interfaces
- **Component Isolation**: Clear boundaries between components
- **Debugging**: Easy to identify and fix issues
- **Documentation**: Clear props and usage examples
- **Consistency**: Standardized patterns and conventions

---

## 📊 Component Size Analysis

### Before Splitting
```
Large Components (>5KB):
✓ EventWizard.tsx (23KB) - Main wizard component
✓ RegistrationSection.tsx (12.7KB) - Registration settings
✓ TicketingSection.tsx (12.9KB) - Ticket management
✓ ReviewSection.tsx (17.6KB) - Review and preview
✓ AdvancedSection.tsx (7.9KB) - Advanced options
✓ CategorySection.tsx (7.2KB) - Category and settings
✓ EventTypeSection.tsx (6.7KB) - Event type selection
```

### After Splitting
```
Split Components:
✓ RegistrationPrivacySelector.tsx (~2KB)
✓ RegistrationTiming.tsx (~2KB)
✓ RegistrationSettings.tsx (~2KB)
✓ AccessibilityFeatures.tsx (~2KB)
✓ TicketTypeEditor.tsx (~4KB)
✓ TicketingOverview.tsx (~3KB)
✓ Updated RegistrationSection.tsx (~3KB)
✓ Updated TicketingSection.tsx (~4KB)
```

### Size Reduction Benefits
- **Faster Loading**: Smaller components load quicker
- **Better Caching**: Individual components can be cached separately
- **Code Splitting**: Better lazy loading opportunities
- **Memory Usage**: Reduced memory footprint
- **Development Speed**: Faster rebuilds and hot reloads

---

## 🔮 Future Enhancements

### Remaining Large Components to Split
- **ReviewSection.tsx** (17.6KB) → Preview, Validation, Publishing components
- **AdvancedSection.tsx** (7.9KB) → Settings, Policies, Contact components
- **EventTypeSection.tsx** (6.7KB) → Type, Format, Privacy components

### Potential New Components
- **EventPreview.tsx** - Enhanced preview functionality
- **ValidationSummary.tsx** - Validation error aggregation
- **PublishingOptions.tsx** - Publishing configuration
- **SocialSharing.tsx** - Social media integration

### Architecture Improvements
- **State Management**: Consider Redux/Zustand for complex state
- **Form Library**: Integrate with React Hook Form or Formik
- **Component Library**: Extract to shared component library
- **Testing**: Add comprehensive unit and integration tests
- **Storybook**: Component documentation and testing

---

## 📝 Conclusion

This modular component architecture provides a robust, scalable foundation for the event creation wizard. The separation of concerns, clear interfaces, and reusable components make the system maintainable and extensible while providing an excellent user experience for event organizers.

The architecture follows modern React best practices and provides a solid foundation for future enhancements and improvements.

---

*Last Updated: April 2026*
*Version: 1.0*
*Author: EventRadius Development Team*
