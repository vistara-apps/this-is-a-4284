import React from 'react'
import { Lock, FileText } from 'lucide-react'

function GuideCard({ guide, onSelect, isPremium, userSubscription }) {
  const isLocked = isPremium && userSubscription === 'free'
  
  return (
    <div
      onClick={() => onSelect(guide)}
      className={`relative glass-effect rounded-lg p-6 cursor-pointer transition-all duration-200 hover:bg-white/20 hover:scale-105 ${
        isLocked ? 'opacity-75' : ''
      }`}
    >
      {isLocked && (
        <div className="absolute top-4 right-4">
          <Lock className="h-5 w-5 text-yellow-400" />
        </div>
      )}
      
      <div className="flex items-start space-x-3">
        <FileText className="h-6 w-6 text-white/80 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {guide.title}
          </h3>
          <p className="text-white/80 text-sm leading-6 line-clamp-3">
            {guide.content.substring(0, 120)}...
          </p>
          <div className="flex items-center justify-between mt-4">
            <span className="inline-block bg-white/20 text-white/90 text-xs px-2 py-1 rounded-full">
              {guide.category}
            </span>
            {isPremium && (
              <span className="text-xs text-yellow-400 font-medium">
                Premium
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuideCard