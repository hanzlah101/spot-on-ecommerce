import { toast } from "sonner"
import { createImageUpload } from "novel/plugins"
import { uploadFile } from "@/hooks/use-upload-files"

function onUpload(file: File) {
  const promise = uploadFile(file, "description")

  return new Promise((resolve, reject) => {
    toast.promise(
      promise.then(async ({ url }) => {
        const image = new Image()
        image.src = url
        image.onload = () => {
          resolve(url)
        }
      }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (e) => {
          reject(e)
          return e.message
        },
      },
    )
  })
}

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.")
      return false
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).")
      return false
    }
    return true
  },
})
