import React, { useState, useEffect } from 'react'
import { X, Check, Crown, CreditCard, Shield, Zap } from 'lucide-react'
import { stripeService } from '../services/api'
import { useUser } from '../contexts/UserContext'

const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    priceId: null,
    features: [
      'Basic legal guides',
      'Essential scripted responses',
      'Limited recordings (3 per month)',
      'Community support'
    ],
    limitations: [
      'No offline access',
      'No state-specific content',
      'No IPFS backup',
      'Limited recording storage'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$4.99',
    period: 'month',
    priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
    features: [
      'All legal guides',
      'State-specific content',
      'Unlimited recordings',
      'IPFS backup & encryption',
      'Offline access',
      'Priority support',
      'Advanced scripted responses',
      'Real-time legal updates'
    ],
    popular: true
  },
  {
    id: 'annual',
    name: 'Premium Annual',
    price: '$49.99',
    period: 'year',
    priceId: 'price_premium_annual', // Replace with actual Stripe price ID
    savings: 'Save $10',
    features: [
      'All Premium features',
      'Annual billing discount',
      'Extended IPFS storage',
      'Legal consultation credits',
      'Early access to new features'
    ]
  }
]

export default function SubscriptionModal({ onClose, onSubscribe }) {
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  
  const { user, updateSubscription } = useUser()

  useEffect(() => {
    // Clear error when plan changes
    setError(null)
  }, [selectedPlan])

  const handleSubscribe = async () => {
    if (selectedPlan === 'free') {
      updateSubscription('free')
      onSubscribe('free')
      return
    }

    setIsProcessing(true)
    setError(null)
    
    try {
      const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)
      
      if (!selectedPlanData.priceId) {
        throw new Error('Invalid plan selected')
      }

      // Create Stripe checkout session
      const stripe = await stripeService.getStripe()
      
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Create subscription
      const subscription = await stripeService.createSubscription(
        selectedPlanData.priceId,
        user?.stripeCustomerId
      )

      if (subscription.status === 'active') {
        updateSubscription('premium')
        onSubscribe('premium')
      } else if (subscription.status === 'incomplete') {
        // Handle 3D Secure or other authentication
        const { error } = await stripe.confirmCardPayment(subscription.latest_invoice.payment_intent.client_secret)
        
        if (error) {
          throw new Error(error.message)
        } else {
          updateSubscription('premium')
          onSubscribe('premium')
        }
      }

    } catch (error) {
      console.error('Subscription error:', error)
      setError(error.message || 'Failed to process subscription')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTrialStart = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Start 7-day trial
      updateSubscription('trial')
      onSubscribe('trial')
    } catch (error) {
      console.error('Trial error:', error)
      setError('Failed to start trial')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Upgrade to Premium
              </h2>
              <p className="text-gray-600">
                Get full access to all features and protect your rights with confidence
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield size={16} className="text-green-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap size={16} className="text-blue-500" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard size={16} className="text-purple-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Crown size={16} />
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-600">
                      /{plan.period}
                    </span>
                  </div>
                  {plan.id === 'annual' && (
                    <p className="text-sm text-green-600 font-medium">
                      Just $4.17/month
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations && (
                  <ul className="space-y-2 pt-4 border-t border-gray-200">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedPlan === plan.id && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trial offer for premium plans */}
          {selectedPlan !== 'free' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    🎉 Start with a 7-day free trial
                  </h4>
                  <p className="text-sm text-gray-600">
                    Try all premium features risk-free. Cancel anytime during the trial.
                  </p>
                </div>
                <button
                  onClick={handleTrialStart}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                >
                  Start Trial
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedPlan === 'free'
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : selectedPlan === 'free' ? (
                'Continue with Free'
              ) : (
                `Subscribe to ${SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}`
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              <br />
              Payments are processed securely by Stripe. Cancel anytime from your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

