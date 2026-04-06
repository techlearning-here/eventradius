# Event Wizard Component Architecture Documentation (Simplified Version)

## 📋 Overview

This document provides a comprehensive overview of the **simplified** Event Wizard component architecture, including all components, their purposes, relationships, and data flow within the event creation system.

**Note**: Advanced Options section has been temporarily disabled for initial testing and validation. It will be re-enabled in later iterations.

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
- **5-step wizard flow** with progress tracking (simplified from 8 steps)
- Auto-save every 30 seconds
- Step validation and completion checks
- Preview modal functionality (simplified)
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

## 🧩 Current Wizard Structure (Simplified)

### Single Section: Basic Event Details
The wizard now consists of **5 sub-steps** within a single section:

#### Step 1: Event Info
- **Components**: BasicInfo + ImageUpload
- **Purpose**: Core event information collection
- **Fields**: Title, description, image upload, event cost, external ticketing URL
- **Mandatory Fields**: Title (*), Description (*)
- **Conditional Fields**: External Ticketing URL (shown only for paid events)

#### Step 2: Type & Format  
- **Components**: EventTypeSection
- **Purpose**: Event format and delivery method selection
- **Fields**: Event type (online/in-person/hybrid), format, privacy, structured venue address, online meeting link, conditional scheduling
- **Mandatory Fields**: Event Type (*), Event Format (*), Structured Venue Address (* for in-person/hybrid), Online Meeting Link (* for online/hybrid), Scheduling Fields (* based on format)
- **Conditional Fields**: Structured venue address, meeting link, and scheduling based on event type and format
- **Structured Venue Fields**: Building Name (optional), Street Address (*), City (*), State/Province (*), ZIP/Postal Code (*), Country (*)
- **Scheduling Options**:
  - **Single Event**: Date, start time, end time
  - **Recurring Event**: Day of week/month, start time, end time, frequency (daily/weekly/monthly), end date options (indefinite or specific date)
  - **Multi-Date Event**: Up to 7 separate events with individual dates and times

#### Step 3: Date & Location
- **Components**: DateTimeSection + LocationSection
- **Purpose**: Event scheduling and venue management
- **Fields**: Start/end times, timezone, location or virtual URL
- **Mandatory Fields**: Start Date & Time (*), End Date & Time (*), Location (*)

#### Step 4: Contact Info
- **Components**: ContactInfo
- **Purpose**: Contact information for attendees
- **Fields**: Contact phone and email
- **Mandatory Fields**: None (optional)

#### Step 5: Review & Publish
- **Components**: ReviewSection
- **Purpose**: Event preview and publishing
- **Fields**: Complete event review and publishing options
- **Mandatory Fields**: None (review step)

---

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
- **Event Cost Selection**: Free vs Paid event toggle
- **External Ticketing Integration**: URL field for external ticketing systems (appears for paid events)

**External Ticketing Feature**:
- **Conditional Display**: Only shown when "Paid Event" is selected
- **URL Validation**: Accepts valid URL format
- **Optional Field**: Organizers can leave blank if not using external system
- **Popular Platforms**: Supports Eventbrite, Ticketmaster, custom solutions
- **User Guidance**: Clear placeholder text and help instructions

**Props Interface**:
```typescript
interface BasicInfoProps {
  eventName: string;
  description: string;
  isPaidEvent: boolean;
  ticketingUrl?: string;
  onEventNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIsPaidEventChange: (value: boolean) => void;
  onTicketingUrlChange: (value: string) => void;
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
  language: string;
  venueAddress?: string;
  // Structured venue fields
  venueStreet?: string;
  venueCity?: string;
  venueState?: string;
  venueZipCode?: string;
  venueCountry?: string;
  venueBuildingName?: string;
  onlineMeetingLink?: string;
  // Scheduling fields based on event format
  singleEventDate?: string;
  singleEventStartTime?: string;
  singleEventEndTime?: string;
  recurringEventDay?: string;
  recurringEventStartTime?: string;
  recurringEventEndTime?: string;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  recurringHasEndDate?: boolean;
  multiDateEvents?: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
  // Event type handlers
  onEventTypeChange: (value: 'online' | 'in_person' | 'hybrid') => void;
  onEventFormatChange: (value: 'single' | 'recurring' | 'multi_date') => void;
  onEventPrivacyChange: (value: 'public' | 'private' | 'unlisted') => void;
  onLanguageChange: (value: string) => void;
  // Venue handlers
  onVenueAddressChange: (value: string) => void;
  onVenueStreetChange: (value: string) => void;
  onVenueCityChange: (value: string) => void;
  onVenueStateChange: (value: string) => void;
  onVenueZipCodeChange: (value: string) => void;
  onVenueCountryChange: (value: string) => void;
  onVenueBuildingNameChange: (value: string) => void;
  onOnlineMeetingLinkChange: (value: string) => void;
  // Scheduling handlers
  onSingleEventDateChange: (value: string) => void;
  onSingleEventStartTimeChange: (value: string) => void;
  onSingleEventEndTimeChange: (value: string) => void;
  onRecurringEventDayChange: (value: string) => void;
  onRecurringEventStartTimeChange: (value: string) => void;
  onRecurringEventEndTimeChange: (value: string) => void;
  onRecurringFrequencyChange: (value: 'daily' | 'weekly' | 'monthly') => void;
  onRecurringEndDateChange: (value: string) => void;
  onRecurringHasEndDateChange: (value: boolean) => void;
  onMultiDateEventsChange: (events: Array<{id: string; date: string; startTime: string; endTime: string}>) => void;
}
```

