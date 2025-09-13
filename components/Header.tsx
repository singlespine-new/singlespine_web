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
import { UIIcon } from '@/components/ui/icon';
interface IconAdapterProps extends React.SVGProps<SVGSVGElement> { size?: number }
const Menu: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => <UIIcon name="more" size={size} {...rest} />
const ShoppingBag: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => <UIIcon name="shopping-bag" size={size} {...rest} />
const Heart: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => <UIIcon name="heart" size={size} {...rest} />
const User: React.FC<IconAdapterProps> = ({ size = 18, ...rest }) => <UIIcon name="user" size={size} {...rest} />
const LogOut: React.FC<IconAdapterProps> = ({ size = 18, ...rest }) => <UIIcon name="logout" size={size} {...rest} />
const Package: React.FC<IconAdapterProps> = ({ size = 18, ...rest }) => <UIIcon name="package" size={size} {...rest} />
const Settings: React.FC<IconAdapterProps> = ({ size = 18, ...rest }) => <UIIcon name="settings" size={size} {...rest} />
import { cn } from '@/lib/utils'; // Import cn utility
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useAuth } from '@/lib/auth-utils';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname(); // Get current pathname
  const { openCart, getTotalItems } = useCartStore();
  const { openWishlist, getTotalItems: getWishlistTotal } = useWishlistStore();
  const { isAuthenticated, user, isLoading } = useAuth();
  const cartItemsCount = getTotalItems();
  const wishlistItemsCount = getWishlistTotal();

  const navLinks = isAuthenticated
    ? [
      { label: 'Home', href: '/products' },
      { label: 'How it Works', href: '/how-it-works' },
    ]
    : [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'How it Works', href: '/how-it-works' },
    ];

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href={isAuthenticated ? "/products" : "/"} className="flex shrink-0 items-center gap-2" aria-label="Singlespine Home">
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
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative cursor-pointer"
            onClick={openWishlist}
          >
            <Heart className="h-5 w-5" />
            {wishlistItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
              </span>
            )}
          </Button>

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative cursor-pointer"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
          </Button>

          {/* Authentication Section */}
          {isLoading ? (
            <div className="animate-pulse bg-muted rounded h-8 w-20"></div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user?.name || 'User Avatar'}
                      width={32}
                      height={32}
                      className="w-full h-full rounded-full object-cover cursor-pointer"

                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || user?.phoneNumber || 'Account'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="secondary" size="sm" asChild className='font-semibold'>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" asChild className='font-semibold'>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
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
                  <Link href={isAuthenticated ? "/products" : "/"} className="mb-2 inline-block" aria-label="Singlespine Home" onClick={() => setIsOpen(false)}>
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
                {/* Mobile Cart & Wishlist */}
                <div className="flex gap-3 mb-3">
                  <Button variant="outline" size="sm" className="flex-1 relative" onClick={openCart}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Cart
                    {cartItemsCount > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 relative"
                    onClick={openWishlist}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                    {wishlistItemsCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Mobile Authentication */}
                {isLoading ? (
                  <div className="animate-pulse bg-muted rounded h-10 w-full"></div>
                ) : isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || user?.phoneNumber || 'Account'}
                      </p>
                    </div>
                    <SheetClose asChild>
                      <Button variant="outline" asChild className='w-full' onClick={() => setIsOpen(false)}>
                        <Link href="/orders">
                          <Package className="h-4 w-4 mr-2" />
                          My Orders
                        </Link>
                      </Button>
                    </SheetClose>
                    <Button variant="secondary" onClick={handleSignOut} className='w-full font-semibold'>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="secondary" asChild className='w-full font-semibold' onClick={() => setIsOpen(false)}>
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button variant="default" asChild className='w-full font-semibold' onClick={() => setIsOpen(false)}>
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;
