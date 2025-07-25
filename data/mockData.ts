import { Order, Product, Review, Shop, User } from '@/types'

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Kwame Asante',
    email: 'kwame@example.com',
    phone: '+233244567890',
    image: '/avatars/kwame.jpg',
    role: 'customer',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'user-2',
    name: 'Ama Osei',
    email: 'ama@example.com',
    phone: '+233201234567',
    image: '/avatars/ama.jpg',
    role: 'vendor',
    isActive: true,
    createdAt: '2024-01-10T08:20:00Z',
    updatedAt: '2024-01-15T14:45:00Z'
  },
  {
    id: 'user-3',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+14155552345',
    image: '/avatars/john.jpg',
    role: 'customer',
    isActive: true,
    createdAt: '2024-01-05T16:15:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  }
]

// Mock Shops
export const MOCK_SHOPS: Shop[] = [
  {
    id: 'shop-1',
    name: 'Bioko Treats - Osu',
    slug: 'bioko-treats-osu',
    description: 'Authentic Ghanaian chocolate and treats made with love. We specialize in premium cocoa products sourced directly from local farmers in the Ashanti region.',
    shortDescription: 'Premium Ghanaian chocolate and cocoa treats',
    image: '/shops/bioko-treats.jpg',
    coverImage: '/shops/bioko-treats-cover.jpg',
    ownerId: 'user-2',
    rating: 4.8,
    reviewCount: 127,
    deliveryTime: '30-40 min',
    deliveryFee: 5.00,
    minimumOrder: 25.00,
    address: 'Ring Road East, Osu, Accra, Ghana',
    phone: '+233244123456',
    email: 'hello@biokotreats.com',
    website: 'https://biokotreats.com',
    established: '2018',
    openingHours: {
      'SUN-MON': 'Closed',
      'TUE-FRI': '09:00 - 17:00',
      'SAT': '10:00 - 16:00'
    },
    categories: ['Chocolate Bars', 'Bonbons and Pralines', 'Gifts and Bundles', 'Chocolate Specialties'],
    tags: ['chocolate', 'artisan', 'local', 'premium', 'authentic', 'organic'],
    socialMedia: {
      instagram: '@biokotreats',
      facebook: 'BiokotreatsGhana',
      twitter: '@biokotreats'
    },
    certifications: ['Organic Certified', 'Fair Trade', 'Local Sourcing'],
    isActive: true,
    isVerified: true,
    createdAt: '2018-03-15T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'shop-2',
    name: 'Akosombo Textiles',
    slug: 'akosombo-textiles',
    description: 'Traditional Ghanaian textiles and clothing. Specializing in authentic Kente cloth, Adinkra prints, and contemporary African fashion.',
    shortDescription: 'Authentic Ghanaian textiles and clothing',
    image: '/shops/akosombo-textiles.jpg',
    coverImage: '/shops/akosombo-textiles-cover.jpg',
    ownerId: 'user-2',
    rating: 4.6,
    reviewCount: 89,
    deliveryTime: '45-60 min',
    deliveryFee: 8.00,
    minimumOrder: 40.00,
    address: 'Makola Market, Accra Central, Ghana',
    phone: '+233208765432',
    email: 'info@akosombotextiles.com',
    established: '2015',
    openingHours: {
      'MON-FRI': '08:00 - 18:00',
      'SAT': '08:00 - 16:00',
      'SUN': 'Closed'
    },
    categories: ['Traditional Wear', 'Casual Wear', 'Accessories', 'Textiles'],
    tags: ['kente', 'traditional', 'handwoven', 'authentic', 'african-fashion'],
    socialMedia: {
      instagram: '@akosombotextiles',
      facebook: 'AkosomboTextiles'
    },
    certifications: ['Authentic Kente', 'Handwoven Certified'],
    isActive: true,
    isVerified: true,
    createdAt: '2015-06-20T00:00:00Z',
    updatedAt: '2024-01-12T15:20:00Z'
  },
  {
    id: 'shop-3',
    name: 'Mama Akos Kitchen',
    slug: 'mama-akos-kitchen',
    description: 'Authentic Ghanaian spices, seasonings, and ready-to-cook meal preparations. Bringing the taste of home to your kitchen.',
    shortDescription: 'Authentic Ghanaian spices and meal preparations',
    image: '/shops/mama-akos.jpg',
    coverImage: '/shops/mama-akos-cover.jpg',
    ownerId: 'user-2',
    rating: 4.9,
    reviewCount: 203,
    deliveryTime: '25-35 min',
    deliveryFee: 6.00,
    minimumOrder: 20.00,
    address: 'Kaneshie Market, Accra, Ghana',
    phone: '+233277891234',
    email: 'orders@mamaakos.com',
    established: '2020',
    openingHours: {
      'MON-SAT': '07:00 - 19:00',
      'SUN': '09:00 - 15:00'
    },
    categories: ['Spices & Seasonings', 'Grains & Cereals', 'Snacks & Confectionery'],
    tags: ['spices', 'authentic', 'homemade', 'traditional', 'fresh'],
    socialMedia: {
      instagram: '@mamaakoskitchen',
      facebook: 'MamaAkosKitchen',
      tiktok: '@mamaakos'
    },
    certifications: ['Food Safety Certified', 'Natural Products'],
    isActive: true,
    isVerified: true,
    createdAt: '2020-09-10T00:00:00Z',
    updatedAt: '2024-01-14T11:45:00Z'
  }
]

