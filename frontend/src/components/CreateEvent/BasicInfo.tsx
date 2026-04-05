import { useState } from 'react';

interface BasicInfoProps {
  eventName: string;
  description: string;
  onEventNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const BasicInfo = ({ eventName, description, onEventNameChange, onDescriptionChange }: BasicInfoProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
      <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
        {/* Left: Image Upload */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Image upload will be handled by parent component */}
        </div>

        {/* Right: Form Fields */}
        <div className="space-y-4 md:space-y-6">
          <input
            type="text"
            placeholder="Event Name"
            className="w-full text-black text-[32px] md:text-[48px] lg:text-[56px] font-medium leading-none mb-4 md:mb-8 focus:outline-none bg-red-50 border-b-2 border-red-300 p-0 placeholder:text-[#C4C4C4]"
            value={eventName}
            onChange={(e) => onEventNameChange(e.target.value)}
          />

          <textarea
            placeholder="Describe your event..."
            className="w-full text-black text-base md:text-lg leading-relaxed focus:outline-none bg-red-50 border-b-2 border-red-300 p-0 placeholder:text-[#C4C4C4] resize-none"
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
