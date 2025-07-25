// Re-export all constants from different modules
export * from './app'
export * from './categories'
export * from './filters'
export * from './shops'

// Export specific items for easier imports
export {
  API_CONFIG, APP_CONFIG, AUTH_CONFIG, CURRENCY, ORDER_STATUS,
  PAYMENT_CONFIG, SHIPPING_CONFIG, SUPPORTED_COUNTRIES,
  THEME
} from './app'
export { getCategoryById, getCategoryBySlug, PRODUCT_CATEGORIES } from './categories'
export { AVAILABILITY_OPTIONS, CATEGORY_SELECT_OPTIONS, ORIGIN_OPTIONS, SORT_OPTIONS } from './filters'
export { DEFAULT_OPENING_HOURS, GHANA_REGIONS, SHOP_CATEGORIES } from './shops'

// Common utility exports
export const COMMON_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_SEARCH_RESULTS: 100,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
  IMAGE_PLACEHOLDER: '/placeholder-product.jpg',
  SHOP_PLACEHOLDER: '/placeholder-shop.jpg',
  AVATAR_PLACEHOLDER: '/placeholder-avatar.jpg'
} as const

// API Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// Form Field Names
export const FORM_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  PHONE: 'phone',
  NAME: 'name',
  ADDRESS: 'address',
  CITY: 'city',
  COUNTRY: 'country',
  QUANTITY: 'quantity',
  VARIANT: 'variant'
} as const

// Event Names for Analytics
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  SEARCH: 'search',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  SHARE: 'share'
} as const

// UI Component Sizes
export const COMPONENT_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const

// Image Dimensions
export const IMAGE_DIMENSIONS = {
  PRODUCT_CARD: { width: 300, height: 300 },
  PRODUCT_DETAIL: { width: 800, height: 800 },
  SHOP_LOGO: { width: 200, height: 200 },
  SHOP_COVER: { width: 1200, height: 400 },
  USER_AVATAR: { width: 100, height: 100 }
} as const
