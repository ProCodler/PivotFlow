// Placeholder for shadcn/ui Skeleton
// `npx shadcn-ui@latest add skeleton`
import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-purple-700/40", // Morphy skeleton base
          "shadow-[0_0_15px_rgba(128,0,128,0.3)]", // Subtle purple glow for skeleton
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

// Astronaut Skeleton for more thematic loading
const AstronautSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6 rounded-xl bg-purple-800/30 animate-pulse", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-user-astronaut text-cyan-400/70 mb-3 opacity-60"
      >
        <path d="M12 12c-1.657 0-3 2.239-3 5s1.343 5 3 5 3-2.239 3-5-1.343-5-3-5Z"/>
        <path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 2.074.836 3.943 2.195 5.25A3.495 3.495 0 0 1 9.5 17.5a3.5 3.5 0 0 1-3.5-3.5V10"/>
        <path d="M18 14v-4a3.5 3.5 0 0 0-3.5-3.5A3.495 3.495 0 0 0 12.305 9.25c1.359-1.307 2.195-3.176 2.195-5.25A7.5 7.5 0 0 0 12 2"/>
        <path d="M12 12a2.5 2.5 0 0 1 2.5 2.5V17a2.5 2.5 0 0 1-5 0v-2.5A2.5 2.5 0 0 1 12 12Z"/>
        <path d="M12 2v4"/>
        <path d="m18.5 4.5-2 2.5"/>
        <path d="m5.5 4.5 2 2.5"/>
      </svg>
      <Skeleton className="h-4 w-3/4 mb-2 rounded-md" />
      <Skeleton className="h-3 w-1/2 rounded-md" />
    </div>
  );
};


export { Skeleton, AstronautSkeleton };
