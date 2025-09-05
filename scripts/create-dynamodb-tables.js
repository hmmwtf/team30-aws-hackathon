const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb')
require('dotenv').config({ path: '.env.local' })

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

async function createTable(tableName, keySchema, attributeDefinitions) {
  try {
    // 테이블이 이미 존재하는지 확인
    await client.send(new DescribeTableCommand({ TableName: tableName }))
    console.log(`Table ${tableName} already exists`)
    return
  } catch (error) {
    if (error.name !== 'ResourceNotFoundException') {
      throw error
    }
  }

  const params = {
    TableName: tableName,
    KeySchema: keySchema,
    AttributeDefinitions: attributeDefinitions,
    BillingMode: 'PAY_PER_REQUEST'
  }

  try {
    await client.send(new CreateTableCommand(params))
    console.log(`Table ${tableName} created successfully`)
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error)
  }
}

async function main() {
  console.log('Creating DynamoDB tables...')

  // CultureChat-Chats 테이블
  await createTable(
    'CultureChat-Chats',
    [{ AttributeName: 'id', KeyType: 'HASH' }],
    [{ AttributeName: 'id', AttributeType: 'S' }]
  )

  // CultureChat-Messages 테이블
  await createTable(
    'CultureChat-Messages',
    [
      { AttributeName: 'chatId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' }
    ],
    [
      { AttributeName: 'chatId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' }
    ]
  )

  // Users 테이블
  await createTable(
    'Users',
    [{ AttributeName: 'userId', KeyType: 'HASH' }],
    [{ AttributeName: 'userId', AttributeType: 'S' }]
  )

  console.log('DynamoDB tables setup complete!')
}

main().catch(console.error)