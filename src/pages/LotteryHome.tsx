import React, { useState } from 'react';
import LotteryHeader from '@/components/LotteryHeader';
import TimeSlot from '@/components/TimeSlot';
import { useLotteryResults } from '@/hooks/useLotteryResults';

interface LotteryHomeProps {
  onViewResults: () => void;
  onAdminLogin: () => void;
}

const TIME_SLOTS = [
  '10:20',
  '12:20', 
  '14:20',
  '16:20',
  '18:20'
];

const LotteryHome: React.FC<LotteryHomeProps> = ({ onViewResults, onAdminLogin }) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const today = new Date();
  const { getResultForTime, isTimeSlotActive } = useLotteryResults(today);

  const currentDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleSlotClick = (time: string) => {
    if (isTimeSlotActive(time)) {
      setSelectedSlot(selectedSlot === time ? null : time);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <LotteryHeader
          onViewResults={onViewResults}
          onAdminLogin={onAdminLogin}
          currentDate={currentDate}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {TIME_SLOTS.map((time) => {
            const isActive = isTimeSlotActive(time);
            const result = isActive ? getResultForTime(time) : null;
            
            return (
              <TimeSlot
                key={time}
                time={time}
                result={result}
                isActive={isActive}
                onClick={() => handleSlotClick(time)}
              />
            );
          })}
        </div>

        {selectedSlot && isTimeSlotActive(selectedSlot) && (
          <div className="lottery-card p-6 mt-8">
            <h3 className="text-2xl font-bold text-center mb-4">
              Result Details - {selectedSlot}
            </h3>
            <div className="text-center">
              <div className="result-number text-primary mb-2">
                {getResultForTime(selectedSlot) || 'Result Pending'}
              </div>
              <p className="text-muted-foreground">
                Draw Date: {currentDate}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LotteryHome;