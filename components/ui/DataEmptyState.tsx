import * as React from 'react'
import { UIIcon, IconName } from '@/components/ui/icon'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

/**
 * Shared, accessible, brand‑aligned empty state component.
 *
 * Goals:
 * - Consistent styling across Orders, Wishlist, Cart, Search, etc.
 * - Light & dark friendly (uses design tokens)
 * - Optional illustrative icon, actions, and suggestion pills
 * - Safe defaults (non-intrusive, responsive)
 *
 * Example:
 *  <DataEmptyState
 *    icon={{ name: 'package', tone: 'primary' }}
 *    title="No Orders Yet"
 *    description="Once you place an order it will appear here with tracking and delivery details."
 *    primaryAction={{ label: 'Start Shopping', onClick: () => router.push('/products') }}
 *    secondaryAction={{ label: 'How It Works', onClick: () => router.push('/how-it-works'), variant: 'outline' }}
 *    suggestions={[
 *      { label: 'Browse Categories', onClick: () => openCategories() },
 *      { label: 'View Wishlist', onClick: () => router.push('/wishlist') }
 *    ]}
 *  />
 */

export interface DataEmptyStateAction {
  label: string
  onClick: () => void
  /**
   * Optional variant override for Button component
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /**
   * Optional leading icon (UIIcon name)
   */
  iconName?: IconName
  /**
   * Optional aria-label override if label is not descriptive enough
   */
  ariaLabel?: string
}

export interface DataEmptyStateSuggestion {
  label: string
  onClick: () => void
  iconName?: IconName
  ariaLabel?: string
}

export interface DataEmptyStateProps {
  /**
   * Title / heading text (concise)
   */
  title: string
  /**
   * Supporting explanatory text (1–3 lines)
   */
  description?: string | React.ReactNode
  /**
   * Main call to action (prominent button)
   */
  primaryAction?: DataEmptyStateAction
  /**
   * Secondary call to action (outline or subtle)
   */
  secondaryAction?: DataEmptyStateAction
  /**
   * Optional additional children (custom content)
   */
  children?: React.ReactNode
  /**
   * Optional icon configuration or custom ReactNode
   */
  icon?:
  | {
    name: IconName
    /**
     * Visual tone for background
     */
    tone?: 'primary' | 'muted' | 'info' | 'success' | 'danger' | 'warning'
    /**
     * Size in pixels (default 48)
     */
    size?: number
    /**
     * Override icon className
     */
    className?: string
  }
  | {
    custom: React.ReactNode
  }
  /**
   * Optional list of quick suggestion chips/pills
   */
  suggestions?: DataEmptyStateSuggestion[]
  /**
   * Layout density
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Visual style variant
   */
  variant?: 'subtle' | 'card' | 'ghost' | 'gradient'
  /**
   * Center horizontally (default true)
   */
  center?: boolean
  /**
   * Allows overriding outer container className
   */
  className?: string
  /**
   * Test id for QA automation
   */
  'data-testid'?: string
}

const toneMap: Record<
  NonNullable<Extract<DataEmptyStateProps['icon'], { name: IconName }>['tone']>,
  { bg: string; fg: string; ring: string }
> = {
  primary: {
    bg: 'bg-primary/10 dark:bg-primary/15',
    fg: 'text-primary',
    ring: 'ring-primary/25'
  },
  muted: {
    bg: 'bg-muted/50 dark:bg-muted/30',
    fg: 'text-muted-foreground',
    ring: 'ring-muted/30'
  },
  info: {
    bg: 'bg-blue-100/60 dark:bg-blue-400/10',
    fg: 'text-blue-600 dark:text-blue-300',
    ring: 'ring-blue-300/40'
  },
  success: {
    bg: 'bg-emerald-100/60 dark:bg-emerald-400/10',
    fg: 'text-emerald-600 dark:text-emerald-300',
    ring: 'ring-emerald-300/40'
  },
  danger: {
    bg: 'bg-red-100/60 dark:bg-red-400/10',
    fg: 'text-red-600 dark:text-red-300',
    ring: 'ring-red-300/40'
  },
  warning: {
    bg: 'bg-amber-100/60 dark:bg-amber-400/10',
    fg: 'text-amber-600 dark:text-amber-300',
    ring: 'ring-amber-300/40'
  }
}

const variantWrapperClasses: Record<
  NonNullable<DataEmptyStateProps['variant']>,
  string
