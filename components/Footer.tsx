import Link from 'next/link';
import Image from 'next/image'; // If using a logo in footer

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Example Footer Links
  const footerLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact Us', href: '/contact' },
  ];

  // Example Social Links (replace # with actual URLs)
  const socialLinks = [
    { label: 'Facebook', href: '#', icon: '/icons/facebook.svg' }, // Example
    { label: 'Instagram', href: '#', icon: '/icons/instagram.svg' },
    { label: 'Twitter', href: '#', icon: '/icons/twitter.svg' },
  ];

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Logo & Description */}
          <div>
            <Link href="/" className="inline-block mb-3">
              {/* Option 1: Text Logo */}
              <span className="text-xl font-bold text-primary">Singlespine</span>
              {/* Option 2: Image Logo (if you have a footer version) */}
              {/* <Image src="/singlespine_logo_footer.png" alt="Singlespine" width={100} height={30} /> */}
            </Link>
            <p className="text-sm text-foreground/70 max-w-xs">
              Bridging the gap between diaspora and their families through thoughtful gifting.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/gifts" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Browse Gifts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact / Social */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Connect</h4>
            {/* Add Contact Info if needed */}
            {/* <p className="text-sm text-foreground/70 mb-3">support@singlespine.com</p> */}

            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    {/* Use an Icon component or <Image> here */}
                    {/* <Image src={social.icon} alt={social.label} width={20} height={20} /> */}
                    <span className="sr-only">{social.label}</span> {/* Keep for accessibility */}
                    {/* Placeholder text if no icons yet */}
                    <span className="text-xs">{social.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="border-t border-border/40 pt-6 text-center text-sm text-foreground/60">
          © {currentYear} Singlespine. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
