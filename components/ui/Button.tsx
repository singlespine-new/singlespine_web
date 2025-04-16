import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-secondary text-primary hover:bg-secondary/80",
        outline: "border border-primary bg-transparent text-primary hover:bg-primary/5",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-md px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// Combine potential attributes for both button and anchor for the props interface
// This isn't perfectly type-safe but resolves the immediate conflict for spreading.
// A more robust solution involves conditional types or component composition patterns.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  React.AnchorHTMLAttributes<HTMLAnchorElement>, // Add Anchor attributes
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string; // href is already part of AnchorHTMLAttributes
}

// Adjust the ref type to be more general or use 'any' for now
const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant, size, asChild = false, href, ...props }, ref) => {
    // Determine the component type
    const isLink = typeof href === 'string';
    const Comp = asChild ? Slot : isLink ? "a" : "button";

    // Prepare common props
    const commonProps = {
      className: cn(buttonVariants({ variant, size, className })),
      ref: ref, // Pass the ref directly
      ...props, // Spread remaining props (now includes anchor/button attributes)
    };

    if (asChild) {
      return <Slot {...commonProps} />;
    }

    if (isLink) {
      // If it's an internal link, wrap with NextLink
      if (href.startsWith('/')) {
        // Important: When using legacyBehavior with an 'a' tag inside,
        // pass props like className, ref, etc., to the 'a' tag, not the Link itself.
        return (
          <Link href={href} passHref legacyBehavior>
            <a {...commonProps} />
          </Link>
        );
      } else {
        // External link, render a simple 'a' tag
        return <a href={href} {...commonProps} />;
      }
    }

    // It's a button
    // Cast props specifically to ButtonHTMLAttributes if needed, though spreading might work now
    return <button {...commonProps as React.ButtonHTMLAttributes<HTMLButtonElement>} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
