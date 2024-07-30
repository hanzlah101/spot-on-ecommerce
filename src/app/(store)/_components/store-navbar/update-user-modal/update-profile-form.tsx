"use client"

import Image from "next/image"
import { useEffect } from "react"
import { toast } from "sonner"
import { Edit, ImageUp, X } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"

import {
  updateUserProfileSchema,
  UpdateUserProfileSchema,
} from "@/utils/validations/user"

import { Input } from "@/components/ui/input"
import { FileUploader } from "@/components/ui/file-uploader"
import { updateUserProfile } from "@/actions/user"
import { useUpdateUserModal } from "@/stores/use-update-user-modal"
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type UpdateProfileFormProps = {
  name: string
  image?: string
}

export function UpdateProfileForm({ name, image }: UpdateProfileFormProps) {
  const { onOpenChange } = useUpdateUserModal()

  const form = useForm<UpdateUserProfileSchema>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name,
      image,
    },
  })

  const inputImage = useWatch({
    control: form.control,
    name: "image",
  })

  const { isPending, mutate: updateProfile } = useMutation({
    mutationKey: ["update-user-profile"],
    mutationFn: async (values: UpdateUserProfileSchema) => {
      const { error } = await updateUserProfile(values)
      if (error) {
        form.setError("root", { message: error })
        throw error
      }
    },
    onSuccess() {
      toast.success("Profile updated successfully!")
      onOpenChange(false)
      form.reset()
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    updateProfile(values)
  })

  useEffect(() => {
    form.setValue("name", name)
    form.setValue("image", image)
  }, [name, image, form])

  return (
    <Form {...form}>
      <form
        id="update-user-profile-form"
        onSubmit={onSubmit}
        className="my-4 space-y-4"
      >
        <FormError />

        <FormField
          control={form.control}
          name="image"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <div className="relative">
                <FormControl>
                  <FileUploader
                    disabled={isPending}
                    folder="user-avatars"
                    multiple={false}
                    maxFiles={1}
                    shouldCreateGalleryImage={false}
                    className="group relative flex h-20 w-20 items-center justify-center rounded-full"
                    onSuccess={([uploaded]) => field.onChange(uploaded?.url)}
                  >
                    {inputImage ? (
                      <>
                        <Image
                          fill
                          src={inputImage}
                          alt={name}
                          className="rounded-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label="Remove image"
                          className="peer absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            field.onChange(null)
                          }}
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <ImageUp className="size-6 text-muted-foreground" />
                    )}

                    {inputImage && (
                      <div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 peer-hover:opacity-0">
                        <Edit className="size-6 text-white" />
                      </div>
                    )}
                  </FileUploader>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoFocus placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
