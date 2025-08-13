import React from 'react';
import { Calendar, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LotteryHeaderProps {
  onViewResults: () => void;
  onAdminLogin: () => void;
  currentDate: string;
}

const LotteryHeader: React.FC<LotteryHeaderProps> = ({ 
  onViewResults, 
  onAdminLogin, 
  currentDate 
}) => {
  return (
    <header className="lottery-card p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-primary-contrast text-4xl md:text-5xl font-bold mb-2">
            Sri Karunya Lottery
          </h1>
          <p className="text-muted-foreground text-lg">
            Today's Draw Results - {currentDate}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={onViewResults}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Past Results
          </Button>
          
          <Button
            onClick={onAdminLogin}
            variant="ghost"
            size="icon"
            className="opacity-30 hover:opacity-100 transition-opacity"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default LotteryHeader;