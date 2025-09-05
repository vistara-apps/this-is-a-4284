import React, { useState } from 'react'
import { Mic, Square, Upload, Lock, Video, Camera, Cloud, Download, Share2 } from 'lucide-react'

function RecordingButton({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  isPremium,
  onUpgradePrompt,
  recordings = [],
  onUploadToIPFS,
  onDownload,
  onShare,
  isUploading = false,
  uploadProgress = 0
}) {
  const [recordingMode, setRecordingMode] = useState('audio') // 'audio' or 'video'
  const [showOptions, setShowOptions] = useState(false)

  const handleClick = () => {
    if (!isPremium) {
      onUpgradePrompt()
      return
    }
    
    if (isRecording) {
      onStopRecording()
    } else {
      onStartRecording({
        audio: true,
        video: recordingMode === 'video',
        interactionType: 'law_enforcement',
        location: null // Will be filled by geolocation
      })
    }
  }

  const toggleRecordingMode = () => {
    if (!isRecording) {
      setRecordingMode(prev => prev === 'audio' ? 'video' : 'audio')
    }
  }

  const recentRecording = recordings[0]

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Recording Button */}
      <div className="relative">
        <button
          onClick={handleClick}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50'
              : isPremium
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/50'
              : 'bg-gray-400 hover:bg-gray-500 shadow-gray-400/50'
          } text-white shadow-2xl transform hover:scale-105`}
        >
          {!isPremium ? (
            <Lock size={36} />
          ) : isRecording ? (
            <Square size={36} />
          ) : recordingMode === 'video' ? (
            <Video size={36} />
          ) : (
            <Mic size={36} />
          )}
          
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse" />
            </>
          )}
        </button>

        {/* Recording Mode Toggle */}
        {isPremium && !isRecording && (
          <button
            onClick={toggleRecordingMode}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            title={`Switch to ${recordingMode === 'audio' ? 'video' : 'audio'} recording`}
          >
            {recordingMode === 'video' ? <Camera size={16} /> : <Mic size={16} />}
          </button>
        )}
      </div>
      
      {/* Status Text */}
      <div className="text-center">
        <p className="text-white font-semibold text-lg">
          {!isPremium 
            ? 'Premium Feature' 
            : isRecording 
            ? `Recording ${recordingMode}...` 
            : `Tap to Record ${recordingMode === 'video' ? 'Video' : 'Audio'}`
          }
        </p>
        {!isPremium ? (
          <p className="text-white/80 text-sm mt-1">
            Upgrade to record interactions securely
          </p>
        ) : (
          <p className="text-white/80 text-sm mt-1">
            {recordingMode === 'video' 
              ? 'Video + Audio recording with IPFS backup'
              : 'Audio recording with secure storage'
            }
          </p>
        )}
      </div>

      {/* Recent Recording Actions */}
      {isPremium && recentRecording && !isRecording && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 w-full max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium text-sm">Latest Recording</h4>
            <span className="text-white/70 text-xs">
              {new Date(recentRecording.timestamp).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/80 text-sm">
              Duration: {recentRecording.duration}s
            </div>
            <div className="text-white/80 text-sm">
              {(recentRecording.size / 1024 / 1024).toFixed(1)}MB
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Uploading to IPFS...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onUploadToIPFS?.(recentRecording.id)}
              disabled={isUploading || recentRecording.isUploaded}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:opacity-50 rounded-md text-white text-sm font-medium transition-colors"
            >
              <Cloud size={14} />
              {recentRecording.isUploaded ? 'Uploaded' : 'IPFS'}
            </button>
            
            <button
              onClick={() => onDownload?.(recentRecording.id)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md text-white text-sm font-medium transition-colors"
            >
              <Download size={14} />
            </button>
            
            <button
              onClick={() => onShare?.(recentRecording.id)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md text-white text-sm font-medium transition-colors"
            >
              <Share2 size={14} />
            </button>
          </div>

          {recentRecording.ipfsHash && (
            <div className="mt-2 p-2 bg-green-500/20 rounded-md">
              <p className="text-green-200 text-xs">
                ✅ Securely stored on IPFS
              </p>
            </div>
          )}
        </div>
      )}

      {/* Emergency Instructions */}
      {isPremium && (
        <div className="text-center max-w-sm">
          <p className="text-white/60 text-xs leading-relaxed">
            💡 <strong>Pro Tip:</strong> Start recording before any interaction begins. 
            Your recordings are automatically encrypted and can be backed up to IPFS for maximum security.
          </p>
        </div>
      )}
    </div>
  )
}

export default RecordingButton

