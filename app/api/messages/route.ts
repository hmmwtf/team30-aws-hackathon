import { NextRequest, NextResponse } from 'next/server'
import { ChatService } from '../../lib/chat-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    
    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 })
    }
    
    const messages = await ChatService.getMessages(chatId)
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, text, userId, feedback } = await request.json()
    const message = await ChatService.saveMessage({ chatId, text, userId, feedback })
    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}