/**
 * Phone Utilities (Ghana-focused with extensibility hooks)
 * --------------------------------------------------------
 * Lightweight, framework-agnostic helpers for normalizing, validating,
 * and formatting user–provided phone numbers (currently optimized for Ghana).
 *
 * Design Goals:
 *  - Zero external dependencies
 *  - Pure functions (easy to test)
 *  - Clear separation between parsing, normalization, validation, and formatting
 *  - Safe defaults: never throw, always return explicit results
 *
 * Supported Ghana Input Examples (all normalize to E.164: +233XXXXXXXXX):
 *   0241234567
 *   241234567         (leading 0 omitted by user)
 *   +233241234567
 *   233241234567
 *   024 123 4567
 *   (0)24-123-4567
 *
 * Non-Ghana numbers: currently returned unchanged (or null on strict modes).
 * Future: Add multi-country metadata registry.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface PhoneParseResult {
  raw: string                 // Original user input
  digits: string              // All numeric characters only
  country?: string            // ISO country hint (currently only 'GH' or undefined)
  isPossible: boolean         // Length/pattern plausibly matches a known rule
  isValid: boolean            // Fully valid under strict national rules
  e164?: string               // Normalized +<countryCode><nationalNumber> if valid
  national?: string           // Normalized national representation (e.g. 0241234567)
  reason?: string             // Failure / informative message
}

export interface NormalizeOptions {
  defaultCountry?: 'GH'
  strict?: boolean            // If true, reject ambiguous forms more aggressively
  allowMissingLeadingZero?: boolean // Accept 241234567 as 0241234567
}

export interface ValidationOptions {
  required?: boolean
  country?: 'GH'
}

/* -------------------------------------------------------------------------- */
/* Constants & Patterns                                                       */
/* -------------------------------------------------------------------------- */

// Ghana country dial code & national number expectations.
const GH_COUNTRY_CODE = '233'
const GH_E164_PREFIX = `+${GH_COUNTRY_CODE}`

// Ghana mobile / general number patterns (after stripping formatting):
//  - National format: 0XXXXXXXXX (10 digits, starting with 0)
//  - International: +233XXXXXXXXX or 233XXXXXXXXX (no leading 0)
const GH_NATIONAL_FULL = /^0\d{9}$/              // e.g. 0241234567
const GH_NATIONAL_MISSING_ZERO = /^\d{9}$/       // e.g. 241234567 (user omitted 0)
const GH_INT_WITH_PLUS = /^\+233\d{9}$/          // e.g. +233241234567
const GH_INT_NO_PLUS = /^233\d{9}$/              // e.g. 233241234567

// Basic character cleanup regex (remove everything except digits and '+')
const NON_DIGIT_PLUS = /[^+\d]/g

/* -------------------------------------------------------------------------- */
/* Core Helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * stripFormatting
 * Removes spaces, hyphens, parentheses and other non digit/+ chars.
 */
export function stripFormatting(input: string): string {
  return (input || '').replace(NON_DIGIT_PLUS, '')
}

/**
 * removeAllNonDigits
 */
export function digitsOnly(input: string): string {
  return (input || '').replace(/\D/g, '')
}

/**
 * Detect if the cleaned string looks Ghanaian.
 * NOTE: This is a heuristic; for multi-country expansion we'd consult metadata.
 */
export function looksLikeGhanaNumber(clean: string): boolean {
  return (
    GH_NATIONAL_FULL.test(clean) ||
    GH_INT_WITH_PLUS.test(clean) ||
    GH_INT_NO_PLUS.test(clean) ||
    GH_NATIONAL_MISSING_ZERO.test(clean)
  )
}

/**
 * Internal: Normalize a Ghana number candidate into canonical structures.
 */
function normalizeGhana(clean: string, opts: NormalizeOptions): Omit<PhoneParseResult, 'raw'> {
  // If already E.164 (+233XXXXXXXXX)
  if (GH_INT_WITH_PLUS.test(clean)) {
    return {
      digits: clean.replace('+', ''),
      country: 'GH',
      isPossible: true,
      isValid: true,
      e164: clean,
      national: '0' + clean.slice(GH_E164_PREFIX.length + 1), // Insert leading 0
    }
  }

  // If international without plus (233XXXXXXXXX)
  if (GH_INT_NO_PLUS.test(clean)) {
    const nationalFragment = clean.slice(GH_COUNTRY_CODE.length)
    return {
      digits: clean,
      country: 'GH',
      isPossible: true,
      isValid: true,
      e164: `+${clean}`,
      national: '0' + nationalFragment
    }
  }

  // National full (0XXXXXXXXX)
  if (GH_NATIONAL_FULL.test(clean)) {
    const nationalFragment = clean.slice(1)
    return {
      digits: digitsOnly(clean),
      country: 'GH',
      isPossible: true,
      isValid: true,
      e164: `${GH_E164_PREFIX}${nationalFragment}`,
      national: clean
    }
  }

  // Missing leading zero (XXXXXXXXX) – accept if allowMissingLeadingZero is true
  if (GH_NATIONAL_MISSING_ZERO.test(clean)) {
    if (!opts.allowMissingLeadingZero) {
      return {
        digits: digitsOnly(clean),
        country: 'GH',
        isPossible: true,
        isValid: false,
        reason: 'Missing leading 0 (e.g. 024...)'
      }
    }
    return {
      digits: digitsOnly(clean),
      country: 'GH',
      isPossible: true,
      isValid: true,
      e164: `${GH_E164_PREFIX}${clean}`,
      national: `0${clean}`
    }
  }

  return {
    digits: digitsOnly(clean),
    country: 'GH',
    isPossible: false,
    isValid: false,
    reason: 'Pattern does not match Ghana numbering plan'
  }
}

