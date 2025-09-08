import React, { createContext, useContext, useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

interface SheetContextProps {
  onOpenChange: (open: boolean) => void;
  titleId: string;
}

const SheetContext = createContext<SheetContextProps | undefined>(undefined);

const useSheetContext = () => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within a Sheet');
  }
  return context;
};

const Sheet: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }> = ({ open, onOpenChange, children }) => {
  const titleId = useId();

  if (!open) return null;
  
  return (
    <SheetContext.Provider value={{ onOpenChange, titleId }}>
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-background/80"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          {children}
        </div>
    </SheetContext.Provider>
  );
};

const SheetContent: React.FC<{ className?: string; side?: 'left' | 'right'; children: React.ReactNode }> = ({ className, side = 'right', children }) => {
  const { onOpenChange, titleId } = useSheetContext();
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenChange]);

  // Focus trapping
  useEffect(() => {
    if (contentRef.current) {
        const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const trapFocus = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };
        
        firstElement?.focus();
        contentRef.current.addEventListener('keydown', trapFocus);
        
        return () => {
          contentRef.current?.removeEventListener('keydown', trapFocus);
        }
    }
  }, []);


  const sideClasses = {
    left: 'inset-y-0 left-0 h-full w-3/4 border-r',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l',
  };

  return (
    <div
      ref={contentRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.stopPropagation()}
      className={`fixed z-50 gap-4 bg-card border-border p-6 shadow-lg motion-safe:transition motion-safe:ease-in-out motion-safe:duration-300 ${sideClasses[side]} ${className}`}
    >
      {children}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute right-4 top-4 rounded-full p-2 opacity-70 ring-offset-background motion-safe:transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-foreground"
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
};

const SheetHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>
    {children}
  </div>
);

const SheetTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  const { titleId } = useSheetContext();
  return (
    <h2 id={titleId} className={`text-lg font-semibold text-foreground ${className}`}>
      {children}
    </h2>
  );
};

const SheetDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

const SheetFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>
    {children}
  </div>
);

export { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };