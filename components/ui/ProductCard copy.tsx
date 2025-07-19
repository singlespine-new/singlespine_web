'use client'

import Image from "next/image"
import Link from "next/link"
import { Clock, Heart, Tag, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

// Enhanced Product interface for better data structure
export interface Product {
  id: string | number
  image: string
  name: string
  description: string
  price: number // Using number for price is better for calculations
  currency?: string
  deliveryTime: string // e.g., "30-40 min"
  tag: string
  slug: string // for URL path
  isNew?: boolean
  isFavorite?: boolean
}

interface ProductCardProps {
  product: Product
  className?: string
  onToggleFavorite?: (id: Product['id']) => void
}

// A more refined ProductCard component
const ProductCard = ({ product, className, onToggleFavorite }: ProductCardProps) => {
  const {
    id,
    name,
    description,
    image,
    price,
    currency = '€',
    deliveryTime,
    tag,
    slug,
    isFavorite,
  } = product

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // Prevent link navigation when clicking the button
    e.stopPropagation() // Stop event from bubbling up to the Link component
    onToggleFavorite?.(id)
  }

  return (
    <Link href={`/product/${slug}`} passHref>
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5",
          className
        )}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={image || '/placeholder-product.jpg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-102"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="secondary"
              size="icon"
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full shadow-md"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn(
                "h-4 w-4",
                isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )} />
            </Button>
          )}

          {/* Vendor Tag */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-white/80" />
              <span className="text-xs font-semibold text-white">{tag}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-1.5 font-semibold leading-snug text-foreground">
            {name}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2 h-[2.5em]">
            {description}
          </p>

          {/* Footer with Price and Delivery */}
          <div className="mt-auto flex items-end justify-between border-t border-border/40 pt-3">
            <div className="flex justify-center items-center text-lg font-bold text-primary space-x-2">
              <Truck /> <span>{currency}{price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
