import { useState } from 'react';

interface AccessibilityFeaturesProps {
  accessibilityOptions: string;
  onAccessibilityOptionsChange: (value: string) => void;
}

export const AccessibilityFeatures = ({
  accessibilityOptions,
  onAccessibilityOptionsChange,
}: AccessibilityFeaturesProps) => {
  const accessibilityFeatures = [
    { id: 'wheelchair', label: 'Wheelchair accessible' },
    { id: 'parking', label: 'Accessible parking' },
    { id: 'restroom', label: 'Accessible restrooms' },
    { id: 'elevator', label: 'Elevator access' },
    { id: 'ramp', label: 'Ramp access' },
    { id: 'sign_language', label: 'Sign language interpreter' },
    { id: 'captions', label: 'Closed captions' },
    { id: 'audio_description', label: 'Audio description' },
    { id: 'quiet_space', label: 'Quiet space available' },
    { id: 'service_animals', label: 'Service animals welcome' },
  ];

  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    accessibilityOptions ? accessibilityOptions.split(',').map(s => s.trim()) : []
  );

  const handleAccessibilityToggle = (featureId: string) => {
    const updated = selectedAccessibility.includes(featureId)
      ? selectedAccessibility.filter(id => id !== featureId)
      : [...selectedAccessibility, featureId];
    setSelectedAccessibility(updated);
    onAccessibilityOptionsChange(updated.join(', '));
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Accessibility Features</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {accessibilityFeatures.map((feature) => (
          <label
            key={feature.id}
            className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedAccessibility.includes(feature.id)}
              onChange={() => handleAccessibilityToggle(feature.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">{feature.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
