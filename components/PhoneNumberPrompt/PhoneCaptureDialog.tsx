'use client'

/**
 * PhoneCaptureDialog
 * --------------------------------------------------------------------------
 * Re‑usable primitive dialog for capturing & validating a user's phone number.
 * Features:
 *  - Debounced validation feedback
 *  - Auto-detection / normalization of Ghana (+233) formats
 *  - Country selector scaffold (currently Ghana only + disabled placeholder)
 *  - Accessible status & error messaging
 *  - Optional pretty national formatting on blur
 *  - Clean, framework-friendly pure validation layer via phone-utils
 *
 * Props use *Action suffix for Next.js client component function-prop conventions.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId
} from 'react'
import { Button } from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import { makeIcon } from '@/components/ui/icon'
import {
  parsePhone,
  getPhoneValidationError,
  prettyFormatPhone,
  deriveCanonical
} from './phone-utils'

/* Icon adapters (icon names must exist in IconName union) */
const PhoneIcon = makeIcon('phone')
const CloseIcon = makeIcon('close')
const SuccessIcon = makeIcon('success')
const ErrorIcon = makeIcon('error')
const InfoIcon = makeIcon('info')
const LoadingIcon = makeIcon('loading')
const LockIcon = makeIcon('lock')

export interface PhoneCaptureDialogProps {
  open: boolean
  onCloseAction: () => void
  onSaveAction: (
    e164: string,
    meta: { national: string | null; country: string | null }
  ) => Promise<void>

  initialPhone?: string
  context?: 'checkout' | 'profile' | 'cart' | 'general'
  userName?: string
  requirePhone?: boolean

  countries?: Array<{ code: string; label: string; dial: string; disabled?: boolean }>
  defaultCountry?: string

  validationDebounceMs?: number
  autoPrettyFormat?: boolean
  idPrefix?: string
}

const DEFAULT_COUNTRIES: NonNullable<PhoneCaptureDialogProps['countries']> = [
  { code: 'GH', label: 'Ghana (+233)', dial: '233' },
  { code: 'OTHER', label: 'Other (Coming Soon)', dial: '', disabled: true }
]

function getContextMessage(context: PhoneCaptureDialogProps['context']) {
  switch (context) {
    case 'checkout':
      return {
        title: 'Add Your Phone Number',
        subtitle: 'Needed to coordinate delivery',
        reason:
          'Our delivery partner may call to confirm directions and schedule drop‑off.'
      }
    case 'cart':
      return {
        title: 'Quick Setup',
        subtitle: 'Add a phone for faster future checkout',
        reason: 'Save time next order and receive timely delivery updates.'
      }
    case 'profile':
      return {
        title: 'Complete Your Profile',
        subtitle: 'Add your phone to enhance your experience',
        reason:
          'Get real‑time order updates, delivery notifications & better support.'
      }
    default:
      return {
        title: 'Add Phone Number',
        subtitle: 'We use it for delivery updates',
        reason: 'Receive order & delivery status notifications instantly.'
      }
  }
}

/**
 * PhoneCaptureDialog component.
 */
