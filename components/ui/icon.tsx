import * as React from 'react'
import {
  // Status / feedback
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Circle,
  CircleDot,
  XCircle,
  // Commerce / product
  ShoppingCart,
  ShoppingBag,
  Package,
  Package2,
  Truck,
  Percent,
  Gift,
  Wallet,
  // User / identity
  User,
  Users,
  Mail,
  Phone,
  Lock,
  Shield,
  Heart,
  Star,
  Smile,
  // Location / navigation
  MapPin,
  Globe2,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  RefreshCcw,
  // Actions / misc
  Plus,
  Minus,
  X,
  Trash2,
  Copy,
  Download,
  Share2,
  Settings,
  CreditCard,
  Eye,
  Edit3,
  LogOut,
  Search,
  Filter,
  Calendar,
  MessageCircle,
  MoreHorizontal,
  TrendingUp,
  Zap,
  SortDesc,
  ChevronDown,
  ExternalLink,
  Clock,
  Save,
  Tag,
  // Newly added for global replacement
  ChevronRight,
  ChevronLeft,
  Facebook,
  Instagram,
  Twitter,
  Smartphone,
  Building,
  Building2,
  Banknote,
  Grid,
  List
} from 'lucide-react'

/**
 * Centralized icon registry and unified <UIIcon /> component.
 *
 * Benefits:
 * - Consistent sizing & theming
 * - Single semantic naming layer (future-proof if library changes)
 * - Unified accessibility handling (decorative vs semantic)
 * - Encourages reuse and prevents ad-hoc mismatches
 *
 * Default behavior:
 * - Decorative (aria-hidden) unless you set decorative={false}
 * - Sizing via size prop (number or preset key)
 * - Optional spin for loading states
 */

export type IconName =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'neutral'
  | 'dot'
  | 'close'
  | 'close-circle'
  | 'cart'
  | 'cart-bag'
  | 'package'
  | 'package-alt'
  | 'shopping-bag'
  | 'truck'
  | 'discount'
  | 'gift'
  | 'wallet'
  | 'user'
  | 'users'
  | 'mail'
  | 'phone'
  | 'lock'
  | 'shield'
  | 'heart'
  | 'star'
  | 'smile'
  | 'location'
  | 'globe'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'refresh'
  | 'plus'
  | 'percent'
  | 'minus'
  | 'trash'
  | 'copy'
  | 'download'
  | 'share'
  | 'settings'
  | 'credit-card'
  | 'eye'
  | 'edit'
  | 'logout'
  | 'search'
  | 'filter'
  | 'calendar'
  | 'message'
  | 'more'
  | 'trending-up'
  | 'zap'
  | 'sort-desc'
  | 'chevron-down'
  | 'external-link'
  | 'clock'
  | 'save'
  | 'tag'
  | 'chevron-right'
  | 'chevron-left'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'smartphone'
  | 'building'
  | 'building-2'
  | 'banknote'
  | 'grid'
  | 'list'

const ICON_MAP: Record<IconName, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // Status
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
  neutral: Circle,
  dot: CircleDot,
  // Close
  close: X,
  'close-circle': XCircle,

  // Commerce
  cart: ShoppingCart,
  'cart-bag': ShoppingBag,
  package: Package,
  truck: Truck,
  discount: Percent,
  percent: Percent,
  gift: Gift,
  wallet: Wallet,
  save: Save,
  tag: Tag,

  // People
  user: User,
  users: Users,
  mail: Mail,
  phone: Phone,
  lock: Lock,
  shield: Shield,
  heart: Heart,
  star: Star,
  smile: Smile,

  // Location / nav
  location: MapPin,
  globe: Globe2,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  refresh: RefreshCcw,

  // Actions / misc
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  copy: Copy,
  download: Download,
  share: Share2,
  settings: Settings,
  'credit-card': CreditCard,
  eye: Eye,
  edit: Edit3,
  logout: LogOut,
  search: Search,
  filter: Filter,
  calendar: Calendar,
  message: MessageCircle,
  more: MoreHorizontal,
  'trending-up': TrendingUp,
  zap: Zap,
  'sort-desc': SortDesc,
  'chevron-down': ChevronDown,
  'external-link': ExternalLink,
  'package-alt': Package2,
  'shopping-bag': ShoppingBag,
  clock: Clock,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  smartphone: Smartphone,
  building: Building,
  'building-2': Building2,
  banknote: Banknote,
  grid: Grid,
  list: List
}

