import axios from "axios"
import { Dispatch, SetStateAction, useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { getImageDimensions } from "@/utils"
import type { ImageSchema } from "@/utils/validations/image"
import { createGalleryImage, getPresignedUrl } from "@/actions/file-upload"
import { toast } from "sonner"
import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action"

type UploadFilesProps = {
  files: File[]
  folder: string
}

type UseUploadFilesProps = {
  onSuccess?: (_uploadedFiles: ImageSchema[]) => void
  shouldCreateGalleryImage?: boolean
}

export function useUploadFiles({
  onSuccess,
  shouldCreateGalleryImage = true,
}: UseUploadFilesProps) {
  const [progresses, setProgresses] = useState<Record<string, number>>()

  const { isPending, mutateAsync: uploadFiles } = useMutation({
    mutationFn: async ({ files, folder }: UploadFilesProps) => {
      return await Promise.all(
        files.map(async (file) => {
          const uploaded = await uploadFile(
            file,
            folder,
            setProgresses,
            shouldCreateGalleryImage,
          )
          return uploaded
        }),
      )
    },
    onSuccess: (data) => {
      setProgresses({})
      onSuccess?.(data)
    },
    onError() {
      toast.error("Error uploading image", {
        description: DEFAULT_SERVER_ERROR_MESSAGE,
      })
    },
  })

  return { isUploading: isPending, uploadFiles, progresses }
}

export async function uploadFile(
  file: File,
  folder: string,
  onProgressChange?: Dispatch<
    SetStateAction<Record<string, number> | undefined>
  >,
  shouldCreateGalleryImage?: boolean,
) {
  const { width, height } = await getImageDimensions(file)

  const { error, presignedUrl, key, url } = await getPresignedUrl({
    width,
    height,
    fileName: file.name,
    folder,
  })

  if (error || !presignedUrl || !key || !url) throw error

  return await axios
    .put(presignedUrl!, file, {
      onUploadProgress({ loaded, total }) {
        if (total) {
          let progress = Math.round((loaded * 100) / total)
          if (progress > 97) {
            progress = 97
          }
          onProgressChange?.((prevProgresses) => ({
            ...prevProgresses,
            [file.name]: progress,
          }))
        }
      },
    })
    .then(async () => {
      if (!shouldCreateGalleryImage) {
        onProgressChange?.((prev) => ({
          ...prev,
          [file.name]: 100,
        }))

        return { name: file.name, id: key, url }
      }

      const { error } = await createGalleryImage({
        id: key,
        url,
        name: file.name,
      })

      if (error) throw error

      onProgressChange?.((prev) => ({
        ...prev,
        [file.name]: 100,
      }))

      return { name: file.name, id: key, url }
    })
}
