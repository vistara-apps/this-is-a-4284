import { useState, useRef, useCallback } from 'react'

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [error, setError] = useState(null)
  
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const startTimeRef = useRef(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      startTimeRef.current = Date.now()
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
        
        const recording = {
          id: Date.now(),
          blob,
          timestamp: new Date().toLocaleString(),
          duration,
          fileType: 'video/webm',
          filePath: URL.createObjectURL(blob)
        }
        
        setRecordings(prev => [recording, ...prev])
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      
    } catch (err) {
      setError(err.message)
      console.error('Recording error:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const uploadToIPFS = useCallback(async (recording) => {
    // In a real app, implement IPFS upload via Pinata
    // For demo purposes, we'll simulate this
    try {
      const formData = new FormData()
      formData.append('file', recording.blob)
      
      // Simulate IPFS upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const ipfsHash = 'QmExample' + Math.random().toString(36).substr(2, 9)
      
      setRecordings(prev => prev.map(rec => 
        rec.id === recording.id 
          ? { ...rec, ipfsHash }
          : rec
      ))
      
      return ipfsHash
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    isRecording,
    recordings,
    error,
    startRecording,
    stopRecording,
    uploadToIPFS
  }
}