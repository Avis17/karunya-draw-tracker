import React from 'react';
import { Clock } from 'lucide-react';

interface TimeSlotProps {
  time: string;
  result: string | null;
  isActive: boolean;
  onClick: () => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ time, result, isActive, onClick }) => {
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      onClick={onClick}
      className={`time-slot ${isActive ? 'time-slot-active' : 'time-slot-inactive'}`}
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-5 h-5" />
        <span className="font-bold">{formatTime(time)}</span>
      </div>
      
      <div className="bg-white/20 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
        {result ? (
          <div className="result-number text-primary-foreground">
            {result}
          </div>
        ) : (
          <div className="text-6xl font-bold">---</div>
        )}
      </div>
    </div>
  );
};

export default TimeSlot;