// Mock Products
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Intense Dark Chocolate Bar',
    slug: 'intense-dark-chocolate-bar',
    description: 'Rich and intense dark chocolate bar with 75% cocoa content. Made from premium Ghanaian cocoa beans with a hint of natural vanilla. The perfect balance of bitterness and sweetness that melts beautifully in your mouth.',
    shortDescription: 'Premium 75% dark chocolate made from Ghanaian cocoa',
    price: 8.40,
    comparePrice: 10.00,
    images: [
      '/products/dark-chocolate-1.jpg',
      '/products/dark-chocolate-2.jpg',
      '/products/dark-chocolate-3.jpg'
    ],
    category: 'food-beverages',
    subcategory: 'snacks-confectionery',
    tags: ['chocolate', 'dark', 'premium', 'organic', 'vegan'],
    isFeatured: true,
    stock: 45,
    weight: 0.1,
    dimensions: { length: 15, width: 8, height: 1, unit: 'cm' },
    origin: 'Ghana',
    vendor: 'Bioko Treats - Osu',
    shopId: 'shop-1',
    availability: 'IN_STOCK',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    rating: 4.7,
    reviewCount: 23,
    variants: [
      {
        id: 'var-1',
        productId: 'prod-1',
        name: 'Size',
        value: 'Small (50g)',
        price: 8.40,
        stock: 25,
        sku: 'DKC-SM-50',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'var-2',
        productId: 'prod-1',
        name: 'Size',
        value: 'Large (100g)',
        price: 15.00,
        stock: 20,
        sku: 'DKC-LG-100',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Sea Salt Dark Chocolate',
    slug: 'sea-salt-dark-chocolate',
    description: 'Artisanal dark chocolate infused with Atlantic sea salt crystals. The combination of rich cocoa and mineral-rich salt creates a sophisticated flavor profile that enhances the natural sweetness of the chocolate.',
    shortDescription: 'Dark chocolate with Atlantic sea salt crystals',
    price: 9.20,
    images: [
      '/products/sea-salt-chocolate-1.jpg',
      '/products/sea-salt-chocolate-2.jpg'
    ],
    category: 'food-beverages',
    subcategory: 'snacks-confectionery',
    tags: ['chocolate', 'sea-salt', 'artisan', 'gourmet'],
    isFeatured: true,
    stock: 32,
    weight: 0.1,
    origin: 'Ghana',
    vendor: 'Bioko Treats - Osu',
    shopId: 'shop-1',
    availability: 'IN_STOCK',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    rating: 4.8,
    reviewCount: 18
  },
  {
    id: 'prod-3',
    name: 'Traditional Kente Cloth',
    slug: 'traditional-kente-cloth',
    description: 'Authentic handwoven Kente cloth from the master weavers of Bonwire. This beautiful piece features traditional Adinkra symbols and vibrant colors that tell the story of Ghanaian heritage and culture.',
    shortDescription: 'Authentic handwoven Kente cloth with traditional patterns',
    price: 85.00,
    comparePrice: 100.00,
    images: [
      '/products/kente-1.jpg',
      '/products/kente-2.jpg',
      '/products/kente-3.jpg',
      '/products/kente-4.jpg'
    ],
    category: 'clothing-accessories',
    subcategory: 'traditional-wear',
    tags: ['kente', 'traditional', 'handwoven', 'authentic', 'cultural'],
    isFeatured: true,
    stock: 8,
    weight: 0.5,
    dimensions: { length: 200, width: 120, height: 0.5, unit: 'cm' },
    origin: 'Ghana',
    vendor: 'Akosombo Textiles',
    shopId: 'shop-2',
    availability: 'LOW_STOCK',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-14T16:20:00Z',
    rating: 4.9,
    reviewCount: 12,
    variants: [
      {
        id: 'var-3',
        productId: 'prod-3',
        name: 'Pattern',
        value: 'Adinkra Classic',
        price: 85.00,
        stock: 5,
        sku: 'KNT-ADK-CLS',
        isActive: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z'
      },
      {
        id: 'var-4',
        productId: 'prod-3',
        name: 'Pattern',
        value: 'Royal Gold',
        price: 95.00,
        stock: 3,
        sku: 'KNT-RYL-GLD',
        isActive: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z'
      }
    ]
  },
  {
    id: 'prod-4',
    name: 'Shito Pepper Sauce Mix',
    slug: 'shito-pepper-sauce-mix',
    description: 'Authentic Ghanaian shito pepper sauce seasoning mix. Made with carefully selected dried peppers, ginger, garlic, and traditional spices. Just add oil and enjoy the fiery taste of Ghana.',
    shortDescription: 'Traditional Ghanaian shito pepper sauce mix',
    price: 12.50,
    images: [
      '/products/shito-mix-1.jpg',
      '/products/shito-mix-2.jpg'
    ],
    category: 'food-beverages',
    subcategory: 'spices-seasonings',
    tags: ['spices', 'hot-sauce', 'traditional', 'authentic', 'homemade'],
    isFeatured: false,
    stock: 67,
    weight: 0.25,
    origin: 'Ghana',
    vendor: 'Mama Akos Kitchen',
    shopId: 'shop-3',
    availability: 'IN_STOCK',
    isActive: true,
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-13T14:10:00Z',
    rating: 4.6,
    reviewCount: 34
  },
  {
    id: 'prod-5',
    name: 'Gift Box Chocolate Assortment',
    slug: 'gift-box-chocolate-assortment',
    description: 'Beautifully curated gift box containing an assortment of our finest chocolates. Includes dark chocolate, milk chocolate, white chocolate truffles, and specialty flavored bars. Perfect for special occasions.',
    shortDescription: 'Luxury chocolate gift box with assorted premium chocolates',
    price: 35.00,
    comparePrice: 42.00,
    images: [
      '/products/gift-box-1.jpg',
      '/products/gift-box-2.jpg',
      '/products/gift-box-3.jpg'
    ],
    category: 'food-beverages',
    subcategory: 'snacks-confectionery',
    tags: ['gift', 'chocolate', 'assortment', 'premium', 'luxury'],
    isFeatured: true,
    stock: 15,
    weight: 0.8,
    dimensions: { length: 25, width: 20, height: 5, unit: 'cm' },
    origin: 'Ghana',
    vendor: 'Bioko Treats - Osu',
    shopId: 'shop-1',
    availability: 'IN_STOCK',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    rating: 4.9,
    reviewCount: 8
  },
  {
    id: 'prod-6',
    name: 'Adinkra Print T-Shirt',
    slug: 'adinkra-print-t-shirt',
    description: 'Comfortable cotton t-shirt featuring authentic Adinkra symbols. Each symbol carries deep meaning in Ghanaian culture. Made from 100% organic cotton with eco-friendly printing methods.',
    shortDescription: 'Cotton t-shirt with traditional Adinkra symbols',
    price: 18.00,
    images: [
      '/products/adinkra-tshirt-1.jpg',
      '/products/adinkra-tshirt-2.jpg'
    ],
    category: 'clothing-accessories',
    subcategory: 'casual-wear',
    tags: ['t-shirt', 'adinkra', 'cotton', 'cultural', 'eco-friendly'],
    isFeatured: false,
    stock: 24,
    weight: 0.2,
    origin: 'Ghana',
    vendor: 'Akosombo Textiles',
    shopId: 'shop-2',
    availability: 'IN_STOCK',
    isActive: true,
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-12T15:20:00Z',
    rating: 4.4,
    reviewCount: 15,
    variants: [
      {
        id: 'var-5',
        productId: 'prod-6',
        name: 'Size',
        value: 'Small',
        stock: 8,
        sku: 'ADK-TSH-SM',
        isActive: true,
        createdAt: '2024-01-06T00:00:00Z',
        updatedAt: '2024-01-12T15:20:00Z'
      },
      {
        id: 'var-6',
        productId: 'prod-6',
        name: 'Size',
        value: 'Medium',
        stock: 10,
        sku: 'ADK-TSH-MD',
        isActive: true,
        createdAt: '2024-01-06T00:00:00Z',
        updatedAt: '2024-01-12T15:20:00Z'
      },
      {
        id: 'var-7',
        productId: 'prod-6',
        name: 'Size',
        value: 'Large',
        stock: 6,
        sku: 'ADK-TSH-LG',
        isActive: true,
        createdAt: '2024-01-06T00:00:00Z',
        updatedAt: '2024-01-12T15:20:00Z'
      }
    ]
  }
]

