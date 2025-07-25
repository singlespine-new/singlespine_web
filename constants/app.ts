// Application Configuration
export const APP_CONFIG = {
  name: 'Singlespine',
  tagline: 'Bridging Diaspora & Family',
  description: 'Send gifts to your family and friends in Ghana. Connecting the diaspora during festive seasons and special occasions.',
  version: '1.0.0',
  author: 'Singlespine Team',
  website: 'https://singlespine.com',
  supportEmail: 'support@singlespine.com',
  logo: '/singlespine_logo.png',
  favicon: '/favicon.ico'
} as const

// Currency Configuration
export const CURRENCY = {
  code: 'GHS',
  symbol: '₵',
  name: 'Ghanaian Cedi',
  decimalPlaces: 2,
  thousandSeparator: ',',
  decimalSeparator: '.'
} as const

// Supported Countries
export const SUPPORTED_COUNTRIES = [
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    phoneCode: '+233',
    isDeliveryCountry: true,
    isSenderCountry: false
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    phoneCode: '+1',
    isDeliveryCountry: false,
    isSenderCountry: true
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    phoneCode: '+44',
    isDeliveryCountry: false,
    isSenderCountry: true
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    phoneCode: '+1',
    isDeliveryCountry: false,
    isSenderCountry: true
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    phoneCode: '+49',
    isDeliveryCountry: false,
    isSenderCountry: true
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    phoneCode: '+61',
    isDeliveryCountry: false,
    isSenderCountry: true
  }
] as const

// Language Configuration
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', isDefault: true },
  { code: 'tw', name: 'Twi', flag: '🇬🇭', isDefault: false },
  { code: 'ga', name: 'Ga', flag: '🇬🇭', isDefault: false }
] as const

// Theme Configuration
export const THEME = {
  colors: {
    primary: '#FC8120',
    secondary: '#FFECDD',
    accent: '#231F20',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6'
  },
  fonts: {
    primary: 'Inter',
    secondary: 'Geist Mono'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  retries: 3,
  endpoints: {
    auth: '/auth',
    products: '/products',
    shops: '/shops',
    cart: '/cart',
    orders: '/orders',
    users: '/users',
    notifications: '/notifications',
    search: '/search'
  }
} as const

// Authentication Configuration
export const AUTH_CONFIG = {
  sessionDuration: 30 * 24 * 60 * 60, // 30 days in seconds
  otpExpiry: 5 * 60, // 5 minutes in seconds
  otpLength: 6,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60, // 15 minutes in seconds
  providers: ['google', 'phone-otp'] as const
} as const

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxFiles: 10,
  thumbnailSize: { width: 300, height: 300 },
  largeImageSize: { width: 1200, height: 1200 }
} as const

// Shipping Configuration
export const SHIPPING_CONFIG = {
  freeShippingThreshold: 500, // GHS
  baseFee: 15, // GHS
  weightLimit: 50, // kg
  additionalWeightFee: 5, // GHS per kg over 2kg
  rushDeliveryFee: 25, // GHS
  zones: {
    accra: { name: 'Greater Accra', baseFee: 10, deliveryTime: '1-2 days' },
    kumasi: { name: 'Kumasi', baseFee: 15, deliveryTime: '2-3 days' },
    other: { name: 'Other Regions', baseFee: 20, deliveryTime: '3-5 days' }
  }
} as const

// Order Status Configuration
export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'orange', description: 'Order is being processed' },
  confirmed: { label: 'Confirmed', color: 'blue', description: 'Order has been confirmed' },
  processing: { label: 'Processing', color: 'yellow', description: 'Order is being prepared' },
  shipped: { label: 'Shipped', color: 'purple', description: 'Order is on the way' },
  delivered: { label: 'Delivered', color: 'green', description: 'Order has been delivered' },
  cancelled: { label: 'Cancelled', color: 'red', description: 'Order has been cancelled' },
  refunded: { label: 'Refunded', color: 'gray', description: 'Order has been refunded' }
} as const

// Payment Configuration
export const PAYMENT_CONFIG = {
  methods: {
    card: { label: 'Credit/Debit Card', icon: 'CreditCard', enabled: true },
    mobileMoney: { label: 'Mobile Money', icon: 'Smartphone', enabled: true },
    bankTransfer: { label: 'Bank Transfer', icon: 'Building2', enabled: false },
    cashOnDelivery: { label: 'Cash on Delivery', icon: 'Banknote', enabled: true },
    paypal: { label: 'PayPal', icon: 'Wallet', enabled: false }
  },
  currency: 'GHS',
  testMode: process.env.NODE_ENV !== 'production'
} as const

// Social Media Links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/singlespine',
  twitter: 'https://twitter.com/singlespine',
  instagram: 'https://instagram.com/singlespine',
  linkedin: 'https://linkedin.com/company/singlespine',
  youtube: 'https://youtube.com/@singlespine',
  tiktok: 'https://tiktok.com/@singlespine'
} as const

// Navigation Links
export const NAV_LINKS = [
  { href: '/', label: 'Home', isExternal: false },
  { href: '/products', label: 'Browse Gifts', isExternal: false },
  { href: '/how-it-works', label: 'How It Works', isExternal: false },
  { href: '/shops', label: 'Shops', isExternal: false },
  { href: '/about', label: 'About', isExternal: false },
  { href: '/contact', label: 'Contact', isExternal: false }
] as const