---

### Date & Time Components

#### DateTimeSection.tsx (4.1KB)
**Purpose**: Event scheduling management

**Functionality**:
- Event start and end time configuration
- Timezone selection and detection
- Date validation and sequencing

**Features**:
- Start/end datetime pickers
- Automatic timezone detection
- Date validation (end after start)
- Timezone support

**Props Interface**:
```typescript
interface DateTimeSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  timezone: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onTimezoneChange: (timezone: string) => void;
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
  isVirtual: boolean;
  virtualEventDetails: string;
  onLocationChange: (value: string) => void;
  onIsVirtualChange: (value: boolean) => void;
  onVirtualEventDetailsChange: (value: string) => void;
}
```

---

### Contact Components

#### ContactInfo.tsx (~2KB)
**Purpose**: Contact information management for events

**Functionality**:
- Contact phone and email configuration
- Validation for contact information
- Optional field handling

**Features**:
- Phone number input with validation
- Email input with validation
- Optional field indicators
- Clear help text

**Props Interface**:
```typescript
interface ContactInfoProps {
  contactPhone: string;
  contactEmail: string;
  onContactPhoneChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
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

---

## 🎯 Component Usage Flow (Simplified)

### Step-by-Step Component Usage
```
1. Event Info: BasicInfo + ImageUpload
2. Type & Format: EventTypeSection  
3. Date & Location: DateTimeSection + LocationSection
4. Contact Info: ContactInfo
5. Review & Publish: ReviewSection
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

## 🚀 Simplified Architecture Benefits

### Reduced Complexity
- **Faster Development**: Fewer steps to implement and test
- **Better User Experience**: Quicker event creation process
- **Easier Validation**: Simpler data structure to validate
- **Faster Loading**: Fewer components to load

### Core Functionality Focus
- **Essential Features**: Focus on most important event creation aspects
- **Quick Validation**: Faster testing and feedback cycles
- **Stable Foundation**: Solid base for future enhancements
- **Cleaner Code**: More maintainable codebase

### User Experience
- **Streamlined Flow**: 5 steps instead of 8
- **Quick Setup**: Get events created faster
- **Essential Fields**: Focus on what matters most
- **Clear Progress**: Better progress indication

---

## 📊 Component Size Analysis (Simplified)

### Active Components
```
Core Components:
✓ EventWizard.tsx (23KB) - Main wizard component
✓ BasicInfo.tsx (1.6KB) - Event information
✓ ImageUpload.tsx (2.6KB) - Image management
✓ EventTypeSection.tsx (6.7KB) - Event type selection
✓ DateTimeSection.tsx (4.1KB) - Scheduling
✓ LocationSection.tsx (1KB) - Location management
✓ ContactInfo.tsx (~2KB) - Contact information
✓ ReviewSection.tsx (17.6KB) - Review and preview
```

### Temporarily Disabled Components
```
Advanced Components (Disabled for now):
✗ RegistrationSection.tsx (12.7KB) - Registration settings
✗ TicketingSection.tsx (12.9KB) - Ticket management
✗ AdvancedSection.tsx (7.9KB) - Advanced options
✗ CategorySection.tsx (7.2KB) - Category and settings
✗ All Registration sub-components
✗ All Ticketing sub-components
```

---

## 🔮 Future Enhancements

### Re-enabling Advanced Features
When ready to re-enable advanced options:
- **Registration Section**: Privacy settings, timing, accessibility
- **Ticketing Section**: Multiple ticket types, pricing, revenue tracking
- **Advanced Settings**: Refund policies, custom fields, integrations

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

This simplified event wizard architecture provides a focused, efficient foundation for event creation. By temporarily disabling advanced features, we can:

1. **Validate Core Functionality**: Ensure basic event creation works perfectly
2. **Gather User Feedback**: Get feedback on the essential flow
3. **Iterative Development**: Add advanced features based on user needs
4. **Stable Platform**: Build on a solid, tested foundation

The simplified architecture maintains the same high-quality component design and user experience while focusing on the most critical event creation features.

---

*Last Updated: April 2026*
*Version: 1.0 (Simplified)*
*Author: EventRadius Development Team*
