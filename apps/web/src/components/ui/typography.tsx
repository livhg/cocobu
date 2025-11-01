import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Mobile-optimized typography components
 * All text sizes meet minimum 16px for body text to prevent iOS zoom
 * Line heights optimized for mobile readability (1.5+)
 */

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function H1({ className, children, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-bold tracking-tight',
        'leading-tight', // 1.3 line height
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        'scroll-m-20 text-3xl font-semibold tracking-tight',
        'leading-snug', // 1.3 line height
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children, ...props }: TypographyProps) {
  return (
    <h3
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        'leading-snug', // 1.4 line height
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({ className, children, ...props }: TypographyProps) {
  return (
    <h4
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        'leading-normal', // 1.4 line height
        className
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

export function P({ className, children, ...props }: TypographyProps) {
  return (
    <p
      className={cn(
        'text-base leading-relaxed', // 16px with 1.5 line height
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Lead({ className, children, ...props }: TypographyProps) {
  return (
    <p
      className={cn(
        'text-lg leading-relaxed text-gray-700', // 18px with 1.5 line height
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Small({ className, children, ...props }: TypographyProps) {
  return (
    <small
      className={cn(
        'text-sm leading-relaxed text-gray-600', // 14px with 1.5 line height
        className
      )}
      {...props}
    >
      {children}
    </small>
  );
}

export function Muted({ className, children, ...props }: TypographyProps) {
  return (
    <p
      className={cn(
        'text-sm leading-relaxed text-gray-500', // 14px with 1.5 line height
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Code({ className, children, ...props }: TypographyProps) {
  return (
    <code
      className={cn(
        'relative rounded bg-gray-100 px-1.5 py-0.5',
        'font-mono text-sm', // 14px
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export function Blockquote({ className, children, ...props }: TypographyProps) {
  return (
    <blockquote
      className={cn(
        'border-l-4 border-gray-300 pl-4 italic',
        'text-base leading-relaxed text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function List({ className, children, ...props }: TypographyProps) {
  return (
    <ul
      className={cn(
        'ml-6 list-disc space-y-2',
        'text-base leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </ul>
  );
}

export function OrderedList({
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <ol
      className={cn(
        'ml-6 list-decimal space-y-2',
        'text-base leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </ol>
  );
}