> = {
  subtle:
    'bg-transparent border-none shadow-none backdrop-blur-none',
  card:
    'bg-card/80 backdrop-blur-sm border border-border/60 shadow-sm dark:shadow-none',
  ghost:
    'bg-background/40 dark:bg-background/30 border border-border/40',
  gradient:
    'bg-gradient-to-br from-background/70 via-background/60 to-primary/5 dark:from-background/50 dark:to-primary/10 border border-border/50 backdrop-blur-sm shadow-sm'
}

const sizeMap = {
  sm: {
    gap: 'gap-4',
    pad: 'px-5 py-6',
    title: 'text-lg',
    desc: 'text-sm',
    iconWrap: 'h-14 w-14',
    iconSize: 28
  },
  md: {
    gap: 'gap-5',
    pad: 'px-7 py-8',
    title: 'text-xl md:text-2xl',
    desc: 'text-sm md:text-base',
    iconWrap: 'h-16 w-16',
    iconSize: 36
  },
  lg: {
    gap: 'gap-6',
    pad: 'px-8 py-10 md:px-10',
    title: 'text-2xl md:text-3xl',
    desc: 'text-base md:text-lg',
    iconWrap: 'h-20 w-20',
    iconSize: 44
  }
}

export const DataEmptyState: React.FC<DataEmptyStateProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon,
  suggestions,
  children,
  size = 'md',
  variant = 'card',
  center = true,
  className,
  'data-testid': testId
}) => {
  const sizeCfg = sizeMap[size]

  const renderIcon = () => {
    if (!icon) return null
    if ('custom' in icon) {
      return (
        <div
          className={cn(
            'relative flex items-center justify-center rounded-xl ring-1',
            'ring-border/40 bg-muted/30',
            sizeCfg.iconWrap
          )}
        >
          {icon.custom}
        </div>
      )
    }
    const tone = toneMap[icon.tone || 'primary']
    return (
      <div
        className={cn(
          'relative flex items-center justify-center rounded-2xl ring-1',
          tone.bg,
          tone.ring,
          'shadow-sm',
          sizeCfg.iconWrap
        )}
        aria-hidden="true"
      >
        <UIIcon
          name={icon.name}
          size={icon.size || sizeCfg.iconSize}
          className={cn(tone.fg, icon.className)}
        />
      </div>
    )
  }

  const ActionButton = (a: DataEmptyStateAction, key: string, primary = false) => {
    const btnVariant =
      a.variant || (primary ? 'default' : 'outline')

    return (
      <Button
        key={key}
        variant={btnVariant}
        onClick={a.onClick}
        aria-label={a.ariaLabel || a.label}
        className={cn(
          'h-11 rounded-xl font-medium',
          primary ? 'shadow-sm hover:shadow-md transition-shadow' : '',
          !primary && btnVariant === 'outline'
            ? 'border-border/60 hover:border-primary/40'
            : ''
        )}
      >
        {a.iconName && (
          <UIIcon
            name={a.iconName}
            size={16}
            className="mr-2 opacity-80"
          />
        )}
        {a.label}
      </Button>
    )
  }

  return (
    <section
      data-testid={testId}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'flex flex-col',
        variantWrapperClasses[variant],
        sizeCfg.pad,
        center && 'items-center text-center',
        !center && 'text-left',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Decorative subtle gradient aura */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_70%)]"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[400px] bg-primary/10 blur-3xl rounded-full" />
      </div>

      <div className={cn('relative flex flex-col', sizeCfg.gap, center && 'items-center')}>
        {renderIcon()}
        <div className="space-y-3 max-w-xl">
          <h2 className={cn('font-semibold tracking-tight', sizeCfg.title)}>
            {title}
          </h2>
          {description && (
            <div
              className={cn(
                'text-muted-foreground leading-relaxed',
                sizeCfg.desc
              )}
            >
              {description}
            </div>
          )}
        </div>

        {(primaryAction || secondaryAction) && (
          <div
            className={cn(
              'flex flex-col sm:flex-row sm:items-center gap-3 pt-2',
              center && 'justify-center'
            )}
          >
            {primaryAction && ActionButton(primaryAction, 'primary', true)}
            {secondaryAction && ActionButton(secondaryAction, 'secondary', false)}
          </div>
        )}

        {suggestions && suggestions.length > 0 && (
          <div
            className={cn(
              'flex flex-wrap gap-2 pt-4',
              center && 'justify-center'
            )}
            aria-label="Quick suggestions"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={s.onClick}
                aria-label={s.ariaLabel || s.label}
                className={cn(
                  'group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                  'bg-muted/60 hover:bg-muted/80 dark:bg-muted/40 dark:hover:bg-muted/60',
                  'text-muted-foreground hover:text-foreground',
                  'transition-colors border border-border/50'
                )}
              >
                {s.iconName && (
                  <UIIcon
                    name={s.iconName}
                    size={14}
                    className="opacity-70 group-hover:opacity-90 transition-opacity"
                  />
                )}
                {s.label}
              </button>
            ))}
          </div>
        )}

        {children && (
          <div className="w-full pt-4">
            {children}
          </div>
        )}
      </div>
    </section>
  )
}

