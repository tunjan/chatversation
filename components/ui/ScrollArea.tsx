
import React from 'react';

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    className={`relative overflow-hidden ${className}`}
    {...props}
  >
    <div ref={ref} className="h-full w-full rounded-[inherit]" style={{ overflowY: 'auto' }}>
      {children}
    </div>
  </div>
));
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }