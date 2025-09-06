import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const docClient = DynamoDBDocumentClient.from(client)

export async function POST(request: NextRequest) {
  try {
    const { senderEmail, receiverEmail, relationship } = await request.json()
    console.log('채팅 요청 데이터:', { senderEmail, receiverEmail, relationship })

    // 발신자 정보 조회
    console.log('발신자 조회 시작:', senderEmail)
    const senderResult = await docClient.send(new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': senderEmail
      }
    }))
    console.log('발신자 조회 결과:', senderResult.Items?.length || 0, '개')

    if (!senderResult.Items || senderResult.Items.length === 0) {
      console.log('발신자 없음:', senderEmail)
      return NextResponse.json({ error: '발신자 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 수신자 이메일로 사용자 찾기
    console.log('수신자 조회 시작:', receiverEmail)
    const receiverResult = await docClient.send(new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': receiverEmail
      }
    }))
    console.log('수신자 조회 결과:', receiverResult.Items?.length || 0, '개')

    if (!receiverResult.Items || receiverResult.Items.length === 0) {
      console.log('수신자 없음:', receiverEmail)
      return NextResponse.json({ error: '해당 이메일의 사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    const sender = senderResult.Items[0]
    const receiver = receiverResult.Items[0]
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 기존 채팅방 중복 확인
    console.log('기존 채팅방 중복 확인 시작')
    const existingChatResult = await docClient.send(new ScanCommand({
      TableName: 'CultureChat-Chats',
      FilterExpression: 'contains(participants, :sender) AND contains(participants, :receiver)',
      ExpressionAttributeValues: {
        ':sender': senderEmail,
        ':receiver': receiverEmail
      }
    }))
    
    if (existingChatResult.Items && existingChatResult.Items.length > 0) {
      const existingChat = existingChatResult.Items[0]
      console.log('기존 채팅방 발견:', existingChat.id)
      return NextResponse.json({ 
        success: true, 
        chatId: existingChat.id,
        message: `${receiverEmail}님과의 채팅방이 이미 존재합니다.`,
        isExisting: true
      })
    }

    // 채팅방 생성
    const relationshipLabels: { [key: string]: string } = {
      'boss': '상사',
      'colleague': '동료', 
      'friend': '친구',
      'lover': '연인',
      'parent': '부모님',
      'stranger': '낯선 사람'
    }
    
    const chatRoom = {
      id: chatId,
      participants: [senderEmail, receiverEmail],
      relationship,
      senderCountry: sender.nationality,
      receiverCountry: receiver.nationality,
      senderLanguage: sender.language, // 발신자 언어 추가
      receiverLanguage: receiver.language, // 수신자 언어 추가
      createdAt: new Date().toISOString(),
      status: 'accepted', // 일단 바로 수락된 상태로 설정
      name: `${receiverEmail} (${relationshipLabels[relationship] || relationship})`,
      country: receiver.nationality,
      lastMessage: '',
      timestamp: new Date().toISOString(),
      unread: 0
    }

    console.log('채팅방 생성 시작:', chatRoom)
    await docClient.send(new PutCommand({
      TableName: 'CultureChat-Chats',
      Item: chatRoom
    }))
    console.log('채팅방 생성 성공:', chatId)

    return NextResponse.json({ 
      success: true, 
      chatId,
      message: `${receiverEmail}님과의 채팅방이 생성되었습니다.`
    })
  } catch (error) {
    console.error('채팅 요청 오류:', error)
    return NextResponse.json({ error: '채팅 요청 실패' }, { status: 500 })
  }
}