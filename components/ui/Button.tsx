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

export interface ButtonProps
  extends VariantProps<typeof buttonVariants> {
  className?: string;
  asChild?: boolean;
  href?: string;
  children?: React.ReactNode;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler;
  [key: string]: any; // Allow other props to pass through
}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant, size, asChild = false, href, target, rel, onClick, ...props }, ref) => {
    const baseClassName = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return <Slot className={baseClassName} {...props} />;
    }

    if (href) {
      // Handle links
      if (href.startsWith('/')) {
        // Internal link
        return (
          <Link
            href={href}
            className={baseClassName}
            onClick={onClick}
            {...props}
          >
            {props.children}
          </Link>
        );
      } else {
        // External link - set default values, but allow overrides from props
        return (
          <a
            href={href}
            className={baseClassName}
            target={target || "_blank"}
            rel={rel || "noopener noreferrer"}
            onClick={onClick}
            {...props}
          >
            {props.children}
          </a>
        );
      }
    }

    // It's a button
    return (
      <button
        className={baseClassName}
        ref={ref as React.Ref<HTMLButtonElement>}
        type={props.type || "button"} // Default to 'button' type to avoid form submission
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
