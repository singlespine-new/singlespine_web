'use client'

/**
 * Professional, subtle, accessible toast system built on react-hot-toast.
 *
 * Refinements (v2):
 * - Softer translucent surface with adaptive gradient border + refined shadow stack.
 * - Mobile–aware positioning: bottom-center on small screens to reduce overlap with side drawers.
 * - More "quiet" visual hierarchy: slimmer progress bar, gentler colors, reduced motion-friendly.
 * - Improved focus & hover affordances without drawing excessive attention.
 * - Progress bar now less dominant; accent bar responds to hover (slightly brighter).
 * - Structural attributes (data-variant) for future theming / analytics hooks.
 *
 * Still Provides:
 * - Title + optional description, action, dismiss button.
 * - Variants: success | error | warning | info | loading | neutral.
 * - Concurrency capping (oldest removed past MAX_ACTIVE).
 * - Promise helper + accessible ARIA roles (alert for destructive, status otherwise).
 *
 * Usage Examples:
 *   toast.success('Saved')
 *   toast.info('Profile updated', { description: 'It may take a minute to propagate.' })
 *   toast.action({ title: 'Item added', action: { label: 'Undo', onClick: () => handleUndo() } })
 *   toast.promise(fetch(...), { loading: 'Saving…', success: 'Done!', error: 'Failed.' })
  */

import React, { useEffect } from 'react'
import hotToast, { Toast, Toaster, ToastOptions } from 'react-hot-toast'
import { UIIcon } from '@/components/ui/icon'

/**
 * Default icon elements mapped by variant using unified UIIcon registry.
 * (Replaces previous direct lucide-react icon usage.)
 */
const TOAST_VARIANT_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <UIIcon name="success" size={18} className="shrink-0" />,
  error: <UIIcon name="error" size={18} className="shrink-0" />,
  warning: <UIIcon name="warning" size={18} className="shrink-0" />,
  info: <UIIcon name="info" size={18} className="shrink-0" />,
  loading: <UIIcon name="loading" size={18} spin className="shrink-0" />,
  neutral: <UIIcon name="dot" size={18} className="shrink-0" />
}

/* ---------------------------------- Types ---------------------------------- */

type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'neutral'

interface BaseToastOptions {
  /**
   * Main message (short, single-line ideal).
   * Alias: title
   */
  title?: string
  /**
   * Secondary explanatory text (wraps / multi-line).
   */
  description?: string
  /**
   * Milliseconds before auto-dismiss. 0 = persistent until dismissed.
   */
  duration?: number
  /**
   * Override variant.
   */
  variant?: ToastVariant
  /**
   * Custom icon element.
   */
  icon?: React.ReactNode
  /**
   * If true, hides the close button.
   */
  hideClose?: boolean
  /**
   * If true, hides the lifetime progress bar.
   */
  hideProgress?: boolean
  /**
   * Callback when toast fully exits (after animation).
   */
  onDismiss?: () => void
  /**
   * Custom ARIA role override (defaults: alert for destructive / status for others).
   */
  role?: 'alert' | 'status'
  /**
   * Optional primary action (button).
   */
  action?: {
    label: string
    onClick: (dismiss: () => void) => void
    /**
     * Provide a semantic label if needed for screen readers.
     */
    ariaLabel?: string
  }
  /**
   * Additional className adjustments
   */
  className?: string
}

interface ActionToastInput extends BaseToastOptions {
  title: string
  variant?: ToastVariant
}

/* ----------------------------- Styling Helpers ----------------------------- */

const variantStyles: Record<
  ToastVariant,
  {
    ring: string
    iconWrap: string
    iconColor: string
    accentBar: string
    progressColor: string
  }
> = {
  success: {
    ring: 'ring-emerald-300/30',
    iconWrap:
      'bg-emerald-100/70 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    accentBar: 'from-emerald-500/60 to-emerald-400/60',
    progressColor: 'bg-emerald-500'
  },
  error: {
    ring: 'ring-red-300/30',
    iconWrap: 'bg-red-100/70 text-red-700 dark:bg-red-400/10 dark:text-red-300',
    iconColor: 'text-red-600 dark:text-red-300',
    accentBar: 'from-red-500/60 to-red-400/60',
    progressColor: 'bg-red-500'
  },
  warning: {
    ring: 'ring-amber-300/30',
    iconWrap:
      'bg-amber-100/70 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
    iconColor: 'text-amber-600 dark:text-amber-300',
    accentBar: 'from-amber-500/60 to-amber-400/60',
    progressColor: 'bg-amber-500'
  },
  info: {
    ring: 'ring-sky-300/30',
    iconWrap: 'bg-sky-100/70 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
    iconColor: 'text-sky-600 dark:text-sky-300',
    accentBar: 'from-sky-500/60 to-sky-400/60',
    progressColor: 'bg-sky-500'
  },
  loading: {
    ring: 'ring-indigo-300/30',
    iconWrap:
      'bg-indigo-100/70 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300',
    iconColor: 'text-indigo-600 dark:text-indigo-300',
    accentBar: 'from-indigo-500/60 to-indigo-400/60',
    progressColor: 'bg-indigo-500'
  },
  neutral: {
    ring: 'ring-zinc-300/30',
    iconWrap:
      'bg-zinc-200/60 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300',
    iconColor: 'text-zinc-600 dark:text-zinc-300',
    accentBar: 'from-zinc-400/70 to-zinc-300/70',
    progressColor: 'bg-zinc-500'
  }
}



