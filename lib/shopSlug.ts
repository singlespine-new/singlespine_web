/**
 * shopSlug.ts
 * -----------------------------------------------------------------------------
 * Centralized, testable utilities for:
 *  - Normalizing arbitrary shop identifier input (ID or slug)
 *  - Deriving a canonical shop slug from product/shop objects
 *  - Resolving an incoming path segment against known IDs / slugs
 *  - Producing redirect instructions for non‑canonical variants
 *
 * Design Goals:
 *  - Pure functions (no direct DB / network calls)
 *  - Small, dependency‑free
 *  - Shared logic between UI components, API routes, and middleware
 *
 * Canonical Normalization Rules:
 *  1. Lowercase
 *  2. Trim leading/trailing whitespace
 *  3. Replace spaces + underscores with a single hyphen
 *  4. Collapse multiple hyphens to one
 *  5. Trim leading / trailing hyphen
 *
 * Example:
 *   "  Bioko  Treats---Osu  " -> "bioko-treats-osu"
 *
 * Usage (UI):
 *   import { deriveShopSlugFromProduct } from '@/lib/shopSlug'
 *   const href = deriveShopSlugFromProduct(product)
 *
 * Usage (API route):
 *   const { canonical, matchType } = resolveShopIdentifier(params.shopId, {
 *     knownIds: new Set(MOCK_SHOPS.map(s => s.id)),
 *     knownSlugs: new Set(MOCK_SHOPS.map(s => s.slug))
 *   })
 *   if (!canonical) return 404
 *
 * Usage (redirect in middleware):
 *   const redirect = getCanonicalShopRedirect(requestedSegment, canonicalSegment)
 *   if (redirect) return NextResponse.redirect(redirect.url, 301)
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ProductLike {
  vendor?: string | null
  shopId?: string | null
  shopSlug?: string | null
  shop_slug?: string | null
  metadata?: {
    shopSlug?: string | null
    shop_slug?: string | null
    shopId?: string | null
    shop_id?: string | null
    [k: string]: unknown
  } | null
  [k: string]: unknown
}

export interface ShopLike {
  id?: string
  slug?: string
  name?: string
  [k: string]: unknown
}

export interface ResolveOptions {
  /**
   * Known internal shop IDs (e.g., primary keys).
   * Provide to enable exact / normalized ID matching.
   */
  knownIds?: Set<string>
  /**
   * Known canonical slugs.
   */
  knownSlugs?: Set<string>
  /**
   * When true, will attempt normalized fallback matching for IDs as well.
   * Defaults to true.
   */
  allowNormalizedIdFallback?: boolean
}

export type ResolveResult =
  | {
    found: true
    /**
     * Canonical segment to use in URLs (/shop/<canonical>)
     */
    canonical: string
    /**
     * Whether the match corresponded to an internal ID or a slug
     */
    matchType: 'id' | 'slug'
    /**
     * Whether the originally supplied segment already matched canonical form
     */
    isCanonical: boolean
  }
  | {
    found: false
    canonical: null
    matchType: null
    isCanonical: false
  }

export interface RedirectInstruction {
  /**
   * Absolute or relative URL to redirect to
   */
  location: string
  /**
   * HTTP status (301 preferred for canonicalization)
   */
  status: 301 | 302
}

/* -------------------------------------------------------------------------- */
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

/**
 * normalizeShopSlug
 * Apply canonical normalization rules to the provided raw identifier.
 */
export function normalizeShopSlug(raw: string): string {
  if (!raw) return ''
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // spaces & underscores -> hyphen
    .replace(/-+/g, '-') // collapse repeats
    .replace(/^-|-$/g, '') // trim edges
}

/**
 * isLikelyId
 * Simple heuristic: treat values containing a prefix like "shop-" or
 * an alphanumeric pattern with dashes that matches existing IDs as ID candidates.
 * Keep minimal; callers ultimately decide via provided knownIds set.
 */
export function isLikelyId(value: string): boolean {
  return /^shop-[a-z0-9]+/i.test(value)
}

/* -------------------------------------------------------------------------- */
/* Derivation                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * deriveShopSlugFromProduct
 * Attempts to produce a canonical /shop/<slugOrId> path segment from a product.
 * Priority order:
 *   1. Explicit slug fields: shopSlug, shop_slug
 *   2. Metadata slug: metadata.shopSlug / metadata.shop_slug
 *   3. Metadata shopId: metadata.shopId / metadata.shop_id
 *   4. Top-level shopId
 *   5. Fallback vendor name (normalized)
 * Returns a string suitable to concatenate with `/shop/`.
 */
export function deriveShopSlugFromProduct(product: ProductLike): string {
  const explicit =
    product.shopSlug ||
    product.shop_slug ||
    product.metadata?.shopSlug ||
    product.metadata?.shop_slug ||
    product.metadata?.shopId ||
    product.metadata?.shop_id ||
    product.shopId

  if (explicit && typeof explicit === 'string') {
    return normalizeShopSlug(explicit)
  }

  if (product.vendor && typeof product.vendor === 'string') {
    return normalizeShopSlug(product.vendor)
  }

  return '' // INTENTIONAL: caller should handle empty -> fallback
}

/**
 * deriveShopSlugFromShop
 * Prefer slug if present; fallback to name or id.
 */
