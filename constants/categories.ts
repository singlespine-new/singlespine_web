import { Category } from '@/types'

// Product Categories
export const PRODUCT_CATEGORIES: Category[] = [
  {
    id: 'food-beverages',
    name: 'Food & Beverages',
    slug: 'food-beverages',
    description: 'Fresh local produce, traditional foods, and beverages',
    image: '/categories/food-beverages.jpg',
    isActive: true,
    sortOrder: 1,
    children: [
      {
        id: 'fruits-vegetables',
        name: 'Fruits & Vegetables',
        slug: 'fruits-vegetables',
        parentId: 'food-beverages',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'grains-cereals',
        name: 'Grains & Cereals',
        slug: 'grains-cereals',
        parentId: 'food-beverages',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'spices-seasonings',
        name: 'Spices & Seasonings',
        slug: 'spices-seasonings',
        parentId: 'food-beverages',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'snacks-confectionery',
        name: 'Snacks & Confectionery',
        slug: 'snacks-confectionery',
        parentId: 'food-beverages',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'beverages',
        name: 'Beverages',
        slug: 'beverages',
        parentId: 'food-beverages',
        isActive: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'clothing-accessories',
    name: 'Clothing & Accessories',
    slug: 'clothing-accessories',
    description: 'Traditional and modern African fashion and accessories',
    image: '/categories/clothing-accessories.jpg',
    isActive: true,
    sortOrder: 2,
    children: [
      {
        id: 'traditional-wear',
        name: 'Traditional Wear',
        slug: 'traditional-wear',
        parentId: 'clothing-accessories',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'casual-wear',
        name: 'Casual Wear',
        slug: 'casual-wear',
        parentId: 'clothing-accessories',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'accessories',
        name: 'Accessories',
        slug: 'accessories',
        parentId: 'clothing-accessories',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'footwear',
        name: 'Footwear',
        slug: 'footwear',
        parentId: 'clothing-accessories',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'bags-purses',
        name: 'Bags & Purses',
        slug: 'bags-purses',
        parentId: 'clothing-accessories',
        isActive: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Home decor, furniture, and household items',
    image: '/categories/home-living.jpg',
    isActive: true,
    sortOrder: 3,
    children: [
      {
        id: 'home-decor',
        name: 'Home Decor',
        slug: 'home-decor',
        parentId: 'home-living',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'kitchenware',
        name: 'Kitchenware',
        slug: 'kitchenware',
        parentId: 'home-living',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'furniture',
        name: 'Furniture',
        slug: 'furniture',
        parentId: 'home-living',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'textiles-bedding',
        name: 'Textiles & Bedding',
        slug: 'textiles-bedding',
        parentId: 'home-living',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'storage-organization',
        name: 'Storage & Organization',
        slug: 'storage-organization',
        parentId: 'home-living',
        isActive: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'health-beauty',
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Natural health products, cosmetics, and personal care',
    image: '/categories/health-beauty.jpg',
    isActive: true,
    sortOrder: 4,
    children: [
      {
        id: 'skincare',
        name: 'Skincare',
        slug: 'skincare',
        parentId: 'health-beauty',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'haircare',
        name: 'Haircare',
        slug: 'haircare',
        parentId: 'health-beauty',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'natural-remedies',
        name: 'Natural Remedies',
        slug: 'natural-remedies',
        parentId: 'health-beauty',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'personal-care',
        name: 'Personal Care',
        slug: 'personal-care',
        parentId: 'health-beauty',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'wellness',
        name: 'Wellness',
        slug: 'wellness',
        parentId: 'health-beauty',
        isActive: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Technology and electronic devices',
    image: '/categories/electronics.jpg',
    isActive: true,
    sortOrder: 5,
    children: [
      {
        id: 'mobile-tablets',
        name: 'Mobile & Tablets',
        slug: 'mobile-tablets',
        parentId: 'electronics',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'audio-video',
        name: 'Audio & Video',
        slug: 'audio-video',
        parentId: 'electronics',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'computers',
        name: 'Computers',
        slug: 'computers',
        parentId: 'electronics',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'accessories',
        name: 'Accessories',
        slug: 'accessories',
        parentId: 'electronics',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'smart-home',
        name: 'Smart Home',
        slug: 'smart-home',
        parentId: 'electronics',
        isActive: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'books-media',
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Books, music, movies, and educational materials',
    image: '/categories/books-media.jpg',
    isActive: true,
    sortOrder: 6,
    children: [
      {
        id: 'books',
        name: 'Books',
        slug: 'books',
        parentId: 'books-media',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'music',
        name: 'Music',
        slug: 'music',
        parentId: 'books-media',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'movies',
        name: 'Movies',
        slug: 'movies',
        parentId: 'books-media',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'educational',
        name: 'Educational',
        slug: 'educational',
        parentId: 'books-media',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'magazines',
        name: 'Magazines',
        slug: 'magazines',
        parentId: 'books-media',
        isActive: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'crafts-art',
    name: 'Crafts & Art',
    slug: 'crafts-art',
    description: 'Handmade crafts, artworks, and creative supplies',
    image: '/categories/crafts-art.jpg',
    isActive: true,
    sortOrder: 7,
    children: [
      {
        id: 'woodwork',
        name: 'Woodwork',
        slug: 'woodwork',
        parentId: 'crafts-art',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'pottery',
        name: 'Pottery',
        slug: 'pottery',
        parentId: 'crafts-art',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'textiles',
        name: 'Textiles',
        slug: 'textiles',
        parentId: 'crafts-art',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'paintings',
        name: 'Paintings',
        slug: 'paintings',
        parentId: 'crafts-art',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'sculptures',
        name: 'Sculptures',
        slug: 'sculptures',
        parentId: 'crafts-art',
        isActive: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Traditional and contemporary jewelry pieces',
    image: '/categories/jewelry.jpg',
    isActive: true,
    sortOrder: 8,
    children: [
      {
        id: 'necklaces',
        name: 'Necklaces',
        slug: 'necklaces',
        parentId: 'jewelry',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'bracelets',
        name: 'Bracelets',
        slug: 'bracelets',
        parentId: 'jewelry',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'earrings',
        name: 'Earrings',
        slug: 'earrings',
        parentId: 'jewelry',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'rings',
        name: 'Rings',
        slug: 'rings',
        parentId: 'jewelry',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'traditional-jewelry',
        name: 'Traditional Jewelry',
        slug: 'traditional-jewelry',
        parentId: 'jewelry',
        isActive: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'seasonal-special',
    name: 'Seasonal & Special',
    slug: 'seasonal-special',
    description: 'Seasonal items and special occasion products',
    image: '/categories/seasonal-special.jpg',
    isActive: true,
    sortOrder: 9,
    children: [
      {
        id: 'christmas',
        name: 'Christmas',
        slug: 'christmas',
        parentId: 'seasonal-special',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'new-year',
        name: 'New Year',
        slug: 'new-year',
        parentId: 'seasonal-special',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'valentines',
        name: "Valentine's Day",
        slug: 'valentines',
        parentId: 'seasonal-special',
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'mothers-day',
        name: "Mother's Day",
        slug: 'mothers-day',
        parentId: 'seasonal-special',
        isActive: true,
        sortOrder: 4
      },
      {
        id: 'independence-day',
        name: 'Independence Day',
        slug: 'independence-day',
        parentId: 'seasonal-special',
        isActive: true,
        sortOrder: 5
      }
    ]
  }
]

// Category utilities
export const getCategoryById = (id: string): Category | undefined => {
  return PRODUCT_CATEGORIES.find(cat => cat.id === id)
}

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return PRODUCT_CATEGORIES.find(cat => cat.slug === slug)
}

export const getSubcategories = (parentId: string): Category[] => {
  const parent = getCategoryById(parentId)
  return parent?.children || []
}

export const getAllCategories = (): Category[] => {
  const allCategories: Category[] = []

  PRODUCT_CATEGORIES.forEach(category => {
    allCategories.push(category)
    if (category.children) {
      allCategories.push(...category.children)
    }
  })

  return allCategories
}

export const getCategoryHierarchy = (categoryId: string): Category[] => {
  const hierarchy: Category[] = []

  // Find if it's a subcategory
  for (const category of PRODUCT_CATEGORIES) {
    if (category.children) {
      const subcategory = category.children.find(sub => sub.id === categoryId)
      if (subcategory) {
        hierarchy.push(category, subcategory)
        return hierarchy
      }
    }

    if (category.id === categoryId) {
      hierarchy.push(category)
      return hierarchy
    }
  }

  return hierarchy
}

// Category options for select components
export const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map(category => ({
  value: category.id,
  label: category.name,
  slug: category.slug
}))

export const ALL_CATEGORIES_OPTION = {
  value: '',
  label: 'All Categories',
  slug: 'all'
}

export const CATEGORY_SELECT_OPTIONS = [
  ALL_CATEGORIES_OPTION,
  ...CATEGORY_OPTIONS
]
