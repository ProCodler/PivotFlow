// Placeholder for shadcn/ui Input
// `npx shadcn-ui@latest add input`
import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-gray-200 ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-200 focus:shadow-lg focus:shadow-cyan-500/30",
          "shadow-inner_md", // Custom inner shadow for depth
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
