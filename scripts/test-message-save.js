const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
require('dotenv').config({ path: '.env.local' })

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const docClient = DynamoDBDocumentClient.from(client)

async function testMessageSave() {
  const testChatId = 'chat_1757102478830_cqg4fvnm6' // 실제 채팅방 ID
  
  try {
    console.log('💾 테스트 메시지 저장...')
    
    // 테스트 메시지 저장
    const testMessage = {
      id: `msg_${Date.now()}_test`,
      chatId: testChatId,
      userId: 'minhyay01@gmail.com',
      text: '테스트 메시지입니다',
      timestamp: new Date().toISOString()
    }
    
    await docClient.send(new PutCommand({
      TableName: 'CultureChat-Messages',
      Item: testMessage
    }))
    
    console.log('✅ 메시지 저장 완료')
    
    // 저장된 메시지 조회
    console.log('📥 메시지 조회 중...')
    const result = await docClient.send(new QueryCommand({
      TableName: 'CultureChat-Messages',
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': testChatId
      },
      ScanIndexForward: true
    }))
    
    console.log(`📊 총 ${result.Items?.length || 0}개 메시지 발견`)
    if (result.Items && result.Items.length > 0) {
      result.Items.forEach((msg, i) => {
        console.log(`${i+1}. [${msg.userId}] ${msg.text} (${new Date(msg.timestamp).toLocaleTimeString()})`)
      })
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message)
  }
}

testMessageSave()