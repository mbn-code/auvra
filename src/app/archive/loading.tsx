import React from 'react';
import SkeletonCard from '@/components/SkeletonCard';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafafa] pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 border-b border-zinc-100 pb-20 mb-6">
        <div className="max-w-2xl w-full">
          <div className="w-32 h-4 bg-zinc-200 animate-pulse mb-6 rounded" />
          <div className="w-48 h-4 bg-zinc-200 animate-pulse mb-6 rounded" />
          <div className="w-3/4 h-24 bg-zinc-200 animate-pulse rounded-2xl" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
