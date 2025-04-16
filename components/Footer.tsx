import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react'; // Import Lucide icons

// Define types for links
interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink extends FooterLink {
  icon: React.ElementType; // Use React Component type for icons
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks: FooterLink[] = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'How it Works', href: '/how-it-works' },
  ];

  const socialLinks: SocialLink[] = [
    { label: 'Facebook', href: '#', icon: Facebook }, // Use imported icons
    { label: 'Instagram', href: '#', icon: Instagram },
    { label: 'Twitter', href: '#', icon: Twitter }, // Use X/Twitter icon
  ];

  return (
    <footer className="border-t border-border/20 bg-background"> {/* Lighter border */}
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12">
          {/* Column 1: Logo & Description (Larger on wider screens) */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="mb-4 inline-block" aria-label="Singlespine Home">
              <span className="text-2xl font-bold text-primary">Singlespine</span>
            </Link>
            <p className="text-sm text-foreground/70">
              Bridging the gap between diaspora and their families through thoughtful gifting.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="mb-4 font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/gifts" className="text-sm text-foreground/70 transition-colors hover:text-primary">
                  Browse Gifts
                </Link>
              </li>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/70 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="mb-4 font-semibold text-foreground">Connect With Us</h4>
            {/* Contact Info (Optional) */}
            {/* <p className="mb-4 text-sm text-foreground/70">support@singlespine.com</p> */}

            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon; // Assign component to variable
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="text-foreground/60 transition-colors hover:text-primary"
                    >
                      <Icon className="size-5" /> {/* Render icon component */}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-8 border-t border-border/20 pt-6 text-center text-xs text-foreground/60 md:mt-12 md:pt-8">
          © {currentYear} Singlespine. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