// Mock Reviews
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userId: 'user-1',
    productId: 'prod-1',
    rating: 5,
    title: 'Absolutely delicious!',
    comment: 'This dark chocolate is incredible. The quality is outstanding and you can really taste the authentic Ghanaian cocoa. Will definitely order again!',
    images: ['/reviews/review-1-1.jpg'],
    isVerified: true,
    isHelpful: 12,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    user: {
      name: 'Kwame Asante',
      image: '/avatars/kwame.jpg'
    }
  },
  {
    id: 'rev-2',
    userId: 'user-3',
    productId: 'prod-1',
    rating: 4,
    title: 'Great chocolate',
    comment: 'Really good quality chocolate. The packaging was perfect and it arrived in excellent condition. My family in Accra loved it!',
    isVerified: true,
    isHelpful: 8,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    user: {
      name: 'John Smith',
      image: '/avatars/john.jpg'
    }
  },
  {
    id: 'rev-3',
    userId: 'user-1',
    shopId: 'shop-1',
    rating: 5,
    title: 'Excellent service!',
    comment: 'Bioko Treats provides exceptional service. Fast delivery, great packaging, and authentic products. Highly recommended for anyone wanting to send quality Ghanaian products.',
    isVerified: true,
    isHelpful: 15,
    createdAt: '2024-01-08T10:20:00Z',
    updatedAt: '2024-01-08T10:20:00Z',
    user: {
      name: 'Kwame Asante',
      image: '/avatars/kwame.jpg'
    }
  }
]

