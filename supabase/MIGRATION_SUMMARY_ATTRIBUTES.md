# Supabase Migration Summary - Event & User Attributes

## Migration Files Created

### 1. `11_add_event_attributes.sql`
Adds 34 new columns to the `events` table for comprehensive event attributes.

#### Audience & Demographics (6 columns)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `age_categories` | text[] | {} | Array: all_ages, kids, teens, young_adults, adults_25_35, middle_age, 50_plus, seniors_65_plus |
| `gender_preference` | varchar(50) | 'all' | all, women_only, men_only, lgbtq_friendly, gender_neutral |
| `family_friendly` | boolean | false | Suitable for families with children |
| `senior_friendly` | boolean | false | Accessible and welcoming for seniors |
| `singles_friendly` | boolean | false | Welcoming for solo attendees |
| `couples_oriented` | boolean | false | Designed for pairs/partners |

#### Accessibility (7 columns)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `wheelchair_accessible` | boolean | false | Ramps, wide doorways, accessible restrooms |
| `mobility_friendly` | boolean | false | Elevators, minimal stairs, resting areas |
| `hearing_accessible` | boolean | false | ASL interpreters, hearing loops, captions |
| `vision_accessible` | boolean | false | Large print, braille, screen reader support |
| `sensory_friendly` | boolean | false | Low noise, no flashing lights, quiet spaces |
| `service_animals_allowed` | boolean | false | Service animals and emotional support pets welcome |
| `accessibility_notes` | text | null | Additional accessibility information |

#### Cultural Context (3 columns)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `religious_context` | text[] | {} | hindu, christian, muslim, buddhist, jewish, sikh, jain, interfaith, secular |
| `dietary_context` | text[] | {} | vegetarian, vegan, halal, kosher, jain, gluten_free, nut_free, dairy_free |
| `traditional_attire` | varchar(50) | 'not_applicable' | encouraged, required, optional, not_applicable |

#### Prerequisites (6 columns)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `skill_level` | varchar(50) | 'all_levels' | beginner, intermediate, advanced, all_levels |
| `prior_experience` | varchar(50) | 'none_required' | none_required, some_experience, expert_level |
| `physical_fitness` | varchar(50) | 'sedentary' | sedentary, light_activity, moderate_activity, high_intensity, athletic |
| `equipment_required` | text[] | {} | yoga_mat, laptop, sports_shoes, musical_instrument, art_supplies, etc. |
| `dress_code` | varchar(50) | 'casual' | casual, business_casual, formal, sportswear, traditional |
| `prerequisites_notes` | text | null | Additional requirements or preparation needed |

#### Content & Intensity (5 columns)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `content_rating` | varchar(50) | 'all_ages' | all_ages, pg, pg_13, mature_18, explicit |
| `alcohol_served` | varchar(50) | 'no_alcohol' | no_alcohol, byob, bar_available, complimentary |
| `smoking_policy` | varchar(50) | 'non_smoking' | non_smoking, smoking_area, vape_friendly |
| `noise_level` | varchar(50) | 'moderate' | quiet, moderate, loud, very_loud |
| `physical_intensity` | varchar(50) | 'none' | none, low, medium, high, extreme |

#### Social & Networking (5 columns)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `networking_focus` | boolean | false | Professional connections focus |
| `social_mixer` | boolean | false | Casual mingling and socializing |
| `ice_breakers` | boolean | false | Activities to help people connect |
| `group_activities` | boolean | false | Collaborative exercises and games |
| `team_building` | boolean | false | Strengthen group dynamics |

### 2. `12_create_user_profiles_table.sql`
Creates the `user_profiles` table with basic structure and RLS policies.

### 3. `13_add_user_profile_attributes.sql`
Adds 37 new columns to the `user_profiles` table for user matching.

#### Key Columns Added:
- **Cultural Identity**: religion, religious_observance, ethnicity, nationality
- **Languages**: primary_language, secondary_languages, preferred_event_languages
- **Interests**: interests (JSONB), music_genres, sports_fitness, arts_culture, food_drink, tech_gaming, wellness_mindfulness, outdoor_activities, learning_education
- **Social Preferences**: preferred_group_size, social_style, looking_for, event_companion, comfort_level
- **Event Preferences**: preferred_days, preferred_times, max_event_duration, price_comfort, virtual_comfort
- **Accessibility**: accessibility_needs, dietary_restrictions, sensory_sensitivities, service_animal
- **Family**: relationship_status, has_children, children_ages, pet_owner, pet_types
- **Professional**: industry, job_function, career_level, education_level
- **Geographic**: preferred_search_radius, willing_to_travel, max_travel_distance

#### Bonus: Match Score Function
```sql
calculate_event_match_score(user_id, event_id) -> numeric (0-100)
```
SQL function that calculates compatibility between a user and event based on their attributes.

## Indexes Created

### Event Table Indexes
- `idx_events_age_categories` (GIN) - Fast age filtering
- `idx_events_religious_context` (GIN) - Religious context filtering
- `idx_events_dietary_context` (GIN) - Dietary needs filtering
- `idx_events_equipment_required` (GIN) - Equipment filtering
- `idx_events_family_friendly` - Boolean filter
- `idx_events_senior_friendly` - Boolean filter
- `idx_events_wheelchair_accessible` - Boolean filter
- `idx_events_content_rating` - Content rating filter
- `idx_events_skill_level` - Skill level filter
- `idx_events_matching_attributes` - Composite for AI matching

### User Profile Indexes
- `idx_user_profiles_ethnicity` (GIN)
- `idx_user_profiles_interests` (GIN)
- `idx_user_profiles_music_genres` (GIN)
- `idx_user_profiles_sports_fitness` (GIN)
- `idx_user_profiles_looking_for` (GIN)
- `idx_user_profiles_dietary_restrictions` (GIN)
- `idx_user_profiles_accessibility_needs` (GIN)
- `idx_user_profiles_preferred_days` (GIN)
- Plus B-tree indexes on: religion, primary_language, social_style, career_level, relationship_status

## How to Apply Migrations

### Option 1: Using Supabase CLI
```bash
supabase db reset  # Reset with all migrations
# OR
supabase migration up  # Apply pending migrations
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file
4. Run the SQL

### Option 3: Using psql
```bash
psql $SUPABASE_DB_URL -f supabase/migrations/11_add_event_attributes.sql
psql $SUPABASE_DB_URL -f supabase/migrations/12_create_user_profiles_table.sql
psql $SUPABASE_DB_URL -f supabase/migrations/13_add_user_profile_attributes.sql
```

## Verification

After running migrations, verify with:

```sql
-- Check event columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('age_categories', 'gender_preference', 'religious_context', 'skill_level', 'wheelchair_accessible');

-- Check user profile columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('religion', 'ethnicity', 'interests', 'looking_for', 'dietary_restrictions');

-- Test match function
SELECT calculate_event_match_score(
  'user-uuid-here'::uuid,
  'event-uuid-here'::uuid
);
```

## Next Steps After Migration

1. **Update API layer** to include new fields in event creation/update endpoints
2. **Update event discovery queries** to filter by new attributes
3. **Implement AI matching** using the `calculate_event_match_score` function
4. **Build user onboarding** to collect profile attributes
5. **Create admin dashboard** to view attribute usage statistics

## Notes

- All new fields have sensible defaults to avoid breaking existing code
- Array fields use empty arrays `{}` as defaults (not NULL)
- String fields have valid default values matching enum options
- Boolean fields default to `false` (opt-in approach)
- GIN indexes on arrays enable fast containment queries (`&&` operator)
- B-tree indexes on enums enable fast equality filtering
