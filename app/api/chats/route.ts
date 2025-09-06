import { NextRequest, NextResponse } from 'next/server'
import { ChatService } from '../../lib/chat-service'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const docClient = DynamoDBDocumentClient.from(client)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      // 기존 로직 유지 (모든 채팅방 반환)
      const chats = await ChatService.getChats()
      return NextResponse.json(chats)
    }
    
    // 사용자별 채팅방 조회
    console.log('사용자별 채팅방 조회:', userEmail)
    const result = await docClient.send(new ScanCommand({
      TableName: 'CultureChat-Chats',
      FilterExpression: 'contains(participants, :userEmail)',
      ExpressionAttributeValues: {
        ':userEmail': userEmail
      }
    }))
    
    const chats = result.Items || []
    console.log('조회된 채팅방 수:', chats.length)
    
    // 채팅방 데이터 정규화
    const normalizedChats = chats.map(chat => {
      const isUserSender = chat.participants && chat.participants[0] === userEmail
      return {
        id: chat.id,
        name: chat.name || `${chat.participants.find((p: string) => p !== userEmail) || '알 수 없는 사용자'}과의 채팅`,
        country: chat.receiverCountry || chat.country || 'KR',
        lastMessage: chat.lastMessage || '',
        timestamp: chat.timestamp || chat.createdAt || new Date().toISOString(),
        unread: chat.unread || 0,
        participants: chat.participants || [],
        relationship: chat.relationship || 'friend',
        senderLanguage: chat.senderLanguage || 'ko',
        receiverLanguage: chat.receiverLanguage || 'en',
        // 사용자 기준으로 수신자 언어 결정
        userReceiverLanguage: isUserSender ? chat.receiverLanguage : chat.senderLanguage
      }
    })
    
    return NextResponse.json(normalizedChats)
  } catch (error) {
    console.error('채팅방 조회 오류:', error)
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