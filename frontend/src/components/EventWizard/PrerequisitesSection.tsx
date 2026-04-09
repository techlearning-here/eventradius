import { GraduationCap, Dumbbell, Wrench, Shirt, FileText, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface PrerequisitesSectionProps {
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  priorExperience: 'none_required' | 'some_experience' | 'expert_level';
  physicalFitness: 'sedentary' | 'light_activity' | 'moderate_activity' | 'high_intensity' | 'athletic';
  equipmentRequired: string[];
  dressCode: 'casual' | 'business_casual' | 'formal' | 'sportswear' | 'traditional';
  prerequisitesNotes: string;
  onSkillLevelChange: (level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels') => void;
  onPriorExperienceChange: (experience: 'none_required' | 'some_experience' | 'expert_level') => void;
  onPhysicalFitnessChange: (fitness: 'sedentary' | 'light_activity' | 'moderate_activity' | 'high_intensity' | 'athletic') => void;
  onEquipmentRequiredChange: (equipment: string[]) => void;
  onDressCodeChange: (code: 'casual' | 'business_casual' | 'formal' | 'sportswear' | 'traditional') => void;
  onPrerequisitesNotesChange: (notes: string) => void;
}

const skillLevelOptions = [
  { value: 'all_levels', label: 'All Levels', description: 'Open to everyone, regardless of experience' },
  { value: 'beginner', label: 'Beginner', description: 'No prior experience needed' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some basic knowledge required' },
  { value: 'advanced', label: 'Advanced', description: 'Significant experience required' },
];

const experienceOptions = [
  { value: 'none_required', label: 'None Required', description: 'Complete beginners welcome' },
  { value: 'some_experience', label: 'Some Experience', description: 'Basic familiarity helpful' },
  { value: 'expert_level', label: 'Expert Level', description: 'Deep expertise expected' },
];

const fitnessOptions = [
  { value: 'sedentary', label: 'Sedentary', description: 'Mostly sitting or standing in place' },
  { value: 'light_activity', label: 'Light Activity', description: 'Walking, light movement' },
  { value: 'moderate_activity', label: 'Moderate Activity', description: 'Brisk movement, some exertion' },
  { value: 'high_intensity', label: 'High Intensity', description: 'Vigorous physical activity' },
  { value: 'athletic', label: 'Athletic', description: 'Peak physical performance required' },
];

const dressCodeOptions = [
  { value: 'casual', label: 'Casual', description: 'Comfortable everyday wear' },
  { value: 'business_casual', label: 'Business Casual', description: 'Professional but relaxed' },
  { value: 'formal', label: 'Formal', description: 'Evening wear, suits, gowns' },
  { value: 'sportswear', label: 'Sportswear', description: 'Athletic clothing, sneakers' },
  { value: 'traditional', label: 'Traditional/Cultural', description: 'Cultural or religious attire' },
];

const equipmentOptions = [
  { id: 'none', label: 'None Required', description: 'Just bring yourself' },
  { id: 'laptop', label: 'Laptop', description: 'Personal computer needed' },
  { id: 'yoga_mat', label: 'Yoga Mat', description: 'Exercise mat required' },
  { id: 'sports_shoes', label: 'Sports Shoes', description: 'Athletic footwear' },
  { id: 'musical_instrument', label: 'Musical Instrument', description: 'Bring your own instrument' },
  { id: 'art_supplies', label: 'Art Supplies', description: 'Drawing/painting materials' },
  { id: 'swimwear', label: 'Swimwear', description: 'Swimsuit, towel, etc.' },
  { id: 'safety_gear', label: 'Safety Gear', description: 'Helmet, harness, pads' },
  { id: 'camping_gear', label: 'Camping Gear', description: 'Tent, sleeping bag, etc.' },
  { id: 'cooking_utensils', label: 'Cooking Utensils', description: 'Knives, pots, etc.' },
  { id: 'sports_equipment', label: 'Sports Equipment', description: 'Rackets, balls, etc.' },
  { id: 'camera', label: 'Camera', description: 'Photo/video equipment' },
  { id: 'notebooks', label: 'Notebooks/Stationery', description: 'Paper, pens, folders' },
  { id: 'id_documents', label: 'ID/Documents', description: 'ID card, tickets, passes' },
  { id: 'water_bottle', label: 'Water Bottle', description: 'Reusable drinking bottle' },
  { id: 'other', label: 'Other (Specify in notes)', description: 'See additional notes' },
];

export const PrerequisitesSection = ({
  skillLevel,
  priorExperience,
  physicalFitness,
  equipmentRequired,
  dressCode,
  prerequisitesNotes,
  onSkillLevelChange,
  onPriorExperienceChange,
  onPhysicalFitnessChange,
  onEquipmentRequiredChange,
  onDressCodeChange,
  onPrerequisitesNotesChange,
}: PrerequisitesSectionProps) => {
  const handleEquipmentToggle = (id: string) => {
    if (equipmentRequired.includes(id)) {
      const newEquipment = equipmentRequired.filter(e => e !== id);
      onEquipmentRequiredChange(newEquipment);
    } else {
      // If selecting "none", clear other selections
      if (id === 'none') {
        onEquipmentRequiredChange(['none']);
      } else {
        // Remove "none" if selecting specific equipment
        const newEquipment = equipmentRequired.filter(e => e !== 'none');
        onEquipmentRequiredChange([...newEquipment, id]);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Skill Level */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Skill Level</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          What level of skill or knowledge should attendees have?
        </p>
        <RadioGroup
          value={skillLevel}
          onValueChange={(value) => onSkillLevelChange(value as typeof skillLevel)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {skillLevelOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`skill-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`skill-${option.value}`}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Prior Experience */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Prior Experience Required</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          What background knowledge or experience is needed?
        </p>
        <RadioGroup
          value={priorExperience}
          onValueChange={(value) => onPriorExperienceChange(value as typeof priorExperience)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {experienceOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`exp-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`exp-${option.value}`}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Physical Fitness */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Physical Fitness Level</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          What level of physical activity or fitness is required?
        </p>
        <RadioGroup
          value={physicalFitness}
          onValueChange={(value) => onPhysicalFitnessChange(value as typeof physicalFitness)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {fitnessOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`fitness-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`fitness-${option.value}`}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Dress Code */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Dress Code</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          What should attendees wear?
        </p>
        <RadioGroup
          value={dressCode}
          onValueChange={(value) => onDressCodeChange(value as typeof dressCode)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {dressCodeOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`dress-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`dress-${option.value}`}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Equipment Required */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Equipment Required</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          What should attendees bring? Select all that apply.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {equipmentOptions.map((option) => (
            <div
              key={option.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                equipmentRequired.includes(option.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleEquipmentToggle(option.id)}
            >
              <Checkbox
                checked={equipmentRequired.includes(option.id)}
                onCheckedChange={() => handleEquipmentToggle(option.id)}
              />
              <div className="flex-1">
                <Label className="font-medium cursor-pointer">{option.label}</Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Prerequisites Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <Label htmlFor="prerequisites-notes" className="font-medium">
            Additional Prerequisites or Notes
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Provide any specific requirements, preparation needed, or other important information for attendees.
        </p>
        <Textarea
          id="prerequisites-notes"
          placeholder="Example: Please bring a valid ID. Complete the online safety module before attending. Prior yoga experience recommended but not required. Must be comfortable with heights..."
          value={prerequisitesNotes}
          onChange={(e) => onPrerequisitesNotesChange(e.target.value)}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};
