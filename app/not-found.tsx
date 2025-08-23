'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import { Home, Search, Package, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  const handleSearch = (q: string) => {
    const query = typeof q === 'string' ? q.trim() : ''
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : '/products')
  }
  return (
    <div className="min-h-[75vh] bg-gradient-to-b from-white to-orange-50/30 dark:from-background dark:to-background/60">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
            404 · Page not found
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            We can’t find that page
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            The link might be broken or the page may have moved. Try searching or head back to products.
          </p>

          <div className="mt-8">
            <SearchBar
              placeholder="Search products or enter an address..."
              variant="default"
              size="lg"
              clearButton={false}
              onSearch={handleSearch}
              containerClassName="mx-auto max-w-xl bg-white/90 dark:bg-background/80 backdrop-blur border border-transparent focus-within:border-primary/40 shadow-sm"
              className="text-foreground placeholder:text-foreground/60"
              icon={<Search size={18} className="text-primary" />}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: Try searching for “rice”, “cooking oil”, or an area like “East Legon”.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="font-semibold w-full sm:w-auto">
              <Link href="/products" aria-label="Browse all products">
                <Package className="mr-2 h-5 w-5" />
                Browse Products
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-semibold w-full sm:w-auto">
              <Link href="/" aria-label="Go back to home">
                <Home className="mr-2 h-5 w-5" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-sm">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1 text-primary hover:underline"
              aria-label="Learn how Singlespine works"
            >
              Learn how it works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <Image
              src="/singlespine_logo.png"
              alt="Singlespine"
              width={120}
              height={32}
              className="h-auto w-auto opacity-90"
              priority
            />
            <span className="hidden sm:inline">•</span>
            <span className="max-w-[28ch] sm:max-w-none">
              Sending love back home made simple.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