/* ---------------------------- Internal Component --------------------------- */

interface InternalCustomToastProps extends BaseToastOptions {
  t: Toast
  title: string
  variant: ToastVariant
}

const InternalToast: React.FC<InternalCustomToastProps> = ({
  t,
  title,
  description,
  variant,
  icon,
  hideClose,
  hideProgress,
  duration,
  action,
  onDismiss,
  role,
  className
}) => {
  const styles = variantStyles[variant] || variantStyles.neutral
  const isDestructive = variant === 'error'
  const ariaRole = role || (isDestructive ? 'alert' : 'status')

  useEffect(() => {
    if (!t.visible && onDismiss) {
      // Trigger after a slight delay to ensure exit animation completion
      const timer = setTimeout(() => onDismiss(), 160)
      return () => clearTimeout(timer)
    }
  }, [t.visible, onDismiss])

  return (
    <div
      role={ariaRole}
      aria-live={isDestructive ? 'assertive' : 'polite'}
      className={[
        'group pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl touch-pan-y',
        'backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/55 bg-white/85 dark:bg-zinc-900/85',
        'shadow-[0_4px_14px_-4px_rgba(0,0,0,0.15),0_1px_0_0_rgba(255,255,255,0.3)] dark:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.55),0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-white/40 dark:ring-zinc-700/40',
        styles.ring,
        'flex flex-col px-4 py-3 sm:px-5 sm:py-4 data-[compact=true]:py-2.5',
        'transition-all duration-150 motion-reduce:transition-none',
        t.visible
          ? 'animate-[toastSlideIn_0.28s_cubic-bezier(.4,.6,.3,1)_forwards]'
          : 'animate-[toastSlideOut_0.18s_ease-in_forwards] opacity-0',
        'will-change-transform',
        className || ''
      ].join(' ')}
      style={{
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Accent gradient bar */}
      <div
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${styles.accentBar} opacity-70 transition-opacity duration-300 group-hover:opacity-90`}
      />

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={[
            'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
            'shadow-inner shadow-black/5 ring-1 ring-inset ring-black/5 dark:ring-white/5',
            styles.iconWrap
          ].join(' ')}
          aria-hidden="true"
        >
          <span className={styles.iconColor}>
            {icon || TOAST_VARIANT_ICONS[variant]}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 leading-snug">
            {title}
          </p>
          {description && (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-4">
              {description}
            </p>
          )}

          {action && (
            <div className="mt-3">
              <button
                onClick={() => action.onClick(() => hotToast.dismiss(t.id))}
                aria-label={action.ariaLabel || action.label}
                className={[
                  'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium',
                  'border border-transparent',
                  'bg-zinc-900/90 text-white dark:bg-zinc-100 dark:text-zinc-900',
                  'hover:bg-zinc-900 dark:hover:bg-white',
                  'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400/50 dark:focus-visible:ring-white/40',
                  'active:scale-[.97]'
                ].join(' ')}
              >
                {action.label}
                <UIIcon name="dot" size={12} className="opacity-70" />
              </button>
            </div>
          )}
        </div>

        {/* Close */}
        {!hideClose && (
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className={[
              'relative -mr-1 -mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md',
              'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
              'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400/40 dark:focus-visible:ring-white/30'
            ].join(' ')}
            aria-label="Dismiss notification"
          >
            <UIIcon name="close" size={16} />
          </button>
        )}
      </div>

      {/* Lifetime progress bar */}
      {!hideProgress && duration && duration > 0 && (
        <div className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-zinc-300/25 dark:bg-zinc-600/25">
          <div
            className={[
              'h-full origin-left rounded-full bg-gradient-to-r from-white/60 via-white/10 to-transparent dark:from-zinc-200/40 dark:via-zinc-200/10 dark:to-transparent',
              styles.progressColor,
              'opacity-90 group-hover:opacity-100 transition-opacity animate-[toastProgress_linear_forwards]'
            ].join(' ')}
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Toast Wrapper ------------------------------ */

/**
 * Maximum simultaneous toasts (older ones removed).
 */
const MAX_ACTIVE = 5

/**
 * Ensure we never stack more than MAX_ACTIVE
 */
const activeToastIds: string[] = []

function enforceLimit(newId: string) {
  // Track order of spawned toasts (custom variants only)
  activeToastIds.push(newId)

  // Deduplicate while preserving order
  const dedup: string[] = []
  for (const id of activeToastIds) {
    if (!dedup.includes(id)) dedup.push(id)
  }

  // Dismiss oldest if over limit
  while (dedup.length > MAX_ACTIVE) {
    const oldest = dedup.shift()
    if (oldest) hotToast.dismiss(oldest)
  }

  // Persist cleaned list
  activeToastIds.splice(0, activeToastIds.length, ...dedup)
}

function spawn(
  variant: ToastVariant,
  msg: string,
  opts: BaseToastOptions = {}
) {
  const {
    title = msg,
    description,
    duration,
    icon,
    hideClose,
    hideProgress,
    onDismiss,
    action,
    role,
    className
  } = opts

  const toastId = hotToast.custom(
    t => (
      <InternalToast
        t={t}
        title={title}
        description={description}
        duration={duration}
        hideClose={hideClose}
        hideProgress={hideProgress}
        icon={icon}
        variant={variant}
        onDismiss={onDismiss}
        action={action}
        role={role}
        className={className}
      />
    ),
    {
      duration: duration === 0 ? Infinity : duration ?? defaultDurations[variant],
      position: (typeof window !== 'undefined' && window.innerWidth < 640) ? 'bottom-center' : 'bottom-right'
    } as ToastOptions
  )

  enforceLimit(toastId)
  return toastId
}

const defaultDurations: Record<ToastVariant, number> = {
  success: 3800,
  error: 5200,
  warning: 4500,
  info: 4000,
  loading: 0, // stays until dismissed or promise resolves
  neutral: 4000
}

/* ------------------------------ Public API -------------------------------- */

export const toast = {
  success: (message: string, options?: BaseToastOptions) =>
    spawn('success', message, options || {}),
  error: (message: string, options?: BaseToastOptions) =>
    spawn('error', message, options || {}),
  warning: (message: string, options?: BaseToastOptions) =>
    spawn('warning', message, options || {}),
  info: (message: string, options?: BaseToastOptions) =>
    spawn('info', message, options || {}),
  neutral: (message: string, options?: BaseToastOptions) =>
    spawn('neutral', message, options || {}),
  loading: (message: string, options?: BaseToastOptions) =>
    spawn('loading', message, options || {}),

  /**
   * Show a toast with a primary action button.
   */
  action: (input: ActionToastInput) =>
    spawn(input.variant || 'neutral', input.title, input),

  /**
   * Wrap a promise with loading / success / error toasts
   */
  promise: <T,>(
    promise: Promise<T>,
    labels: {
      loading: string
      success: string | ((value: T) => string)
      error: string | ((err: unknown) => string)
    },
    options?: { success?: BaseToastOptions; error?: BaseToastOptions; loading?: BaseToastOptions }
  ) => {
    const id = toast.loading(labels.loading, {
      variant: 'loading',
      ...(options?.loading || {})
    })
    promise
      .then(val => {
        hotToast.dismiss(id)
        const successMessage =
          typeof labels.success === 'function'
            ? labels.success(val)
            : labels.success
        toast.success(successMessage, options?.success)
      })
      .catch(err => {
        hotToast.dismiss(id)
        const errorMessage =
          typeof labels.error === 'function'
            ? labels.error(err)
            : labels.error
        toast.error(errorMessage, options?.error)
      })
    return promise
  },

  dismiss: (id?: string) => {
    if (id) {
      const idx = activeToastIds.indexOf(id)
      if (idx > -1) activeToastIds.splice(idx, 1)
    } else {
      activeToastIds.length = 0
    }
    hotToast.dismiss(id)
  },
  remove: (id?: string) => {
    if (id) {
      const idx = activeToastIds.indexOf(id)
      if (idx > -1) activeToastIds.splice(idx, 1)
    } else {
      activeToastIds.length = 0
    }
    hotToast.remove(id)
  }
}

export default toast

/* --------------------------- Global <Toaster /> --------------------------- */
/**
 * You can place this in your root layout once.
 * We export it here for convenience; usage is optional if already mounted.
 */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      gutter={12}
      toastOptions={{
        // Provide a baseline style fallback (content component overrides)
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0
        },
        duration: 4000
      }}
      containerStyle={{
        bottom: 16,
        right: 16
      }}
    />
  )
}

/* ----------------------------- Tailwind Keyframes --------------------------
Add this snippet to your global CSS if you prefer defining keyframes explicitly.

@keyframes toastSlideIn {
  from { transform: translateY(8px) translateZ(0); opacity:0; }
  to   { transform: translateY(0) translateZ(0); opacity:1; }
}
@keyframes toastSlideOut {
  from { transform: translateY(0) translateZ(0); opacity:1; }
  to   { transform: translateY(6px) translateZ(0); opacity:0; }
}
@keyframes toastProgress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

If you have a Tailwind config, you can add:
  animation: {
    toastSlideIn: 'toastSlideIn 0.28s cubic-bezier(.4,.6,.3,1) forwards',
    toastSlideOut: 'toastSlideOut 0.18s ease-in forwards',
    toastProgress: 'toastProgress linear forwards'
  }
--------------------------------------------------------------------------- */
