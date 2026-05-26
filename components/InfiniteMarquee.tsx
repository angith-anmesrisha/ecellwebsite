import React from 'react';

export default function InfiniteMarquee() {
  const items = ["15+ EVENTS", "20+ SPEAKERS", "3000+ FOOTFALL", "BIMTECH PGDM"];
  
  return (
    <div className="w-full overflow-hidden bg-white/5 backdrop-blur-sm border-y border-white/10 py-4 flex whitespace-nowrap">
      <div className="flex animate-marquee min-w-full">
        {items.concat(items).map((text, i) => (
          <div key={i} className="flex items-center mx-8 text-white/70 font-semibold tracking-wider">
            <span>{text}</span>
            <span className="mx-8 text-blue-500">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}