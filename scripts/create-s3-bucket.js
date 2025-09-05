require('dotenv').config({ path: '.env.local' })
const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3')

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

async function createS3Bucket() {
  try {
    await client.send(new CreateBucketCommand({
      Bucket: 'culturechat-transcribe-bucket'
    }))
    console.log('S3 bucket created successfully')
  } catch (error) {
    if (error.name === 'BucketAlreadyExists' || error.name === 'BucketAlreadyOwnedByYou') {
      console.log('Bucket already exists')
    } else {
      console.error('Error creating S3 bucket:', error)
    }
  }
}

createS3Bucket()