// Placeholder for shadcn/ui AlertDialog
// `npx shadcn-ui@latest add alert-dialog`
// This is a highly simplified version. Real AlertDialog has more parts and accessibility features.
import React, { HTMLAttributes, forwardRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button'; // Using our placeholder Button

// Context to manage open state
const AlertDialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

const AlertDialog: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = forwardRef<HTMLButtonElement, ButtonProps>( // Use ButtonProps
  ({ children, onClick, ...props }, ref) => {
    const { onOpenChange } = React.useContext(AlertDialogContext);
    return (
      <Button
        ref={ref}
        onClick={(e) => {
          onOpenChange(true);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
AlertDialogTrigger.displayName = "AlertDialogTrigger";


const AlertDialogContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(AlertDialogContext);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
        <div
          ref={ref}
          className={cn(
            "relative m-4 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-purple-700/70 rounded-2xl shadow-2xl shadow-purple-500/30 p-6 w-full max-w-md transform animate-scale-in",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
            className
          )}
          role="alertdialog"
          aria-modal="true"
          {...props}
        >
          {children}
          {/* Optional: Add a default close button if not handled by AlertDialogCancel/Action */}
           <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-gray-400 hover:text-gray-200" onClick={() => onOpenChange(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </Button>
        </div>
      </div>
    );
  }
);
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-2 text-center sm:text-left mb-4", className)} {...props} />
  )
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-gray-100", className)} {...props} />
  )
);
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-400", className)} {...props} />
  )
);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6", className)} {...props} />
  )
);
AlertDialogFooter.displayName = "AlertDialogFooter";


// Use our ButtonProps for AlertDialogAction and AlertDialogCancel
import { ButtonProps } from './Button';

const AlertDialogAction = forwardRef<HTMLButtonElement, ButtonProps>( // Use ButtonProps
  ({ onClick, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(AlertDialogContext);
    return (
      <Button
        ref={ref}
        onClick={(e) => {
          onClick?.(e);
          // Optionally close dialog on action, or let the consumer handle it
          // onOpenChange(false);
        }}
        variant="morphic" // Default to morphic for action
        {...props}
      >
        {children}
      </Button>
    );
  }
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = forwardRef<HTMLButtonElement, ButtonProps>( // Use ButtonProps
  ({ onClick, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(AlertDialogContext);
    return (
      <Button
        ref={ref}
        variant="outline" // Default to outline for cancel
        onClick={(e) => {
          onOpenChange(false);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
AlertDialogCancel.displayName = "AlertDialogCancel";


export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
