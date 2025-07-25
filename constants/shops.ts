import { OpeningHours } from '@/types'

// Shop Categories
export const SHOP_CATEGORIES = [
  { value: '', label: 'All Shop Types' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'grocery', label: 'Grocery Store' },
  { value: 'fashion', label: 'Fashion & Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'butchery', label: 'Butchery' },
  { value: 'crafts', label: 'Arts & Crafts' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'bookstore', label: 'Bookstore' },
  { value: 'beauty', label: 'Beauty & Wellness' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'toys', label: 'Toys & Games' }
]

// Shop Status Options
export const SHOP_STATUS_OPTIONS = [
  { value: '', label: 'All Shops' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'suspended', label: 'Suspended' }
]

// Shop Verification Status
export const VERIFICATION_STATUS = [
  { value: '', label: 'All Verification Status' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending Verification' }
]

// Default Opening Hours Templates
export const DEFAULT_OPENING_HOURS: OpeningHours = {
  'MON-FRI': '09:00 - 17:00',
  'SAT': '10:00 - 16:00',
  'SUN': 'Closed'
}

export const EXTENDED_OPENING_HOURS: OpeningHours = {
  'MON-SAT': '08:00 - 20:00',
  'SUN': '10:00 - 18:00'
}

export const RESTAURANT_OPENING_HOURS: OpeningHours = {
  'MON-THU': '11:00 - 22:00',
  'FRI-SAT': '11:00 - 23:00',
  'SUN': '12:00 - 21:00'
}

export const GROCERY_OPENING_HOURS: OpeningHours = {
  'MON-SUN': '07:00 - 21:00'
}

// Opening Hours Templates
export const OPENING_HOURS_TEMPLATES = [
  {
    id: 'default',
    name: 'Standard Business Hours',
    hours: DEFAULT_OPENING_HOURS
  },
  {
    id: 'extended',
    name: 'Extended Hours',
    hours: EXTENDED_OPENING_HOURS
  },
  {
    id: 'restaurant',
    name: 'Restaurant Hours',
    hours: RESTAURANT_OPENING_HOURS
  },
  {
    id: 'grocery',
    name: 'Grocery Store Hours',
    hours: GROCERY_OPENING_HOURS
  },
  {
    id: 'always-open',
    name: '24/7 Open',
    hours: {
      'MON-SUN': '24 Hours'
    }
  }
]

// Shop Sort Options
export const SHOP_SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'delivery-time', label: 'Fastest Delivery' },
  { value: 'delivery-fee', label: 'Lowest Delivery Fee' },
  { value: 'minimum-order', label: 'Lowest Minimum Order' },
  { value: 'popular', label: 'Most Popular' }
]

// Delivery Time Options
export const DELIVERY_TIME_OPTIONS = [
  { value: '', label: 'Any Time' },
  { value: '0-30', label: 'Under 30 min' },
  { value: '30-60', label: '30-60 min' },
  { value: '60-90', label: '60-90 min' },
  { value: '90+', label: 'Over 90 min' }
]

// Minimum Order Value Options
export const MINIMUM_ORDER_OPTIONS = [
  { value: '', label: 'Any Amount' },
  { value: '0-25', label: 'Under ₵25' },
  { value: '25-50', label: '₵25-₵50' },
  { value: '50-100', label: '₵50-₵100' },
  { value: '100+', label: 'Over ₵100' }
]

// Delivery Fee Options
export const DELIVERY_FEE_OPTIONS = [
  { value: '', label: 'Any Fee' },
  { value: 'free', label: 'Free Delivery' },
  { value: '0-5', label: 'Under ₵5' },
  { value: '5-10', label: '₵5-₵10' },
  { value: '10-15', label: '₵10-₵15' },
  { value: '15+', label: 'Over ₵15' }
]

