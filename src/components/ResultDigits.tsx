import React from 'react';

interface ResultDigitsProps {
  result: string | null;
  showPending?: boolean;
}

const ResultDigits: React.FC<ResultDigitsProps> = ({ result, showPending = true }) => {
  if (!result) {
    return (
      <div className="flex gap-2 justify-center">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="w-12 h-12 md:w-16 md:h-16 bg-gradient-subtle border-2 border-accent/30 rounded-lg flex items-center justify-center"
          >
            {showPending ? (
              <span className="text-lg md:text-xl text-foreground/60 font-bold">
                -
              </span>
            ) : (
              <div className="w-2 h-2 bg-foreground/30 rounded-full animate-pulse"></div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Ensure result is exactly 5 digits
  const digits = result.padStart(6, '0').split('').slice(0, 6);

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, index) => (
        <div
          key={index}
          className="w-12 h-12 md:w-16 md:h-16 bg-white/90 border-2 border-accent/40 rounded-lg flex items-center justify-center shadow-lg"
        >
          <span className="text-xl md:text-2xl font-bold text-foreground">
            {digit}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ResultDigits;