import React, { useState, useMemo } from 'react';
import LotteryHeader from '@/components/LotteryHeader';
import TimeSlot from '@/components/TimeSlot';
import ResultDigits from '@/components/ResultDigits';
import { useLotteryResults } from '@/hooks/useLotteryResults';
import keralaArtLogo from '@/assets/kerala-art-logo.png';

interface LotteryHomeProps {
  onViewResults: () => void;
  onAdminLogin: () => void;
}

const TIME_SLOTS = [
  '10:20',
  '12:20', 
  '16:20',
  '18:20',
  '20:20'
];

const LotteryHome: React.FC<LotteryHomeProps> = ({ onViewResults, onAdminLogin }) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // Memoize dates to prevent infinite re-renders
  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }, []);
  
  const { getResultForTime, isTimeSlotActive, shouldShowResult } = useLotteryResults(today);
  const { 
    getResultForTime: getYesterdayResultForTime,
    results: yesterdayResults 
  } = useLotteryResults(yesterday);

  const currentDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const yesterdayDate = yesterday.toLocaleDateString('en-IN', {
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

        <div className="flex items-start gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {TIME_SLOTS.map((time) => {
                const isActive = isTimeSlotActive(time);
                const result = shouldShowResult(time) ? getResultForTime(time) : null;
                const displayResult = isActive && !result ? '******' : result;
                
                return (
                  <TimeSlot
                    key={time}
                    time={time}
                    result={displayResult}
                    isActive={isActive}
                    onClick={() => handleSlotClick(time)}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Kerala Art Logo */}
          <div className="hidden lg:block">
            <div className="lottery-card p-4">
              <img 
                src={keralaArtLogo} 
                alt="Kerala Traditional Art" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>
        </div>

        {selectedSlot && isTimeSlotActive(selectedSlot) && (
          <div className="lottery-card p-6 mt-8">
            <h3 className="text-2xl font-bold text-center mb-4">
              Result Details - {selectedSlot}
            </h3>
            <div className="text-center">
              <ResultDigits 
                result={getResultForTime(selectedSlot)} 
                showPending={true}
              />
              <p className="text-muted-foreground mt-4">
                Draw Date: {currentDate}
              </p>
            </div>
          </div>
        )}

        {/* Previous Day Results - Always Show */}
        <div className="mt-12">
          <div className="lottery-card p-6 mb-6">
            <h2 className="text-3xl font-bold text-center text-primary-contrast mb-2">
              Previous Day Results
            </h2>
            <p className="text-center text-muted-foreground text-lg">
              {yesterdayDate}
            </p>
          </div>

          <div className="space-y-8">
            {TIME_SLOTS.map((time) => {
              const result = getYesterdayResultForTime(time);
              const formatTime = (timeStr: string) => {
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
              };
              
              return (
                <div key={`yesterday-${time}`} className="lottery-card p-6">
                  <h3 className="text-xl font-bold text-center mb-4 text-primary">
                    Result for {formatTime(time)}:
                  </h3>
                  <ResultDigits result={result} showPending={false} />
                  {!result && (
                    <p className="text-center text-muted-foreground mt-3 text-sm">
                      Result not available for this time slot
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryHome;