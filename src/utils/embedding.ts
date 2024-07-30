"use server"

import { LRUCache } from "lru-cache"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function generateEmbedding(text: string) {
  const input = text.replaceAll("\n", " ")
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
  const { embedding } = await model.embedContent(input)
  return embedding.values
}

class EmbeddingCacheManager {
  private static instance: EmbeddingCacheManager
  private cache: LRUCache<string, number[]>

  private constructor() {
    const sizeCalculation = (value: number[], key: string) => {
      const valueSize = Buffer.byteLength(JSON.stringify(value), "utf8")
      const keySize = Buffer.byteLength(key, "utf8")
      return valueSize + keySize
    }

    this.cache = new LRUCache<string, number[]>({
      max: 150000, // Store up to 150,000 embeddings
      maxSize: 500 * 1024 * 1024, // 500 MB size limit
      ttl: 7 * 24 * 60 * 60 * 1000, // Embedding expire after 1 week
      sizeCalculation,
    })
  }

  public static getInstance(): EmbeddingCacheManager {
    if (!EmbeddingCacheManager.instance) {
      EmbeddingCacheManager.instance = new EmbeddingCacheManager()
    }
    return EmbeddingCacheManager.instance
  }

  public get(key: string): number[] | undefined {
    return this.cache.get(key)
  }

  public set(key: string, value: number[]): void {
    this.cache.set(key, value)
  }
}

export async function generateEmbeddingWithCache(text: string) {
  const cacheManager = EmbeddingCacheManager.getInstance()
  const cachedEmbedding = cacheManager.get(text)

  if (cachedEmbedding) {
    return cachedEmbedding
  } else {
    const newEmbedding = await generateEmbedding(text)
    cacheManager.set(text, newEmbedding)
    return newEmbedding
  }
}