// Shop Rating Options
export const SHOP_RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4.5+', label: '4.5+ Stars' },
  { value: '4+', label: '4+ Stars' },
  { value: '3.5+', label: '3.5+ Stars' },
  { value: '3+', label: '3+ Stars' }
]

// Shop Certifications
export const SHOP_CERTIFICATIONS = [
  'Verified Business',
  'Organic Certified',
  'Fair Trade',
  'Local Sourcing',
  'Halal Certified',
  'Kosher Certified',
  'FDA Approved',
  'ISO Certified',
  'Eco-Friendly',
  'Woman-Owned',
  'Family Business',
  'Award Winner',
  'Member of Chamber',
  'Licensed Vendor'
]

// Popular Shop Tags
export const SHOP_TAGS = [
  'fast-delivery',
  'organic',
  'local',
  'authentic',
  'premium',
  'budget-friendly',
  'family-owned',
  'artisan',
  'traditional',
  'modern',
  'eco-friendly',
  'award-winning',
  'popular',
  'trending',
  'new',
  'featured',
  'recommended',
  'best-seller',
  'seasonal',
  'gift-shop'
]

// Ghana Regions for Shop Location
export const GHANA_REGIONS = [
  { value: 'greater-accra', label: 'Greater Accra Region' },
  { value: 'ashanti', label: 'Ashanti Region' },
  { value: 'western', label: 'Western Region' },
  { value: 'central', label: 'Central Region' },
  { value: 'eastern', label: 'Eastern Region' },
  { value: 'volta', label: 'Volta Region' },
  { value: 'northern', label: 'Northern Region' },
  { value: 'upper-east', label: 'Upper East Region' },
  { value: 'upper-west', label: 'Upper West Region' },
  { value: 'brong-ahafo', label: 'Brong-Ahafo Region' },
  { value: 'western-north', label: 'Western North Region' },
  { value: 'ahafo', label: 'Ahafo Region' },
  { value: 'bono', label: 'Bono Region' },
  { value: 'bono-east', label: 'Bono East Region' },
  { value: 'oti', label: 'Oti Region' },
  { value: 'savannah', label: 'Savannah Region' },
  { value: 'north-east', label: 'North East Region' }
]

// Major Cities in Ghana
export const GHANA_CITIES = [
  { value: 'accra', label: 'Accra', region: 'greater-accra' },
  { value: 'kumasi', label: 'Kumasi', region: 'ashanti' },
  { value: 'tamale', label: 'Tamale', region: 'northern' },
  { value: 'sekondi-takoradi', label: 'Sekondi-Takoradi', region: 'western' },
  { value: 'cape-coast', label: 'Cape Coast', region: 'central' },
  { value: 'koforidua', label: 'Koforidua', region: 'eastern' },
  { value: 'ho', label: 'Ho', region: 'volta' },
  { value: 'sunyani', label: 'Sunyani', region: 'brong-ahafo' },
  { value: 'wa', label: 'Wa', region: 'upper-west' },
  { value: 'bolgatanga', label: 'Bolgatanga', region: 'upper-east' },
  { value: 'tema', label: 'Tema', region: 'greater-accra' },
  { value: 'osu', label: 'Osu', region: 'greater-accra' },
  { value: 'east-legon', label: 'East Legon', region: 'greater-accra' },
  { value: 'airport-residential', label: 'Airport Residential', region: 'greater-accra' },
  { value: 'cantonments', label: 'Cantonments', region: 'greater-accra' }
]

// Shop Performance Metrics
export const SHOP_METRICS = {
  EXCELLENT_RATING: 4.5,
  GOOD_RATING: 4.0,
  AVERAGE_RATING: 3.0,
  FAST_DELIVERY: 30, // minutes
  STANDARD_DELIVERY: 60, // minutes
  HIGH_MINIMUM_ORDER: 100, // GHS
  LOW_DELIVERY_FEE: 5, // GHS
  FREE_DELIVERY_THRESHOLD: 50 // GHS
}