/* -------------------------------------------------------------------------- */
/* Public Parsing / Normalization                                             */
/* -------------------------------------------------------------------------- */

/**
 * parsePhone
 * Attempts to interpret a user input into a structured phone result.
 * Currently Ghana-focused. Unknown / foreign numbers pass back minimal data.
 */
export function parsePhone(input: string, options: NormalizeOptions = {}): PhoneParseResult {
  const raw = input ?? ''
  const cleaned = stripFormatting(raw)

  if (!cleaned) {
    return {
      raw,
      digits: '',
      isPossible: false,
      isValid: false,
      reason: 'Empty input'
    }
  }

  // Ghana detection path
  if (looksLikeGhanaNumber(cleaned)) {
    return {
      raw,
      ...normalizeGhana(cleaned, {
        defaultCountry: 'GH',
        strict: options.strict ?? false,
        allowMissingLeadingZero: options.allowMissingLeadingZero ?? true
      })
    }
  }

  // Fallback: treat as unknown – non-Ghana number
  const numeric = digitsOnly(cleaned)
  return {
    raw,
    digits: numeric,
    isPossible: !options.strict, // optimistic if not strict
    isValid: false,
    reason: 'Unknown / unsupported country (only Ghana handled presently)'
  }
}

/**
 * normalizePhone
 * Convenience wrapper returning E.164 or null.
 */
export function normalizePhone(
  input: string,
  opts: NormalizeOptions = {}
): string | null {
  const parsed = parsePhone(input, opts)
  return parsed.isValid && parsed.e164 ? parsed.e164 : null
}

/**
 * isValidGhanaPhone (standalone quick check)
 */
export function isValidGhanaPhone(input: string): boolean {
  const cleaned = stripFormatting(input)
  return looksLikeGhanaNumber(cleaned) && !!normalizePhone(input)
}

/**
 * getPhoneValidationError
 * Returns human-readable error or an empty string if valid.
 */
export function getPhoneValidationError(
  input: string,
  options: ValidationOptions = {}
): string {
  const { required = true, country = 'GH' } = options
  const raw = input || ''
  if (!raw.trim()) {
    return required ? 'Phone number is required.' : ''
  }
  if (country === 'GH') {
    const parsed = parsePhone(raw, { defaultCountry: 'GH' })
    if (!parsed.isValid) {
      return parsed.reason || 'Invalid phone number.'
    }
    return ''
  }
  // For unsupported countries (future expansion)
  return ''
}

/* -------------------------------------------------------------------------- */
/* Formatting Helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * prettyFormatPhone
 * For Ghana numbers, returns spaced formatting: 024 123 4567
 * Falls back to original for unknown patterns.
 */
export function prettyFormatPhone(input: string): string {
  const parsed = parsePhone(input)
  if (parsed.country === 'GH' && parsed.national) {
    // 0 + 2 + 3 + 4 group => 0XX XXX XXXX
    const d = parsed.national
    if (d.length === 10) {
      return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
    }
  }
  return input
}

/**
 * maskPhone
 * Obscures middle digits for partial display (privacy).
 * 0241234567 -> 024****567
 */
export function maskPhone(input: string): string {
  const digits = digitsOnly(input)
  if (digits.length < 7) return input
  return (
    digits.slice(0, 3) +
    '****' +
    digits.slice(digits.length - 3)
  )
}

/**
 * deriveCanonical
 * Returns a canonical object useful for state persistence.
 */
export function deriveCanonical(input: string) {
  const parsed = parsePhone(input)
  return {
    raw: parsed.raw,
    canonical: parsed.e164 || null,
    valid: parsed.isValid,
    country: parsed.country || null
  }
}

/* -------------------------------------------------------------------------- */
/* Batch Utilities                                                            */
/* -------------------------------------------------------------------------- */

export function batchNormalize(list: string[]): string[] {
  return list
    .map(v => normalizePhone(v))
    .filter((v): v is string => !!v)
}

export function batchParse(list: string[]): PhoneParseResult[] {
  return list.map(v => parsePhone(v))
}

/* -------------------------------------------------------------------------- */
/* Example (for documentation / dev notes – remove in production if desired)  */
/* -------------------------------------------------------------------------- */
/*
const example = parsePhone('024 123 4567')
console.log(example)
// {
//   raw: '024 123 4567',
//   digits: '0241234567',
//   country: 'GH',
//   isPossible: true,
//   isValid: true,
//   e164: '+233241234567',
//   national: '0241234567'
// }
*/

/* -------------------------------------------------------------------------- */
/* Exports Aggregate                                                          */
/* -------------------------------------------------------------------------- */

export default {
  parsePhone,
  normalizePhone,
  isValidGhanaPhone,
  getPhoneValidationError,
  prettyFormatPhone,
  maskPhone,
  deriveCanonical,
  batchNormalize,
  batchParse
}
