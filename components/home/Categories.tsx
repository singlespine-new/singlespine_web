'use client'

import { useState, useEffect } from 'react'
import { Product, Category } from '@/types'
import { PRODUCT_CATEGORIES } from '@/constants/categories'
import { getMockProductsByCategory, getMockFeaturedProducts } from '@/data/mockData'

interface CategoriesProps {
  className?: string
  showAllCategories?: boolean
  featuredOnly?: boolean
}

const Categories = ({
  className = '',
  showAllCategories = false,
  featuredOnly = false
}: CategoriesProps) => {
  const [categorizedProducts, setCategorizedProducts] = useState<{
    category: Category
    products: Product[]
  }[]>([])

  useEffect(() => {
    // Get categories to display
    const categoriesToShow = showAllCategories
      ? PRODUCT_CATEGORIES
      : PRODUCT_CATEGORIES.slice(0, 3) // Show first 3 categories by default

    // Get products for each category
    const categoryData = categoriesToShow.map(category => {
      let products: Product[]

      if (featuredOnly) {
        // Get featured products for this category
        products = getMockFeaturedProducts().filter(product =>
          product.category === category.id
        )
      } else {
        // Get all products for this category
        products = getMockProductsByCategory(category.id)
      }

      // Limit to 6 products per category for display
      products = products.slice(0, 6)

      return {
        category,
        products
      }
    }).filter(item => item.products.length > 0) // Only show categories with products

    setCategorizedProducts(categoryData)
  }, [showAllCategories, featuredOnly])

  if (categorizedProducts.length === 0) {
    return (
      <div className="p-4 bg-gray-50">
        <div className="text-center py-8">
          <p className="text-gray-500">No products available at the moment.</p>
        </div>
      </div >
    )
  }

  return (
    <div className={`p-4 bg-gray-50 flex flex-col space-y-8 ${className}`}>
      {categorizedProducts.map(({ category, products }) => (
        <section key={category.id} className="mb-8">
          {/* Category Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{category.name}</h2>
            {category.description && (
              <p className="text-gray-600 text-lg">{category.description}</p>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="hover:shadow-lg transition-shadow duration-200"
              />
            ))}
          </div>

          {/* View More Link */}
          {products.length >= 6 && (
            <div className="mt-6 text-center">
              <button
                className="text-blue-600 hover:text-blue-800 font-semibold text-lg hover:underline transition-colors duration-200"
                onClick={() => {
                  // Navigate to category page - would implement routing here
                  console.log(`Navigate to category: ${category.slug}`)
                }}
              >
                View all {category.name} →
              </button>
            </div>
          )}
        </section>
      ))}

      {/* Show All Categories Button */}
      {!showAllCategories && PRODUCT_CATEGORIES.length > 3 && (
        <div className="text-center py-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            onClick={() => {
              // This would typically update URL params or trigger a state change
              console.log('Show all categories')
            }}
          >
            Explore All Categories
          </button>
        </div>
      )}
    </div>
  )
}

export default Categories
