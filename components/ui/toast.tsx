'use client'

import React from 'react'
import { toast as hotToast, Toast } from 'react-hot-toast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface CustomToastProps {
  t: Toast
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  icon?: React.ReactNode
}

const CustomToast: React.FC<CustomToastProps> = ({ t, message, type = 'success', icon }) => {
  const getIcon = () => {
    if (icon) return icon

    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <CheckCircle className="w-5 h-5" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-[#FC8120]'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-amber-500'
      case 'info':
        return 'bg-blue-500'
      default:
        return 'bg-[#FC8120]'
    }
  }

  return (
    <div
      className={`${t.visible ? 'animate-enter' : 'animate-leave'
        } relative max-w-md w-full shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${getBgColor()} text-white`}
      style={{
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
      }}
    >
      <div className="flex items-center flex-1 pr-8">
        <div className="flex-shrink-0 mr-3 opacity-90">
          {getIcon()}
        </div>
        <div className="flex-1 leading-relaxed">
          {message}
        </div>
      </div>
      <button
        onClick={() => hotToast.dismiss(t.id)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/20 transition-colors duration-200"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Enhanced toast utilities
export const toast = {
  success: (message: string, options?: { duration?: number; icon?: React.ReactNode }) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          t={t}
          message={message}
          type="success"
          icon={options?.icon}
        />
      ),
      {
        duration: options?.duration || 4000,
      }
    )
  },

  error: (message: string, options?: { duration?: number; icon?: React.ReactNode }) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          t={t}
          message={message}
          type="error"
          icon={options?.icon}
        />
      ),
      {
        duration: options?.duration || 5000,
      }
    )
  },

  warning: (message: string, options?: { duration?: number; icon?: React.ReactNode }) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          t={t}
          message={message}
          type="warning"
          icon={options?.icon}
        />
      ),
      {
        duration: options?.duration || 4000,
      }
    )
  },

  info: (message: string, options?: { duration?: number; icon?: React.ReactNode }) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          t={t}
          message={message}
          type="info"
          icon={options?.icon}
        />
      ),
      {
        duration: options?.duration || 4000,
      }
    )
  },

  // Keep original methods for backward compatibility
  dismiss: hotToast.dismiss,
  remove: hotToast.remove,
  loading: (message: string) => hotToast.loading(message),
  promise: hotToast.promise
}

export default toast
