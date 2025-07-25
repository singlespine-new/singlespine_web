// Base Types
export type ID = string
export type Timestamp = string // ISO 8601 format
export type Currency = number
export type Rating = number // 0-5
export type Percentage = number // 0-100

// User Types
export interface User {
  id: ID
  name: string
  email?: string
  phone?: string
  image?: string
  role: UserRole
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type UserRole = 'customer' | 'vendor' | 'admin' | 'super_admin'

// Product Types
export interface Product {
  id: ID
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: Currency
  comparePrice?: Currency
  images: string[]
  category: string
  subcategory?: string
  tags: string[]
  isFeatured: boolean
  stock: number
  weight?: number
  dimensions?: ProductDimensions
  origin: string
  vendor: string
  shopId?: ID
  availability: ProductAvailability
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  variants?: ProductVariant[]
  rating?: Rating
  reviewCount?: number
}

export interface ProductVariant {
  id: ID
  productId: ID
  name: string
  value: string
  price?: Currency
  stock?: number
  sku?: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ProductDimensions {
  length?: number
  width?: number
  height?: number
  unit: 'cm' | 'inch'
}

export type ProductAvailability =
  | 'IN_STOCK'
  | 'OUT_OF_STOCK'
  | 'LOW_STOCK'
  | 'PREORDER'
  | 'DISCONTINUED'

// Shop Types
export interface Shop {
  id: ID
  name: string
  slug: string
  description: string
  shortDescription?: string
  image?: string
  coverImage?: string
  ownerId: ID
  rating: Rating
  reviewCount: number
  deliveryTime: string
  deliveryFee: Currency
  minimumOrder: Currency
  address: string
  phone?: string
  email?: string
  website?: string
  established?: string
  openingHours: OpeningHours
  categories: string[]
  tags: string[]
  socialMedia?: SocialMedia
  certifications?: string[]
  isActive: boolean
  isVerified: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface OpeningHours {
  [key: string]: string // e.g., 'MON-FRI': '09:00 - 17:00'
}

export interface SocialMedia {
  instagram?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

// Cart Types
export interface CartItem {
  id: ID
  productId: ID
  variantId?: ID
  name: string
  price: Currency
  quantity: number
  maxQuantity: number
  image: string
  variant?: {
    id: ID
    name: string
    value: string
  }
  metadata?: CartItemMetadata
}

export interface CartItemMetadata {
  weight?: number
  origin?: string
  vendor?: string
  shopId?: ID
}

export interface CartSummary {
  subtotal: Currency
  shippingCost: Currency
  tax?: Currency
  discount?: Currency
  total: Currency
  totalItems: number
  totalWeight?: number
}

export interface Cart {
  items: CartItem[]
  summary: CartSummary
}

// Order Types
export interface Order {
  id: ID
  userId: ID
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  shipping: ShippingInfo
  billing: BillingInfo
  payment: PaymentInfo
  summary: OrderSummary
  notes?: string
  deliveryInstructions?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  deliveredAt?: Timestamp
}

export interface OrderItem {
  id: ID
  productId: ID
  variantId?: ID
  name: string
  price: Currency
  quantity: number
  image: string
  variant?: {
    name: string
    value: string
  }
  shopId?: ID
  vendor?: string
}

export interface OrderSummary {
  subtotal: Currency
  shippingCost: Currency
  tax?: Currency
  discount?: Currency
  total: Currency
  totalItems: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

// Address Types
export interface Address {
  id?: ID
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode?: string
  country: string
  phone?: string
  isDefault?: boolean
}

export interface ShippingInfo extends Address {
  deliveryInstructions?: string
  preferredDeliveryTime?: string
}

export interface BillingInfo extends Address {
  sameAsShipping?: boolean
}

// Payment Types
export interface PaymentInfo {
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  amount: Currency
  currency: string
  processedAt?: Timestamp
}

export type PaymentMethod =
  | 'card'
  | 'mobile_money'
  | 'bank_transfer'
  | 'cash_on_delivery'
  | 'paypal'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

// Review Types
export interface Review {
  id: ID
  userId: ID
  productId?: ID
  shopId?: ID
  rating: Rating
  title?: string
  comment?: string
  images?: string[]
  isVerified: boolean
  isHelpful: number
  createdAt: Timestamp
  updatedAt: Timestamp
  user: {
    name: string
    image?: string
  }
}

// Category Types
export interface Category {
  id: ID
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: ID
  isActive: boolean
  sortOrder: number
  productCount?: number
  children?: Category[]
}

// Search & Filter Types
export interface SearchFilters {
  query?: string
  category?: string
  subcategory?: string
  minPrice?: Currency
  maxPrice?: Currency
  origin?: string
  vendor?: string
  shopId?: ID
  availability?: ProductAvailability
  inStock?: boolean
  featured?: boolean
  tags?: string[]
  rating?: Rating
}

export interface SortOption {
  value: string
  label: string
  field: string
  order: 'asc' | 'desc'
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: unknown
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// UI Component Types
export interface ProductCardProps {
  product: Product
  className?: string
  showQuickAdd?: boolean
  viewMode?: 'grid' | 'list'
  onClick?: (product: Product) => void
}

export interface ShopCardProps {
  shop: Shop
  className?: string
  showProducts?: boolean
  onClick?: (shop: Shop) => void
}

// Form Types
export interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface NewsletterForm {
  email: string
  name?: string
}

export interface LoginForm {
  email?: string
  phone?: string
  password?: string
  otp?: string
  rememberMe?: boolean
}

export interface SignupForm {
  name: string
  email?: string
  phone: string
  password?: string
  confirmPassword?: string
  agreeToTerms: boolean
}

// Notification Types
export interface Notification {
  id: ID
  userId: ID
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: Timestamp
}

export type NotificationType =
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'payment_received'
  | 'low_stock'
  | 'new_review'
  | 'promotion'
  | 'system'

// Analytics Types
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
  userId?: ID
  sessionId?: string
  timestamp: Timestamp
}

// Geography Types
export interface Country {
  code: string
  name: string
  flag?: string
}

export interface Region {
  id: ID
  name: string
  country: string
  isActive: boolean
}

// Delivery Types
export interface DeliveryZone {
  id: ID
  name: string
  regions: string[]
  baseRate: Currency
  freeDeliveryThreshold?: Currency
  estimatedDays: string
  isActive: boolean
}

// Promotional Types
export interface Coupon {
  id: ID
  code: string
  type: CouponType
  value: Currency | Percentage
  minOrderValue?: Currency
  maxDiscount?: Currency
  usageLimit?: number
  usedCount: number
  validFrom: Timestamp
  validUntil: Timestamp
  isActive: boolean
  applicableProducts?: ID[]
  applicableCategories?: string[]
}

export type CouponType = 'fixed' | 'percentage' | 'free_shipping'

// Inventory Types
export interface InventoryItem {
  id: ID
  productId: ID
  variantId?: ID
  sku: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderLevel: number
  lastRestocked?: Timestamp
  cost?: Currency
}

// Wishlist Types
export interface WishlistItem {
  id: ID
  userId: ID
  productId: ID
  variantId?: ID
  addedAt: Timestamp
  product: Product
}

// Settings Types
export interface AppSettings {
  siteName: string
  siteDescription: string
  logo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  currency: string
  locale: string
  timezone: string
  maintenanceMode: boolean
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Timestamp
}

// Utility Types
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WithoutTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>

export type CreateInput<T> = WithoutTimestamps<Omit<T, 'id'>>

export type UpdateInput<T> = Partial<WithoutTimestamps<Omit<T, 'id'>>>
