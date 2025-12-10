import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			color: {
				primary: 'bg-fd-primary text-fd-primary-foreground shadow hover:bg-fd-primary/90',
				secondary: 'bg-fd-secondary text-fd-secondary-foreground shadow-sm hover:bg-fd-secondary/80',
				ghost: 'hover:bg-fd-accent hover:text-fd-accent-foreground',
				outline: 'border border-fd-input bg-fd-background shadow-sm hover:bg-fd-accent hover:text-fd-accent-foreground'
			},
			size: {
				sm: 'h-8 rounded-md px-3 text-xs',
				md: 'h-9 px-4 py-2',
				lg: 'h-10 rounded-md px-8',
				icon: 'h-9 w-9'
			}
		},
		defaultVariants: {
			color: 'primary',
			size: 'md'
		}
	}
);

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
	asChild?: boolean;
	color?: VariantProps<typeof buttonVariants>['color'];
	size?: VariantProps<typeof buttonVariants>['size'];
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, color, size, ...props }, ref) => {
	return <button className={cn(buttonVariants({ color, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
