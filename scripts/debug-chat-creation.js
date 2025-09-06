const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const docClient = DynamoDBDocumentClient.from(client)

async function debugChatCreation() {
  try {
    console.log('=== 채팅방 생성 디버깅 시작 ===')
    
    // 1. 사용자 테이블 확인
    console.log('\n1. 사용자 테이블 확인')
    const usersResult = await docClient.send(new ScanCommand({
      TableName: 'Users'
    }))
    
    console.log(`사용자 수: ${usersResult.Items?.length || 0}`)
    usersResult.Items?.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.nationality}, ${user.language})`)
    })
    
    // 2. 채팅방 테이블 확인
    console.log('\n2. 채팅방 테이블 확인')
    const chatsResult = await docClient.send(new ScanCommand({
      TableName: 'CultureChat-Chats'
    }))
    
    console.log(`채팅방 수: ${chatsResult.Items?.length || 0}`)
    chatsResult.Items?.forEach((chat, index) => {
      console.log(`  ${index + 1}. ${chat.id} - ${chat.name}`)
      console.log(`     참가자: ${chat.participants?.join(', ')}`)
      console.log(`     관계: ${chat.relationship}`)
      console.log(`     생성일: ${chat.createdAt}`)
    })
    
    // 3. 테스트 채팅방 생성 (예시)
    if (usersResult.Items && usersResult.Items.length >= 2) {
      console.log('\n3. 테스트 채팅방 생성')
      const user1 = usersResult.Items[0]
      const user2 = usersResult.Items[1]
      
      const testChatId = `test_chat_${Date.now()}`
      const testChat = {
        id: testChatId,
        participants: [user1.email, user2.email],
        relationship: 'friend',
        senderCountry: user1.nationality,
        receiverCountry: user2.nationality,
        createdAt: new Date().toISOString(),
        status: 'accepted',
        name: `${user2.email} (친구)`,
        country: user2.nationality,
        lastMessage: '',
        timestamp: new Date().toISOString(),
        unread: 0
      }
      
      await docClient.send(new PutCommand({
        TableName: 'CultureChat-Chats',
        Item: testChat
      }))
      
      console.log(`테스트 채팅방 생성 완료: ${testChatId}`)
      console.log(`참가자: ${user1.email} ↔ ${user2.email}`)
    }
    
    console.log('\n=== 디버깅 완료 ===')
    
  } catch (error) {
    console.error('디버깅 중 오류:', error)
  }
}

// 환경변수 확인
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('AWS 자격증명이 설정되지 않았습니다.')
  console.log('다음 명령어로 실행하세요:')
  console.log('AWS_ACCESS_KEY_ID=your_key AWS_SECRET_ACCESS_KEY=your_secret node scripts/debug-chat-creation.js')
  process.exit(1)
}

debugChatCreation()