const SIZE_PRESETS = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
}
type SizePreset = keyof typeof SIZE_PRESETS

/**
 * Broadened name typing to allow dynamic (string) icon names from runtime data
 * while still providing strong autocomplete via the IconName union.
 * Any string not in the registry falls back to a neutral placeholder (or provided fallbackName).
 */
export interface UIIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name' | 'ref'> {
  name: IconName | (string & {})
  size?: number | SizePreset
  strokeWidth?: number | string
  decorative?: boolean
  label?: string
  spin?: boolean
  /**
   * Fallback icon to render if a dynamic string does not match a known IconName.
   */
  fallbackName?: IconName
  square?: boolean
  className?: string
}

function humanize(name: string) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export const UIIcon = React.forwardRef<SVGSVGElement, UIIconProps>(
  (
    {
      name,
      size = 'md',
      strokeWidth = 2,
      decorative = true,
      label,
      spin = false,
      fallbackName,
      className,
      square = true,
      ...rest
    },
    ref
  ) => {
    // Runtime type guard: only treat the name as a registered icon if it exists in ICON_MAP
    let Comp = (ICON_MAP as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[name as string]
    if (!Comp && fallbackName) {
      Comp = ICON_MAP[fallbackName]
    }

    if (!Comp) {
      const px = typeof size === 'number' ? size : SIZE_PRESETS[size] || SIZE_PRESETS.md
      return (
        <span
          style={{ width: px, height: px }}
          className="inline-block rounded-sm bg-muted shrink-0"
          aria-hidden="true"
          data-unknown-icon={name}
        />
      )
    }

    const pixelSize =
      typeof size === 'number'
        ? size
        : SIZE_PRESETS[(size as SizePreset)] || SIZE_PRESETS.md

    const numericStrokeWidth =
      typeof strokeWidth === 'string'
        ? (Number.parseFloat(strokeWidth) || 2)
        : strokeWidth

    const a11yProps = decorative
      ? { 'aria-hidden': true }
      : { role: 'img', 'aria-label': label || humanize(name) }

    return (
      <Comp
        ref={ref}
        width={pixelSize}
        height={pixelSize}
        strokeWidth={numericStrokeWidth}
        className={[
          'inline-block align-middle',
          square ? 'shrink-0' : '',
          spin ? 'animate-spin' : '',
          className || ''
        ].filter(Boolean).join(' ')}
        {...a11yProps}
        {...rest}
      />
    )
  }
)
UIIcon.displayName = 'UIIcon'

/**
 * Convenience factory to create a locally pre-configured Icon component.
 * Example:
 *   const useMutedIcons = createIconFactory({ className: 'text-muted-foreground', size: 'sm' })
 *   const { Icon } = useMutedIcons()
 *   <Icon name="cart" />
 */
export function createIconFactory(defaults?: Partial<Pick<UIIconProps,
  'size' | 'strokeWidth' | 'className' | 'decorative'
>>) {
  return function useIconFactory() {
    const Icon: React.FC<UIIconProps> = props => (
      <UIIcon
        {...defaults}
        {...props}
        className={[defaults?.className || '', props.className || ''].join(' ').trim()}
      />
    )
    return { Icon }
  }
}

/**
 * makeIcon
 * Lightweight helper to generate a typed, memo-friendly icon component
 * without needing to declare an adapter each time. Prefer for inline
 * usage scenarios (e.g. const SaveIcon = makeIcon('save')).
 *
 * Example:
 *   const SaveIcon = makeIcon('save')
 *   <SaveIcon size={18} className="text-primary" />
 */
export function makeIcon(name: IconName, base?: Partial<Pick<UIIconProps, 'size' | 'strokeWidth' | 'className' | 'decorative'>>) {
  const Comp: React.FC<Omit<UIIconProps, 'name'>> = ({
    size = base?.size,
    strokeWidth = base?.strokeWidth,
    className,
    decorative = base?.decorative ?? true,
    ...rest
  }) => (
    <UIIcon
      name={name}
      size={size}
      strokeWidth={strokeWidth}
      decorative={decorative}
      className={[base?.className || '', className || ''].join(' ').trim()}
      {...rest}
    />
  )
  Comp.displayName = `Icon(${name})`
  return Comp
}

/**
 * Export read-only registry list (useful for analytics / linting).
 */
export const ICON_REGISTRY: readonly IconName[] = Object.freeze(
  Object.keys(ICON_MAP) as IconName[]
)
