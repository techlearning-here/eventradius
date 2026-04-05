import { useState } from 'react';

interface BasicInfoProps {
  eventName: string;
  description: string;
  isPaidEvent: boolean;
  onEventNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIsPaidEventChange: (value: boolean) => void;
}

export const BasicInfo = ({ 
  eventName, 
  description,
  isPaidEvent,
  onEventNameChange, 
  onDescriptionChange,
  onIsPaidEventChange
}: BasicInfoProps) => {
  const MAX_DESCRIPTION_LENGTH = 2000; // Reasonable limit for event descriptions
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
      <div className="space-y-8 md:space-y-12">
        {/* Step 1: Event Name */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <h3 className="text-lg font-semibold">Event Name</h3>
          </div>
          <p className="text-white mb-4">Choose a clear, descriptive title for your event</p>
          <input
            type="text"
            placeholder="Enter your event name..."
            className="w-full text-black text-lg md:text-xl font-medium leading-none focus:outline-none bg-red-50 border-b-2 border-red-300 p-2 placeholder:text-[#C4C4C4]"
            value={eventName}
            onChange={(e) => onEventNameChange(e.target.value)}
          />
        </div>

        {/* Step 2: Event Cost (Free or Paid) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <h3 className="text-lg font-semibold">Event Cost</h3>
          </div>
          <p className="text-white mb-4">Choose whether your event is free or requires payment</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free Event Card */}
            <div
              onClick={() => {
                console.log('Free Event card clicked');
                onIsPaidEventChange(false);
              }}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                !isPaidEvent
                  ? 'bg-green-50 border-green-200 ring-2 ring-green-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="text-white text-2xl font-bold">FREE</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-green-800 mb-2">Free Event</h4>
                  <p className="text-sm text-green-700">No registration fee required</p>
                  <p className="text-xs text-green-600 mt-2">Perfect for community gatherings, workshops, and meetups</p>
                </div>
              </div>
            </div>
            
            {/* Paid Event Card */}
            <div
              onClick={() => {
                console.log('Paid Event card clicked');
                onIsPaidEventChange(true);
              }}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                isPaidEvent
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="text-white text-2xl font-bold">PAID</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Paid Event</h4>
                  <p className="text-sm text-blue-700">Requires ticket purchase for attendance</p>
                  <p className="text-xs text-blue-600 mt-2">Ideal for conferences, concerts, and professional events</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Event Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <h3 className="text-lg font-semibold">Event Description</h3>
          </div>
          <p className="text-white mb-4">Provide a detailed description of what attendees can expect</p>
          <div className="relative">
            <textarea
              placeholder="Describe your event in detail..."
              className="w-full text-black text-base md:text-lg leading-relaxed focus:outline-none bg-red-50 border-b-2 border-red-300 p-2 placeholder:text-[#C4C4C4] resize-y min-h-[120px] hover:border-blue-400 focus:border-blue-500 transition-colors"
              rows={4}
              maxLength={MAX_DESCRIPTION_LENGTH}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {description.length} / {MAX_DESCRIPTION_LENGTH} characters
              </span>
              {description.length > MAX_DESCRIPTION_LENGTH * 0.8 && (
                <span className="text-xs text-orange-500">
                  {description.length > MAX_DESCRIPTION_LENGTH * 0.95 ? 'Almost at limit' : 'Getting long'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Event Image */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <h3 className="text-lg font-semibold">Event Image</h3>
          </div>
          <p className="text-white mb-4">Upload a compelling image that represents your event</p>
          <p className="text-white text-xs mb-4">Recommended size: 1920x1080px</p>
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Image upload will be handled by parent component */}
          </div>
        </div>
      </div>
    </div>
  );
};
