import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { ChevronDown } from 'lucide-react';

// Context for the main Accordion state (which item is open)
interface AccordionContextProps {
  openItem: string | null;
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextProps | undefined>(undefined);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
};

// Context to pass the item value from AccordionItem down to Trigger and Content
interface AccordionItemContextProps {
    value: string;
    triggerId: string;
    contentId: string;
}

const AccordionItemContext = createContext<AccordionItemContextProps | undefined>(undefined);

const Accordion: React.FC<{ type: 'single'; collapsible?: boolean; className?: string; children: React.ReactNode }> = ({ children, className }) => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = useCallback((value: string) => {
    setOpenItem((prev) => (prev === value ? null : value));
  }, []);

  return (
    <AccordionContext.Provider value={{ openItem, toggleItem }}>
      <div className={`border-t border-border ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

const AccordionItem: React.FC<{ value: string; className?: string; children: React.ReactNode }> = ({ value, className, children }) => {
  const triggerId = useId();
  const contentId = useId();
  return (
    <AccordionItemContext.Provider value={{value, triggerId, contentId}}>
        <div className={`border-b border-border ${className}`}>{children}</div>
    </AccordionItemContext.Provider>
  );
};

const AccordionTrigger: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  const { openItem, toggleItem } = useAccordion();
  const itemContext = useContext(AccordionItemContext);

  if (!itemContext) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  const { value, triggerId, contentId } = itemContext;
  const isOpen = openItem === value;

  return (
    <h3>
        <button
            id={triggerId}
            onClick={() => toggleItem(value)}
            aria-expanded={isOpen}
            aria-controls={contentId}
            className={`flex w-full flex-1 items-center justify-between py-4 font-medium motion-safe:transition-all hover:underline text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
        >
            {children}
            <ChevronDown className={`h-4 w-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
    </h3>
  );
};

const AccordionContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  const { openItem } = useAccordion();
  const itemContext = useContext(AccordionItemContext);

  if (!itemContext) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  const { value, triggerId, contentId } = itemContext;
  const isOpen = openItem === value;

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!isOpen}
      className={`overflow-hidden text-sm motion-safe:transition-all ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} ${className}`}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };