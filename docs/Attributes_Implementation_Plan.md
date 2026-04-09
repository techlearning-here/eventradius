# Attributes Implementation Plan

## Overview
Implement comprehensive event and user attributes collection for intelligent event matching and personalized recommendations.

## Phase 1: Event Creation Wizard Enhancement

### New Wizard Sections to Add

#### Section 1: Audience & Demographics (After Basic Info)
**Sub-steps:**
1. **Target Audience** - Age groups, gender preference, family/senior/singles friendly
2. **Accessibility** - Wheelchair, hearing, vision, sensory-friendly flags

#### Section 2: Cultural Context & Prerequisites (Before Review)
**Sub-steps:**
1. **Cultural Context** - Religious context, cultural celebrations, dietary needs
2. **Prerequisites** - Skill level, equipment, dress code, physical fitness
3. **Content Rating** - Age rating, alcohol policy, noise level

### Implementation Steps

#### Step 1: Update EventFormData Interface
Add new fields to `EventFormData` in `EventWizard.tsx`:

```typescript
// Audience & Demographics
age_categories: string[]; // ['kids', 'teens', 'adults_25_35', 'middle_age', '50_plus', 'seniors_65_plus']
gender_preference: 'all' | 'women_only' | 'men_only' | 'lgbtq_friendly' | 'gender_neutral';
family_friendly: boolean;
senior_friendly: boolean;
singles_friendly: boolean;
couples_oriented: boolean;

// Accessibility
wheelchair_accessible: boolean;
mobility_friendly: boolean;
hearing_accessible: boolean;
vision_accessible: boolean;
sensory_friendly: boolean;
service_animals_allowed: boolean;
accessibility_notes: string;

// Cultural Context
religious_context: string[]; // ['hindu', 'christian', 'muslim', 'buddhist', 'jewish', 'sikh', 'jain', 'interfaith', 'secular', 'none']
cultural_celebration: string[]; // ['diwali', 'christmas', 'eid', 'chinese_new_year', 'holi', etc.]
cultural_origin: string; // Country/region of origin
dietary_context: string[]; // ['vegetarian', 'vegan', 'halal', 'kosher', 'jain', 'none']
traditional_attire: 'encouraged' | 'required' | 'optional' | 'not_applicable';

// Prerequisites & Requirements
skill_level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
prior_experience: 'none_required' | 'some_experience' | 'expert_level';
physical_fitness: 'sedentary' | 'light_activity' | 'moderate_activity' | 'high_intensity' | 'athletic';
equipment_required: string[]; // ['yoga_mat', 'laptop', 'sports_shoes', 'musical_instrument', 'art_supplies', 'none']
dress_code: 'casual' | 'business_casual' | 'formal' | 'sportswear' | 'traditional';
prerequisites_notes: string;

// Content & Intensity
content_rating: 'all_ages' | 'pg' | 'pg_13' | 'mature_18' | 'explicit';
alcohol_served: 'no_alcohol' | 'byob' | 'bar_available' | 'complimentary';
smoking_policy: 'non_smoking' | 'smoking_area' | 'vape_friendly';
noise_level: 'quiet' | 'moderate' | 'loud' | 'very_loud';
physical_intensity: 'none' | 'low' | 'medium' | 'high' | 'extreme';

// Social & Networking
networking_focus: boolean;
social_mixer: boolean;
ice_breakers: boolean;
group_activities: boolean;
team_building: boolean;
```

#### Step 2: Create New Components

**Component 1: `AudienceSection.tsx`**
- Multi-select for age categories (Kids, Teens, Adults 18-25, Adults 25-35, Middle Age 36-50, 50+, 60+, 65+ Seniors)
- Gender preference selector (All Welcome, Women Only, Men Only, LGBTQ+ Friendly, Gender Neutral)
- Toggle switches for Family Friendly, Senior Friendly, Singles Friendly, Couples Oriented

**Component 2: `AccessibilitySection.tsx`**
- Toggle switches for all accessibility options
- Notes text area for specific accommodations

**Component 3: `CulturalContextSection.tsx`**
- Multi-select for religious context
- Multi-select for cultural celebrations
- Dietary requirements multi-select
- Traditional attire selector

**Component 4: `PrerequisitesSection.tsx`**
- Skill level selector
- Physical fitness selector
- Equipment required multi-select with "other" option
- Dress code selector
- Prerequisites notes textarea

**Component 5: `ContentRatingSection.tsx`**
- Content rating selector with age descriptions
- Alcohol policy selector
- Smoking policy selector
- Noise level selector
- Physical intensity selector
- Social features toggles (networking, ice breakers, etc.)

#### Step 3: Update Wizard Configuration
Update `wizardConfig.ts` to add new sections:

```typescript
export const WIZARD_SECTIONS = [
  {
    id: 'basic',
    title: 'Basic Event Details',
    description: 'Essential information for your event',
    subSteps: [
      { id: 'info', title: 'Event Info', description: 'Title, description, language and image' },
      { id: 'type', title: 'Type & Format', description: 'Event type, format, schedule and venue' },
      { id: 'contact', title: 'Contact Info', description: 'Phone and email for attendees' }
    ]
  },
  {
    id: 'audience',
    title: 'Target Audience',
    description: 'Define who your event is for',
    subSteps: [
      { id: 'demographics', title: 'Demographics', description: 'Age groups, gender, family-friendly settings' },
      { id: 'accessibility', title: 'Accessibility', description: 'Accessibility features and accommodations' }
    ]
  },
  {
    id: 'context',
    title: 'Cultural Context & Requirements',
    description: 'Cultural context and prerequisites',
    subSteps: [
      { id: 'cultural', title: 'Cultural Context', description: 'Religious, cultural, and dietary context' },
      { id: 'prerequisites', title: 'Prerequisites', description: 'Skill level, equipment, and requirements' },
      { id: 'content', title: 'Content Rating', description: 'Age rating, policies, and intensity' }
    ]
  },
  {
    id: 'review',
    title: 'Review & Publish',
    description: 'Review your event and publish',
    subSteps: [
      { id: 'review', title: 'Review & Publish', description: 'Final review before publishing' }
    ]
  }
] as const;
```

#### Step 4: Update EventWizard.tsx

1. **Add new fields to formData state initialization**
2. **Add validation logic in `isSubStepComplete`**
3. **Add render cases in `renderSubStepContent`**
4. **Update ReviewSection to display new attributes**

### Database Schema Updates

Add columns to `events` table:

```sql
-- Audience & Demographics
age_categories text[],
gender_preference varchar(50),
family_friendly boolean default false,
senior_friendly boolean default false,
singles_friendly boolean default false,
couples_oriented boolean default false,

-- Accessibility
wheelchair_accessible boolean default false,
mobility_friendly boolean default false,
hearing_accessible boolean default false,
vision_accessible boolean default false,
sensory_friendly boolean default false,
service_animals_allowed boolean default false,
accessibility_notes text,

-- Cultural Context
religious_context text[],
cultural_celebration text[],
cultural_origin varchar(100),
dietary_context text[],
traditional_attire varchar(50),

-- Prerequisites
skill_level varchar(50),
prior_experience varchar(50),
physical_fitness varchar(50),
equipment_required text[],
dress_code varchar(50),
prerequisites_notes text,

-- Content & Intensity
content_rating varchar(50),
alcohol_served varchar(50),
smoking_policy varchar(50),
noise_level varchar(50),
physical_intensity varchar(50),

-- Social Features
networking_focus boolean default false,
social_mixer boolean default false,
ice_breakers boolean default false,
group_activities boolean default false,
team_building boolean default false
```

## Phase 2: User Onboarding Enhancement

### New Onboarding Steps

#### Step 1: Cultural Identity
- Religion selection (single select with observance level)
- Ethnicity multi-select with search
- Languages spoken (primary + secondary)
- Cultural background description (optional)

#### Step 2: Interests & Preferences
- Interest categories with multi-select
- Preferred event formats
- Group size preference
- Social style (introvert/extrovert/ambivert)

#### Step 3: Accessibility & Needs
- Any accessibility requirements
- Dietary restrictions
- Preferred event times/days
- Price comfort range

#### Step 4: Goals & Intentions
- What are you looking for? (Friends, Networking, Dating, Learning, Entertainment)
- Event companion preference (Solo, Partner, Friends, Family)
- Comfort level with new people

### Database Schema for User Attributes

Add columns to `user_profiles` table:

