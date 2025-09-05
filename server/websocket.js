require('dotenv').config({ path: '.env.local' })
const WebSocket = require('ws')
const { dynamodb } = require('./dynamodbClient')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')

const wss = new WebSocket.Server({ port: 8080 })
const clients = new Map()

wss.on('connection', (ws) => {
  console.log('New client connected')

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'join':
          clients.set(ws, { userId: message.userId, chatId: message.chatId })
          console.log(`User ${message.userId} joined chat ${message.chatId}`)
          break
          
        case 'message':
          await handleMessage(message, ws)
          break
      }
    } catch (error) {
      console.error('Error handling message:', error)
    }
  })

  ws.on('close', () => {
    clients.delete(ws)
    console.log('Client disconnected')
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
  } catch (error) {
    console.error('Error saving message:', error)
  }
}

console.log('WebSocket server running on port 8080')