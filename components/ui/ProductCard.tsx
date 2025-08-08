'use client'

import { useState } from "react"
import { Truck, Star, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Product } from '@/types'
import ProductDetailsModal from "@/components/products/ProductDetailsModal"
import { useCartStore } from '@/lib/store/cart'
import { useAuth } from '@/lib/auth-utils'
import toast from '@/components/ui/toast'

interface ProductCardProps {
  product: Product
  className?: string
  showQuickAdd?: boolean
  viewMode?: 'grid' | 'list'
  onClick?: (product: Product) => void
}

const ProductCard = ({
  product,
  className,
  showQuickAdd = false,
  viewMode = 'grid',
  onClick
}: ProductCardProps) => {
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuth()

  const handleCardClick = () => {
    if (onClick) {
      onClick(product)
    } else {
      setShowModal(true)
    }
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setIsLoading(true)

    try {
      // Add to cart store (this will handle both frontend and backend sync)
      await addItem({
        id: `${product.id}-default`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder-product.jpg',
        maxQuantity: product.stock,
        metadata: {
          weight: product.weight,
          origin: product.origin,
          vendor: product.vendor
        }
      }, isAuthenticated)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    try {
      // Find the variant if specified
      const variant = variantId ? product.variants?.find(v => v.id === variantId) : undefined

      // Add to cart store (this will handle both frontend and backend sync)
      await addItem({
        id: `${productId}-${variantId || 'default'}`,
        productId,
        variantId,
        name: product.name,
        price: variant?.price || product.price,
        image: product.images[0] || '/placeholder-product.jpg',
        maxQuantity: variant?.stock || product.stock,
        variant: variant ? {
          id: variant.id,
          name: variant.name,
          value: variant.value
        } : undefined,
        metadata: {
          weight: product.weight,
          origin: product.origin,
          vendor: product.vendor
        }
      }, isAuthenticated)

      return { success: true }
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  const formatPrice = (price: number, comparePrice?: number) => {
    const formattedPrice = `₵${price.toFixed(2)}`
    if (comparePrice && comparePrice > price) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{formattedPrice}</span>
          <span className="text-sm text-gray-500 line-through">₵{comparePrice.toFixed(2)}</span>
        </div>
      )
    }
    return <span className="font-bold text-lg">{formattedPrice}</span>
  }

  const getDeliveryTime = () => {
    // Calculate delivery time based on product's shop or default
    return "30-45 min" // This would typically come from shop data or be calculated
  }

  const getAvailabilityColor = () => {
    switch (product.availability) {
      case 'IN_STOCK':
        return 'text-green-600'
      case 'LOW_STOCK':
        return 'text-yellow-600'
      case 'OUT_OF_STOCK':
        return 'text-red-600'
      case 'PREORDER':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getAvailabilityText = () => {
    switch (product.availability) {
      case 'IN_STOCK':
        return 'In Stock'
      case 'LOW_STOCK':
        return 'Low Stock'
      case 'OUT_OF_STOCK':
        return 'Out of Stock'
      case 'PREORDER':
        return 'Pre-order'
      case 'DISCONTINUED':
        return 'Discontinued'
      default:
        return 'Available'
    }
  }

  if (viewMode === 'list') {
    return (
      <>
        <div
          className={cn(
            "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex",
            className
          )}
          onClick={handleCardClick}
        >
          {/* Image */}
          <div className="relative w-48 h-32 flex-shrink-0">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="192px"
            />
            {product.isFeatured && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                Featured
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{product.name}</h3>
              {product.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                  {product.reviewCount && (
                    <span className="text-gray-500">({product.reviewCount})</span>
                  )}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.shortDescription || product.description}
            </p>

            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                {formatPrice(product.price, product.comparePrice)}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>{getDeliveryTime()}</span>
                  </div>
                  <span className={cn("text-sm font-medium", getAvailabilityColor())}>
                    {getAvailabilityText()}
                  </span>
                </div>
              </div>

              {showQuickAdd && product.availability === 'IN_STOCK' && (
                <button
                  onClick={handleQuickAdd}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors duration-200"
                  title="Quick add to cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              )}
            </div>

            {product.vendor && (
              <div className="mt-2">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                  {product.vendor}
                </span>
              </div>
            )}
          </div>
        </div>

        <ProductDetailsModal
          product={product}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAddToCart={handleAddToCart}
        />
      </>
    )
  }

  // Default grid view
  return (
    <>
      <div
        className={cn(
          "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] relative",
          className
        )}
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative h-48">
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.isFeatured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Featured
            </div>
          )}
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Sale
            </div>
          )}
          {showQuickAdd && product.availability === 'IN_STOCK' && (
            <button
              onClick={handleQuickAdd}
              disabled={isLoading}
              className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
              title="Quick add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-800 line-clamp-2 flex-1 mr-2">
              {product.name}
            </h3>
            {product.rating && (
              <div className="flex items-center gap-1 text-sm flex-shrink-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
            {product.shortDescription || product.description}
          </p>

          <div className="space-y-2">
            {formatPrice(product.price, product.comparePrice)}

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Truck className="w-4 h-4" />
                <span>{getDeliveryTime()}</span>
              </div>
              <span className={cn("font-medium", getAvailabilityColor())}>
                {getAvailabilityText()}
              </span>
            </div>

            {product.reviewCount && (
              <div className="text-xs text-gray-500">
                {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {product.vendor && (
            <div className="mt-3">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                {product.vendor}
              </span>
            </div>
          )}
        </div>
      </div>

      <ProductDetailsModal
        product={product}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  )
}

export default ProductCard
