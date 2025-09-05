import { NextRequest, NextResponse } from 'next/server'
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const languageCode = formData.get('languageCode') as string || 'ko-KR'
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const jobName = `transcribe-${Date.now()}`
    const bucketName = 'culturechat-transcribe-bucket'
    const key = `audio/${jobName}.webm`

    // S3에 오디오 파일 업로드
    const audioBuffer = await audioFile.arrayBuffer()
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: new Uint8Array(audioBuffer),
      ContentType: 'audio/webm'
    }))

    // Transcribe 작업 시작
    await transcribeClient.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      Media: {
        MediaFileUri: `s3://${bucketName}/${key}`
      },
      MediaFormat: 'webm',
      LanguageCode: languageCode
    }))

    // 작업 완료 대기 (최대 30초)
    let jobStatus = 'IN_PROGRESS'
    let attempts = 0
    const maxAttempts = 15

    while (jobStatus === 'IN_PROGRESS' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const result = await transcribeClient.send(new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName
      }))
      
      jobStatus = result.TranscriptionJob?.TranscriptionJobStatus || 'FAILED'
      attempts++
    }

    if (jobStatus === 'COMPLETED') {
      const result = await transcribeClient.send(new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName
      }))
      
      const transcriptUri = result.TranscriptionJob?.Transcript?.TranscriptFileUri
      if (transcriptUri) {
        const transcriptResponse = await fetch(transcriptUri)
        const transcriptData = await transcriptResponse.json()
        const text = transcriptData.results.transcripts[0].transcript
        
        return NextResponse.json({ text })
      }
    }

    return NextResponse.json({ error: 'Transcription timeout or failed' }, { status: 500 })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ 
      error: 'Transcription failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}