export const PhoneCaptureDialog: React.FC<PhoneCaptureDialogProps> = ({
  open,
  onCloseAction,
  onSaveAction,
  initialPhone = '',
  context = 'general',
  userName = '',
  requirePhone = true,
  countries = DEFAULT_COUNTRIES,
  defaultCountry = 'GH',
  validationDebounceMs = 450,
  autoPrettyFormat = true,
  idPrefix
}) => {
  /* State */
  const [rawInput, setRawInput] = useState(initialPhone)
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry)
  const [touched, setTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showBenefits, setShowBenefits] = useState(false)
  const [error, setError] = useState('')
  const [debouncing, setDebouncing] = useState(false)
  const [parsed, setParsed] = useState(() => parsePhone(initialPhone))

  /* Refs */
  const debounceTimerRef = useRef<number | null>(null)
  const errorRef = useRef<HTMLParagraphElement | null>(null)
  const phoneInputRef = useRef<HTMLInputElement | null>(null)

  /* IDs for accessibility */
  const generatedId = useId()
  const internalIdPrefix = idPrefix ?? generatedId
  const inputId = `${internalIdPrefix}-phone-input`
  const countrySelectId = `${internalIdPrefix}-country`
  const helpId = `${internalIdPrefix}-phone-help`
  const errorId = `${internalIdPrefix}-phone-error`
  const benefitsId = `${internalIdPrefix}-phone-benefits`
  const titleId = `${internalIdPrefix}-phone-title`
  const contextInfo = getContextMessage(context)

  /* Reset when reopened */
  useEffect(() => {
    if (open) {
      setRawInput(initialPhone)
      setParsed(parsePhone(initialPhone))
      setError('')
      setShowBenefits(false)
      setTouched(false)
      setSelectedCountry(defaultCountry)
      setTimeout(() => phoneInputRef.current?.focus(), 40)
    }
  }, [open, initialPhone, defaultCountry])

  /* Validation logic */
  const runValidation = useCallback(
    (value: string) => {
      if (selectedCountry === 'GH') {
        return getPhoneValidationError(value, {
          required: requirePhone,
          country: 'GH'
        })
      }
      if (!value.trim()) return requirePhone ? 'Phone number is required.' : ''
      return 'Unsupported country (Ghana only currently).'
    },
    [selectedCountry, requirePhone]
  )

  /* Debounced validation effect */
  useEffect(() => {
    if (!touched) return
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
    }
    setDebouncing(true)
    debounceTimerRef.current = window.setTimeout(() => {
      const p = parsePhone(rawInput)
      setParsed(p)
      setError(runValidation(rawInput))
      setDebouncing(false)
    }, validationDebounceMs)
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
    }
  }, [rawInput, touched, runValidation, validationDebounceMs])

  /* Immediate parsing on country change for feedback */
  useEffect(() => {
    if (!touched) return
    const p = parsePhone(rawInput)
    setParsed(p)
    setError(runValidation(rawInput))
  }, [selectedCountry, rawInput, touched, runValidation])

  const handleInputChange = (value: string) => {
    setRawInput(value)
    if (!touched) setTouched(true)
  }

  const handleBlur = () => {
    setTouched(true)
    if (autoPrettyFormat && parsed?.isValid && parsed.country === 'GH') {
      setRawInput(prettyFormatPhone(parsed.national || rawInput))
    }
  }

  const focusError = () => {
    requestAnimationFrame(() => {
      errorRef.current?.focus()
    })
  }

  const canSubmit =
    !isLoading &&
    rawInput.trim().length > 0 &&
    !debouncing &&
    (error === '' || (!requirePhone && rawInput.trim().length === 0))

  const handleSave = async () => {
    setTouched(true)
    const finalError = runValidation(rawInput)
    setError(finalError)
    if (finalError) {
      focusError()
      return
    }
    const finalParsed = parsePhone(rawInput)
    if (!finalParsed.isValid || !finalParsed.e164) {
      setError(finalParsed.reason || 'Invalid phone number.')
      focusError()
      return
    }
    setIsLoading(true)
    try {
      await onSaveAction(finalParsed.e164, {
        national: finalParsed.national || null,
        country: finalParsed.country || null
      })
      toast.success('Phone number saved', {
        icon: <SuccessIcon size={18} />
      })
      onCloseAction()
    } catch (e) {

      console.error('[PhoneCaptureDialog] save error:', e)
      toast.error('Failed to save phone number. Please retry.', {
        icon: <ErrorIcon size={18} />
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (requirePhone || context === 'checkout') {
      toast.error('Phone number required to proceed', {
        icon: <ErrorIcon size={18} />
      })
      return
    }
    onCloseAction()
  }

  if (!open) return null

  const showError = touched && !!error
  const showValid = touched && !error && !debouncing && parsed?.isValid
  const canonical = deriveCanonical(rawInput)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={`${helpId}${showError ? ' ' + errorId : ''}`}
    >
      <div className="bg-card dark:bg-gray-800 rounded-2xl shadow-2xl border border-border/50 p-6 w-full max-w-md mx-4 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        {/* Close */}
        {!requirePhone && context !== 'checkout' && (
          <button
            onClick={onCloseAction}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Close phone capture dialog"
          >
            <CloseIcon size={20} />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneIcon size={32} className="text-primary-foreground" />
          </div>
          <h2 id={titleId} className="text-2xl font-bold text-foreground mb-2">
            {userName ? `${userName}, ` : ''}
            {contextInfo.title}
          </h2>
          <p className="text-muted-foreground">{contextInfo.subtitle}</p>
        </div>

        {/* Context Reason */}
        <div
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <InfoIcon
              size={20}
              className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                Why we need this:
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {contextInfo.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5 mb-4">
          {/* Country Selector */}
          <div>
            <label
              htmlFor={countrySelectId}
              className="block text-sm font-medium text-foreground mb-2"
            >
              Country
            </label>
            <div className="relative">
              <select
                id={countrySelectId}
                value={selectedCountry}
                onChange={e => {
                  setSelectedCountry(e.target.value)
                  setTouched(true)
                }}
                className="w-full h-11 rounded-xl bg-background border border-input px-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 disabled:opacity-60"
                disabled={isLoading}
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code} disabled={c.disabled}>
                    {c.label}
                  </option>
                ))}
              </select>
              {countries.length === 1 && (
                <LockIcon
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            {selectedCountry !== 'GH' && (
              <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-400">
                Only Ghana (+233) numbers supported right now.
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div>
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-foreground mb-2"
            >
              Phone Number {requirePhone && '*'}
            </label>
            <div className="relative">
              <PhoneIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={phoneInputRef}
                id={inputId}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={rawInput}
                onChange={e => handleInputChange(e.target.value)}
                onBlur={handleBlur}
                aria-invalid={showError}
                aria-describedby={`${helpId}${showError ? ' ' + errorId : ''}`}
                placeholder={
                  selectedCountry === 'GH'
                    ? '0XX XXX XXXX or +233XX XXX XXXX'
                    : 'Enter phone number'
                }
                className={[
                  'w-full pl-10 pr-12 py-3 rounded-xl bg-background text-foreground transition-colors',
                  'border focus:outline-none focus:ring-2',
                  showError
                    ? 'border-red-500/70 focus:ring-red-500/30'
                    : 'border-input focus:ring-primary/30 focus:border-primary/60'
                ].join(' ')}
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {debouncing && (
                  <LoadingIcon
                    size={18}
                    className="text-muted-foreground animate-spin"
                    aria-hidden="true"
                  />
                )}
                {!debouncing && showValid && (
                  <SuccessIcon size={18} className="text-green-500" aria-hidden="true" />
                )}
                {!debouncing && showError && (
                  <ErrorIcon size={18} className="text-red-500" aria-hidden="true" />
                )}
              </div>
            </div>
            <p id={helpId} className="text-xs text-muted-foreground mt-2">
              {selectedCountry === 'GH'
                ? 'Format: 0XXXXXXXXX or +233XXXXXXXXX. We normalize automatically.'
                : 'Currently only Ghana numbers are validated.'}
            </p>
            {showError && (
              <p
                id={errorId}
                ref={errorRef}
                role="alert"
                tabIndex={-1}
                className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}
            {touched && !error && canonical.canonical && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <SuccessIcon size={14} /> Normalized: {canonical.canonical}
              </p>
            )}
          </div>
        </div>

        {/* Benefits Toggle */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowBenefits(v => !v)}
            className="text-sm text-primary hover:text-primary/80 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            aria-expanded={showBenefits}
            aria-controls={benefitsId}
          >
            {showBenefits ? 'Hide' : 'See'} benefits of adding your phone
          </button>
          {showBenefits && (
            <div
              id={benefitsId}
              className="mt-3 space-y-2"
              aria-live="polite"
            >
              {[
                'Real-time delivery SMS updates',
                'Faster support resolution',
                'Order confirmation & tracking',
                'Coordinate with rider more easily'
              ].map(text => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <SuccessIcon size={16} className="text-green-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSave}
            disabled={!canSubmit}
            className="w-full h-12 font-semibold"
            size="lg"
            aria-disabled={!canSubmit}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingIcon size={18} spin />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <PhoneIcon size={18} />
                {initialPhone ? 'Update Phone Number' : 'Save Phone Number'}
              </div>
            )}
          </Button>
          {!requirePhone && context !== 'checkout' && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full h-10"
              disabled={isLoading}
            >
              Skip for now
            </Button>
          )}
        </div>

        {/* Privacy Note */}
        <div className="mt-4 text-center" aria-live="polite">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <LockIcon size={14} aria-hidden="true" />
            <span>Your number is used only for essential order communications.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

PhoneCaptureDialog.displayName = 'PhoneCaptureDialog'

/**
 * Simple utility hook if consumers want local state management:
 * const { open, show, hide } = usePhoneCaptureDialog()
 */
export function usePhoneCaptureDialog(initial = false) {
  const [open, setOpen] = useState(initial)
  const show = useCallback(() => setOpen(true), [])
  const hide = useCallback(() => setOpen(false), [])
  return { open, show, hide, setOpen }
}

/* -------------------------------------------------------------------------- */
/* Test Outline (Commented)
 *
 * (When adding Jest/Vitest, uncomment and implement):
 *
 * describe('PhoneCaptureDialog', () => {
 *   it('validates Ghana national form', () => { ... })
 *   it('normalizes +233 to national + e164', () => { ... })
 *   it('shows error when required & empty', () => { ... })
 *   it('debounces validation (no immediate error)', () => { ... })
 *   it('disables skip when requirePhone', () => { ... })
 * })
 *
 * Pure logic is already covered by phone-utils test outline.
 * -------------------------------------------------------------------------- */
export default PhoneCaptureDialog
