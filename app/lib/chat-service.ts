import { dynamodb } from './dynamodb'
import { PutCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { Chat } from '../../types/chat'
import { Message } from '../../types/message'

export class ChatService {
  static async createChat(name: string, country: string): Promise<Chat> {
    const timestamp = new Date().toISOString()
    const chat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      country,
      lastMessage: '',
      timestamp,
      unread: 0,
      createdAt: timestamp
    }

    await dynamodb.send(new PutCommand({
      TableName: 'CultureChat-Chats',
      Item: chat
    }))

    return chat
  }

  static async getChats(): Promise<Chat[]> {
    const result = await dynamodb.send(new ScanCommand({
      TableName: 'CultureChat-Chats'
    }))
    return (result.Items as Chat[]) || []
  }

  static async saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const timestamp = new Date().toISOString()
    const fullMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp
    }

    await dynamodb.send(new PutCommand({
      TableName: 'CultureChat-Messages',
      Item: fullMessage
    }))

    return fullMessage
  }

  static async getMessages(chatId: string): Promise<Message[]> {
    const result = await dynamodb.send(new QueryCommand({
      TableName: 'CultureChat-Messages',
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': chatId
      },
      ScanIndexForward: true
    }))
    return (result.Items as Message[]) || []
  }
}