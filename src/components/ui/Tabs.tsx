// Placeholder for shadcn/ui Tabs
// `npx shadcn-ui@latest add tabs`
import React, { forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react';
import * * as TabsPrimitives from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitives.Root;

const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitives.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitives.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitives.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-xl bg-purple-800/50 p-1 text-gray-300 border border-purple-700/60", // Morphy base
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitives.List.displayName;

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitives.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitives.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitives.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-slate-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md", // Morphy active state
      "hover:bg-purple-700/40", // Morphy hover state
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitives.Trigger.displayName;

const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitives.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitives.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitives.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1",
      "bg-transparent p-4 rounded-lg", // Morphy content area
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitives.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