// Mock Orders
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    userId: 'user-1',
    orderNumber: 'SS-2024-001',
    status: 'delivered',
    items: [
      {
        id: 'ord-item-1',
        productId: 'prod-1',
        variantId: 'var-1',
        name: 'Intense Dark Chocolate Bar',
        price: 8.40,
        quantity: 2,
        image: '/products/dark-chocolate-1.jpg',
        variant: { name: 'Size', value: 'Small (50g)' },
        shopId: 'shop-1',
        vendor: 'Bioko Treats - Osu'
      },
      {
        id: 'ord-item-2',
        productId: 'prod-2',
        name: 'Sea Salt Dark Chocolate',
        price: 9.20,
        quantity: 1,
        image: '/products/sea-salt-chocolate-1.jpg',
        shopId: 'shop-1',
        vendor: 'Bioko Treats - Osu'
      }
    ],
    shipping: {
      firstName: 'Akosua',
      lastName: 'Mensah',
      address1: '123 Liberation Road',
      city: 'Accra',
      country: 'Ghana',
      phone: '+233244567890',
      deliveryInstructions: 'Please call when you arrive'
    },
    billing: {
      firstName: 'Kwame',
      lastName: 'Asante',
      address1: '456 Oak Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      sameAsShipping: false
    },
    payment: {
      method: 'card',
      status: 'completed',
      transactionId: 'txn_1234567890',
      amount: 31.00,
      currency: 'GHS',
      processedAt: '2024-01-10T12:00:00Z'
    },
    summary: {
      subtotal: 26.00,
      shippingCost: 5.00,
      total: 31.00,
      totalItems: 3
    },
    notes: 'Birthday gift for my sister',
    deliveryInstructions: 'Please call when you arrive',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    deliveredAt: '2024-01-12T14:30:00Z'
  }
]

