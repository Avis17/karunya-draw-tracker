import React, { useState } from 'react';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useLotteryResults } from '@/hooks/useLotteryResults';
import TimeSlot from '@/components/TimeSlot';

interface ResultsHistoryProps {
  onBack: () => void;
}

const TIME_SLOTS = [
  '10:20',
  '12:20', 
  '16:20',
  '18:20',
  '20:20'
];

const ResultsHistory: React.FC<ResultsHistoryProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { results, loading, getResultForTime, shouldShowResult } = useLotteryResults(selectedDate);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && date <= new Date()) {
      setSelectedDate(date);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="lottery-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={onBack}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Today's Results
            </Button>
            
            <h1 className="text-gradient-primary text-3xl md:text-4xl font-bold">
              Results History
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Select Date to View Results
              </h2>
              <p className="text-muted-foreground">
                You can only view past results, future dates are disabled
              </p>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {selectedDate && (
          <>
            <div className="lottery-card p-6 mb-6">
              <h3 className="text-2xl font-bold text-center mb-4">
                Results for {format(selectedDate, "EEEE, MMMM do, yyyy")}
              </h3>
            </div>

            {loading ? (
              <div className="lottery-card p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading results...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {TIME_SLOTS.map((time) => {
                  const result = shouldShowResult(time) ? getResultForTime(time) : null;
                  
                  return (
                    <TimeSlot
                      key={time}
                      time={time}
                      result={result}
                      isActive={true}
                      onClick={() => {}}
                    />
                  );
                })}
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="lottery-card p-8 text-center">
                <p className="text-muted-foreground text-lg">
                  No results found for {format(selectedDate, "MMMM do, yyyy")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsHistory;