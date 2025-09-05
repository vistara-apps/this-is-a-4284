import React from 'react'
import { Check, X, Crown } from 'lucide-react'

const PREMIUM_FEATURES = [
  'Unlimited audio/video recording',
  'Secure IPFS backup storage',
  'State-specific legal deep dives',
  'Offline access to all guides',
  'Advanced scripted responses',
  'Priority customer support'
]

function SubscriptionModal({ onClose, onSubscribe }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Upgrade to Premium
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-gray-900">$4.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 text-center">
              Get full access to all features and ensure your rights are protected.
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            {PREMIUM_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onSubscribe}
              className="w-full bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Subscribe Now
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Continue with Free
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Cancel anytime. Your rights matter.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionModal