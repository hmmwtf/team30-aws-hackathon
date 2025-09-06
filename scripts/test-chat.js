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

async function testChatMessage() {
  try {
    // 테스트용 채팅방 ID (실제 존재하는 채팅방 사용)
    const testChatId = 'chat_1757102478830_cqg4fvnm6' // 실제 채팅방 ID
    
    console.log('💬 테스트 메시지 저장 중...')
    
    // 테스트 메시지 생성
    const testMessage = {
      id: `msg_${Date.now()}_test`,
      chatId: testChatId,
      userId: 'minhyay01@gmail.com',
      text: '안녕하세요! 테스트 메시지입니다.',
      timestamp: new Date().toISOString()
    }
    
    // 메시지 저장
    await docClient.send(new PutCommand({
      TableName: 'CultureChat-Messages',
      Item: testMessage
    }))
    
    console.log('✅ 메시지 저장 완료:', testMessage.text)
    
    // 저장된 메시지 조회
    console.log('\n📥 채팅방 메시지 조회 중...')
    const result = await docClient.send(new QueryCommand({
      TableName: 'CultureChat-Messages',
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': testChatId
      },
      ScanIndexForward: true
    }))
    
    if (result.Items && result.Items.length > 0) {
      console.log(`✅ 총 ${result.Items.length}개의 메시지 발견:`)
      result.Items.forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.userId}] ${msg.text}`)
        console.log(`   시간: ${new Date(msg.timestamp).toLocaleString()}`)
      })
    } else {
      console.log('❌ 메시지가 없습니다.')
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message)
  }
}

testChatMessage()