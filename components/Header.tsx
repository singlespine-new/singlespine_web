import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button'; // Import the reusable button

const Header = () => {
  // Placeholder for navigation links - replace with actual links/data
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Gifts', href: '/gifts' },
    { label: 'How it Works', href: '/how-it-works' },
    // { label: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/singlespine_logo.png" // Make sure this path is correct in your public folder
            alt="Singlespine Logo"
            width={160} // Adjust size as needed
            height={50} // Adjust size as needed
            priority // Load logo quickly
            className="h-auto" // Maintain aspect ratio
          />
          {/* Optional: Add text logo next to image if needed */}
          {/* <span className="font-bold text-lg hidden sm:inline-block">Singlespine</span> */}
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" href="/auth/signin" className='font-semibold'>
            Sign In
          </Button>
          <Button variant="primary" size="sm" href="/auth/signup" className='font-semibold'>
            Sign Up
          </Button>
          {/* Add Mobile Menu Button Here Later */}
          {/* <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="h-5 w-5" /> // Replace with actual icon
            <span className="sr-only">Toggle Menu</span>
          </Button> */}
        </div>
      </nav>
      {/* Mobile Menu Container (conditionally rendered) could go here */}
    </header>
  );
};

export default Header;
