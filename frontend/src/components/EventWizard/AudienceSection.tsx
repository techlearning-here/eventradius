import { Users, Baby, Heart, UserPlus, Users2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface AudienceSectionProps {
  ageCategories: string[];
  genderPreference: 'all' | 'women_only' | 'men_only' | 'lgbtq_friendly' | 'gender_neutral';
  familyFriendly: boolean;
  seniorFriendly: boolean;
  singlesFriendly: boolean;
  couplesOriented: boolean;
  onAgeCategoriesChange: (categories: string[]) => void;
  onGenderPreferenceChange: (preference: 'all' | 'women_only' | 'men_only' | 'lgbtq_friendly' | 'gender_neutral') => void;
  onFamilyFriendlyChange: (value: boolean) => void;
  onSeniorFriendlyChange: (value: boolean) => void;
  onSinglesFriendlyChange: (value: boolean) => void;
  onCouplesOrientedChange: (value: boolean) => void;
}

const ageCategoryOptions = [
  { id: 'all_ages', label: 'All Ages', description: 'Suitable for everyone' },
  { id: 'kids', label: 'Kids (0-12)', description: 'Children friendly' },
  { id: 'girl_kids', label: 'Girl Kids', description: 'Programs for young girls' },
  { id: 'boy_kids', label: 'Boy Kids', description: 'Programs for young boys' },
  { id: 'teens', label: 'Teens (13-17)', description: 'Teenager focused' },
  { id: 'young_adults', label: 'Young Adults (18-25)', description: 'College and early career' },
  { id: 'adults_25_35', label: 'Adults (25-35)', description: 'Young professionals' },
  { id: 'middle_age', label: 'Middle Age (36-50)', description: 'Established professionals' },
  { id: '50_plus', label: '50+', description: 'Mature adults' },
  { id: 'seniors_65_plus', label: 'Seniors (65+)', description: 'Retirees and seniors' },
];

const genderOptions = [
  { value: 'all', label: 'All Welcome', description: 'Open to everyone', icon: Users },
  { value: 'women_only', label: 'Women Only', description: 'Female participants only', icon: Heart },
  { value: 'men_only', label: 'Men Only', description: 'Male participants only', icon: UserPlus },
  { value: 'lgbtq_friendly', label: 'LGBTQ+ Friendly', description: 'Inclusive and welcoming', icon: Users2 },
  { value: 'gender_neutral', label: 'Gender Neutral', description: 'No gender focus', icon: Users },
];

export const AudienceSection = ({
  ageCategories,
  genderPreference,
  familyFriendly,
  seniorFriendly,
  singlesFriendly,
  couplesOriented,
  onAgeCategoriesChange,
  onGenderPreferenceChange,
  onFamilyFriendlyChange,
  onSeniorFriendlyChange,
  onSinglesFriendlyChange,
  onCouplesOrientedChange,
}: AudienceSectionProps) => {
  const handleAgeCategoryToggle = (categoryId: string) => {
    if (ageCategories.includes(categoryId)) {
      onAgeCategoriesChange(ageCategories.filter(c => c !== categoryId));
    } else {
      // If selecting "All Ages", clear other selections
      if (categoryId === 'all_ages') {
        onAgeCategoriesChange(['all_ages']);
      } else {
        // If selecting specific age, remove "All Ages"
        const newCategories = ageCategories.filter(c => c !== 'all_ages');
        onAgeCategoriesChange([...newCategories, categoryId]);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Age Categories */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Age Categories</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select the age groups your event is designed for. You can select multiple options.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ageCategoryOptions.map((option) => (
            <div
              key={option.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                ageCategories.includes(option.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleAgeCategoryToggle(option.id)}
            >
              <Checkbox
                checked={ageCategories.includes(option.id)}
                onCheckedChange={() => handleAgeCategoryToggle(option.id)}
              />
              <div className="flex-1">
                <Label className="font-medium cursor-pointer">{option.label}</Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gender Preference */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Gender Preference</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Who is welcome to attend your event?
        </p>
        <RadioGroup
          value={genderPreference}
          onValueChange={(value) => onGenderPreferenceChange(value as typeof genderPreference)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {genderOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.value}>
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <div className="font-semibold text-center">{option.label}</div>
                  <div className="text-xs text-muted-foreground text-center">{option.description}</div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Family & Social Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Event Atmosphere</h3>
        <p className="text-sm text-muted-foreground">
          Mark the settings that apply to your event. These help attendees find the right fit.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="family-friendly" className="font-medium">Family Friendly</Label>
              <p className="text-xs text-muted-foreground">Suitable for children and parents</p>
            </div>
            <Switch
              id="family-friendly"
              checked={familyFriendly}
              onCheckedChange={onFamilyFriendlyChange}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="senior-friendly" className="font-medium">Senior Friendly</Label>
              <p className="text-xs text-muted-foreground">Accessible and welcoming for seniors</p>
            </div>
            <Switch
              id="senior-friendly"
              checked={seniorFriendly}
              onCheckedChange={onSeniorFriendlyChange}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="singles-friendly" className="font-medium">Singles Friendly</Label>
              <p className="text-xs text-muted-foreground">Welcoming for solo attendees</p>
            </div>
            <Switch
              id="singles-friendly"
              checked={singlesFriendly}
              onCheckedChange={onSinglesFriendlyChange}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="couples-oriented" className="font-medium">Couples Oriented</Label>
              <p className="text-xs text-muted-foreground">Designed for pairs or partners</p>
            </div>
            <Switch
              id="couples-oriented"
              checked={couplesOriented}
              onCheckedChange={onCouplesOrientedChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
