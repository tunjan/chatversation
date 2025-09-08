
import React, { createContext, useContext, useState, useRef, useEffect, useId, Children, cloneElement } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string;
  onValueChange?: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  listboxRef: React.RefObject<HTMLDivElement>;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  highlightedIndex: number;
  // FIX: Provide a more specific type for the element's props to allow accessing `children`.
  options: { value: string, element: React.ReactElement<{ children: React.ReactNode }> }[];
  listboxId: string;
}

const SelectContext = createContext<SelectContextProps | undefined>(undefined);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('useSelect must be used within a Select component');
  return context;
};

const Select: React.FC<{ value: string; onValueChange: (value: string) => void; children: React.ReactNode }> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const options = Children.toArray(children)
    .filter((child: any) => child.type?.displayName === 'SelectContent')
    .flatMap((contentChild: any) => Children.toArray(contentChild.props.children))
    .map((child: any) => ({ value: child.props.value, element: child }));

  useEffect(() => {
    if (isOpen) {
      const selectedIndex = options.findIndex(opt => opt.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, value, options.length]);

  return (
    <SelectContext.Provider value={{ isOpen, setIsOpen, selectedValue: value, onValueChange, triggerRef, listboxRef, highlightedIndex, setHighlightedIndex, options, listboxId }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger: React.FC<{ id?: string; className?: string; children: React.ReactNode; disabled?: boolean; }> = ({ id, className, children, disabled }) => {
  const { isOpen, setIsOpen, triggerRef, listboxRef, highlightedIndex, setHighlightedIndex, options, listboxId, onValueChange, selectedValue } = useSelect();
  // FIX: Type the element more specifically to ensure `cloneElement` knows about the `selectedValue` prop.
  const selectValueChild = Children.toArray(children).find((child: any) => child.type?.displayName === 'SelectValue') as React.ReactElement<{ placeholder?: string; selectedValue?: string }> | undefined;
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <button
      id={id}
      ref={triggerRef}
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="combobox"
      aria-controls={listboxId}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {selectValueChild ? cloneElement(selectValueChild, { selectedValue }) : children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

const SelectValue: React.FC<{ placeholder?: string; selectedValue?: string }> = ({ placeholder, selectedValue }) => {
  const { options } = useSelect();
  const selectedOption = options.find(opt => opt.value === selectedValue);
  const displayValue = selectedOption ? selectedOption.element.props.children : placeholder;
  return <span>{displayValue}</span>;
};
SelectValue.displayName = 'SelectValue';


const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, setIsOpen, listboxRef, triggerRef, setHighlightedIndex, options, onValueChange, listboxId, highlightedIndex } = useSelect();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        listboxRef.current && !listboxRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const highlightedItem = listboxRef.current.querySelector<HTMLElement>(`[data-index="${highlightedIndex}"]`);
      highlightedItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
     e.preventDefault();
     switch (e.key) {
        case 'ArrowDown':
          setHighlightedIndex(prev => (prev + 1) % options.length);
          break;
        case 'ArrowUp':
          setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
          break;
        case 'Enter':
        case ' ':
          if(highlightedIndex > -1 && onValueChange) {
            onValueChange(options[highlightedIndex].value);
          }
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'Escape':
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
     }
  };


  if (!isOpen) return null;

  return (
    <div 
      ref={listboxRef}
      onKeyDown={handleKeyDown}
      className="absolute z-50 w-full mt-1 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
    >
      <div id={listboxId} role="listbox" tabIndex={-1} className="p-1 focus:outline-none">
        {Children.map(children, (child: any, index) => cloneElement(child, { index }))}
      </div>
    </div>
  );
};
{/* FIX: Set displayName on SelectContent, not SelectItem which was not yet defined. */}
SelectContent.displayName = 'SelectContent';

const SelectItem: React.FC<{ value: string; children: React.ReactNode; index?: number }> = ({ value, children, index = -1 }) => {
  const { onValueChange, setIsOpen, triggerRef, setHighlightedIndex, highlightedIndex, selectedValue } = useSelect();
  const isHighlighted = index === highlightedIndex;
  const isSelected = value === selectedValue;
  const itemId = useId();

  return (
    <div
      id={itemId}
      onClick={() => {
        if(onValueChange) onValueChange(value);
        setIsOpen(false);
        triggerRef.current?.focus();
      }}
      onMouseEnter={() => setHighlightedIndex(index)}
      role="option"
      aria-selected={isSelected}
      data-index={index}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent ${isHighlighted ? 'bg-accent' : ''} ${isSelected ? 'font-semibold' : ''}`}
    >
      {children}
    </div>
  );
};
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
