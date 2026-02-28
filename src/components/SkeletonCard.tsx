import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="group block w-full">
      <div className="aspect-[4/5] bg-zinc-200 animate-pulse rounded-[2.5rem] mb-8 border border-zinc-100 relative">
        <div className="absolute top-6 left-6 w-16 h-6 bg-zinc-300 rounded-full animate-pulse" />
        <div className="absolute top-6 right-6 w-12 h-6 bg-zinc-300 rounded-full animate-pulse" />
      </div>
      <div className="px-2 flex justify-between items-end">
        <div className="pb-1 w-full max-w-[60%]">
          <div className="w-full h-5 bg-zinc-200 rounded-md animate-pulse mb-2" />
          <div className="w-16 h-3 bg-zinc-200 rounded-md animate-pulse" />
        </div>
        <div className="flex flex-col items-end shrink-0 gap-2">
          <div className="w-10 h-3 bg-zinc-200 rounded-md animate-pulse" />
          <div className="w-16 h-8 bg-zinc-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
