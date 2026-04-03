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
            className="w-full text-black text-[32px] md:text-[48px] lg:text-[56px] font-medium leading-none mb-4 md:mb-8 focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4]"
            value={eventName}
            onChange={(e) => onEventNameChange(e.target.value)}
          />

          <textarea
            placeholder="Event Description"
            className="w-full text-black text-[16px] md:text-[18px] leading-rel focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4] resize-none h-24 md:h-32"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
