import React from 'react'
import { Info, AlertTriangle, CheckCircle } from 'lucide-react'

const ALERT_TYPES = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500'
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500'
  }
}

function AlertBar({ type = 'info', message, onDismiss }) {
  const alertConfig = ALERT_TYPES[type]
  const Icon = alertConfig.icon

  return (
    <div className={`${alertConfig.bgColor} ${alertConfig.borderColor} border rounded-md p-4 mb-6`}>
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${alertConfig.iconColor} mr-3 flex-shrink-0`} />
        <p className={`${alertConfig.textColor} text-sm font-medium flex-1`}>
          {message}
        </p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${alertConfig.textColor} hover:opacity-75 ml-3`}
          >
            <span className="sr-only">Dismiss</span>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default AlertBar