// Shop Features/Services
export const SHOP_FEATURES = [
  { id: 'online-payment', label: 'Online Payment', icon: 'CreditCard' },
  { id: 'cash-on-delivery', label: 'Cash on Delivery', icon: 'Banknote' },
  { id: 'mobile-money', label: 'Mobile Money', icon: 'Smartphone' },
  { id: 'free-delivery', label: 'Free Delivery Available', icon: 'Truck' },
  { id: 'same-day-delivery', label: 'Same Day Delivery', icon: 'Clock' },
  { id: 'bulk-orders', label: 'Bulk Orders', icon: 'Package' },
  { id: 'gift-wrapping', label: 'Gift Wrapping', icon: 'Gift' },
  { id: 'loyalty-program', label: 'Loyalty Program', icon: 'Award' },
  { id: 'customer-support', label: '24/7 Customer Support', icon: 'Headphones' },
  { id: 'return-policy', label: 'Return Policy', icon: 'RotateCcw' },
  { id: 'warranty', label: 'Warranty Available', icon: 'Shield' },
  { id: 'installation', label: 'Installation Service', icon: 'Wrench' }
]

// Default Shop Configuration
export const DEFAULT_SHOP_CONFIG = {
  deliveryFee: 10,
  minimumOrder: 25,
  deliveryTime: '30-45 min',
  rating: 0,
  reviewCount: 0,
  isActive: true,
  isVerified: false,
  categories: [],
  tags: [],
  certifications: [],
  openingHours: DEFAULT_OPENING_HOURS
}

// Shop Application Status
export const SHOP_APPLICATION_STATUS = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'submitted', label: 'Submitted', color: 'blue' },
  { value: 'under-review', label: 'Under Review', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'resubmission-required', label: 'Resubmission Required', color: 'orange' }
]

// Shop Dashboard Quick Stats
export const SHOP_QUICK_STATS = [
  { id: 'total-orders', label: 'Total Orders', icon: 'ShoppingBag' },
  { id: 'revenue', label: 'Revenue', icon: 'DollarSign' },
  { id: 'customers', label: 'Customers', icon: 'Users' },
  { id: 'products', label: 'Products', icon: 'Package' },
  { id: 'reviews', label: 'Reviews', icon: 'Star' },
  { id: 'rating', label: 'Rating', icon: 'TrendingUp' }
]

// Utility functions
export const getShopCategoryLabel = (value: string): string => {
  const category = SHOP_CATEGORIES.find(cat => cat.value === value)
  return category?.label || value
}

export const getRegionLabel = (value: string): string => {
  const region = GHANA_REGIONS.find(region => region.value === value)
  return region?.label || value
}

export const getCityLabel = (value: string): string => {
  const city = GHANA_CITIES.find(city => city.value === value)
  return city?.label || value
}

export const formatOpeningHours = (hours: OpeningHours): string[] => {
  return Object.entries(hours).map(([days, time]) => `${days}: ${time}`)
}

export const isShopOpen = (openingHours: OpeningHours, date: Date = new Date()): boolean => {
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const currentDay = dayNames[date.getDay()]

  // Find matching day pattern
  for (const [dayPattern, hours] of Object.entries(openingHours)) {
    if (hours.toLowerCase().includes('closed')) continue
    if (hours === '24 Hours') return true

    // Check if current day matches pattern
    if (dayPattern.includes(currentDay) || dayPattern.includes('-')) {
      // Simple check - in real implementation, you'd parse the time ranges
      return true
    }
  }

  return false
}

export const getShopRatingColor = (rating: number): string => {
  if (rating >= SHOP_METRICS.EXCELLENT_RATING) return 'green'
  if (rating >= SHOP_METRICS.GOOD_RATING) return 'blue'
  if (rating >= SHOP_METRICS.AVERAGE_RATING) return 'yellow'
  return 'red'
}

export const formatDeliveryTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}
