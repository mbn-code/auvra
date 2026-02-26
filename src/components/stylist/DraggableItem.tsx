"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function DraggableItem({ item, children }: { item: any, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `draggable-${item.id}`,
    data: item
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.5 : undefined
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing h-full">
      {children}
    </div>
  );
}
