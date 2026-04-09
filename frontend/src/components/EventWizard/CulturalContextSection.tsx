import { Church, Utensils, Shirt } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CulturalContextSectionProps {
  religiousContext: string[];
  dietaryContext: string[];
  traditionalAttire: 'encouraged' | 'required' | 'optional' | 'not_applicable';
  onReligiousContextChange: (contexts: string[]) => void;
  onDietaryContextChange: (diets: string[]) => void;
  onTraditionalAttireChange: (attire: 'encouraged' | 'required' | 'optional' | 'not_applicable') => void;
}

const religiousOptions = [
  { id: 'hindu', label: 'Hindu', description: 'Hindu traditions and celebrations' },
  { id: 'christian', label: 'Christian', description: 'Christian faith and observances' },
  { id: 'muslim', label: 'Muslim', description: 'Islamic traditions and practices' },
  { id: 'buddhist', label: 'Buddhist', description: 'Buddhist teachings and ceremonies' },
  { id: 'jewish', label: 'Jewish', description: 'Jewish traditions and customs' },
  { id: 'sikh', label: 'Sikh', description: 'Sikh faith and practices' },
  { id: 'jain', label: 'Jain', description: 'Jain traditions and principles' },
  { id: 'taoist', label: 'Taoist', description: 'Taoist philosophy and practices' },
  { id: 'shinto', label: 'Shinto', description: 'Shinto Japanese traditions' },
  { id: 'interfaith', label: 'Interfaith', description: 'Multiple faith traditions' },
  { id: 'secular', label: 'Secular', description: 'No religious affiliation' },
  { id: 'none', label: 'None / Not Applicable', description: 'No religious context' },
];

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat, may include dairy and eggs' },
  { id: 'vegan', label: 'Vegan', description: 'No animal products' },
  { id: 'halal', label: 'Halal', description: 'Islamic dietary laws' },
  { id: 'kosher', label: 'Kosher', description: 'Jewish dietary laws' },
  { id: 'jain', label: 'Jain', description: 'Jain dietary principles' },
  { id: 'gluten_free', label: 'Gluten-Free', description: 'No gluten-containing ingredients' },
  { id: 'nut_free', label: 'Nut-Free', description: 'No nuts or nut products' },
  { id: 'dairy_free', label: 'Dairy-Free', description: 'No milk or dairy products' },
  { id: 'none', label: 'None / Not Applicable', description: 'No dietary restrictions' },
];

const traditionalAttireOptions = [
  { value: 'not_applicable', label: 'Not Applicable', description: 'No special dress code' },
  { value: 'optional', label: 'Optional', description: 'Traditional dress welcome but not required' },
  { value: 'encouraged', label: 'Encouraged', description: 'Hosts encourage traditional attire' },
  { value: 'required', label: 'Required', description: 'Traditional dress expected/required' },
];

export const CulturalContextSection = ({
  religiousContext,
  dietaryContext,
  traditionalAttire,
  onReligiousContextChange,
  onDietaryContextChange,
  onTraditionalAttireChange,
}: CulturalContextSectionProps) => {
  const handleReligiousToggle = (id: string) => {
    if (religiousContext.includes(id)) {
      onReligiousContextChange(religiousContext.filter(c => c !== id));
    } else {
      // If selecting "none", clear other selections
      if (id === 'none') {
        onReligiousContextChange(['none']);
      } else {
        // Remove "none" if selecting something else
        const newContext = religiousContext.filter(c => c !== 'none');
        onReligiousContextChange([...newContext, id]);
      }
    }
  };

  const handleDietaryToggle = (id: string) => {
    if (dietaryContext.includes(id)) {
      onDietaryContextChange(dietaryContext.filter(c => c !== id));
    } else {
      if (id === 'none') {
        onDietaryContextChange(['none']);
      } else {
        const newDiets = dietaryContext.filter(c => c !== 'none');
        onDietaryContextChange([...newDiets, id]);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Religious Context */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Church className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Religious Context</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Does your event have a religious or spiritual context? Select all that apply.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {religiousOptions.map((option) => (
            <div
              key={option.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                religiousContext.includes(option.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleReligiousToggle(option.id)}
            >
              <Checkbox
                checked={religiousContext.includes(option.id)}
                onCheckedChange={() => handleReligiousToggle(option.id)}
              />
              <div className="flex-1">
                <Label className="font-medium cursor-pointer">{option.label}</Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Context */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Dietary Context</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Will food be served? Select dietary accommodations available at your event.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dietaryOptions.map((option) => (
            <div
              key={option.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                dietaryContext.includes(option.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleDietaryToggle(option.id)}
            >
              <Checkbox
                checked={dietaryContext.includes(option.id)}
                onCheckedChange={() => handleDietaryToggle(option.id)}
              />
              <div className="flex-1">
                <Label className="font-medium cursor-pointer">{option.label}</Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traditional Attire */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Traditional Attire</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Is traditional or cultural dress relevant to your event?
        </p>
        <RadioGroup
          value={traditionalAttire}
          onValueChange={(value) => onTraditionalAttireChange(value as typeof traditionalAttire)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {traditionalAttireOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};
