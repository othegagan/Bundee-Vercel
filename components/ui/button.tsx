'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';
import { ImSpinner2 } from 'react-icons/im';

const buttonVariants = cva(
    'inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer active:scale-95',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
                outline: 'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                black: 'bg-black text-white shadow-sm hover:bg-black/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black ring-offset-2',
                green: 'bg-green-500 text-white shadow-sm hover:bg-green-500/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                success:
                    'bg-green-500 text-white disabled:pointer-events-none disabled:opacity-90 hover:bg-green-500/80 dark:bg-green-700 dark:hover:bg-green-600',
                yellow: 'bg-yellow-400 text-black shadow-sm hover:bg-yellow-500'
            },
            size: {
                default: 'h-9 px-4 py-2',
                xs: 'h-6 px-2 py-1 text-[10px]',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-10 rounded-md px-8',
                icon: 'h-9 w-9'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    loadingText?: string;
    tooltip?: string | null;
    loadingPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, type = 'button', variant, size, asChild = false, loading, loadingText, tooltip, loadingPosition = 'left', children, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        const renderContent = () => {
            if (loading) {
                return (
                    <>
                        {loadingPosition === 'left' && <ImSpinner2 className={cn('size-5 animate-spin', children && 'mr-2')} />}
                        {loadingText ? loadingText : children}
                        {loadingPosition === 'right' && <ImSpinner2 className={cn('size-5 animate-spin', children && 'ml-2')} />}
                    </>
                );
            }
            return children;
        };

        if (tooltip) {
            return (
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Comp className={cn(buttonVariants({ variant, size, className }))} disabled={loading} ref={ref} {...props}>
                                <>
                                    {loading && (
                                        <>
                                            <ImSpinner2 className={cn('size-5 animate-spin', children && 'mr-2')} /> {loadingText ? loadingText : children}
                                        </>
                                    )}
                                    {!loading && children}
                                </>
                            </Comp>
                        </TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return (
            <Comp className={cn(buttonVariants({ variant, size, className }))} disabled={loading} ref={ref} {...props}>
                {renderContent()}
            </Comp>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
