

import React, { useEffect, useRef, createContext, useContext, useId } from 'react';
import { X } from 'lucide-react';

interface DialogContextProps {
  titleId: string;
}

const DialogContext = createContext<DialogContextProps | null>(null);

const Dialog: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }> = ({ open, onOpenChange, children }) => {
  const titleId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);
  
  // Focus trapping
  useEffect(() => {
    if (open && contentRef.current) {
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
  }, [open]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ titleId }}>
        <div 
          className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center"
          onClick={() => onOpenChange(false)}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child) && (child.type as any).displayName === 'DialogContent') {
                    return React.cloneElement(child as React.ReactElement<any>, { ref: contentRef });
                }
                return child;
            })}
        </div>
    </DialogContext.Provider>
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
    ({ className, children }, ref) => {
    const context = useContext(DialogContext);
    
    return (
        <div
            ref={ref}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-50 grid w-full max-w-lg gap-4 border border-border bg-card p-6 shadow-lg motion-safe:duration-200 rounded-lg ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={context?.titleId}
        >
            {children}
        </div>
    );
});
DialogContent.displayName = 'DialogContent';


const DialogHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>
    {children}
  </div>
);

const DialogTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
    const context = useContext(DialogContext);
    return (
      <h2 id={context?.titleId} className={`text-lg font-semibold leading-none tracking-tight text-foreground ${className}`}>
        {children}
      </h2>
    );
};

const DialogDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };