import { NextRequest, NextResponse } from 'next/server'
import { dynamodb } from '@/app/lib/dynamodb'
import { UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { sendNotification } from '../notifications/route'

export async function POST(request: NextRequest) {
  try {
    const { messageId, userId, chatId, isRead } = await request.json()
    
    if (!messageId || !userId || !chatId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // DynamoDB에 읽음 상태 업데이트
    await dynamodb.send(new UpdateCommand({
      TableName: 'CultureChat-Messages',
      Key: { id: messageId },
      UpdateExpression: 'SET readBy = if_not_exists(readBy, :emptyMap)',
      ExpressionAttributeValues: {
        ':emptyMap': {}
      }
    }))

    await dynamodb.send(new UpdateCommand({
      TableName: 'CultureChat-Messages',
      Key: { id: messageId },
      UpdateExpression: 'SET readBy.#userId = :readStatus, readAt = :timestamp',
      ExpressionAttributeNames: {
        '#userId': userId
      },
      ExpressionAttributeValues: {
        ':readStatus': isRead,
        ':timestamp': new Date().toISOString()
      }
    }))

    // 채팅방의 다른 사용자들에게 읽음 상태 알림
    const notification = {
      type: 'message_read',
      messageId,
      userId,
      chatId,
      isRead,
      timestamp: new Date().toISOString()
    }

    // 해당 채팅방의 모든 사용자에게 알림 (본인 제외)
    // 실제로는 채팅방 참여자 목록을 조회해야 하지만, 간단히 구현
    sendNotification(`${chatId}_read_status`, notification)

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error updating read status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const userId = searchParams.get('userId')
    
    if (!chatId || !userId) {
      return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 })
    }

    // 해당 채팅방의 읽지 않은 메시지 수 조회
    const result = await dynamodb.send(new QueryCommand({
      TableName: 'CultureChat-Messages',
      IndexName: 'chatId-timestamp-index',
      KeyConditionExpression: 'chatId = :chatId',
      FilterExpression: 'attribute_not_exists(readBy.#userId) OR readBy.#userId = :false',
      ExpressionAttributeNames: {
        '#userId': userId
      },
      ExpressionAttributeValues: {
        ':chatId': chatId,
        ':false': false
      }
    }))

    const unreadCount = result.Items?.length || 0

    return NextResponse.json({ unreadCount })
    
  } catch (error) {
    console.error('Error getting read status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}