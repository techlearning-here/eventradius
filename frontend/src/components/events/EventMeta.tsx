import React from 'react';

interface EventMetaProps {
  date: string;
  time: string;
  timezone?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

export const EventMeta: React.FC<EventMetaProps> = ({ date, time, timezone, contact }) => {
  return (
    <div className="flex flex-col items-start gap-[-1px] relative">
      <div className="flex items-start gap-[-1px] relative">
        <div className="flex justify-center items-center gap-2.5 relative bg-[#1A1A1A] px-2 h-[24px]">
          <time className="text-white text-[11px] font-normal uppercase relative">
            {date}
          </time>
        </div>
        <div className="flex justify-center items-center gap-2.5 border relative px-2 h-[24px] border-solid border-[#1A1A1A]">
          <time className="text-[#1A1A1A] text-[11px] font-normal uppercase relative">
            {time}
          </time>
        </div>
        {timezone && (
          <div className="flex justify-center items-center gap-2.5 border relative px-2 h-[24px] border-solid border-[#1A1A1A]">
            <span className="text-[#1A1A1A] text-[11px] font-normal uppercase relative">
              {timezone}
            </span>
          </div>
        )}
      </div>
      {contact && (
        <div className="flex flex-col items-start gap-2 mt-4">
          <h3 className="text-white text-[11px] font-normal uppercase mb-2">CONTACT</h3>
          {contact.email && (
            <div className="flex items-center gap-2">
              <span className="text-white text-[11px]">EMAIL:</span>
              <a href={`mailto:${contact.email}`} className="text-white text-[11px] hover:opacity-70 transition-opacity">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2">
              <span className="text-white text-[11px]">PHONE:</span>
              <a href={`tel:${contact.phone}`} className="text-white text-[11px] hover:opacity-70 transition-opacity">
                {contact.phone}
              </a>
            </div>
          )}
          {contact.website && (
            <div className="flex items-center gap-2">
              <span className="text-white text-[11px]">WEBSITE:</span>
              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-white text-[11px] hover:opacity-70 transition-opacity">
                {contact.website}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