```sql
-- Cultural Identity
religion varchar(50),
religious_observance varchar(50),
ethnicity text[],
nationality varchar(100),
cultural_background text,

-- Languages
primary_language varchar(50),
secondary_languages text[],
preferred_event_languages text[],

-- Interests
interests jsonb, -- structured object with categories

-- Social Preferences
preferred_group_size varchar(50),
social_style varchar(50),
looking_for text[],
event_companion varchar(50),
comfort_level varchar(50),

-- Event Preferences
preferred_days text[],
preferred_times text[],
max_event_duration varchar(50),
price_comfort varchar(50),
virtual_comfort varchar(50),

-- Accessibility
accessibility_needs text[],
dietary_restrictions text[],
sensory_sensitivities boolean,
service_animal boolean,

-- Family
relationship_status varchar(50),
has_children boolean,
children_ages text[],
pet_owner boolean,
pet_types text[]
```

## Phase 3: Event Discovery Enhancement

### Enhanced Filter Panel

Add new filter categories to the discover page:

1. **Demographics Filter**
   - Age group checkboxes
   - Gender preference
   - Family-friendly toggle
   - Senior-friendly toggle

2. **Cultural Filter**
   - Religious context multi-select
   - Cultural celebration filter
   - Dietary options

3. **Accessibility Filter**
   - Wheelchair accessible
   - Hearing accessible
   - Vision accessible
   - Sensory friendly

4. **Requirements Filter**
   - Skill level
   - Physical intensity
   - Equipment provided vs required
   - Dress code

5. **Content Filter**
   - Content rating
   - Alcohol policy
   - Noise level
   - Smoking policy

### AI Matching Algorithm

Implement matching score calculation:

```typescript
interface MatchScore {
  strictMatch: number;    // Must-have attributes (0-100)
  preferenceMatch: number; // Nice-to-have attributes (0-100)
  aiRecommendation: number; // ML-based score (0-100)
  overallScore: number;   // Weighted combination (0-100)
}

// Matching logic
function calculateMatchScore(event: Event, user: User): MatchScore {
  // Strict matches (deal breakers)
  const strictScore = checkStrictMatches(event, user);
  
  // Preference matches (nice to have)
  const preferenceScore = checkPreferenceMatches(event, user);
  
  // AI recommendation based on behavior
  const aiScore = getAIRecommendation(event, user);
  
  return {
    strictMatch: strictScore,
    preferenceMatch: preferenceScore,
    aiRecommendation: aiScore,
    overallScore: (strictScore * 0.4) + (preferenceScore * 0.3) + (aiScore * 0.3)
  };
}
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Update EventFormData interface
- [ ] Create new wizard sections and sub-steps
- [ ] Update wizard configuration
- [ ] Update database schema (migration)

### Week 2: Event Wizard Components
- [ ] Build AudienceSection component
- [ ] Build AccessibilitySection component
- [ ] Build CulturalContextSection component
- [ ] Build PrerequisitesSection component
- [ ] Build ContentRatingSection component

### Week 3: Integration
- [ ] Integrate new components into EventWizard
- [ ] Update ReviewSection to display new attributes
- [ ] Add validation logic
- [ ] Test wizard flow

### Week 4: User Onboarding
- [ ] Create CulturalIdentity onboarding step
- [ ] Create InterestsPreferences onboarding step
- [ ] Create AccessibilityNeeds onboarding step
- [ ] Create GoalsIntentions onboarding step

### Week 5: Discovery & Matching
- [ ] Add new filter categories to discover page
- [ ] Implement matching score algorithm
- [ ] Update event cards to show relevant attributes
- [ ] Add attribute badges to event listings

### Week 6: Testing & Polish
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] UI/UX refinements
- [ ] Documentation updates

## Success Metrics

1. **Event Creation**: % of events with complete attribute profiles
2. **User Onboarding**: % of users completing attribute preferences
3. **Discovery**: Increase in relevant event matches
4. **Engagement**: Higher click-through rates on recommended events
5. **Diversity**: Broader range of events being discovered

## Notes

- All new fields should be optional to avoid friction
- Use progressive disclosure (show advanced options on demand)
- Provide helpful tooltips for each attribute
- Consider cultural sensitivity in language and options
- Ensure accessibility in the attribute collection UI itself