// Helper functions to get mock data
export const getMockProductById = (id: string): Product | undefined => {
  return MOCK_PRODUCTS.find(product => product.id === id)
}

export const getMockProductBySlug = (slug: string): Product | undefined => {
  return MOCK_PRODUCTS.find(product => product.slug === slug)
}

export const getMockShopById = (id: string): Shop | undefined => {
  return MOCK_SHOPS.find(shop => shop.id === id)
}

export const getMockShopBySlug = (slug: string): Shop | undefined => {
  return MOCK_SHOPS.find(shop => shop.slug === slug)
}

export const getMockProductsByShop = (shopId: string): Product[] => {
  return MOCK_PRODUCTS.filter(product => product.shopId === shopId)
}

export const getMockProductsByCategory = (category: string): Product[] => {
  return MOCK_PRODUCTS.filter(product => product.category === category)
}

export const getMockFeaturedProducts = (): Product[] => {
  return MOCK_PRODUCTS.filter(product => product.isFeatured)
}

export const getMockReviewsByProduct = (productId: string): Review[] => {
  return MOCK_REVIEWS.filter(review => review.productId === productId)
}

export const getMockReviewsByShop = (shopId: string): Review[] => {
  return MOCK_REVIEWS.filter(review => review.shopId === shopId)
}

export const getMockOrdersByUser = (userId: string): Order[] => {
  return MOCK_ORDERS.filter(order => order.userId === userId)
}

// Search and filter functions
export const searchMockProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase()
  return MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    product.vendor.toLowerCase().includes(lowercaseQuery)
  )
}

export const searchMockShops = (query: string): Shop[] => {
  const lowercaseQuery = query.toLowerCase()
  return MOCK_SHOPS.filter(shop =>
    shop.name.toLowerCase().includes(lowercaseQuery) ||
    shop.description.toLowerCase().includes(lowercaseQuery) ||
    shop.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    shop.categories.some(category => category.toLowerCase().includes(lowercaseQuery))
  )
}

// Pagination helper
export const paginateMockData = <T>(data: T[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const items = data.slice(startIndex, endIndex)

  return {
    items,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(data.length / limit),
      totalCount: data.length,
      hasNextPage: endIndex < data.length,
      hasPreviousPage: page > 1,
      limit
    }
  }
}

// Generate random mock data
export const generateMockProducts = (count: number): Product[] => {
  const products: Product[] = []
  const categories = ['food-beverages', 'clothing-accessories', 'crafts-art', 'jewelry']
  const origins = ['Ghana', 'Nigeria', 'Kenya', 'South Africa']

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const origin = origins[Math.floor(Math.random() * origins.length)]

    products.push({
      id: `gen-prod-${i + 1}`,
      name: `Generated Product ${i + 1}`,
      slug: `generated-product-${i + 1}`,
      description: `This is a generated product description for product ${i + 1}`,
      price: Math.floor(Math.random() * 100) + 10,
      images: [`/products/generated-${i + 1}.jpg`],
      category,
      tags: ['generated', 'test'],
      isFeatured: Math.random() > 0.7,
      stock: Math.floor(Math.random() * 50) + 1,
      origin,
      vendor: `Vendor ${Math.floor(Math.random() * 5) + 1}`,
      availability: 'IN_STOCK',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  return products
}
