"use server"

import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createId } from "@paralleldrive/cuid2"
import { PutObjectCommand } from "@aws-sdk/client-s3"

import { db } from "@/db"
import { s3Client } from "@/utils/s3-client"
import { galleryImages } from "@/db/schema"
import {
  GetPresignedUrlSchema,
  ImageSchema,
  getPresignedUrlSchema,
  imageSchema,
} from "@/utils/validations/image"

export async function getPresignedUrl(data: GetPresignedUrlSchema) {
  try {
    const { width, height, fileName, folder } =
      await getPresignedUrlSchema.parseAsync(data)

    const dimensions = width && height ? `${width}:${height}` : ""
    const key = `${folder}/${Date.now()}~${dimensions}~${createId()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    })

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    })

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`

    return { presignedUrl, key, url, error: null }
  } catch (error) {
    return { error: "Error uploading files, try again later" }
  }
}

export async function createGalleryImage(data: ImageSchema) {
  try {
    const { id, ...img } = await imageSchema.parseAsync(data)
    await db.insert(galleryImages).values({ key: id, ...img })
    return { error: null }
  } catch (error) {
    return { error: "Error creating image, try again later" }
  }
}
