import { useState, useRef, useCallback, useEffect } from 'react'
import { recordingService, pinataService } from '../services/api'

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [error, setError] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const startTimeRef = useRef(null)

  // Load saved recordings on mount
  useEffect(() => {
    loadRecordings()
  }, [])

  const loadRecordings = useCallback(async () => {
    try {
      const userId = localStorage.getItem('pocketjustice_user_id')
      if (userId) {
        const savedRecordings = await recordingService.getRecordings(userId)
        setRecordings(savedRecordings)
      } else {
        // Load from localStorage for non-authenticated users
        const localRecordings = JSON.parse(localStorage.getItem('pocketjustice_recordings') || '[]')
        setRecordings(localRecordings)
      }
    } catch (err) {
      console.error('Failed to load recordings:', err)
    }
  }, [])

  const startRecording = useCallback(async (options = {}) => {
    try {
      setError(null)
      
      const {
        audio = true,
        video = false,
        interactionType = 'general',
        location = null
      } = options

      // Request media permissions
      const constraints = { audio }
      if (video) {
        constraints.video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera by default
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      // Determine MIME type based on browser support
      let mimeType = 'audio/webm'
      if (video) {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          mimeType = 'video/webm;codecs=vp9,opus'
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm'
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4'
        }
      } else {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      startTimeRef.current = Date.now()

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const endTime = Date.now()
        const duration = Math.floor((endTime - startTimeRef.current) / 1000)
        
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        
        const recording = {
          id: `recording_${Date.now()}`,
          timestamp: new Date().toISOString(),
          duration,
          blob,
          url,
          fileType: mimeType,
          interactionType,
          location,
          ipfsHash: null,
          isUploaded: false,
          size: blob.size
        }

        // Save recording
        await saveRecording(recording)
      }

      mediaRecorderRef.current.start(1000) // Collect data every second
      setIsRecording(true)

    } catch (err) {
      setError('Failed to start recording: ' + err.message)
      console.error('Recording error:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      setIsRecording(false)
    }
  }, [isRecording])

  const saveRecording = useCallback(async (recording) => {
    try {
      const userId = localStorage.getItem('pocketjustice_user_id')
      
      if (userId) {
        // Save to backend for authenticated users
        const savedRecording = await recordingService.saveRecording({
          ...recording,
          userId,
          blob: undefined // Don't send blob to backend
        })
        
        // Update recording with server data
        const updatedRecording = { ...recording, ...savedRecording }
        setRecordings(prev => [updatedRecording, ...prev])
      } else {
        // Save to localStorage for non-authenticated users
        setRecordings(prev => {
          const updated = [recording, ...prev]
          localStorage.setItem('pocketjustice_recordings', JSON.stringify(
            updated.map(r => ({ ...r, blob: undefined, url: undefined }))
          ))
          return updated
        })
      }
    } catch (err) {
      console.error('Failed to save recording:', err)
      // Still add to local state even if save fails
      setRecordings(prev => [recording, ...prev])
    }
  }, [])

  const uploadToIPFS = useCallback(async (recordingId) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)
      
      const recording = recordings.find(r => r.id === recordingId)
      if (!recording || !recording.blob) {
        throw new Error('Recording not found or no blob available')
      }

      // Create file from blob
      const file = new File([recording.blob], `${recordingId}.${recording.fileType.split('/')[1]}`, {
        type: recording.fileType
      })

      // Upload to IPFS via Pinata
      const uploadResult = await pinataService.uploadFile(file, {
        name: `PocketJustice Recording ${recording.timestamp}`,
        interactionType: recording.interactionType,
        duration: recording.duration,
        location: recording.location
      })

      // Update recording with IPFS hash
      const updatedRecording = {
        ...recording,
        ipfsHash: uploadResult.IpfsHash,
        isUploaded: true
      }

      // Update in backend if user is authenticated
      const userId = localStorage.getItem('pocketjustice_user_id')
      if (userId) {
        await recordingService.uploadToIPFS(recordingId)
      }

      // Update local state
      setRecordings(prev => prev.map(r => 
        r.id === recordingId ? updatedRecording : r
      ))

      setUploadProgress(100)
      return uploadResult

    } catch (err) {
      console.error('IPFS upload error:', err)
      setError('Failed to upload to IPFS: ' + err.message)
      throw err
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }, [recordings])

  const deleteRecording = useCallback(async (id) => {
    try {
      const recording = recordings.find(r => r.id === id)
      
      // Delete from backend if authenticated
      const userId = localStorage.getItem('pocketjustice_user_id')
      if (userId && recording?.id) {
        await recordingService.deleteRecording(recording.id)
      }

      // Delete from IPFS if uploaded
      if (recording?.ipfsHash) {
        try {
          await pinataService.deleteFile(recording.ipfsHash)
        } catch (err) {
          console.warn('Failed to delete from IPFS:', err)
        }
      }

      // Clean up blob URL
      if (recording?.url) {
        URL.revokeObjectURL(recording.url)
      }

      // Update local state
      setRecordings(prev => {
        const updated = prev.filter(r => r.id !== id)
        
        // Update localStorage for non-authenticated users
        if (!userId) {
          localStorage.setItem('pocketjustice_recordings', JSON.stringify(
            updated.map(r => ({ ...r, blob: undefined, url: undefined }))
          ))
        }
        
        return updated
      })

    } catch (err) {
      console.error('Failed to delete recording:', err)
      setError('Failed to delete recording: ' + err.message)
    }
  }, [recordings])

  const downloadRecording = useCallback((id) => {
    const recording = recordings.find(r => r.id === id)
    if (!recording) return

    const link = document.createElement('a')
    link.href = recording.url
    link.download = `pocket-justice-${recording.timestamp}.${recording.fileType.split('/')[1]}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [recordings])

  const shareRecording = useCallback(async (id) => {
    const recording = recordings.find(r => r.id === id)
    if (!recording) return

    if (navigator.share && recording.blob) {
      try {
        const file = new File([recording.blob], `recording-${recording.timestamp}.${recording.fileType.split('/')[1]}`, {
          type: recording.fileType
        })

        await navigator.share({
          title: 'PocketJustice Recording',
          text: `Recording from ${new Date(recording.timestamp).toLocaleString()}`,
          files: [file]
        })
      } catch (err) {
        console.error('Share failed:', err)
        // Fallback to copying IPFS link if available
        if (recording.ipfsHash) {
          const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${recording.ipfsHash}`
          await navigator.clipboard.writeText(ipfsUrl)
          alert('IPFS link copied to clipboard')
        }
      }
    } else if (recording.ipfsHash) {
      // Fallback: copy IPFS link
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${recording.ipfsHash}`
      await navigator.clipboard.writeText(ipfsUrl)
      alert('IPFS link copied to clipboard')
    }
  }, [recordings])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      recordings.forEach(recording => {
        if (recording.url) {
          URL.revokeObjectURL(recording.url)
        }
      })
    }
  }, [])

  return {
    isRecording,
    recordings,
    error,
    isUploading,
    uploadProgress,
    startRecording,
    stopRecording,
    deleteRecording,
    uploadToIPFS,
    downloadRecording,
    shareRecording,
    loadRecordings
  }
}