// Footer Links
export const FOOTER_LINKS = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
    { href: '/blog', label: 'Blog' }
  ],
  support: [
    { href: '/help', label: 'Help Center' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns' }
  ],
  legal: [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/cookies', label: 'Cookie Policy' },
    { href: '/disclaimer', label: 'Disclaimer' }
  ],
  sellers: [
    { href: '/sell', label: 'Become a Seller' },
    { href: '/seller-center', label: 'Seller Center' },
    { href: '/seller-guide', label: 'Seller Guide' },
    { href: '/seller-support', label: 'Seller Support' }
  ]
} as const

// Feature Flags
export const FEATURES = {
  enableShops: true,
  enableWishlist: true,
  enableReviews: true,
  enableChat: false,
  enableNotifications: true,
  enableAnalytics: true,
  enableMultiCurrency: false,
  enableMultiLanguage: false,
  enableGiftCards: false,
  enableSubscriptions: false,
  enableAffiliates: false,
  enableLoyaltyProgram: false
} as const

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  timeout: 'Request timed out. Please try again.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  server: 'Server error. Please try again later.',
  maintenance: 'We are currently under maintenance. Please try again later.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  itemAdded: 'Item added to cart successfully! 🛒',
  orderPlaced: 'Order placed successfully! 🎉',
  profileUpdated: 'Profile updated successfully!',
  passwordChanged: 'Password changed successfully!',
  emailVerified: 'Email verified successfully!',
  phoneVerified: 'Phone number verified successfully!',
  reviewSubmitted: 'Review submitted successfully!',
  messagesent: 'Message sent successfully!'
} as const

// Validation Rules
export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254
  },
  phone: {
    ghana: /^(\+233|0)[2-9]\d{8}$/,
    international: /^\+?[1-9]\d{1,14}$/
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  otp: {
    length: 6,
    pattern: /^\d{6}$/
  }
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  cart: 'singlespine_cart',
  wishlist: 'singlespine_wishlist',
  recentlyViewed: 'singlespine_recently_viewed',
  searchHistory: 'singlespine_search_history',
  userPreferences: 'singlespine_user_preferences',
  authToken: 'singlespine_auth_token',
  language: 'singlespine_language',
  theme: 'singlespine_theme'
} as const

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  short: 5 * 60 * 1000, // 5 minutes
  medium: 30 * 60 * 1000, // 30 minutes
  long: 2 * 60 * 60 * 1000, // 2 hours
  veryLong: 24 * 60 * 60 * 1000 // 24 hours
} as const

// Rate Limiting
export const RATE_LIMITS = {
  api: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  auth: { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  search: { requests: 30, window: 60 * 1000 }, // 30 requests per minute
  upload: { requests: 10, window: 60 * 1000 } // 10 requests per minute
} as const

// SEO Configuration
export const SEO = {
  defaultTitle: 'Singlespine - Bridging Diaspora & Family',
  titleTemplate: '%s | Singlespine',
  defaultDescription: 'Send gifts to your family and friends in Ghana. Connecting the diaspora during festive seasons and special occasions.',
  keywords: 'ghana gifts, diaspora, family, send gifts ghana, african products, ghanaian food, traditional gifts',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Singlespine',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Singlespine - Bridging Diaspora & Family'
      }
    ]
  },
  twitter: {
    handle: '@singlespine',
    site: '@singlespine',
    cardType: 'summary_large_image'
  }
} as const

// Analytics Configuration
export const ANALYTICS = {
  googleAnalytics: process.env.NEXT_PUBLIC_GA_ID,
  facebookPixel: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  hotjar: process.env.NEXT_PUBLIC_HOTJAR_ID,
  events: {
    pageView: 'page_view',
    addToCart: 'add_to_cart',
    removeFromCart: 'remove_from_cart',
    beginCheckout: 'begin_checkout',
    purchase: 'purchase',
    search: 'search',
    viewItem: 'view_item',
    selectContent: 'select_content',
    signUp: 'sign_up',
    login: 'login'
  }
} as const

// Development Configuration
export const DEV_CONFIG = {
  enableDebugMode: process.env.NODE_ENV === 'development',
  showReduxDevTools: process.env.NODE_ENV === 'development',
  enableMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  apiDelay: process.env.NODE_ENV === 'development' ? 1000 : 0,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
} as const

// Contact Information
export const CONTACT_INFO = {
  email: 'hello@singlespine.com',
  supportEmail: 'support@singlespine.com',
  salesEmail: 'sales@singlespine.com',
  phone: '+1 (555) 123-4567',
  address: {
    street: '123 Innovation Drive',
    city: 'Tech City',
    state: 'TC',
    zip: '12345',
    country: 'United States'
  },
  businessHours: {
    timezone: 'EST',
    days: 'Monday - Friday',
    hours: '9:00 AM - 6:00 PM'
  }
} as const

// Regular Expressions
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  ghanaPhone: /^(\+233|0)[2-9]\d{8}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z]+$/,
  numeric: /^[0-9]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
} as const

// Date Formats
export const DATE_FORMATS = {
  short: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  full: 'EEEE, MMMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'MMM d, yyyy h:mm a',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
} as const

// Business Rules
export const BUSINESS_RULES = {
  minOrderValue: 10, // GHS
  maxOrderValue: 10000, // GHS
  maxCartItems: 50,
  maxWishlistItems: 100,
  reviewCooldownPeriod: 24 * 60 * 60 * 1000, // 24 hours
  returnPeriod: 14 * 24 * 60 * 60 * 1000, // 14 days
  warrantyPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
  maxReviewLength: 1000,
  maxReviewImages: 5,
  maxProductImages: 10
} as const
