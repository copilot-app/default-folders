import {v4 as uuid} from 'uuid'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process?.env?.BUCKET || ""

export async function getSignedURL(key: string, mime: string){
  console.log("Getting signed URL")
  const client = new S3Client()
  const ext = mime.split("/")[1]
  const fileKey = `${key}/${uuid()}.${ext}`
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key:fileKey,
    ContentType: mime
  })

  const url = await getSignedUrl(client, command, {expiresIn: 3600})

  return {
    url: url,
    key: fileKey,
  }
}