export function deriveShopSlugFromShop(shop: ShopLike): string {
  if (shop.slug) return normalizeShopSlug(shop.slug)
  if (shop.id) return normalizeShopSlug(shop.id)
  if (shop.name) return normalizeShopSlug(shop.name)
  return ''
}

/* -------------------------------------------------------------------------- */
/* Resolution                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * resolveShopIdentifier
 * Given a path segment (could be a slug or ID) determine the canonical segment.
 *
 * Strategy:
 *   1. Exact ID match
 *   2. Normalized ID match (if allowed)
 *   3. Exact slug match
 *   4. Normalized slug match
 *
 * If found, returns details including whether input was already canonical.
 * If not found, returns found: false.
 */
export function resolveShopIdentifier(
  candidate: string,
  opts: ResolveOptions = {}
): ResolveResult {
  const {
    knownIds,
    knownSlugs,
    allowNormalizedIdFallback = true
  } = opts

  if (!candidate) {
    return { found: false, canonical: null, matchType: null, isCanonical: false }
  }

  const raw = candidate
  const normalized = normalizeShopSlug(raw)

  // 1. Exact ID
  if (knownIds?.has(raw)) {
    return {
      found: true,
      canonical: raw,
      matchType: 'id',
      isCanonical: raw === normalized // usually true for IDs
    }
  }

  // 2. Normalized ID
  if (
    allowNormalizedIdFallback &&
    normalized !== raw &&
    knownIds?.has(normalized)
  ) {
    return {
      found: true,
      canonical: normalized,
      matchType: 'id',
      isCanonical: false
    }
  }

  // 3. Exact Slug
  if (knownSlugs?.has(raw)) {
    return {
      found: true,
      canonical: normalizeShopSlug(raw), // ensure canonical
      matchType: 'slug',
      isCanonical: raw === normalizeShopSlug(raw)
    }
  }

  // 4. Normalized Slug
  if (normalized !== raw && knownSlugs?.has(normalized)) {
    return {
      found: true,
      canonical: normalized,
      matchType: 'slug',
      isCanonical: false
    }
  }

  return {
    found: false,
    canonical: null,
    matchType: null,
    isCanonical: false
  }
}

/* -------------------------------------------------------------------------- */
/* Redirect Helpers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * getCanonicalShopRedirect
 * Given a user-provided segment and the canonical resolved segment,
 * returns redirect instruction if a redirect is required (case / hyphen fixes).
 */
export function getCanonicalShopRedirect(
  provided: string,
  canonical: string | null
): RedirectInstruction | null {
  if (!canonical) return null
  const pNorm = normalizeShopSlug(provided)
  if (pNorm !== canonical) {
    return {
      location: `/shop/${canonical}`,
      status: 301
    }
  }
  return null
}

/**
 * ensureShopPath
 * Utility that wraps resolution + redirect decision.
 */
export function ensureShopPath(
  candidate: string,
  opts: ResolveOptions
): {
  result: ResolveResult
  redirect: RedirectInstruction | null
} {
  const result = resolveShopIdentifier(candidate, opts)
  if (!result.found) {
    return { result, redirect: null }
  }
  const redirect = getCanonicalShopRedirect(candidate, result.canonical)
  return { result, redirect }
}

/* -------------------------------------------------------------------------- */
/* In-Memory Cache Helper (Optional)                                          */
/* -------------------------------------------------------------------------- */

/**
 * createShopResolver
 * Factory producing a stable resolver object pre-loaded with known IDs / slugs.
 * Useful for API routes or middleware to avoid recreating Sets.
 */
export function createShopResolver(shops: Array<ShopLike>) {
  const ids = new Set<string>()
  const slugs = new Set<string>()

  for (const s of shops) {
    if (s.id) ids.add(s.id)
    if (s.slug) slugs.add(normalizeShopSlug(s.slug))
  }

  return {
    resolve: (candidate: string) =>
      resolveShopIdentifier(candidate, {
        knownIds: ids,
        knownSlugs: slugs
      }),
    ensure: (candidate: string) =>
      ensureShopPath(candidate, { knownIds: ids, knownSlugs: slugs })
  }
}

/* -------------------------------------------------------------------------- */
/* Misc Utilities                                                             */
/* -------------------------------------------------------------------------- */

/**
 * isCanonicalShopPath
 * Quick check to verify a path segment is already normalized.
 */
export function isCanonicalShopPath(segment: string): boolean {
  return segment === normalizeShopSlug(segment)
}

/**
 * buildShopHref
 * Convenience for building /shop/<canonical> links from many possible inputs.
 */
export function buildShopHref(
  input: string | ProductLike | ShopLike | null | undefined
): string {
  if (!input) return '#'
  if (typeof input === 'string') {
    return `/shop/${normalizeShopSlug(input)}`
  }
  // Try product-like
  const maybeProduct = input as ProductLike
  const slug = deriveShopSlugFromProduct(maybeProduct)
  if (slug) return `/shop/${slug}`
  // Try shop-like
  const maybeShop = input as ShopLike
  if (maybeShop.slug || maybeShop.id || maybeShop.name) {
    return `/shop/${deriveShopSlugFromShop(maybeShop)}`
  }
  return '#'
}

/* -------------------------------------------------------------------------- */
/* End                                                                         */
/* -------------------------------------------------------------------------- */
