import * as React from 'react'

/**
 * BrandIcon
 * ─────────
 * A zero-config wrapper around simple-icons that turns any SimpleIcon object
 * into a properly-scaled, accessible React SVG element.
 *
 * Usage:
 *   import { siFacebook } from 'simple-icons'
 *   import { BrandIcon } from '@/components/ui/brand-icon'
 *
 *   <BrandIcon icon={siFacebook} size={20} />
 *   <BrandIcon icon={siFacebook} size={20} useBrandColor />
 *
 * The component is intentionally separate from the main UIIcon registry
 * because brand icons are fetched at import-time (tree-shaken) rather
 * than looked up in a static map — keeping the registry lean.
 */

export interface SimpleIconShape {
  title: string
  hex: string   // e.g. "1877F2" (no #)
  path: string  // SVG path d-attribute string
}

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  /** A simple-icons icon object, e.g. imported as `import { siFacebook } from 'simple-icons'` */
  icon: SimpleIconShape
  /** Width/height in px. Defaults to 24. */
  size?: number
  /**
   * When true, fills the icon with its official brand color.
   * When false (default), inherits `currentColor` so Tailwind text utilities work normally.
   */
  useBrandColor?: boolean
  /** Accessible label. Defaults to the icon's title (e.g. "Facebook"). */
  label?: string
  /** When true, treats the icon as purely decorative (aria-hidden). Defaults to true. */
  decorative?: boolean
}

export const BrandIcon = React.forwardRef<SVGSVGElement, BrandIconProps>(
  (
    {
      icon,
      size = 24,
      useBrandColor = false,
      label,
      decorative = true,
      style,
      ...rest
    },
    ref
  ) => {
    const fill = useBrandColor ? `#${icon.hex}` : 'currentColor'

    const a11yProps = decorative
      ? { 'aria-hidden': true as const }
      : {
        role: 'img' as const,
        'aria-label': label ?? icon.title,
      }

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        style={style}
        {...a11yProps}
        {...rest}
      >
        <path d={icon.path} />
      </svg>
    )
  }
)
BrandIcon.displayName = 'BrandIcon'

/**
 * makeBrandIcon
 * ─────────────
 * Factory that pre-binds a specific simple-icons icon so you can use it
 * like a regular component without passing the icon prop every time.
 *
 * Example:
 *   import { siInstagram } from 'simple-icons'
 *   const InstagramIcon = makeBrandIcon(siInstagram)
 *   <InstagramIcon size={18} className="text-pink-500" />
 */
export function makeBrandIcon(
  icon: SimpleIconShape,
  defaults?: Partial<Omit<BrandIconProps, 'icon'>>
) {
  const Comp = React.forwardRef<SVGSVGElement, Omit<BrandIconProps, 'icon'>>(
    (props, ref) => (
      <BrandIcon
        ref={ref}
        icon={icon}
        {...defaults}
        {...props}
      />
    )
  )
  Comp.displayName = `BrandIcon(${icon.title})`
  return Comp
}
