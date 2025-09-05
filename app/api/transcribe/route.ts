import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('STT API called')
    
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      console.log('No audio file provided')
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log('Audio file received:', audioFile.name, audioFile.size)
    
    // 임시로 더미 텍스트 반환
    const dummyText = '안녕하세요, 음성 인식 테스트입니다.'
    
    return NextResponse.json({ text: dummyText })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ 
      error: 'Transcription failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}