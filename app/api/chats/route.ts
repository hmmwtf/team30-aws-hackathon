import { NextRequest, NextResponse } from 'next/server'
import { ChatService } from '../../lib/chat-service'

export async function GET() {
  try {
    const chats = await ChatService.getChats()
    return NextResponse.json(chats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, country } = await request.json()
    const chat = await ChatService.createChat(name, country)
    return NextResponse.json(chat)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
  }
}