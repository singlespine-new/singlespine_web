import Image from "next/image";
import { Button } from "@/components/ui/Button"; // Corrected import path
import { SearchBar } from "@/components/ui/SearchBar";
import { MapPin } from "lucide-react"; // Import from lucide-react
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative w-full">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/hero_bg.png"
            alt="Family receiving a gift package in Ghana"
            fill
            priority
            quality={100}
            // Apply object-right by default (mobile), then object-center from 'md' breakpoint up
            // height={'300'}
            className="object-cover object-right md:object-center"
            sizes="100vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/5" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center text-white sm:min-h-[70vh] md:py-20 lg:min-h-[75vh]">
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:leading-snug">
            One Spine, One Love
          </h1>
          <p className="mb-8 max-w-3xl text-xl text-white/90 sm:text-2xl md:text-4xl">
            Stay connected, place an order for loved ones back home today!
          </p>

          {/* Search Bar */}
          <div className="mb-10 w-full max-w-2xl">
            <SearchBar
              placeholder="Enter their address and area to see what's nearby..."
              variant="default"
              size="lg"
              containerClassName="shadow-lg bg-white/90 dark:bg-background/80 backdrop-blur-sm border border-transparent focus-within:border-primary/50"
              className="text-foreground placeholder:text-foreground/60"
              icon={<MapPin className="text-primary" size={20} />}
            />
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild className="font-semibold">
              <Link href="/gifts">Browse Gifts</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/80 bg-black/20 text-white hover:bg-white/10 hover:border-white font-semibold" asChild>
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Secondary Content Section (remains the same) */}
      {/* <section className="bg-background py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block rounded-full bg-secondary/50 px-5 py-1 text-sm font-medium text-primary mb-6">
            Coming Soon
          </div>
          <h2 className="mb-4 text-2xl font-bold">GhanaPost GPS Integration</h2>
          <p className="mx-auto mb-8 max-w-2xl text-foreground/80">
            Soon, you&apos;ll be able to send gifts to precise locations using Ghana&apos;s digital addressing system.
            Exactly locate your loved ones and send thoughtful gifts directly to their door.
          </p>
          <div className="inline-flex items-center justify-center rounded-full bg-secondary px-3 py-1">
            <code className="font-mono text-sm font-medium text-primary">GH-GPS</code>
          </div>
        </div>
      </section> */}
    </>
  );
}
