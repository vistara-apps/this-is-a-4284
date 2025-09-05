import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import GuideCard from './components/GuideCard'
import RecordingButton from './components/RecordingButton'
import LanguageSelector from './components/LanguageSelector'
import AlertBar from './components/AlertBar'
import SubscriptionModal from './components/SubscriptionModal'
import { useLocation } from './hooks/useLocation'
import { useRecording } from './hooks/useRecording'
import { useContentGeneration } from './hooks/useContentGeneration'

const LEGAL_GUIDES = [
  {
    id: 1,
    title: "Traffic Stop Rights",
    content: "During a traffic stop, you have the right to remain silent beyond providing license, registration, and insurance. You are not required to answer questions about where you're going or coming from. Keep your hands visible and follow lawful orders.",
    category: "Traffic",
    isPremium: false
  },
  {
    id: 2,
    title: "Police Questioning",
    content: "You have the right to remain silent and the right to an attorney. You can say 'I am exercising my right to remain silent and I want to speak to a lawyer.' You cannot be arrested for refusing to answer questions.",
    category: "Questioning",
    isPremium: false
  },
  {
    id: 3,
    title: "Search and Seizure",
    content: "Police generally need a warrant to search your home, car, or belongings. You can say 'I do not consent to a search.' Even if they search anyway, stating your non-consent helps protect your rights in court.",
    category: "Search",
    isPremium: true
  },
  {
    id: 4,
    title: "Recording Police",
    content: "You have a First Amendment right to record police in public spaces as long as you don't interfere with their duties. Stand at a reasonable distance and clearly state you are recording for your safety.",
    category: "Recording",
    isPremium: true
  }
]

const SCRIPTED_RESPONSES = {
  en: [
    "I am exercising my right to remain silent.",
    "I do not consent to any searches.",
    "Am I free to leave?",
    "I would like to speak to a lawyer.",
    "I am recording this interaction for my safety."
  ],
  es: [
    "Estoy ejerciendo mi derecho a permanecer en silencio.",
    "No consiento a ningún registro.",
    "¿Soy libre de irme?",
    "Me gustaría hablar con un abogado.",
    "Estoy grabando esta interacción por mi seguridad."
  ]
}

function App() {
  const [user, setUser] = useState({
    subscriptionStatus: 'free',
    preferredLanguage: 'en',
    locationEnabled: false
  })
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { location, requestLocation } = useLocation()
  const { isRecording, startRecording, stopRecording, recordings } = useRecording()
  const { generateContent, isGenerating } = useContentGeneration()

  useEffect(() => {
    // Request location permission on first load
    requestLocation()
  }, [])

  const filteredGuides = LEGAL_GUIDES.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGuideSelect = (guide) => {
    if (guide.isPremium && user.subscriptionStatus === 'free') {
      setShowSubscriptionModal(true)
      return
    }
    setSelectedGuide(guide)
  }

  const handleSubscribe = () => {
    setUser(prev => ({ ...prev, subscriptionStatus: 'premium' }))
    setShowSubscriptionModal(false)
  }

  const handleLanguageChange = (language) => {
    setUser(prev => ({ ...prev, preferredLanguage: language }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      <Header 
        user={user}
        onLanguageChange={handleLanguageChange}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Pocket Justice
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your Rights, Instantly Accessible
          </p>
          
          {/* Emergency Recording Button */}
          <div className="mb-8">
            <RecordingButton
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              isPremium={user.subscriptionStatus === 'premium'}
              onUpgradePrompt={() => setShowSubscriptionModal(true)}
            />
          </div>
        </div>

        {/* Location Alert */}
        {location && (
          <AlertBar
            type="info"
            message={`Showing content for ${location.state || 'your location'}`}
          />
        )}

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search guides... (e.g., traffic stop, questioning)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredGuides.map(guide => (
            <GuideCard
              key={guide.id}
              guide={guide}
              onSelect={handleGuideSelect}
              isPremium={guide.isPremium}
              userSubscription={user.subscriptionStatus}
            />
          ))}
        </div>

        {/* Scripted Responses */}
        <div className="glass-effect rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Key Phrases to Remember
          </h2>
          <div className="grid gap-3">
            {SCRIPTED_RESPONSES[user.preferredLanguage].map((phrase, index) => (
              <div
                key={index}
                className="bg-white/10 rounded-md p-3 text-white/90 hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() => navigator.clipboard?.writeText(phrase)}
              >
                "{phrase}"
              </div>
            ))}
          </div>
        </div>

        {/* Recent Recordings */}
        {recordings.length > 0 && (
          <div className="glass-effect rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Recent Recordings
            </h2>
            <div className="space-y-3">
              {recordings.slice(0, 3).map(recording => (
                <div
                  key={recording.id}
                  className="bg-white/10 rounded-md p-3 text-white/90"
                >
                  <div className="flex justify-between items-center">
                    <span>Recording from {recording.timestamp}</span>
                    <span className="text-sm opacity-75">{recording.duration}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Guide Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-surface">
                  {selectedGuide.title}
                </h2>
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-7">
                  {selectedGuide.content}
                </p>
              </div>
              {location?.state && (
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    📍 This information is specific to {location.state} law. 
                    Laws may vary by jurisdiction.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handleSubscribe}
        />
      )}
    </div>
  )
}

export default App