DataEmptyState.displayName = 'DataEmptyState'

/* -------------------------------------------------------------------------- */
/* Convenience Presets                                                        */
/* -------------------------------------------------------------------------- */

interface PresetArgs
  extends Omit<DataEmptyStateProps, 'title' | 'icon'> {
  /**
   * Optional description override specifically for preset convenience.
   * (Included explicitly because we do not omit it above anymore.)
   */
  description?: DataEmptyStateProps['description']
  /**
   * Additional descriptive context if needed.
   */
  contextNote?: string
}

/**
 * Orders empty state preset
 */
export const OrdersEmptyState: React.FC<PresetArgs> = (props) => {
  return (
    <DataEmptyState
      title="No Orders Found"
      description={
        props.description ||
        'You have not placed any orders yet. Once you complete a purchase, your order timeline will appear here.'
      }
      icon={{ name: 'package-alt', tone: 'primary' }}
      primaryAction={
        props.primaryAction || {
          label: 'Start Shopping',
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/products'
            }
          },
          iconName: 'shopping-bag'
        }
      }
      secondaryAction={
        props.secondaryAction || {
          label: 'How It Works',
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/how-it-works'
            }
          },
          variant: 'outline'
        }
      }
      suggestions={
        props.suggestions || [
          {
            label: 'View Wishlist',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/wishlist'
              }
            },
            iconName: 'heart'
          },
          {
            label: 'Track Delivery',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/orders?tab=tracking'
              }
            },
            iconName: 'truck'
          }
        ]
      }
      {...props}
    />
  )
}

/**
 * Wishlist empty state preset
 */
export const WishlistEmptyState: React.FC<PresetArgs> = (props) => {
  return (
    <DataEmptyState
      title="Wishlist is Empty"
      description={
        props.description ||
        'Start saving items you love. We will keep them here so you can build the perfect delivery.'
      }
      icon={{ name: 'heart', tone: 'primary' }}
      primaryAction={
        props.primaryAction || {
          label: 'Browse Products',
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/products'
            }
          },
          iconName: 'cart'
        }
      }
      secondaryAction={
        props.secondaryAction || {
          label: 'Recently Viewed',
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/recent'
            }
          },
          variant: 'outline'
        }
      }
      suggestions={
        props.suggestions || [
          {
            label: 'Popular Items',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/products?sort=popular'
              }
            },
            iconName: 'trending-up'
          },
          {
            label: 'Gift Ideas',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/collections/gifts'
              }
            },
            iconName: 'gift'
          }
        ]
      }
      {...props}
    />
  )
}

/**
 * Generic search empty state preset
 */
export const SearchEmptyState: React.FC<PresetArgs & { query?: string }> = ({
  query,
  ...rest
}) => {
  return (
    <DataEmptyState
      title="No Results"
      description={
        rest.description ||
        (query
          ? `We couldn't find any matches for "${query}". Try different keywords or filters.`
          : "We couldn't find any matching items. Adjust your search or filters and try again.")
      }
      icon={{ name: 'search', tone: 'muted' }}
      primaryAction={
        rest.primaryAction || {
          label: 'Clear Filters',
          onClick: () => {
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.search = ''
              window.location.href = url.toString()
            }
          },
          iconName: 'refresh'
        }
      }
      secondaryAction={
        rest.secondaryAction || {
          label: 'Browse Categories',
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/categories'
            }
          },
          variant: 'outline'
        }
      }
      suggestions={
        rest.suggestions || [
          {
            label: 'New Arrivals',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/products?sort=new'
              }
            },
            iconName: 'star'
          },
          {
            label: 'Best Sellers',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/products?sort=best'
              }
            },
            iconName: 'trending-up'
          }
        ]
      }
      {...rest}
    />
  )
}

export default DataEmptyState
