'use client'

import { useState } from 'react'
import { Language, getTranslation } from '../lib/i18n'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
  targetCountry: string
  language: Language
}

export default function MessageInput({ value, onChange, onSend, targetCountry, language }: MessageInputProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(language, key)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    try {
      await onSend(value)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop()
        }
      }, 60000)
    } catch (error) {
      console.error('Recording failed:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const { text } = await response.json()
        onChange(text)
      }
    } catch (error) {
      console.error('Transcription failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('inputPlaceholder')}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isAnalyzing}
        />
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-lg flex items-center justify-center min-w-[50px] ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>
        <button
          type="submit"
          disabled={!value.trim() || isAnalyzing}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t('analyzing')}
            </>
          ) : (
            t('sendButton')
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {targetCountry} {t('culturalCheck')}
      </p>
    </form>
  )
}