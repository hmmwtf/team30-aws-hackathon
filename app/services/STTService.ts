
import { useState } from "react"

export default function useSTTService(onChange: (text: string) => void, languageCode: string = 'ko-KR') {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [isRecording, setIsRecording] = useState(false)

    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            const formData = new FormData()
            formData.append('audio', audioBlob)
            formData.append('languageCode', languageCode)

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

    return {
        startRecording,
        stopRecording,
        isRecording
    }
}
