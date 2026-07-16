import React, { useState, useEffect } from 'react';

/** Home hero countdown — pure presentation (visual contract). */
export const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-3 md:gap-6 justify-center text-white/90">
      {[
        { value: timeLeft.days, label: 'GÜN' },
        { value: timeLeft.hours, label: 'SAAT' },
        { value: timeLeft.minutes, label: 'DK' },
        { value: timeLeft.seconds, label: 'SN' },
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="text-2xl md:text-4xl font-light tabular-nums tracking-tight bg-white/5 rounded-lg py-2 px-3 min-w-[3.5rem] md:min-w-[4.5rem] text-center backdrop-blur-sm border border-white/10 shadow-inner">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold tracking-widest opacity-60 mt-2 text-amber-500">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
