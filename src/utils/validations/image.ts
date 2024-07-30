import * as z from "zod"

export const imageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().min(1),
})

export type ImageSchema = z.infer<typeof imageSchema>

export const getPresignedUrlSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  fileName: z.string().min(1),
  folder: z.string().min(1),
})

export type GetPresignedUrlSchema = z.infer<typeof getPresignedUrlSchema>
