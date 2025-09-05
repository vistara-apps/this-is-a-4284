import React, { useState } from 'react'
import { Video, Square, Lock } from 'lucide-react'

function RecordingButton({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  isPremium, 
  onUpgradePrompt 
}) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    if (!isPremium) {
      onUpgradePrompt()
      return
    }

    if (isRecording) {
      onStopRecording()
    } else {
      onStartRecording()
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full transition-all duration-200 flex items-center justify-center ${
          isRecording
            ? 'bg-red-500 animate-pulse-slow shadow-lg shadow-red-500/50'
            : isPremium
            ? 'bg-white/20 hover:bg-white/30 hover:scale-110'
            : 'bg-gray-500/50 cursor-not-allowed'
        } ${isPressed ? 'scale-95' : ''}`}
        disabled={!isPremium && !isRecording}
      >
        {!isPremium && (
          <div className="absolute -top-2 -right-2">
            <Lock className="h-5 w-5 text-yellow-400" />
          </div>
        )}
        
        {isRecording ? (
          <Square className="h-8 w-8 md:h-10 md:w-10 text-white fill-current" />
        ) : (
          <Video className="h-8 w-8 md:h-10 md:w-10 text-white" />
        )}
      </button>
      
      <div className="text-center">
        <p className="text-white font-medium">
          {isRecording ? 'Recording...' : 'Emergency Record'}
        </p>
        <p className="text-white/70 text-sm">
          {!isPremium ? 'Requires Premium' : 'Tap to start/stop'}
        </p>
      </div>
      
      {isRecording && (
        <div className="text-center">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mx-auto mb-2"></div>
          <p className="text-white/90 text-sm">
            Recording in progress
          </p>
        </div>
      )}
    </div>
  )
}

export default RecordingButton