'use client'; // Required for state and Sheet component

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname hook
import { Button } from '@/components/ui/Button'; // Corrected import path
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Corrected import path
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn utility

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname(); // Get current pathname

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Gifts', href: '/gifts' },
    { label: 'How it Works', href: '/how-it-works' },
    // { label: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Singlespine Home">
          <Image
            src="/singlespine_logo.png" // Ensure this path is correct
            alt="Singlespine Logo"
            width={140}
            height={40}
            priority
            className="h-auto w-auto"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden flex-1 items-center justify-center md:flex md:gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              // Add active state styling for desktop too
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-foreground/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden shrink-0 items-center gap-2 sm:gap-3 md:flex">
          <Button variant="secondary" size="sm" asChild className='font-semibold'>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button variant="default" size="sm" asChild className='font-semibold'>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            {/* Increased padding, added flex-col, h-full */}
            <SheetContent side="left" className="flex h-full w-[300px] flex-col p-6 sm:w-[350px]">
              <SheetHeader className='mb-6 text-left'> {/* Added text-left */}
                <SheetTitle>
                  {/* Logo inside menu */}
                  <Link href="/" className="mb-2 inline-block" aria-label="Singlespine Home" onClick={() => setIsOpen(false)}>
                    <Image
                      src="/singlespine_logo.png"
                      alt="Singlespine Logo"
                      width={120} // Smaller logo inside sheet
                      height={35}
                      className="h-auto w-auto"
                    />
                  </Link>
                </SheetTitle>
                {/* Default close button is built into SheetContent */}
              </SheetHeader>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-1"> {/* Reduced space-y */}
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-md px-3 py-2 text-base font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground" // Active state style
                            : "text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground" // Normal & hover
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              {/* Mobile Action Buttons - Pushed to bottom */}
              <div className="mt-auto flex flex-col space-y-3 border-t border-border/20 pt-6"> {/* Added border-t */}
                <Button variant="secondary" asChild className='w-full font-semibold' onClick={() => setIsOpen(false)}>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button variant="default" asChild className='w-full font-semibold' onClick={() => setIsOpen(false)}>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;
