require('dotenv').config({ path: '.env.local' })
const WebSocket = require('ws')
const { dynamodb } = require('./dynamodbClient')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const fetch = require('node-fetch')

const wss = new WebSocket.Server({ port: 8080 })
const clients = new Map()
const onlineUsers = new Set()

wss.on('connection', (ws) => {
  // 연결 로그 제거 (너무 빈번함)

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'join':
          // 간단한 인증 검증
          if (!message.userId || !message.chatId) {
            ws.close(1008, 'Missing credentials')
            return
          }
          clients.set(ws, { userId: message.userId, chatId: message.chatId })
          onlineUsers.add(message.userId)
          console.log(`[WS] User ${message.userId} joined (${onlineUsers.size} online)`)
          break
          
        case 'message':
          await handleMessage(message, ws)
          break
      }
    } catch (error) {
      console.error('[WS] Error handling message:', error)
    }
  })

  ws.on('close', () => {
    const clientInfo = clients.get(ws)
    if (clientInfo) {
      onlineUsers.delete(clientInfo.userId)
      console.log(`[WS] User ${clientInfo.userId} left (${onlineUsers.size} online)`)
    }
    clients.delete(ws)
  })
})

async function handleMessage(message, senderWs) {
  const timestamp = new Date().toISOString()
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const fullMessage = {
    id: messageId,
    chatId: message.chatId,
    userId: message.userId,
    message: message.message,
    timestamp
  }

  try {
    await dynamodb.send(new PutCommand({
      TableName: 'CultureChat-Messages',
      Item: fullMessage
    }))

    const responseMessage = {
      type: 'message',
      message: message.message,
      userId: message.userId,
      timestamp
    }

    clients.forEach((clientInfo, ws) => {
      if (clientInfo.chatId === message.chatId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(responseMessage))
      }
    })

    // SSE 알림 제거 - WebSocket만 사용
  } catch (error) {
    console.error('[WS] Error saving message:', error)
  }
}

// SSE 알림 전송 함수 제거 - WebSocket만 사용

console.log('[WS] Server running on port 8080')